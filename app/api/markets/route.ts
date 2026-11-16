import { NextResponse } from 'next/server';

import { getMarketSnapshot } from '@/lib/markets';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Market board feed.
 *
 * The heavy lifting (upstream fetch + normalisation) happens in `lib/markets`,
 * which keeps a short global cache. This route only decides whether the caller
 * is asking for a forced refresh.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const force = url.searchParams.get('refresh') === '1';

  try {
    const snapshot = await getMarketSnapshot(force);
    return NextResponse.json(
      { ok: true, ...snapshot },
      {
        headers: {
          'Cache-Control': 'public, max-age=15, s-maxage=30, stale-while-revalidate=60',
        },
      },
    );
  } catch {
    return NextResponse.json({ ok: false, error: 'The market feed is unavailable' }, { status: 503 });
  }
}
