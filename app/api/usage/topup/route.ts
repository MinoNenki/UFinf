import { NextResponse } from 'next/server';
import { TOP_UP_PACKS, type TopUpPackId } from '@/lib/budget';
import { purchaseTopUp, usageSnapshot } from '@/lib/server/usageStore';

function isTopUpPackId(value: unknown): value is TopUpPackId {
  return value === 'boost_25' || value === 'boost_75' || value === 'boost_200';
}

export async function GET() {
  const usage = await usageSnapshot();
  return NextResponse.json({
    packs: Object.values(TOP_UP_PACKS),
    usage,
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const packId = body?.packId;

  if (!isTopUpPackId(packId)) {
    return NextResponse.json(
      {
        error: 'Nieprawidlowy pakiet dokupienia.',
      },
      { status: 400 },
    );
  }

  const result = await purchaseTopUp(packId);
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
