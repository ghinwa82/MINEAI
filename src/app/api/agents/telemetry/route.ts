// src/app/api/agents/telemetry/route.ts
import { NextResponse } from 'next/server';
import { networkState } from '@/lib/state';

export async function GET() {
  // Simulate live ticking calculations
  const jitterMs = Math.floor(Math.random() * 8) + 10;
  networkState.telemetry.latencyMs = jitterMs;

  return NextResponse.json({
    telemetry: networkState.telemetry,
    treasuryBalance: networkState.treasuryBalance,
    totalNodes: networkState.nodes.length,
    timestamp: new Date().toISOString(),
  });
}