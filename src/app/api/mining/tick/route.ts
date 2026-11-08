import { NextResponse } from 'next/server';
import { platformState } from '@/lib/state';

export async function GET() {
  // Calculate passive income from all active nodes
  const totalDailyYield = platformState.nodes
    .filter((n) => n.status === 'active')
    .reduce((sum, n) => sum + n.dailyYieldUsd, 0);

  // Micro-earning increment per 5 seconds: (DailyYield / 86400) * 5
  const microIncrement = (totalDailyYield / 86400) * 5;
  platformState.addFunds(microIncrement);

  return NextResponse.json({
    success: true,
    walletBalance: platformState.walletBalance,
    totalMinedUsd: platformState.totalMinedUsd,
    totalWithdrawnUsd: platformState.totalWithdrawnUsd,
    activeNodesCount: platformState.nodes.length,
    dailyEarningRate: totalDailyYield,
  });
}