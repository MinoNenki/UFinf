import { existsSync, readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AppSettings, PublicAppSettings } from '@/lib/settings';

const BASE_DIRS = [
  process.cwd(),
  path.join(process.cwd(), 'ai_growth_os'),
];

const SETTINGS_FILE = BASE_DIRS
  .map((dir) => path.join(dir, '.runtime', 'app-settings.json'))
  .find((file) => existsSync(file)) || path.join(BASE_DIRS[0], '.runtime', 'app-settings.json');

const ENV_LOCAL_FILES = BASE_DIRS.map((dir) => path.join(dir, '.env.local'));

let memorySettings: AppSettings | null = null;

let cachedEnvLocal: Record<string, string> | null = null;

function readEnvLocalValue(name: string) {
  if (cachedEnvLocal) {
    return cachedEnvLocal[name] || '';
  }

  cachedEnvLocal = {};
  for (const envFile of ENV_LOCAL_FILES) {
    if (!existsSync(envFile)) continue;
    const lines = readFileSync(envFile, 'utf8').split(/\r?\n/);
    for (const raw of lines) {
      const line = raw.trim();
      if (!line || line.startsWith('#')) continue;
      const index = line.indexOf('=');
      if (index <= 0) continue;
      const key = line.slice(0, index).trim();
      const value = line.slice(index + 1).trim();
      if (!(key in cachedEnvLocal)) {
        cachedEnvLocal[key] = value;
      }
    }
  }

  return cachedEnvLocal[name] || '';
}

function envValue(name: string) {
  return process.env[name] || readEnvLocalValue(name) || '';
}

