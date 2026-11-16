import { NextResponse } from 'next/server';

import { MINING_CONSTANTS, payoutTape } from '@/lib/mining';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Public settlement tape used by the homepage ticker and the rewards page. */
export async function GET() {
  return NextResponse.json({
    ok: true,
    payouts: payoutTape(12),
    tokenPriceUsd: MINING_CONSTANTS.tokenPriceUsd,
    updatedAt: new Date().toISOString(),
  });
}
