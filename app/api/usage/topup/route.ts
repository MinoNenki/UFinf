import { NextResponse } from 'next/server';
import { TOP_UP_PACKS, type TopUpPackId } from '@/lib/budget';
import { purchaseTopUp, usageSnapshot } from '@/lib/server/usageStore';

function isTopUpPackId(value: unknown): value is TopUpPackId {
  return value === 'boost_25' || value === 'boost_75' || value === 'boost_200';
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const customerEmail = searchParams.get('email') || '';
  const usage = await usageSnapshot(customerEmail);
  return NextResponse.json({
    packs: Object.values(TOP_UP_PACKS),
    usage,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const packId = body?.packId;
  const customerEmail = String(body?.customerEmail || '').trim().toLowerCase();

  if (!isTopUpPackId(packId)) {
    return NextResponse.json(
      {
        error: 'Nieprawidlowy pakiet dokupienia.',
      },
      { status: 400 },
    );
  }

  const result = await purchaseTopUp(packId, customerEmail);
  if (!result.ok) {
    return NextResponse.json({ error: result.message, usage: result.usage }, { status: 400 });
  }

  return NextResponse.json({
    message: result.message,
    purchase: result.purchase,
    usage: result.usage,
    packs: Object.values(TOP_UP_PACKS),
  });
}
