import { NextResponse } from 'next/server';
import { createVideoJob } from '@/lib/server/videoJobStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function inferOperations(instruction: string) {
  const lower = instruction.toLowerCase();
  const ops: Array<{ operation: string; description: string; status: 'queued' }> = [
    {
      operation: 'parseInstruction',
      description: 'AI parses the user instruction into concrete editing steps.',
      status: 'queued',
    },
    {
      operation: 'detectScenes',
      description: 'Scene and timestamp detection for dynamic short-form pacing.',
      status: 'queued',
    },
  ];

  if (lower.includes('napis') || lower.includes('subtitle') || lower.includes('caption')) {
    ops.push({
      operation: 'addSubtitles',
      description: 'Generate and burn subtitles with readability-optimized style.',
      status: 'queued',
    });
  }

  if (lower.includes('tempo') || lower.includes('speed') || lower.includes('1.5x') || lower.includes('2x')) {
    ops.push({
      operation: 'tempoAdjust',
      description: 'Apply playback speed/tempo optimization for retention.',
      status: 'queued',
    });
  }

  if (lower.includes('wytn') || lower.includes('trim') || lower.includes('cut')) {
    ops.push({
      operation: 'smartTrim',
      description: 'Trim low-value sections and preserve high-attention segments.',
      status: 'queued',
    });
  }

  if (lower.includes('muzyk') || lower.includes('music') || lower.includes('audio')) {
    ops.push({
      operation: 'audioProcessing',
      description: 'Music replacement and loudness normalization.',
      status: 'queued',
    });
  }

  ops.push({
    operation: 'export',
    description: 'Export MP4 profile optimized for TikTok/Reels/Shorts.',
    status: 'queued',
  });

  return ops;
}

export async function POST(req: Request) {
  try {
    if (process.env.ENABLE_VIDEO_EDITOR !== 'true') {
      return NextResponse.json(
        { error: 'Video editor is coming soon. This module is currently disabled.' },
        { status: 503 }
      );
    }

    const formData = await req.formData();
    const videoFile = formData.get('video') as File;
    const instruction = formData.get('instruction') as string;
    const language = (formData.get('language') as string) || 'pl';

    if (!videoFile) {
      return NextResponse.json({ error: 'No video file provided' }, { status: 400 });
    }

    if (!instruction) {
      return NextResponse.json({ error: 'No editing instruction provided' }, { status: 400 });
    }

    if (!videoFile.type.startsWith('video/')) {
      return NextResponse.json(
        { error: 'Unsupported file type. Upload MP4 or WebM video.' },
        { status: 415 }
      );
    }

    if (videoFile.size > 150 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Video too large. Maximum size is 150MB per request.' },
        { status: 413 }
      );
    }

    const job = await createVideoJob({
      file: videoFile,
      instruction,
      language,
    });

    return NextResponse.json({
      ok: true,
      ...job,
      editingOperations: inferOperations(instruction),
      pollUrl: `/api/video/jobs/${job.id}`,
      resultUrl: `/api/video/jobs/${job.id}/result`,
      nextPollInSec: 2,
      status: 'queued',
    });
  } catch (error) {
    console.error('Video editing error:', error);
    return NextResponse.json({ error: 'Video processing failed' }, { status: 500 });
  }
}
