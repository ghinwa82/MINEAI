import { NextResponse } from 'next/server';

import { pushAgentLog } from '@/lib/agents';
import { accrueAll, persistAllPositions } from '@/lib/mining';
import { secretsMatch } from '@/lib/security';
import { logEventToDatabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Mining accrual cron.
 *
 * Runs on external edge infrastructure — no hardware, no electricity. Vercel
 * sends the deployment secret as a bearer token. A caller without the secret
 * gets nothing, and if no secret is configured the route refuses to run rather
 * than becoming a public faucet.
 *
 * Accrual is time-based on read, so this sweep is the durability pass: it
 * advances every position and writes each multi-coin balance to Supabase.
 */
function authorised(request: Request): boolean {
  const expected = process.env.CRON_SECRET?.trim() ?? '';
  if (!expected) return false;
  const header = request.headers.get('authorization') ?? '';
  const url = new URL(request.url);
  return (
    secretsMatch(header.replace(/^Bearer\s+/i, ''), expected) ||
    secretsMatch(url.searchParams.get('secret'), expected)
  );
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json(
      {
        ok: false,
        error: process.env.CRON_SECRET
          ? 'Unauthorised cron request'
          : 'CRON_SECRET is not configured; the accrual job will not run.',
      },
      { status: process.env.CRON_SECRET ? 401 : 503 },
    );
  }

  const result = accrueAll();
  const persisted = await persistAllPositions();

  pushAgentLog({
    agentName: 'TelemetryAuditor',
    action: `Edge accrual swept ${result.positions} position${result.positions === 1 ? '' : 's'} and emitted ${result.tokens} $MINEAI across seven coin rails (${result.usd} USD).`,
    status: 'success',
    details: result,
  });

  await logEventToDatabase({
    table: 'mining_accruals',
    payload: {
      positions: result.positions,
      tokens: result.tokens,
      usd: result.usd,
      coins: result.coins,
      persisted,
      ran_at: new Date().toISOString(),
    },
  });

  return NextResponse.json({ ok: true, ranAt: new Date().toISOString(), persisted, ...result });
}
