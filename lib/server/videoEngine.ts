import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import ffmpegPath from 'ffmpeg-static';

type VideoInstruction = {
  speed: number;
  trimStartSec: number;
  wantsSubtitles: boolean;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function parseInstruction(instruction: string): VideoInstruction {
  const lower = instruction.toLowerCase();

  const speedMatch = lower.match(/(\d+(?:[\.,]\d+)?)\s*x/);
  const speed = clamp(speedMatch ? Number(speedMatch[1].replace(',', '.')) : 1, 0.5, 2);

  let trimStartSec = 0;
  const trimMatch = lower.match(/(?:wytnij|wytnij\s+pierwsze|trim|cut)(?:\s+first)?\s+(\d{1,3})\s*(?:sekund|sekundy|sekundę|sek|s|seconds?)/);
  if (trimMatch?.[1]) {
    trimStartSec = clamp(Number(trimMatch[1]), 0, 300);
  }

  const wantsSubtitles =
    lower.includes('napis') ||
    lower.includes('subtitle') ||
    lower.includes('caption');

  return {
    speed,
    trimStartSec,
    wantsSubtitles,
  };
}

function buildFilterArgs(parsed: VideoInstruction) {
  const videoFilters: string[] = [];
  const audioFilters: string[] = [];

  if (parsed.speed !== 1) {
    videoFilters.push(`setpts=${(1 / parsed.speed).toFixed(6)}*PTS`);
    audioFilters.push(`atempo=${parsed.speed.toFixed(3)}`);
  }

  if (parsed.wantsSubtitles) {
    const font = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
    if (existsSync(font)) {
      videoFilters.push(
        `drawtext=fontfile=${font}:text='AUTO SUBTITLES ENABLED':fontcolor=white:fontsize=28:borderw=2:bordercolor=black:x=(w-text_w)/2:y=h-90`
      );
    }
  }

  return {
    videoFilters,
    audioFilters,
  };
}

function runFfmpeg(args: string[]) {
  return new Promise<void>((resolve, reject) => {
    const candidates = [
      ffmpegPath || '',
      path.join(process.cwd(), 'node_modules', 'ffmpeg-static', 'ffmpeg'),
      path.join('/var/task', 'node_modules', 'ffmpeg-static', 'ffmpeg'),
      path.join('/var/task', '.next', 'server', 'app', 'api', 'video', 'edit', 'ffmpeg'),
      '/usr/bin/ffmpeg',
      '/opt/bin/ffmpeg',
    ].filter(Boolean);

    const ffmpeg = candidates.find((candidate) => existsSync(candidate));
    if (!ffmpeg) {
      reject(new Error(`FFmpeg binary is unavailable. Checked: ${candidates.join(', ')}`));
      return;
    }

    const child = spawn(ffmpeg, args, {
      stdio: ['ignore', 'pipe', 'pipe'],
      windowsHide: true,
    });

    let stderr = '';

    child.stderr.on('data', (chunk) => {
      stderr += String(chunk || '');
    });

    child.on('error', (error) => reject(error));
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`FFmpeg exited with code ${code}. ${stderr.slice(-1000)}`));
    });
  });
}

export async function processVideoInstruction(params: {
  file: File;
  instruction: string;
}) {
  const parsed = parseInstruction(params.instruction);
  const scratchDir = await mkdtemp(path.join(os.tmpdir(), 'ufinf-video-'));

  const safeInputName = params.file.name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'input.mp4';
  const inputPath = path.join(scratchDir, safeInputName);
  const outputPath = path.join(scratchDir, `edited_${Date.now()}.mp4`);

  try {
    const inputBytes = Buffer.from(await params.file.arrayBuffer());
    await writeFile(inputPath, inputBytes);

    const rendered = await processVideoInstructionFromPath({
      inputPath,
      instruction: params.instruction,
      outputPath,
    });
    const outputBytes = await readFile(rendered.outputPath);

    return {
      outputBytes,
      mimeType: 'video/mp4',
      parsed,
    };
  } finally {
    await rm(scratchDir, { recursive: true, force: true });
  }
}

export async function processVideoInstructionFromPath(params: {
  inputPath: string;
  instruction: string;
  outputPath?: string;
}) {
  const parsed = parseInstruction(params.instruction);
  const outputPath = params.outputPath || path.join(path.dirname(params.inputPath), `edited_${Date.now()}.mp4`);

    const { videoFilters, audioFilters } = buildFilterArgs(parsed);

    const args: string[] = ['-y'];
    if (parsed.trimStartSec > 0) {
      args.push('-ss', String(parsed.trimStartSec));
    }

    args.push('-i', params.inputPath);

    if (videoFilters.length > 0) {
      args.push('-vf', videoFilters.join(','));
    }

    if (audioFilters.length > 0) {
      args.push('-af', audioFilters.join(','));
    }

    args.push(
      '-map', '0:v:0',
      '-map', '0:a?',
      '-c:v', 'libx264',
      '-preset', 'veryfast',
      '-crf', '21',
      '-pix_fmt', 'yuv420p',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-movflags', '+faststart',
      outputPath
    );

    await runFfmpeg(args);

    return {
      outputPath,
      parsed,
    };
}
