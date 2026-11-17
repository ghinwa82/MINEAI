import { NextResponse } from 'next/server';

import { getFeedItems } from '@/lib/growth-swarm';
import { normalizeLanguage } from '@/lib/languages';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Public JSON syndication feed.
 *
 * `GET /api/public/feed?lang=fr` returns the same items as `/feed.xml` in a
 * shape any aggregator or app can consume without parsing XML.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lang = normalizeLanguage(url.searchParams.get('lang'));
  const items = await getFeedItems(lang, 20).catch(() => []);

  return NextResponse.json(
    {
      ok: true,
      lang,
      title: 'MineAI Market Insights',
      updatedAt: new Date().toISOString(),
      count: items.length,
      items,
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=900',
        'Access-Control-Allow-Origin': '*',
      },
    },
  );
}
