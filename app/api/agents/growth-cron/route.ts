import { NextResponse } from 'next/server';

import { runGrowthCycle } from '@/lib/growth-swarm';
import { pushAgentLog } from '@/lib/agents';
import { secretsMatch } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;

function authorised(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim() ?? '';
  if (!expected) return false;
  const header = request.headers.get('authorization') ?? '';
  const url = new URL(request.url);
  return (
    secretsMatch(header.replace(/^Bearer\s+/i, ''), expected) ||
    secretsMatch(url.searchParams.get('secret'), expected) ||
    request.headers.get('x-vercel-cron') === '1'
  );
}

/**
 * Growth swarm daily cycle.
 *
 * Pulls live prices, writes the six-language market briefs and social scripts,
 * refreshes the sitemap URLs and pings IndexNow. Vercel cron authenticates with
 * the deployment secret; without one the route refuses to run.
 */
export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: process.env.CRON_SECRET
          ? 'Unauthorised cron request'
          : 'CRON_SECRET is not configured; the growth swarm will not run.',
      },
      { status: process.env.CRON_SECRET ? 401 : 503 },
    );
  }

  const summary = await runGrowthCycle('cron');

  pushAgentLog({
    agentName: 'GrowthSwarm',
    action: `Growth cycle wrote ${summary.briefs} briefs and ${summary.scripts} scripts, then submitted ${summary.urlsSubmitted} URLs to IndexNow.`,
    status: 'success',
    details: { briefs: summary.briefs, scripts: summary.scripts, urls: summary.urlsSubmitted },
  });

  return NextResponse.json(summary);
}
