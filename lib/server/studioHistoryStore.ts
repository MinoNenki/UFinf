import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { StudioVideoBlueprint, StudioProviderMode } from '@/lib/server/mediaProvider';

export type StudioHistoryMode = 'image' | 'video';
export type StudioLanguage = 'pl' | 'en' | 'es';

export type StudioHistoryEntry = {
  id: string;
  mode: StudioHistoryMode;
  topic: string;
  preset: string;
  tone: string;
  language: StudioLanguage;
  providerMode: StudioProviderMode;
  providerUsed: string;
  generatedPrompt?: string;
  revisedPrompt?: string;
  imageDataUrl?: string;
  blueprint?: StudioVideoBlueprint;
  createdAt: string;
};

type StudioHistoryState = {
  items: StudioHistoryEntry[];
};

const RUNTIME_DIR = process.env.VERCEL ? path.join('/tmp', 'ufinf-runtime') : path.join(process.cwd(), '.runtime');
const HISTORY_FILE = path.join(RUNTIME_DIR, 'studio-history.json');
const MAX_HISTORY_ITEMS = 40;

let memoryState: StudioHistoryState | null = null;

function defaultState(): StudioHistoryState {
  return { items: [] };
}

async function readState(): Promise<StudioHistoryState> {
  try {
    const raw = await readFile(HISTORY_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StudioHistoryState>;
    return {
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return memoryState || defaultState();
  }
}

async function writeState(state: StudioHistoryState) {
  memoryState = state;
  try {
    await mkdir(path.dirname(HISTORY_FILE), { recursive: true });
    await writeFile(HISTORY_FILE, JSON.stringify(state, null, 2), 'utf8');
  } catch {
    // Serverless fallback keeps history in process memory when FS is not durable.
  }
}

function makeId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function saveStudioHistoryEntry(input: Omit<StudioHistoryEntry, 'id' | 'createdAt'>) {
  const state = await readState();
  const entry: StudioHistoryEntry = {
    ...input,
    id: makeId(),
    createdAt: new Date().toISOString(),
  };

  const next: StudioHistoryState = {
    items: [entry, ...state.items].slice(0, MAX_HISTORY_ITEMS),
  };

  await writeState(next);
  return entry;
}

export async function listStudioHistory(limit = 20) {
  const state = await readState();
  return state.items.slice(0, Math.max(1, Math.min(limit, MAX_HISTORY_ITEMS)));
}

export async function getStudioHistoryEntry(id: string) {
  const state = await readState();
  return state.items.find((item) => item.id === id) || null;
}