function num(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function bool(value: string | undefined, fallback: boolean) {
  if (value == null) return fallback;
  const normalized = value.trim().toLowerCase();
  if (normalized === 'true') return true;
  if (normalized === 'false') return false;
  return fallback;
}

function preferNonEmptyString(primary: unknown, fallback: string) {
  return typeof primary === 'string' && primary.trim() ? primary.trim() : fallback;
}

export function defaultSettings(): AppSettings {
  return {
    antiLoss: {
      maxRequestCostUsd: num(process.env.MAX_REQUEST_COST_USD, 0.12),
      dailyGlobalAiBudgetUsd: num(process.env.DAILY_GLOBAL_AI_BUDGET_USD, 25),
      freeDailyGenerations: num(process.env.FREE_DAILY_GENERATIONS, 5),
      proDailyGenerations: num(process.env.PRO_DAILY_GENERATIONS, 70),
      premiumPlusDailyGenerations: num(process.env.PREMIUM_PLUS_DAILY_GENERATIONS, 220),
      softStopPercent: num(process.env.SOFT_STOP_PERCENT, 72),
    },
    apiKeys: {
      openaiApiKey: envValue('OPENAI_API_KEY'),
      anthropicApiKey: envValue('ANTHROPIC_API_KEY'),
      replicateApiToken: envValue('REPLICATE_API_TOKEN'),
      tiktokAccessToken: envValue('TIKTOK_ACCESS_TOKEN'),
      tiktokOpenId: envValue('TIKTOK_OPEN_ID'),
      youtubeAccessToken: envValue('YOUTUBE_ACCESS_TOKEN'),
      youtubeChannelId: envValue('YOUTUBE_CHANNEL_ID'),
      instagramAccessToken: envValue('INSTAGRAM_ACCESS_TOKEN'),
      instagramUserId: envValue('INSTAGRAM_USER_ID'),
      facebookAccessToken: envValue('FACEBOOK_ACCESS_TOKEN'),
      facebookPageId: envValue('FACEBOOK_PAGE_ID'),
      xBearerToken: envValue('X_BEARER_TOKEN'),
    },
    features: {
      oneClickPublishEnabled: bool(process.env.FEATURE_ONE_CLICK_PUBLISH, true),
      aiContentBrainEnabled: bool(process.env.FEATURE_AI_CONTENT_BRAIN, true),
    },
    updatedAt: new Date().toISOString(),
  };
}

async function ensureSettingsFile() {
  try {
    await readFile(SETTINGS_FILE, 'utf8');
  } catch {
    const defaults = defaultSettings();
    memorySettings = defaults;
    try {
      await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
      await writeFile(SETTINGS_FILE, JSON.stringify(defaults, null, 2), 'utf8');
    } catch {
      // Środowiska readonly (np. serverless) działają dalej na pamięci procesu.
    }
  }
}

export async function readSettings(): Promise<AppSettings> {
  await ensureSettingsFile();
  try {
    const raw = await readFile(SETTINGS_FILE, 'utf8');
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    const base = defaultSettings();
    return {
      antiLoss: {
        ...base.antiLoss,
        ...(parsed.antiLoss || {}),
      },
      apiKeys: {
        openaiApiKey: preferNonEmptyString(parsed.apiKeys?.openaiApiKey, base.apiKeys.openaiApiKey),
        anthropicApiKey: preferNonEmptyString(parsed.apiKeys?.anthropicApiKey, base.apiKeys.anthropicApiKey),
        replicateApiToken: preferNonEmptyString(parsed.apiKeys?.replicateApiToken, base.apiKeys.replicateApiToken),
        tiktokAccessToken: preferNonEmptyString(parsed.apiKeys?.tiktokAccessToken, base.apiKeys.tiktokAccessToken),
        tiktokOpenId: preferNonEmptyString(parsed.apiKeys?.tiktokOpenId, base.apiKeys.tiktokOpenId),
        youtubeAccessToken: preferNonEmptyString(parsed.apiKeys?.youtubeAccessToken, base.apiKeys.youtubeAccessToken),
        youtubeChannelId: preferNonEmptyString(parsed.apiKeys?.youtubeChannelId, base.apiKeys.youtubeChannelId),
        instagramAccessToken: preferNonEmptyString(parsed.apiKeys?.instagramAccessToken, base.apiKeys.instagramAccessToken),
        instagramUserId: preferNonEmptyString(parsed.apiKeys?.instagramUserId, base.apiKeys.instagramUserId),
        facebookAccessToken: preferNonEmptyString(parsed.apiKeys?.facebookAccessToken, base.apiKeys.facebookAccessToken),
        facebookPageId: preferNonEmptyString(parsed.apiKeys?.facebookPageId, base.apiKeys.facebookPageId),
        xBearerToken: preferNonEmptyString(parsed.apiKeys?.xBearerToken, base.apiKeys.xBearerToken),
      },
      features: {
        ...base.features,
        ...(parsed.features || {}),
      },
      updatedAt: parsed.updatedAt || base.updatedAt,
    };
  } catch {
    if (memorySettings) {
      return memorySettings;
    }
    return defaultSettings();
  }
}

export async function writeSettings(next: AppSettings): Promise<AppSettings> {
  const data: AppSettings = {
    ...next,
    updatedAt: new Date().toISOString(),
  };
  memorySettings = data;
  try {
    await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    await writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch {
    // Brak trwałego FS nie powinien wysadzać panelu ustawień i generowania.
  }
  return data;
}

export function toPublicSettings(settings: AppSettings): PublicAppSettings {
  return {
    antiLoss: settings.antiLoss,
    apiKeys: {
      openaiConfigured: Boolean(settings.apiKeys.openaiApiKey),
      anthropicConfigured: Boolean(settings.apiKeys.anthropicApiKey),
      replicateConfigured: Boolean(settings.apiKeys.replicateApiToken),
      tiktokConfigured: Boolean(settings.apiKeys.tiktokAccessToken && settings.apiKeys.tiktokOpenId),
      youtubeConfigured: Boolean(settings.apiKeys.youtubeAccessToken && settings.apiKeys.youtubeChannelId),
      instagramConfigured: Boolean(settings.apiKeys.instagramAccessToken && settings.apiKeys.instagramUserId),
      facebookConfigured: Boolean(settings.apiKeys.facebookAccessToken && settings.apiKeys.facebookPageId),
      xConfigured: Boolean(settings.apiKeys.xBearerToken),
    },
    features: settings.features,
    updatedAt: settings.updatedAt,
  };
}
