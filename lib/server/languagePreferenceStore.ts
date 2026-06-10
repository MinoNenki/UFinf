import { randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { Language } from '@/lib/i18n';

const STORE_FILE = path.join(process.cwd(), '.runtime', 'language-preferences.json');
const COOKIE_NAME = 'usinf_lang_scope';

export type LanguagePreferenceRecord = {
  scopeId: string;
  language: Language;
  savedAt: string;
  updatedAt: string;
  userId?: string;
};

type LanguagePreferenceStore = {
  scopes: Record<string, LanguagePreferenceRecord>;
};

function normalizeLanguage(input: unknown): Language | null {
  return input === 'pl' || input === 'en' || input === 'es' ? input : null;
}

async function ensureStore() {
  try {
    await readFile(STORE_FILE, 'utf8');
  } catch {
    await mkdir(path.dirname(STORE_FILE), { recursive: true });
    await writeFile(STORE_FILE, JSON.stringify({ scopes: {} } satisfies LanguagePreferenceStore, null, 2), 'utf8');
  }
}

async function readStore(): Promise<LanguagePreferenceStore> {
  await ensureStore();
  try {
    const raw = await readFile(STORE_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<LanguagePreferenceStore>;
    return { scopes: parsed.scopes || {} };
  } catch {
    return { scopes: {} };
  }
}

async function writeStore(store: LanguagePreferenceStore) {
  await mkdir(path.dirname(STORE_FILE), { recursive: true });
  await writeFile(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export function languageCookieName() {
  return COOKIE_NAME;
}

export function resolveLanguageScope(req: Request, body?: { userId?: string }) {
  const explicitUserId = typeof body?.userId === 'string' ? body.userId.trim() : '';
  if (explicitUserId) {
    return { scopeId: `user:${explicitUserId}`, userId: explicitUserId };
  }

  const headerUserId = req.headers.get('x-usinf-user-id')?.trim() || '';
  if (headerUserId) {
    return { scopeId: `user:${headerUserId}`, userId: headerUserId };
  }

  const cookieHeader = req.headers.get('cookie') || '';
  const existing = cookieHeader.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  const scopeId = existing?.[1] || randomUUID();
  return { scopeId, userId: undefined };
}

export async function readLanguagePreference(scopeId: string) {
  const store = await readStore();
  return store.scopes[scopeId] || null;
}

export async function upsertLanguagePreference(scopeId: string, language: Language, savedAt = new Date().toISOString(), userId?: string) {
  const store = await readStore();
  const next: LanguagePreferenceRecord = {
    scopeId,
    language,
    savedAt,
    updatedAt: new Date().toISOString(),
    ...(userId ? { userId } : {}),
  };
  store.scopes[scopeId] = next;
  await writeStore(store);
  return next;
}

export function parseLanguagePreferenceBody(body: unknown) {
  const record = body && typeof body === 'object' ? body as Record<string, unknown> : {};
  return {
    language: normalizeLanguage(record.language),
    savedAt: typeof record.savedAt === 'string' ? record.savedAt : undefined,
    userId: typeof record.userId === 'string' ? record.userId : undefined,
  };
}