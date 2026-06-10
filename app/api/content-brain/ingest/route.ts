import { NextResponse } from 'next/server';
import { ingestBrainEvents } from '@/lib/server/contentBrainStore';

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const events = Array.isArray(body.events) ? body.events : [];
  if (!events.length) {
    return NextResponse.json({ error: 'events[] is required' }, { status: 400 });
  }
  const inserted = await ingestBrainEvents(events);
  return NextResponse.json({ inserted });
}
