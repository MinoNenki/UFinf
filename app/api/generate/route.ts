import { NextResponse } from 'next/server';
import { budgetGuard } from '@/lib/budget';
import type { PlanKey } from '@/lib/settings';
import { generateGrowthPackFromProvider, rankAndAutoFixPromptInput } from '@/lib/server/aiProvider';
import { readSettings } from '@/lib/server/settingsStore';
import { reserveUsage } from '@/lib/server/usageStore';
import { buildOneClickHybridPlan } from '@/lib/server/hybridEngine';
import { ingestBrainEvents } from '@/lib/server/contentBrainStore';
import { resolveCampaignStrategy } from '@/lib/server/campaignStrategy';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const plan = (body.plan || 'free') as PlanKey;
  const topic = String(body.topic || '');
  const attachmentContext = String(body.attachmentContext || '');
  const generationTopic = [topic.trim(), attachmentContext.trim()].filter(Boolean).join('\n\n');
  const settings = await readSettings();
  const guard = budgetGuard(plan, generationTopic.length + String(body.niche || '').length + 500, settings.antiLoss);

  if (!guard.allowed) {
    return NextResponse.json({ error: guard.message, guard }, { status: 402 });
  }

  const usageReservation = await reserveUsage(plan, guard.estimatedCost, settings.antiLoss);
  if (!usageReservation.allowed) {
    return NextResponse.json({
      error: usageReservation.message,
      guard,
      usage: usageReservation.usage,
    }, { status: 402 });
  }

  const language = String(body.language || 'pl') as 'pl' | 'en' | 'es';
  const campaignLengthDays = Math.max(1, Math.min(90, Number(body.campaignLengthDays) || 30));
  const campaignGoal = String(body.campaignGoal || 'awareness');
  const styleMode = String(body.styleMode || 'auto');
  const manualStyleHint = String(body.manualStyleHint || '');
  const strategy = resolveCampaignStrategy({
    topic: generationTopic,
    niche: String(body.niche || 'creator economy'),
    campaignGoal,
    styleMode,
    manualStyleHint,
    language,
  });

  const promptPreparation = rankAndAutoFixPromptInput({
    topic: generationTopic,
    niche: String(body.niche || 'creator economy'),
    platform: String(body.platform || 'all'),
    campaignGoal: strategy.goal,
    styleMode: strategy.styleMode,
    styleProfile: strategy.styleProfile,
  });

  let result;
  try {
    result = await generateGrowthPackFromProvider({
      topic: promptPreparation.fixedInput.topic,
      platform: promptPreparation.fixedInput.platform,
      niche: promptPreparation.fixedInput.niche,
      language,
      campaignLengthDays,
      openaiApiKey: settings.apiKeys.openaiApiKey,
      anthropicApiKey: settings.apiKeys.anthropicApiKey,
      campaignGoal: promptPreparation.fixedInput.campaignGoal,
      styleMode: promptPreparation.fixedInput.styleMode,
      styleProfile: promptPreparation.fixedInput.styleProfile,
      strategy,
    });
  } catch (error) {
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Nie udalo sie wygenerowac tresci AI.',
      guard,
      usage: usageReservation.usage,
    }, { status: 502 });
  }

  const hybridPlan = buildOneClickHybridPlan(plan, {
    hasOpenAi: Boolean(settings.apiKeys.openaiApiKey),
    hasAnthropic: Boolean(settings.apiKeys.anthropicApiKey),
  });

  if (Array.isArray(body.metrics) && body.metrics.length > 0) {
    await ingestBrainEvents(body.metrics);
  }

  return NextResponse.json({
    guard,
    usage: usageReservation.usage,
    result,
    features: settings.features,
    hybridPlan,
    mode: 'real_ai',
    strategy,
    promptQuality: promptPreparation.quality,
  });
}
