// src/app/api/nodes/activate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { networkState } from '@/lib/state';
import { StrixSecurityGuard } from '@/lib/security';
import { MiningNode, NodeTier } from '@/lib/types';

export async function GET() {
  return NextResponse.json({
    treasuryBalance: networkState.treasuryBalance,
    nodes: networkState.nodes,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const nodeTier = StrixSecurityGuard.sanitizeString(body.tier) as NodeTier;
    const nodeName = StrixSecurityGuard.sanitizeString(body.name);
    const nodePrice = Number(body.price);

    if (!nodePrice || nodePrice <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid node tier price' }, { status: 400 });
    }

    if (networkState.treasuryBalance < nodePrice) {
      return NextResponse.json({
        success: false,
        error: `Insufficient Treasury balance ($${networkState.treasuryBalance.toFixed(2)}). Need $${nodePrice.toFixed(2)} to deploy this node.`
      }, { status: 400 });
    }

    // Deduct cost from treasury
    networkState.deductTreasury(nodePrice);

    // Calculate dynamic node specifications based on tier
    let hashrate = '65.0 MH/s';
    let dailyYieldUsd = 2.45;
    if (nodeTier.includes('Quantum')) {
      hashrate = '160.0 MH/s';
      dailyYieldUsd = 6.80;
    } else if (nodeTier.includes('Nebula')) {
      hashrate = '420.0 MH/s';
      dailyYieldUsd = 18.50;
    } else if (nodeTier.includes('Titan')) {
      hashrate = '1,150.0 MH/s';
      dailyYieldUsd = 48.00;
    }

    const newNode: MiningNode = {
      id: `node-${Date.now()}`,
      name: nodeName || `${nodeTier} Node #${networkState.nodes.length + 1}`,
      tier: nodeTier || 'Edge Starter',
      price: nodePrice,
      hashrate,
      dailyYieldUsd,
      efficiency: '99.8%',
      uptime: 100.0,
      status: 'active',
      ipAddress: `198.51.${Math.floor(Math.random() * 250)}.${Math.floor(Math.random() * 250)}`,
      region: 'Frankfurt DePIN Cluster',
      deployedAt: new Date().toISOString(),
    };

    networkState.nodes.unshift(newNode);
    networkState.telemetry.onlineNodes = networkState.nodes.length;
    networkState.telemetry.userXp += 250;

    return NextResponse.json({
      success: true,
      message: `Node ${newNode.name} activated and connected to the DePIN telemetry grid.`,
      node: newNode,
      updatedTreasuryBalance: networkState.treasuryBalance,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Execution error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}