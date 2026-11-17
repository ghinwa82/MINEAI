import { NextResponse } from 'next/server';

import { pingNewsPages } from '@/lib/indexnow';
import { getNewsFeed } from '@/lib/news';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * News feed.
 *
 * Returns headlines for the requested language plus the market badges that
 * sit beside them. Caching lives in `lib/news` (five minutes per locale) so
 * six concurrent readers of the same language share one upstream sweep.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lang = url.searchParams.get('lang');
  const force = url.searchParams.get('refresh') === '1';

  try {
    const payload = await getNewsFeed(lang, force);
    // A fresh batch means new headlines on six crawlable pages; tell the
    // engines once per ten minutes rather than once per reader.
    if (Date.now() - Date.parse(payload.updatedAt) < 15_000) {
      pingNewsPages();
    }
    return NextResponse.json(
      { ok: true, ...payload },
      {
        headers: {
          'Cache-Control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
        },
      },
    );
  } catch {
    return NextResponse.json(
      { ok: false, error: 'The news desk is unavailable' },
      { status: 503 },
    );
  }
}
