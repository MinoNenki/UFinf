import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { AppSettings, PublicAppSettings } from '@/lib/settings';

const SETTINGS_FILE = path.join(process.cwd(), '.runtime', 'app-settings.json');

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

export function defaultSettings(): AppSettings {
  return {
    antiLoss: {
      maxRequestCostUsd: num(process.env.MAX_REQUEST_COST_USD, 0.12),
      dailyGlobalAiBudgetUsd: num(process.env.DAILY_GLOBAL_AI_BUDGET_USD, 20),
      freeDailyGenerations: num(process.env.FREE_DAILY_GENERATIONS, 5),
      proDailyGenerations: num(process.env.PRO_DAILY_GENERATIONS, 60),
      premiumPlusDailyGenerations: num(process.env.PREMIUM_PLUS_DAILY_GENERATIONS, 180),
      softStopPercent: num(process.env.SOFT_STOP_PERCENT, 80),
    },
    apiKeys: {
      openaiApiKey: process.env.OPENAI_API_KEY || '',
      anthropicApiKey: process.env.ANTHROPIC_API_KEY || '',
      replicateApiToken: process.env.REPLICATE_API_TOKEN || '',
      tiktokAccessToken: process.env.TIKTOK_ACCESS_TOKEN || '',
      tiktokOpenId: process.env.TIKTOK_OPEN_ID || '',
      youtubeAccessToken: process.env.YOUTUBE_ACCESS_TOKEN || '',
      youtubeChannelId: process.env.YOUTUBE_CHANNEL_ID || '',
      instagramAccessToken: process.env.INSTAGRAM_ACCESS_TOKEN || '',
      instagramUserId: process.env.INSTAGRAM_USER_ID || '',
      facebookAccessToken: process.env.FACEBOOK_ACCESS_TOKEN || '',
      facebookPageId: process.env.FACEBOOK_PAGE_ID || '',
      xBearerToken: process.env.X_BEARER_TOKEN || '',
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
    await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
    await writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings(), null, 2), 'utf8');
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
        ...base.apiKeys,
        ...(parsed.apiKeys || {}),
      },
      features: {
        ...base.features,
        ...(parsed.features || {}),
      },
      updatedAt: parsed.updatedAt || base.updatedAt,
    };
  } catch {
    return defaultSettings();
  }
}

export async function writeSettings(next: AppSettings): Promise<AppSettings> {
  await mkdir(path.dirname(SETTINGS_FILE), { recursive: true });
  const data: AppSettings = {
    ...next,
    updatedAt: new Date().toISOString(),
  };
  await writeFile(SETTINGS_FILE, JSON.stringify(data, null, 2), 'utf8');
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
