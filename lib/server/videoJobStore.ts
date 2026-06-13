import { mkdir, readFile, writeFile, rm, copyFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { processVideoInstructionFromPath } from '@/lib/server/videoEngine';

export type VideoJobStatus = 'queued' | 'processing' | 'done' | 'failed';

type InternalVideoJob = {
  id: string;
  status: VideoJobStatus;
  progress: number;
  stage: 'queued' | 'analyze' | 'plan' | 'render' | 'finalize' | 'done' | 'failed';
  stageLabel: string;
  language: string;
  originalFileName: string;
  fileSizeBytes: number;
  instruction: string;
  inputPath: string;
  outputPath: string;
  message: string;
  error?: string;
  createdAt: string;
  updatedAt: string;
  lock?: boolean;
};

export type PublicVideoJob = Omit<InternalVideoJob, 'inputPath' | 'outputPath' | 'lock'>;

const RUNTIME_ROOT = path.join('/tmp', 'ufinf-video-jobs');
const JOBS_FILE = path.join(RUNTIME_ROOT, 'jobs.json');

let memoryJobs: Record<string, InternalVideoJob> = {};

function nowIso() {
  return new Date().toISOString();
}

async function readJobs() {
  try {
    const raw = await readFile(JOBS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Record<string, InternalVideoJob>;
    memoryJobs = parsed;
    return parsed;
  } catch {
    return memoryJobs;
  }
}

async function writeJobs(jobs: Record<string, InternalVideoJob>) {
  memoryJobs = jobs;
  await mkdir(RUNTIME_ROOT, { recursive: true });
  await writeFile(JOBS_FILE, JSON.stringify(jobs, null, 2), 'utf8');
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_') || 'input.mp4';
}

function toPublic(job: InternalVideoJob): PublicVideoJob {
  const { inputPath: _inputPath, outputPath: _outputPath, lock: _lock, ...rest } = job;
  return rest;
}

export async function createVideoJob(params: {
  file: File;
  instruction: string;
  language: string;
}) {
  const id = `vid_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const jobDir = path.join(RUNTIME_ROOT, id);
  const inputPath = path.join(jobDir, sanitizeFilename(params.file.name));
  const outputPath = path.join(jobDir, 'output.mp4');

  await mkdir(jobDir, { recursive: true });
  const bytes = Buffer.from(await params.file.arrayBuffer());
  await writeFile(inputPath, bytes);

  const job: InternalVideoJob = {
    id,
    status: 'queued',
    progress: 0,
    stage: 'queued',
    stageLabel: 'Queued',
    language: params.language,
    originalFileName: params.file.name,
    fileSizeBytes: params.file.size,
    instruction: params.instruction,
    inputPath,
    outputPath,
    message: params.language === 'pl'
      ? 'Zadanie dodane do kolejki renderu.'
      : params.language === 'es'
      ? 'Trabajo agregado a la cola de render.'
      : 'Job added to render queue.',
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  const jobs = await readJobs();
  jobs[id] = job;
  await writeJobs(jobs);
  return toPublic(job);
}

export async function getVideoJob(jobId: string) {
  const jobs = await readJobs();
  const job = jobs[jobId];
  return job ? toPublic(job) : null;
}

export async function getVideoJobOutputPath(jobId: string) {
  const jobs = await readJobs();
  const job = jobs[jobId];
  if (!job || job.status !== 'done') return null;
  if (!existsSync(job.outputPath)) return null;
  return job.outputPath;
}

async function saveJob(job: InternalVideoJob) {
  const jobs = await readJobs();
  jobs[job.id] = job;
  await writeJobs(jobs);
}

export async function advanceVideoJob(jobId: string) {
  const jobs = await readJobs();
  const job = jobs[jobId];
  if (!job) return null;

  if (job.status === 'done' || job.status === 'failed') {
    return toPublic(job);
  }

  if (job.lock) {
    return toPublic(job);
  }

  job.lock = true;
  job.status = 'processing';
  job.updatedAt = nowIso();
  await saveJob(job);

  try {
    if (job.stage === 'queued') {
      job.stage = 'analyze';
      job.stageLabel = 'Analyzing input';
      job.progress = 20;
      job.message = job.language === 'pl'
        ? 'Analiza wejscia i instrukcji...'
        : job.language === 'es'
        ? 'Analizando entrada e instruccion...'
        : 'Analyzing input and instruction...';
    } else if (job.stage === 'analyze') {
      job.stage = 'plan';
      job.stageLabel = 'Planning edit operations';
      job.progress = 45;
      job.message = job.language === 'pl'
        ? 'Planowanie operacji montazu...'
        : job.language === 'es'
        ? 'Planificando operaciones de edicion...'
        : 'Planning edit operations...';
    } else if (job.stage === 'plan') {
      job.stage = 'render';
      job.stageLabel = 'Rendering';
      job.progress = 70;
      job.message = job.language === 'pl'
        ? 'Renderowanie klipu...'
        : job.language === 'es'
        ? 'Renderizando clip...'
        : 'Rendering clip...';

      await saveJob(job);

      const rendered = await processVideoInstructionFromPath({
        inputPath: job.inputPath,
        instruction: job.instruction,
      });

      if (rendered.outputPath !== job.outputPath) {
        await copyFile(rendered.outputPath, job.outputPath);
        await rm(rendered.outputPath, { force: true });
      }

      job.stage = 'finalize';
      job.stageLabel = 'Finalizing output';
      job.progress = 90;
      job.message = job.language === 'pl'
        ? 'Finalizacja i publikacja wyniku...'
        : job.language === 'es'
        ? 'Finalizando y publicando resultado...'
        : 'Finalizing output...';
    } else if (job.stage === 'render' || job.stage === 'finalize') {
      job.stage = 'done';
      job.stageLabel = 'Done';
      job.progress = 100;
      job.status = 'done';
      job.message = job.language === 'pl'
        ? 'Wideo gotowe. Mozesz je pobrac lub odtworzyc.'
        : job.language === 'es'
        ? 'Video listo. Puedes descargarlo o reproducirlo.'
        : 'Video is ready. You can download or play it.';
    }
  } catch (error) {
    job.stage = 'failed';
    job.stageLabel = 'Failed';
    job.status = 'failed';
    job.progress = 100;
    job.error = error instanceof Error ? error.message : 'Unknown render error.';
    job.message = job.language === 'pl'
      ? 'Render nie powiodl sie. Sprobuj krotszego klipu lub prostszej instrukcji.'
      : job.language === 'es'
      ? 'El render fallo. Prueba con un clip mas corto o instrucciones mas simples.'
      : 'Render failed. Try a shorter clip or simpler instruction.';
  } finally {
    job.updatedAt = nowIso();
    job.lock = false;
    await saveJob(job);
  }

  return toPublic(job);
}
