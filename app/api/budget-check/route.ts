import { NextResponse } from 'next/server';
import { budgetGuard } from '@/lib/budget';
import type { PlanKey } from '@/lib/settings';
import { readSettings } from '@/lib/server/settingsStore';
import { usageSnapshot } from '@/lib/server/usageStore';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const plan = (body.plan || 'free') as PlanKey;
  const text = String(body.text || '');
  const settings = await readSettings();
  const guard = budgetGuard(plan, text.length, settings.antiLoss);
  const usage = await usageSnapshot();
  return NextResponse.json({ guard, usage, antiLoss: settings.antiLoss });
}
