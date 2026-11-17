import { NextResponse } from 'next/server';

import { INDEXNOW_KEY, defaultUrlSet, pingIndexNow } from '@/lib/indexnow';
import { absoluteUrl } from '@/lib/schema';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 30;

/**
 * IndexNow submission endpoint.
 *
 * GET is public: search engines and operators need to read the key and its
 * location to verify domain ownership. POST is the write action and requires
 * `INDEXNOW_SECRET` in an `x-indexnow-secret` header (or a bearer token). When
 * the secret is absent the endpoint refuses rather than accepting anonymous
 * submissions that could be used to spam the engines with our domain.
 */
export function GET() {
  return NextResponse.json(
    {
      ok: true,
      key: INDEXNOW_KEY,
      keyLocation: absoluteUrl(`/${INDEXNOW_KEY}.txt`),
      endpoints: [
        'api.indexnow.org',
        'www.bing.com',
        'yandex.com',
        'search.seznam.cz',
        'searchadvisor.naver.com',
      ],
      urls: defaultUrlSet().length,
    },
    { headers: { 'Cache-Control': 'public, max-age=3600' } },
  );
}

export async function POST(request: Request) {
  const secret = process.env.INDEXNOW_SECRET?.trim();
  if (!secret) {
    return NextResponse.json(
      { ok: false, error: 'IndexNow submission is not configured' },
      { status: 503 },
    );
  }

  const header = request.headers.get('x-indexnow-secret');
  const authorization = request.headers.get('authorization');
  const bearer = authorization?.toLowerCase().startsWith('bearer ')
    ? authorization.slice(7).trim()
    : null;

  if (header !== secret && bearer !== secret) {
    return NextResponse.json({ ok: false, error: 'Unauthorised' }, { status: 401 });
  }

  let urls: string[] = defaultUrlSet();
  try {
    const body = (await request.json()) as { urls?: unknown };
    if (Array.isArray(body.urls)) {
      urls = body.urls.filter((value): value is string => typeof value === 'string');
    }
  } catch {
    // No body means "submit the whole sitemap", which is the default above.
  }

  const results = await pingIndexNow(urls);
  const accepted = results.filter((result) => result.ok).length;

  return NextResponse.json(
    {
      ok: accepted > 0,
      submitted: urls.length,
      accepted,
      results,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
