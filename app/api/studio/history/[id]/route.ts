import { NextResponse } from 'next/server';
import { getStudioHistoryEntry } from '@/lib/server/studioHistoryStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const item = await getStudioHistoryEntry(id);

  if (!item) {
    return NextResponse.json({ error: 'History item not found.' }, { status: 404 });
  }

  return NextResponse.json({ ok: true, item });
}
