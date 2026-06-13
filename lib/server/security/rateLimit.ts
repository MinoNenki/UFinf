import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

type RateLimitState = {
  buckets: Record<string, Record<string, number[]>>;
};

const RATE_LIMIT_FILE = path.join(process.cwd(), '.runtime', 'rate-limit.json');

let memoryRateLimitState: RateLimitState | null = null;

async function readState(): Promise<RateLimitState> {
  try {
    const raw = await readFile(RATE_LIMIT_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<RateLimitState>;
    return { buckets: parsed.buckets || {} };
  } catch {
    if (memoryRateLimitState) {
      return memoryRateLimitState;
    }
    return { buckets: {} };
  }
}

async function writeState(state: RateLimitState) {
  memoryRateLimitState = state;
  try {
    await mkdir(path.dirname(RATE_LIMIT_FILE), { recursive: true });
    await writeFile(RATE_LIMIT_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Readonly FS fallback: keep state in memory for current runtime.
  }
}

export async function consumeRateLimit(input: {
  bucket: string;
  key: string;
  maxRequests: number;
  windowSeconds: number;
}) {
  const state = await readState();
  const now = Date.now();
  const windowMs = input.windowSeconds * 1000;

  state.buckets[input.bucket] ||= {};
  const current = state.buckets[input.bucket][input.key] || [];
  const filtered = current.filter((ts) => now - ts < windowMs);

  if (filtered.length >= input.maxRequests) {
    const oldest = filtered[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000));
    state.buckets[input.bucket][input.key] = filtered;
    await writeState(state);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  filtered.push(now);
  state.buckets[input.bucket][input.key] = filtered;
  await writeState(state);

  return {
    allowed: true,
    remaining: Math.max(0, input.maxRequests - filtered.length),
    retryAfterSeconds: 0,
  };
}
