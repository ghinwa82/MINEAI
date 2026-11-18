import { createHash, randomBytes } from 'node:crypto';

/**
 * PKCE plumbing for the social sign-in handshake.
 *
 * Supabase returns a one-time `code` to `/auth/callback`. Proving the same
 * browser started the handshake needs a verifier that only the server holds, so
 * it is minted here and sealed into a path-scoped HttpOnly cookie. Nothing in
 * this module is imported by client code.
 */

export const VERIFIER_COOKIE = 'mineai_oauth_verifier';
export const NEXT_COOKIE = 'mineai_oauth_next';
export const OAUTH_COOKIE_MAX_AGE = 600;

export function pkcePair(): { verifier: string; challenge: string } {
  const verifier = randomBytes(48).toString('base64url');
  const challenge = createHash('sha256').update(verifier).digest('base64url');
  return { verifier, challenge };
}

/** A short-lived cookie scoped to `/auth`, so no other route ever sees it. */
export function oauthCookie(name: string, value: string, maxAge = OAUTH_COOKIE_MAX_AGE): string {
  const secure = process.env.NODE_ENV === 'production';
  return [
    `${name}=${value}`,
    'Path=/auth',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function readCookie(request: Request, name: string): string | null {
  const header = request.headers.get('cookie') ?? '';
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

/** Only an internal path may be used as a post-login destination. */
export function safeNext(value: string | null, fallback = '/dashboard'): string {
  if (!value) return fallback;
  const trimmed = value.trim();
  if (!trimmed.startsWith('/') || trimmed.startsWith('//')) return fallback;
  return trimmed.slice(0, 200);
}
