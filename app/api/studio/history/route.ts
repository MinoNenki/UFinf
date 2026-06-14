import { NextResponse } from 'next/server';
import { listStudioHistory } from '@/lib/server/studioHistoryStore';
import { requireEntitlement } from '@/lib/server/security/requireEntitlement';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const guard = await requireEntitlement(req, ['pro', 'premium_plus', 'expert']);
  if (guard) return guard;
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || 20);
  const items = await listStudioHistory(limit);
  return NextResponse.json({ ok: true, items });
}
