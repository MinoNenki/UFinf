import { NextResponse } from 'next/server';
import { getBrainInsights } from '@/lib/server/contentBrainStore';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const limit = Number(url.searchParams.get('limit') || 5);
  const lang = String(url.searchParams.get('lang') || 'pl') as 'pl' | 'en' | 'es';
  const insights = await getBrainInsights(Number.isFinite(limit) ? limit : 5, lang);
  return NextResponse.json(insights);
}
