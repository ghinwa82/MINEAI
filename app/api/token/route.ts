import { NextResponse } from 'next/server';

import { MINING_CONSTANTS, VIP_TIERS, networkStats, tokenPriceUsd } from '@/lib/mining';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const TOTAL_SUPPLY = 1_000_000_000;
const SEED_BURNED = 4_120_000;
const SEED_HOLDERS = 18_420;

/**
 * $MINEAI token identity.
 *
 * Contract addresses are read from the environment after deployment; until
 * then the endpoint returns an empty address and `deployed: false` so the UI
 * never links to a contract that does not exist.
 */
export async function GET() {
  const bsc = process.env.NEXT_PUBLIC_MINEAI_BSC_CONTRACT?.trim() ?? '';
  const eth = process.env.NEXT_PUBLIC_MINEAI_ETH_CONTRACT?.trim() ?? '';
  const dex = process.env.NEXT_PUBLIC_MINEAI_DEX_URL?.trim() ?? '';

  const burned = SEED_BURNED;
  const price = tokenPriceUsd();

  return NextResponse.json({
    ok: true,
    token: {
      name: 'Mine AI',
      ticker: 'MINEAI',
      standard: ['BEP-20', 'ERC-20'],
      totalSupply: TOTAL_SUPPLY,
      circulatingSupply: TOTAL_SUPPLY - burned,
      burned,
      holders: SEED_HOLDERS,
      priceUsd: price,
      marketCapUsd: Number(((TOTAL_SUPPLY - burned) * price).toFixed(2)),
      stakingPools: [
        { name: 'Observer', apr: 8.4, lockDays: 0 },
        { name: 'Navigator', apr: 12.6, lockDays: 30 },
        { name: 'Whale', apr: 18.2, lockDays: 90 },
        { name: 'Leviathan', apr: 24.5, lockDays: 180 },
      ],
      contracts: {
        bsc: bsc || null,
        eth: eth || null,
        dex: dex || null,
        deployed: Boolean(bsc || eth),
      },
      constants: MINING_CONSTANTS,
      tiers: VIP_TIERS,
      network: networkStats(),
    },
  });
}
