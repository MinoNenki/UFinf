import { NextResponse } from 'next/server';
import { budgetGuard } from '@/lib/budget';
import type { PlanKey } from '@/lib/settings';
import { generateGrowthPack } from '@/lib/mockAi';
import { readSettings } from '@/lib/server/settingsStore';
import { reserveUsage } from '@/lib/server/usageStore';
import { buildOneClickHybridPlan } from '@/lib/server/hybridEngine';
import { ingestBrainEvents } from '@/lib/server/contentBrainStore';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const plan = (body.plan || 'free') as PlanKey;
  const topic = String(body.topic || '');
  const settings = await readSettings();
  const guard = budgetGuard(plan, topic.length + String(body.niche || '').length + 500, settings.antiLoss);

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

  // Tu docelowo podłączasz OpenAI/Anthropic. MVP działa bez spalania kluczy API.
  const result = generateGrowthPack({
    topic,
    platform: String(body.platform || 'all'),
    niche: String(body.niche || 'creator economy'),
    language: String(body.language || 'pl') as 'pl' | 'en' | 'es',
  });

  const hasRealAiKey = Boolean(settings.apiKeys.openaiApiKey || settings.apiKeys.anthropicApiKey);
  const hybridPlan = buildOneClickHybridPlan(plan, hasRealAiKey);

  if (Array.isArray(body.metrics) && body.metrics.length > 0) {
    await ingestBrainEvents(body.metrics);
  }

  return NextResponse.json({
    guard,
    usage: usageReservation.usage,
    result,
    features: settings.features,
    hybridPlan,
    mode: hasRealAiKey ? 'ready_for_real_ai' : 'safe_demo_mode',
  });
}
