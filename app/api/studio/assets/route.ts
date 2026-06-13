import { NextResponse } from 'next/server';
import { getFreeAssetsCatalog } from '@/lib/server/freeAssetsCatalog';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    ok: true,
    updatedAt: new Date().toISOString(),
    groups: getFreeAssetsCatalog(),
  });
}
