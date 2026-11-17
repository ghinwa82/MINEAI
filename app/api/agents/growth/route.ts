import { NextResponse } from 'next/server';

import { growthState, runGrowthCycle } from '@/lib/growth-swarm';
import { secretsMatch } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({ ok: true, state: growthState() });
}

/** Manual run is reserved for a caller holding the deployment or growth secret. */
export async function POST(request: Request) {
  const expected = [process.env.CRON_SECRET?.trim() ?? '', process.env.INDEXNOW_SECRET?.trim() ?? ''].filter(
    Boolean,
  );
  const header = request.headers.get('authorization') ?? '';
  const provided =
    header.replace(/^Bearer\s+/i, '') ||
    request.headers.get('x-indexnow-secret') ||
    request.headers.get('x-growth-secret') ||
    new URL(request.url).searchParams.get('secret') ||
    '';
  if (expected.length === 0 || !expected.some((secret) => secretsMatch(provided, secret))) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 });
  }
  const summary = await runGrowthCycle('manual', { force: true });
  return NextResponse.json({ ok: true, summary, state: growthState() });
}
