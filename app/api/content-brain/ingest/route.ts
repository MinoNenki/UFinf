import { NextResponse } from 'next/server';
import { ingestBrainEvents } from '@/lib/server/contentBrainStore';
import { requireEntitlement } from '@/lib/server/security/requireEntitlement';

export async function POST(req: Request) {
  const guard = await requireEntitlement(req, ['premium_plus', 'expert']);
  if (guard) return guard;
  const body = await req.json().catch(() => ({}));
  const events = Array.isArray(body.events) ? body.events : [];
  if (!events.length) {
    return NextResponse.json({ error: 'events[] is required' }, { status: 400 });
  }
  const inserted = await ingestBrainEvents(events);
  return NextResponse.json({ inserted });
}
