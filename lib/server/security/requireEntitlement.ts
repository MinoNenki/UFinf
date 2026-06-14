/**
 * requireEntitlement — reusable helper for premium API route protection.
 * Usage: const check = await requireEntitlement(req, ['pro','premium_plus','expert']);
 * If denied returns a NextResponse, otherwise returns null (caller may proceed).
 */

import { NextResponse } from 'next/server';
import { resolveEffectivePlan } from '@/lib/server/usageStore';
import type { PlanKey } from '@/lib/settings';

export async function requireEntitlement(
  req: Request,
  allowedPlans: PlanKey[],
  options?: { requireEmail?: boolean }
): Promise<NextResponse | null> {
  const url = new URL(req.url);
  const emailFromQuery = url.searchParams.get('email') || '';

  let emailFromBody = '';
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    try {
      const clone = req.clone();
      const body = await clone.json().catch(() => ({}));
      emailFromBody = String(body?.customerEmail || '').trim().toLowerCase();
    } catch {
      // GET or non-JSON — skip
    }
  }

  const customerEmail = emailFromBody || emailFromQuery;

  if (options?.requireEmail && !customerEmail) {
    return NextResponse.json(
      { error: 'customerEmail is required to access this feature.' },
      { status: 400 }
    );
  }

  const access = await resolveEffectivePlan('free', customerEmail);

  if (!allowedPlans.includes(access.effectivePlan)) {
    return NextResponse.json(
      {
        error: 'This feature requires an active subscription. Please upgrade your plan.',
        requiredPlans: allowedPlans,
        effectivePlan: access.effectivePlan,
        entitlement: access.entitlement,
      },
      { status: 403 }
    );
  }

  return null;
}
