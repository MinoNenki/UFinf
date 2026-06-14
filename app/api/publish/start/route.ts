import { NextResponse } from 'next/server';
import { budgetGuard } from '@/lib/budget';
import { PlanKey } from '@/lib/settings';
import { readSettings } from '@/lib/server/settingsStore';
import { reserveUsage, resolveEffectivePlan } from '@/lib/server/usageStore';
import { enqueuePublishJob, getJobByIdempotencyKey, processPublishJob, PublishPlatform } from '@/lib/server/publishQueue';
import { generateGrowthPackFromProvider } from '@/lib/server/aiProvider';
import { buildOneClickHybridPlan } from '@/lib/server/hybridEngine';

const DEFAULT_PLATFORMS: PublishPlatform[] = ['tiktok', 'youtube', 'instagram', 'facebook', 'x'];

function parsePlatforms(input: unknown): PublishPlatform[] {
  if (!Array.isArray(input)) return DEFAULT_PLATFORMS;
  const valid = input.filter((p) => DEFAULT_PLATFORMS.includes(p as PublishPlatform)) as PublishPlatform[];
  return valid.length ? valid : DEFAULT_PLATFORMS;
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const requestIdempotency = String(req.headers.get('idempotency-key') || body.idempotencyKey || '').trim();
  const idempotencyKey = requestIdempotency || `publish-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const language = String(body.language || 'pl') as 'pl' | 'en' | 'es';
  const requestedPlan = (body.plan || 'free') as PlanKey;
  const customerEmail = String(body.customerEmail || '').trim().toLowerCase();
  const access = await resolveEffectivePlan(requestedPlan, customerEmail);
  const plan = access.effectivePlan;
  const topic = String(body.topic || '').trim();
  const niche = String(body.niche || 'creator economy').trim();
  const platforms = parsePlatforms(body.platforms);

  if (!topic) {
    return NextResponse.json({ error: 'Topic is required.' }, { status: 400 });
  }

  const settings = await readSettings();
  if (!settings.features.oneClickPublishEnabled) {
    return NextResponse.json({ error: 'One Click Publish jest tymczasowo wylaczone.' }, { status: 403 });
  }

  if (plan !== 'premium_plus' && plan !== 'expert') {
    return NextResponse.json({ error: 'One Click Publish jest dostepne od planu Premium Plus.' }, { status: 403 });
  }

  const guard = budgetGuard(plan, topic.length + niche.length + 700, settings.antiLoss);
  if (!guard.allowed) {
    return NextResponse.json({ error: guard.message, guard }, { status: 402 });
  }

  const usageReservation = await reserveUsage(plan, guard.estimatedCost, settings.antiLoss, customerEmail);
  if (!usageReservation.allowed) {
    return NextResponse.json({ error: usageReservation.message, guard, usage: usageReservation.usage }, { status: 402 });
  }

  const hybridPlan = buildOneClickHybridPlan(plan, {
    hasOpenAi: Boolean(settings.apiKeys.openaiApiKey),
    hasAnthropic: Boolean(settings.apiKeys.anthropicApiKey),
  });

  let pack;
  try {
    pack = await generateGrowthPackFromProvider({
      topic,
      niche,
      platform: platforms.join(','),
      language,
      openaiApiKey: settings.apiKeys.openaiApiKey,
      anthropicApiKey: settings.apiKeys.anthropicApiKey,
    });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Nie udalo sie przygotowac tresci do publikacji.' }, { status: 502 });
  }

  const existing = await getJobByIdempotencyKey(idempotencyKey);
  if (existing) {
    return NextResponse.json({
      deduplicated: true,
      idempotencyKey,
      guard,
      usage: usageReservation.usage,
      hybridPlan,
      job: existing,
    });
  }

  const job = await enqueuePublishJob({
    idempotencyKey,
    topic,
    plan,
    mode: 'hybrid',
    platforms,
    payload: {
      descriptionByPlatform: {
        tiktok: pack.content.tiktok,
        youtube: pack.content.shorts,
        instagram: pack.content.reels,
        facebook: pack.content.facebook,
        x: pack.content.x,
      },
      hashtags: pack.hashtags,
      thumbnailPrompt: `Miniatura dla: ${topic}. Styl dynamiczny, wysoki kontrast, lead magnet.`
    },
  });

  const processed = await processPublishJob(job.id);

  return NextResponse.json({
    deduplicated: false,
    idempotencyKey,
    guard,
    usage: usageReservation.usage,
    hybridPlan,
    job: processed || job,
  });
}
