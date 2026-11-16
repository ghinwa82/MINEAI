import { NextResponse, type NextRequest } from 'next/server';

import { checkRateLimit } from '@/lib/rate-limit';

/**
 * Edge proxy.
 *
 * The old `middleware` file was renamed in Next 16; this is the replacement.
 * It does two jobs and nothing else:
 *
 *   1. Rate-limits every API call with a tighter bucket on money-moving and
 *      credential routes, so a single client cannot drain an RPC or brute-force
 *      a TOTP window.
 *   2. Stamps the standard rate-limit headers on the response so a well-behaved
 *      client can back off before it is refused.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const identity = forwarded || request.headers.get('x-real-ip') || 'anonymous';

  const sensitive =
    pathname.startsWith('/api/payments') ||
    pathname.startsWith('/api/wallet') ||
    pathname.startsWith('/api/security');

  const scope = sensitive ? 'sensitive' : 'api';
  const limit = checkRateLimit(`${identity}:${scope}`, sensitive ? 20 : 90, 60_000);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        error: sensitive
          ? 'Too many payment or security requests. Wait a minute and try again.'
          : 'Too many requests. Wait a minute and try again.',
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(limit.resetSeconds),
          'X-RateLimit-Limit': String(limit.limit),
          'X-RateLimit-Remaining': '0',
        },
      },
    );
  }

  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', String(limit.limit));
  response.headers.set('X-RateLimit-Remaining', String(limit.remaining));
  return response;
}

export const config = {
  matcher: ['/api/:path*'],
};
