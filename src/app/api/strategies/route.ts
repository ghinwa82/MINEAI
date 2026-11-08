// src/app/api/strategies/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { networkState } from '@/lib/state';
import { StrixSecurityGuard } from '@/lib/security';
import { StrategyEntry } from '@/lib/types';

export async function GET() {
  return NextResponse.json({
    strategies: networkState.strategies,
    count: networkState.strategies.length,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const title = StrixSecurityGuard.sanitizeString(body.title);
    const category = StrixSecurityGuard.sanitizeString(body.category) as StrategyEntry['category'];
    const targetMargin = StrixSecurityGuard.sanitizeString(body.targetMargin);
    const description = StrixSecurityGuard.sanitizeString(body.description);
    const estimatedRoi = Number(body.estimatedRoi) || 150;
    const author = StrixSecurityGuard.sanitizeString(body.author) || 'Lead DePIN Architect';

    if (!title || !description) {
      return NextResponse.json({ success: false, error: 'Title and strategy description are required' }, { status: 400 });
    }

    const newStrategy: StrategyEntry = {
      id: `strat-${Date.now()}`,
      title,
      category: category || 'Dropshipping Funnel',
      targetMargin: targetMargin || '35.0%',
      description,
      estimatedRoi,
      tags: Array.isArray(body.tags) ? body.tags.map((t: string) => StrixSecurityGuard.sanitizeString(t)) : ['DePIN', 'E-commerce'],
      author,
      createdAt: new Date().toISOString(),
    };

    networkState.strategies.unshift(newStrategy);
    networkState.telemetry.userXp += 75;

    return NextResponse.json({
      success: true,
      strategy: newStrategy,
      message: 'Strategy Entry saved and synchronized to the distributed execution hub.',
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error processing strategy';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}