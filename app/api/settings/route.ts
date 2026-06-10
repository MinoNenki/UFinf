import { NextResponse } from 'next/server';
import { AppSettings } from '@/lib/settings';
import { readSettings, toPublicSettings, writeSettings } from '@/lib/server/settingsStore';
import { getAdminSession, hasAdminPermission } from '@/lib/server/security/adminGuard';
import { consumeRateLimit } from '@/lib/server/security/rateLimit';
import { writeAuditLog } from '@/lib/server/security/auditLog';
import { getClientIp, getUserAgent } from '@/lib/server/security/requestMeta';

function clampNumber(value: unknown, fallback: number, min: number, max: number) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, parsed));
}

function optionalString(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

export async function GET(req: Request) {
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);
  const session = await getAdminSession();
  if (!session || !(await hasAdminPermission('settings:read'))) {
    await writeAuditLog({
      action: 'settings.read',
      outcome: 'deny',
      ip,
      userAgent,
      adminRole: session?.adminRole,
      details: { reason: 'forbidden' },
    });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rl = await consumeRateLimit({
    bucket: 'settings-read',
    key: `${ip}:${session.adminRole}`,
    maxRequests: 60,
    windowSeconds: 60,
  });
  if (!rl.allowed) {
    await writeAuditLog({
      action: 'settings.read',
      outcome: 'deny',
      ip,
      userAgent,
      adminRole: session.adminRole,
      details: { reason: 'rate_limit', retryAfterSeconds: rl.retryAfterSeconds },
    });
    return NextResponse.json({ error: 'Too many requests', retryAfterSeconds: rl.retryAfterSeconds }, { status: 429 });
  }

  const settings = await readSettings();
  await writeAuditLog({
    action: 'settings.read',
    outcome: 'allow',
    ip,
    userAgent,
    adminRole: session.adminRole,
  });
  return NextResponse.json(toPublicSettings(settings));
}

export async function PATCH(req: Request) {
  const ip = getClientIp(req);
  const userAgent = getUserAgent(req);
  const session = await getAdminSession();
  if (!session || !(await hasAdminPermission('settings:write'))) {
    await writeAuditLog({
      action: 'settings.write',
      outcome: 'deny',
      ip,
      userAgent,
      adminRole: session?.adminRole,
      details: { reason: 'forbidden' },
    });
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const rl = await consumeRateLimit({
    bucket: 'settings-write',
    key: `${ip}:${session.adminRole}`,
    maxRequests: 20,
    windowSeconds: 60,
  });
  if (!rl.allowed) {
    await writeAuditLog({
      action: 'settings.write',
      outcome: 'deny',
      ip,
      userAgent,
      adminRole: session.adminRole,
      details: { reason: 'rate_limit', retryAfterSeconds: rl.retryAfterSeconds },
    });
    return NextResponse.json({ error: 'Too many requests', retryAfterSeconds: rl.retryAfterSeconds }, { status: 429 });
  }

  const current = await readSettings();
  const body = await req.json().catch(() => ({} as Partial<AppSettings>));

  const next: AppSettings = {
    antiLoss: {
      maxRequestCostUsd: clampNumber(body?.antiLoss?.maxRequestCostUsd, current.antiLoss.maxRequestCostUsd, 0.01, 5),
      dailyGlobalAiBudgetUsd: clampNumber(body?.antiLoss?.dailyGlobalAiBudgetUsd, current.antiLoss.dailyGlobalAiBudgetUsd, 1, 5000),
      freeDailyGenerations: clampNumber(body?.antiLoss?.freeDailyGenerations, current.antiLoss.freeDailyGenerations, 1, 500),
      proDailyGenerations: clampNumber(body?.antiLoss?.proDailyGenerations, current.antiLoss.proDailyGenerations, 1, 5000),
      premiumPlusDailyGenerations: clampNumber(body?.antiLoss?.premiumPlusDailyGenerations, current.antiLoss.premiumPlusDailyGenerations, 1, 10000),
      softStopPercent: clampNumber(body?.antiLoss?.softStopPercent, current.antiLoss.softStopPercent, 50, 99),
    },
    apiKeys: {
      openaiApiKey: optionalString(body?.apiKeys?.openaiApiKey) || current.apiKeys.openaiApiKey,
      anthropicApiKey: optionalString(body?.apiKeys?.anthropicApiKey) || current.apiKeys.anthropicApiKey,
      replicateApiToken: optionalString(body?.apiKeys?.replicateApiToken) || current.apiKeys.replicateApiToken,
      tiktokAccessToken: optionalString(body?.apiKeys?.tiktokAccessToken) || current.apiKeys.tiktokAccessToken,
      tiktokOpenId: optionalString(body?.apiKeys?.tiktokOpenId) || current.apiKeys.tiktokOpenId,
      youtubeAccessToken: optionalString(body?.apiKeys?.youtubeAccessToken) || current.apiKeys.youtubeAccessToken,
      youtubeChannelId: optionalString(body?.apiKeys?.youtubeChannelId) || current.apiKeys.youtubeChannelId,
      instagramAccessToken: optionalString(body?.apiKeys?.instagramAccessToken) || current.apiKeys.instagramAccessToken,
      instagramUserId: optionalString(body?.apiKeys?.instagramUserId) || current.apiKeys.instagramUserId,
      facebookAccessToken: optionalString(body?.apiKeys?.facebookAccessToken) || current.apiKeys.facebookAccessToken,
      facebookPageId: optionalString(body?.apiKeys?.facebookPageId) || current.apiKeys.facebookPageId,
      xBearerToken: optionalString(body?.apiKeys?.xBearerToken) || current.apiKeys.xBearerToken,
    },
    features: {
      oneClickPublishEnabled: body?.features?.oneClickPublishEnabled ?? current.features.oneClickPublishEnabled,
      aiContentBrainEnabled: body?.features?.aiContentBrainEnabled ?? current.features.aiContentBrainEnabled,
    },
    updatedAt: current.updatedAt,
  };

  const saved = await writeSettings(next);
  await writeAuditLog({
    action: 'settings.write',
    outcome: 'allow',
    ip,
    userAgent,
    adminRole: session.adminRole,
    details: { updatedFeatures: saved.features },
  });
  return NextResponse.json(toPublicSettings(saved));
}
