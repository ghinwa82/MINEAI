import { NextResponse } from 'next/server';

import { authorizeUrl, providerStatuses, supabaseAuthConfigured, type OAuthProvider } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const PROVIDERS: OAuthProvider[] = ['apple', 'google', 'facebook'];

/**
 * Starts an OAuth handshake.
 *
 * The browser never sees a provider secret: Supabase holds them and returns to
 * `/auth/callback` with a session. A provider that has not been configured yet
 * is refused here with a readable reason instead of a dead provider error page.
 */
export async function GET(
  request: Request,
  context: { params: Promise<{ provider: string }> },
) {
  const { provider } = await context.params;
  const origin = (process.env.NEXT_PUBLIC_SITE_URL?.trim() || new URL(request.url).origin).replace(/\/$/, '');
  const login = `${origin}/login`;

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

  const url = authorizeUrl(provider as OAuthProvider, `${origin}/auth/callback`);
  if (!url) return NextResponse.redirect(`${login}?oauth=unavailable`, 303);
  return NextResponse.redirect(url, 303);
}
