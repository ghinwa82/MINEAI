import { NextResponse } from 'next/server';

import { sessionCookie } from '@/lib/auth';
import { supabaseSessionToken, tokenAssuranceLevel } from '@/lib/member-session';
import { NEXT_COOKIE, VERIFIER_COOKIE, oauthCookie, readCookie, safeNext } from '@/lib/oauth-pkce';
import { exchangeCodeForSession, verifyTokenHash, type AuthSession, type AuthUser } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const VERIFY_TYPES = ['recovery', 'email', 'signup'] as const;
type VerifyType = (typeof VERIFY_TYPES)[number];

function asVerifyType(value: string | null): VerifyType {
  return value && (VERIFY_TYPES as readonly string[]).includes(value) ? (value as VerifyType) : 'email';
}

function hasVerifiedFactor(user: AuthUser): boolean {
  return (user.factors ?? []).some((factor) => factor.status === 'verified');
}

/**
 * The landing point for every sign-in link.
 *
 * Three shapes can arrive here and each is handled on the server:
 *
 *   ?code=…          an OAuth handshake — redeemed with the PKCE verifier cookie
 *   ?token_hash=…    an email confirmation or recovery link
 *   #access_token=…  the implicit-flow fragment, which never reaches the server
 *
 * The first two are exchanged for a real session and answered with an HttpOnly
 * cookie before the visitor sees a page, so `/dashboard` is never rendered in a
 * half-signed-in state. The third is forwarded to a client page; the redirect
 * inherits the fragment, which no server ever sees.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const params = url.searchParams;
  const origin = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || url.origin).replace(/\/$/, '');

  const clearHandshake = (response: NextResponse) => {
    response.headers.append('Set-Cookie', oauthCookie(VERIFIER_COOKIE, '', 0));
    response.headers.append('Set-Cookie', oauthCookie(NEXT_COOKIE, '', 0));
    return response;
  };

  const providerError = params.get('error') ?? params.get('error_code');
  if (providerError) {
    return clearHandshake(
      NextResponse.redirect(`${origin}/login?oauth=${encodeURIComponent(providerError)}`, 303),
    );
  }

  const code = params.get('code');
  const tokenHash = params.get('token_hash');

  if (!code && !tokenHash) {
    // Fragment flow. The redirect inherits the fragment (RFC 7231 §7.1.2), so
    // the client handler still receives the tokens, which never reach a server.
    return NextResponse.redirect(new URL('/auth/callback/complete', request.url), 303);
  }

  const verifyType = asVerifyType(params.get('type'));
  const next = safeNext(readCookie(request, NEXT_COOKIE) ?? params.get('next'));

  let session: AuthSession | null = null;
  if (code) {
    const verifier = readCookie(request, VERIFIER_COOKIE) ?? undefined;
    const result = await exchangeCodeForSession(code, verifier);
    if (result.ok && result.data) session = result.data;
  } else if (tokenHash) {
    const result = await verifyTokenHash(tokenHash, verifyType);
    if (result.ok && result.data) session = result.data;
  }

  if (!session) {
    return clearHandshake(NextResponse.redirect(`${origin}/login?oauth=expired`, 303));
  }

  // A member with a confirmed second factor must present it; handing them a
  // full session here would quietly bypass the protection they enabled.
  if (hasVerifiedFactor(session.user) && tokenAssuranceLevel(session.access_token) !== 'aal2') {
    return clearHandshake(NextResponse.redirect(`${origin}/login?mfa=required`, 303));
  }

  const destination = verifyType === 'recovery' ? '/reset-password' : next;
  const response = NextResponse.redirect(`${origin}${destination}`, 303);
  response.headers.append('Set-Cookie', sessionCookie(supabaseSessionToken(session)));
  return clearHandshake(response);
}
