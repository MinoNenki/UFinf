import { NextResponse } from 'next/server';
import { budgetGuard } from '@/lib/budget';
import type { PlanKey } from '@/lib/settings';
import { readSettings } from '@/lib/server/settingsStore';
import { usageSnapshot } from '@/lib/server/usageStore';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const requestedPlan = (body.plan || 'free') as PlanKey;
  const text = String(body.text || '');
  const customerEmail = String(body.customerEmail || '').trim().toLowerCase();
  const settings = await readSettings();
  const guard = budgetGuard(requestedPlan, text.length, settings.antiLoss);
  const usage = await usageSnapshot(customerEmail);
  return NextResponse.json({ guard, usage, antiLoss: settings.antiLoss });
}
