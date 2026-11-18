import { NextResponse } from 'next/server';

import { NEXT_COOKIE, VERIFIER_COOKIE, oauthCookie, pkcePair, safeNext } from '@/lib/oauth-pkce';
import { authorizeUrl, providerStatuses, supabaseAuthConfigured, type OAuthProvider } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PROVIDERS: OAuthProvider[] = ['apple', 'google', 'facebook'];

/**
 * Starts an OAuth handshake.
 *
 * The browser never sees a provider secret: Supabase holds them and returns to
 * `/auth/callback` with a one-time code. A PKCE verifier is minted here and
 * sealed into an HttpOnly cookie so the callback can prove the same browser
 * started the handshake. A provider that has not been configured yet is refused
 * here with a readable reason instead of a dead provider error page.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const url = new URL(request.url);
  const origin = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || url.origin).replace(/\/$/, '');
  const login = `${origin}/login`;
  const next = safeNext(url.searchParams.get('next'));

  if (!PROVIDERS.includes(provider as OAuthProvider)) {
    return NextResponse.redirect(`${login}?oauth=unknown`, 303);
  }
  if (!supabaseAuthConfigured()) {
    return NextResponse.redirect(`${login}?oauth=unavailable`, 303);
  }

  const statuses = await providerStatuses();
  const status = statuses.find((entry) => entry.id === provider);
  if (!status?.enabled) {
    return NextResponse.redirect(`${login}?oauth=${provider}_disabled`, 303);
  }

  const { verifier, challenge } = pkcePair();
  const authorize = authorizeUrl(provider as OAuthProvider, `${origin}/auth/callback`, { challenge });
  if (!authorize) return NextResponse.redirect(`${login}?oauth=unavailable`, 303);

  const response = NextResponse.redirect(authorize, 303);
  response.headers.append('Set-Cookie', oauthCookie(VERIFIER_COOKIE, verifier));
  response.headers.append('Set-Cookie', oauthCookie(NEXT_COOKIE, encodeURIComponent(next)));
  return response;
}
