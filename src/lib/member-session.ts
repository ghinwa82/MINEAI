import {
  createSupabaseSessionToken,
  findMemberByUid,
  publicMember,
  readSessionToken,
  sessionFromRequest,
  supabaseMemberUid,
  type PublicMember,
  type SessionPayload,
} from '@/lib/auth';
import { decryptField } from '@/lib/encryption';
import { refreshSession, type AuthSession, type AuthUser } from '@/lib/supabase-auth';

/**
 * One place that answers "who is asking?".
 *
 * A signed cookie can describe two very different accounts: a local one that
 * lives in this process, or a Supabase one that lives at the identity provider.
 * Every route asks this module rather than reading the cookie itself, so the two
 * paths cannot drift. A Supabase session is refreshed on each read — that both
 * proves the account still exists and returns the access token the MFA and
 * password routes need.
 */

export interface ActiveMember extends PublicMember {
  source: 'local' | 'supabase';
}

export interface ResolvedSession {
  member: ActiveMember;
  source: 'local' | 'supabase';
  /** Present for Supabase sessions. */
  accessToken?: string;
  user?: AuthUser;
  /** A freshly signed cookie value, because Supabase rotates refresh tokens. */
  renewedToken?: string;
  payload: SessionPayload;
}

export function memberFromSupabaseUser(user: AuthUser): ActiveMember {
  return {
    uid: supabaseMemberUid(user.id),
    email: user.email ?? '',
    verified: Boolean(user.email_confirmed_at),
    totpEnabled: (user.factors ?? []).some(
      (factor) => factor.factor_type === 'totp' && factor.status === 'verified',
    ),
    createdAt: user.created_at ?? new Date().toISOString(),
    lastLoginAt: user.last_sign_in_at ?? null,
    source: 'supabase',
  };
}

export function verifiedTotpFactor(user: AuthUser | undefined): string | null {
  const factor = (user?.factors ?? []).find(
    (candidate) => candidate.factor_type === 'totp' && candidate.status === 'verified',
  );
  return factor?.id ?? null;
}

/**
 * Reads the `aal` claim without verifying the signature. The token arrived
 * directly from Supabase over TLS in this same request, so the claim is only
 * used to decide whether a second factor is still owed — never as authorisation.
 */
export function tokenAssuranceLevel(accessToken: string): 'aal1' | 'aal2' | null {
  const payload = accessToken.split('.')[1];
  if (!payload) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { aal?: string };
    return claims.aal === 'aal2' ? 'aal2' : claims.aal === 'aal1' ? 'aal1' : null;
  } catch {
    return null;
  }
}

export function supabaseSessionToken(session: AuthSession): string {
  return createSupabaseSessionToken({
    id: session.user.id,
    email: session.user.email,
    refreshToken: session.refresh_token,
  });
}

export async function resolveSession(request: Request): Promise<ResolvedSession | null> {
  const payload = sessionFromRequest(request);
  if (!payload) return null;

  if (payload.src === 'supabase') {
    const refreshToken = payload.srt ? decryptField(payload.srt) : null;
    if (!refreshToken) return null;
    const refreshed = await refreshSession(refreshToken);
    if (!refreshed.ok || !refreshed.data) return null;
    return {
      member: memberFromSupabaseUser(refreshed.data.user),
      source: 'supabase',
      accessToken: refreshed.data.access_token,
      user: refreshed.data.user,
      renewedToken: supabaseSessionToken(refreshed.data),
      payload,
    };
  }

  const account = findMemberByUid(payload.uid);
  if (!account) return null;
  return {
    member: { ...publicMember(account), source: 'local' },
    source: 'local',
    payload,
  };
}
