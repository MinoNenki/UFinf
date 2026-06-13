import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { publishToPlatform } from '@/lib/server/publishConnectors';
import { readSettings } from '@/lib/server/settingsStore';
import { writeAuditLog } from '@/lib/server/security/auditLog';

export type PublishPlatform = 'tiktok' | 'youtube' | 'instagram' | 'facebook' | 'x';
export type PublishStatus = 'pending' | 'processing' | 'retrying' | 'published' | 'failed';

type PlatformState = {
  status: PublishStatus;
  attempts: number;
  maxAttempts: number;
  nextRetryAt: string | null;
  publishedUrl: string | null;
  lastError: string | null;
};

export type PublishJob = {
  id: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
  topic: string;
  plan: string;
  mode: 'hybrid' | 'safe_demo';
  payload: {
    descriptionByPlatform: Record<string, string>;
    hashtags: string[];
    thumbnailPrompt: string;
  };
  platforms: Record<PublishPlatform, PlatformState>;
  history: string[];
};

export type DeadLetterRecord = {
  id: string;
  jobId: string;
  platform: PublishPlatform;
  reason: string;
  attempts: number;
  failedAt: string;
};

type QueueState = {
  jobs: PublishJob[];
  idempotency: Record<string, string>;
  deadLetters: DeadLetterRecord[];
};

const QUEUE_FILE = path.join(process.cwd(), '.runtime', 'publish-queue.json');
const PLATFORMS: PublishPlatform[] = ['tiktok', 'youtube', 'instagram', 'facebook', 'x'];

let memoryQueueState: QueueState | null = null;

function nowIso() {
  return new Date().toISOString();
}

function uuid() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

async function readQueue(): Promise<QueueState> {
  try {
    const raw = await readFile(QUEUE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<QueueState>;
    return {
      jobs: parsed.jobs || [],
      idempotency: parsed.idempotency || {},
      deadLetters: parsed.deadLetters || [],
    };
  } catch {
    if (memoryQueueState) {
      return memoryQueueState;
    }
    return { jobs: [], idempotency: {}, deadLetters: [] };
  }
}

async function writeQueue(state: QueueState) {
  memoryQueueState = state;
  try {
    await mkdir(path.dirname(QUEUE_FILE), { recursive: true });
    await writeFile(QUEUE_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Readonly FS in serverless must not break publish queue handling.
  }
}

function initialPlatformState(enabledPlatforms: PublishPlatform[]) {
  const map = {} as Record<PublishPlatform, PlatformState>;
  for (const platform of PLATFORMS) {
    map[platform] = {
      status: enabledPlatforms.includes(platform) ? 'pending' : 'published',
      attempts: 0,
      maxAttempts: 3,
      nextRetryAt: null,
      publishedUrl: enabledPlatforms.includes(platform) ? null : 'skipped',
      lastError: null,
    };
  }
  return map;
}

export async function enqueuePublishJob(input: {
  idempotencyKey: string;
  topic: string;
  plan: string;
  mode: 'hybrid' | 'safe_demo';
  payload: PublishJob['payload'];
  platforms: PublishPlatform[];
}) {
  const state = await readQueue();

  const existingJobId = state.idempotency[input.idempotencyKey];
  if (existingJobId) {
    const existing = state.jobs.find((x) => x.id === existingJobId);
    if (existing) return existing;
  }

  const job: PublishJob = {
    id: `job_${uuid()}`,
    idempotencyKey: input.idempotencyKey,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    topic: input.topic,
    plan: input.plan,
    mode: input.mode,
    payload: input.payload,
    platforms: initialPlatformState(input.platforms),
    history: ['Job utworzony i dodany do kolejki.'],
  };
  state.jobs.unshift(job);
  state.idempotency[input.idempotencyKey] = job.id;
  await writeQueue(state);
  return job;
}

function backoffSeconds(attempt: number) {
  return Math.min(45, 2 ** attempt * 3);
}

export async function getJobByIdempotencyKey(idempotencyKey: string) {
  const state = await readQueue();
  const jobId = state.idempotency[idempotencyKey];
  if (!jobId) return null;
  return state.jobs.find((x) => x.id === jobId) || null;
}

export async function processPublishJob(jobId: string, options?: { force?: boolean }) {
  const state = await readQueue();
  const job = state.jobs.find((x) => x.id === jobId);
  if (!job) return null;
  const settings = await readSettings();

  const now = Date.now();

  for (const platform of PLATFORMS) {
    const p = job.platforms[platform];
    if (!p) continue;
    if (p.status === 'published' || p.status === 'failed') continue;
    if (!options?.force && p.nextRetryAt && new Date(p.nextRetryAt).getTime() > now) continue;

    p.status = 'processing';
    p.attempts += 1;

    try {
      const result = await publishToPlatform({
        platform,
        topic: job.topic,
        payload: job.payload,
        apiKeys: settings.apiKeys,
        idempotencyKey: `${job.idempotencyKey}:${platform}`,
      });

      p.status = 'published';
      p.publishedUrl = result.publishedUrl;
      p.nextRetryAt = null;
      p.lastError = null;
      job.history.push(`${platform}: opublikowano poprawnie.`);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown connector error';
      if (p.attempts < p.maxAttempts) {
        p.status = 'retrying';
        p.lastError = message;
        const next = new Date(Date.now() + backoffSeconds(p.attempts) * 1000).toISOString();
        p.nextRetryAt = next;
        job.history.push(`${platform}: retry ${p.attempts}/${p.maxAttempts} zaplanowany na ${next}`);
      } else {
        p.status = 'failed';
        p.lastError = message;
        p.nextRetryAt = null;
        state.deadLetters.unshift({
          id: `dlq_${uuid()}`,
          jobId: job.id,
          platform,
          reason: message,
          attempts: p.attempts,
          failedAt: nowIso(),
        });
        job.history.push(`${platform}: przeniesiono do DLQ po ${p.maxAttempts} probach.`);
      }

      await writeAuditLog({
        action: 'publish.connector',
        outcome: p.attempts < p.maxAttempts ? 'deny' : 'error',
        ip: 'system',
        userAgent: 'publish-worker',
        details: {
          jobId: job.id,
          platform,
          attempts: p.attempts,
          error: message,
        },
      });
    }
  }

  job.updatedAt = nowIso();
  await writeQueue(state);
  return job;
}

export async function getPublishJob(jobId: string) {
  const state = await readQueue();
  return state.jobs.find((x) => x.id === jobId) || null;
}

export async function listPublishJobs(limit = 20) {
  const state = await readQueue();
  return state.jobs.slice(0, limit);
}

export async function listDeadLetters(limit = 50) {
  const state = await readQueue();
  return state.deadLetters.slice(0, limit);
}
