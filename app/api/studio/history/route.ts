import { NextResponse } from 'next/server';
import { listStudioHistory } from '@/lib/server/studioHistoryStore';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || 20);
  const items = await listStudioHistory(limit);
  return NextResponse.json({ ok: true, items });
}
