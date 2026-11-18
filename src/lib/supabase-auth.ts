/**
 * Supabase Auth, server side.
 *
 * The publishable (anon) key is the only credential needed for the flows used
 * here: sign-up, password grant, email OTP, recovery and TOTP factors. The
 * service-role key is never touched, so this module cannot read another member's
 * data. Every call returns a plain result object; a missing project simply makes
 * `supabaseAuthConfigured()` false and the caller falls back to the in-memory
 * account store.
 */

export interface AuthUser {
  id: string;
  email: string | null;
  email_confirmed_at?: string | null;
  created_at?: string;
  last_sign_in_at?: string | null;
  /** Supabase returns an empty array when the address is already registered. */
  identities?: unknown[];
  factors?: Array<{ id: string; factor_type: string; status: string; friendly_name?: string }>;
}

export interface AuthSession {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  token_type?: string;
  user: AuthUser;
}

export interface AuthResult<T> {
  ok: boolean;
  data?: T;
  error?: string;
  code?: string;
  status: number;
}

export interface Factor {
  id: string;
  type: string;
  friendly_name?: string;
  status?: string;
  totp?: { qr_code?: string; secret?: string; uri?: string };
}

const MESSAGES: Record<string, string> = {
  invalid_credentials: 'Email or password is not correct',
  email_not_confirmed: 'Please verify your email first',
  email_exists: 'This email already has an account. Sign in instead.',
  user_already_exists: 'This email already has an account. Sign in instead.',
  over_email_send_rate_limit: 'Too many emails sent. Wait a minute and try again.',
  over_request_rate_limit: 'Too many attempts. Wait a minute and try again.',
  signup_disabled: 'New sign-ups are closed right now.',
  weak_password: 'Choose a stronger password',
  validation_failed: 'Check the email address and try again',
  otp_expired: 'That code has expired. Request a new one.',
  invalid_otp: 'That code is not correct',
  mfa_factor_name_conflict: 'That authenticator already exists',
  insufficient_aal: 'Confirm a two-factor code first',
};

function config(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) return null;
  return { url: url.replace(/\/$/, ''), key };
}

export function supabaseAuthConfigured(): boolean {
  return config() !== null;
}

export function supabaseUrl(): string | null {
  return config()?.url ?? null;
}

interface RawResult {
  status: number;
  body: Record<string, unknown> | null;
}

async function call(
  path: string,
  init: { method?: string; body?: unknown; accessToken?: string } = {},
): Promise<RawResult> {
  const creds = config();
  if (!creds) return { status: 0, body: null };

  const headers: Record<string, string> = {
    apikey: creds.key,
    'Content-Type': 'application/json',
  };
  if (init.accessToken) headers.Authorization = `Bearer ${init.accessToken}`;
  else headers.Authorization = `Bearer ${creds.key}`;

  try {
    const response = await fetch(`${creds.url}${path}`, {
      method: init.method ?? 'POST',
      headers,
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      cache: 'no-store',
    });
    let body: Record<string, unknown> | null = null;
    const text = await response.text();
    if (text) {
      try {
        body = JSON.parse(text) as Record<string, unknown>;
      } catch {
        body = { msg: text.slice(0, 200) };
      }
    }
    return { status: response.status, body };
  } catch {
    return { status: 0, body: null };
  }
}

function fail<T>(raw: RawResult, fallback: string): AuthResult<T> {
  const body = raw.body ?? {};
  const code = [body.error_code, body.code].find((value): value is string => typeof value === 'string');
  const message =
    (typeof body.msg === 'string' && body.msg) ||
    (typeof body.message === 'string' && body.message) ||
    (code ? MESSAGES[code] : undefined) ||
    fallback;
  return {
    ok: false,
    error: (code && MESSAGES[code]) || message,
    code,
    status: raw.status,
  };
}

function sessionFrom(body: Record<string, unknown> | null): AuthSession | null {
  if (!body) return null;
  const access = body.access_token;
  const refresh = body.refresh_token;
  const user = body.user as AuthUser | undefined;
  if (typeof access !== 'string' || typeof refresh !== 'string' || !user?.id) return null;
  return {
    access_token: access,
    refresh_token: refresh,
    expires_in: typeof body.expires_in === 'number' ? body.expires_in : undefined,
    token_type: typeof body.token_type === 'string' ? body.token_type : undefined,
    user,
  };
}

export type SignUpOutcome =
  | { state: 'session'; session: AuthSession }
  | { state: 'confirm'; user: AuthUser };

export async function signUp(email: string, password: string): Promise<AuthResult<SignUpOutcome>> {
  const raw = await call('/auth/v1/signup', { body: { email, password } });
  if (raw.status === 0) return { ok: false, error: 'Sign-in service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<SignUpOutcome>(raw, 'Could not create the account');

  const session = sessionFrom(raw.body);
  if (session) return { ok: true, data: { state: 'session', session }, status: raw.status };

  const user = raw.body?.user as AuthUser | undefined;
  if (user && Array.isArray(user.identities) && user.identities.length === 0) {
    return {
      ok: false,
      error: 'This email already has an account. Sign in instead.',
      code: 'email_exists',
      status: 409,
    };
  }
  if (user?.id) return { ok: true, data: { state: 'confirm', user }, status: raw.status };

  // Supabase returns an obfuscated response for an existing address.
  return { ok: true, data: { state: 'confirm', user: { id: '', email } }, status: raw.status };
}

export async function signInWithPassword(email: string, password: string): Promise<AuthResult<AuthSession>> {
  const raw = await call('/auth/v1/token?grant_type=password', { body: { email, password } });
  if (raw.status === 0) return { ok: false, error: 'Sign-in service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<AuthSession>(raw, 'Email or password is not correct');
  const session = sessionFrom(raw.body);
  if (!session) return { ok: false, error: 'Sign-in did not return a session', status: 502 };
  return { ok: true, data: session, status: raw.status };
}

export async function sendEmailOtp(
  email: string,
  options: { createUser?: boolean; redirectTo?: string } = {},
): Promise<AuthResult<{ sent: true }>> {
  const raw = await call('/auth/v1/otp', {
    body: {
      email,
      create_user: options.createUser ?? true,
      ...(options.redirectTo ? { options: { email_redirect_to: options.redirectTo } } : {}),
    },
  });
  if (raw.status === 0) return { ok: false, error: 'Mail service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<{ sent: true }>(raw, 'Could not send the email');
  return { ok: true, data: { sent: true }, status: raw.status };
}

export async function verifyEmailToken(
  email: string,
  token: string,
  type: 'signup' | 'recovery' | 'email',
): Promise<AuthResult<AuthSession>> {
  const raw = await call('/auth/v1/verify', { body: { type, email, token } });
  if (raw.status === 0) return { ok: false, error: 'Verification service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<AuthSession>(raw, 'That code is not correct');
  const session = sessionFrom(raw.body);
  if (!session) {
    // Some projects answer a bare 200 without a session when the token is a
    // one-time confirmation; treat it as verified but ask the visitor to sign in.
    return { ok: true, status: raw.status };
  }
  return { ok: true, data: session, status: raw.status };
}

export async function requestRecovery(email: string, redirectTo?: string): Promise<AuthResult<{ sent: true }>> {
  const raw = await call('/auth/v1/recover', {
    body: { email, ...(redirectTo ? { redirect_to: redirectTo } : {}) },
  });
  if (raw.status === 0) return { ok: false, error: 'Mail service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<{ sent: true }>(raw, 'Could not send the reset email');
  return { ok: true, data: { sent: true }, status: raw.status };
}

/**
 * Exchanges the `token_hash` from a Supabase email link for a session. Recovery
 * links opened on a different device carry this query token rather than a URL
 * fragment, so the server has to redeem it.
 */
export async function verifyTokenHash(
  tokenHash: string,
  type: 'recovery' | 'email' | 'signup' = 'recovery',
): Promise<AuthResult<AuthSession>> {
  const query = new URLSearchParams({ token_hash: tokenHash, type });
  const raw = await call(`/auth/v1/verify?${query.toString()}`, { method: 'GET' });
  if (raw.status === 0) return { ok: false, error: 'Verification service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<AuthSession>(raw, 'That reset link has expired');
  const session = sessionFrom(raw.body);
  if (!session) return { ok: false, error: 'That reset link is not valid', status: 400 };
  return { ok: true, data: session, status: raw.status };
}

export async function getUser(accessToken: string): Promise<AuthResult<AuthUser>> {
  const raw = await call('/auth/v1/user', { method: 'GET', accessToken });
  if (raw.status === 0) return { ok: false, error: 'Auth service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<AuthUser>(raw, 'Session is not valid');
  const user = raw.body as unknown as AuthUser;
  if (!user?.id) return { ok: false, error: 'Session is not valid', status: 401 };
  return { ok: true, data: user, status: raw.status };
}

export async function refreshSession(refreshToken: string): Promise<AuthResult<AuthSession>> {
  const raw = await call('/auth/v1/token?grant_type=refresh_token', {
    body: { refresh_token: refreshToken },
  });
  if (raw.status === 0) return { ok: false, error: 'Auth service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<AuthSession>(raw, 'Session expired. Sign in again.');
  const session = sessionFrom(raw.body);
  if (!session) return { ok: false, error: 'Session expired. Sign in again.', status: 401 };
  return { ok: true, data: session, status: raw.status };
}

export async function updatePassword(accessToken: string, password: string): Promise<AuthResult<true>> {
  const raw = await call('/auth/v1/user', { method: 'PUT', body: { password }, accessToken });
  if (raw.status === 0) return { ok: false, error: 'Auth service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<true>(raw, 'Could not update the password');
  return { ok: true, data: true, status: raw.status };
}

/* ------------------------------------------------------------------ *
 * TOTP factors
 * ------------------------------------------------------------------ */

export async function listFactors(accessToken: string): Promise<Factor[]> {
  const user = await getUser(accessToken);
  if (!user.ok || !user.data) return [];
  return (user.data.factors ?? []).map((factor) => ({
    id: factor.id,
    type: factor.factor_type,
    status: factor.status,
    friendly_name: factor.friendly_name,
  }));
}

export async function enrollTotp(accessToken: string, friendlyName = 'MineAI'): Promise<AuthResult<Factor>> {
  const raw = await call('/auth/v1/factors', {
    body: { factor_type: 'totp', friendly_name: friendlyName },
    accessToken,
  });
  if (raw.status === 0) return { ok: false, error: 'Auth service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<Factor>(raw, 'Could not start two-factor setup');

  const id = typeof raw.body?.id === 'string' ? raw.body.id : '';
  const totp = raw.body?.totp as Factor['totp'] | undefined;
  if (!id || !totp) return { ok: false, error: 'Two-factor setup did not return a secret', status: 502 };
  return {
    ok: true,
    data: { id, type: 'totp', status: 'unverified', totp },
    status: raw.status,
  };
}

export async function challengeFactor(
  accessToken: string,
  factorId: string,
): Promise<AuthResult<{ id: string }>> {
  const raw = await call(`/auth/v1/factors/${encodeURIComponent(factorId)}/challenge`, {
    body: {},
    accessToken,
  });
  if (raw.status === 0) return { ok: false, error: 'Auth service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<{ id: string }>(raw, 'Could not start the two-factor check');
  const id = typeof raw.body?.id === 'string' ? raw.body.id : '';
  if (!id) return { ok: false, error: 'Two-factor challenge was not created', status: 502 };
  return { ok: true, data: { id }, status: raw.status };
}

export async function verifyFactor(
  accessToken: string,
  factorId: string,
  challengeId: string,
  code: string,
): Promise<AuthResult<AuthSession>> {
  const raw = await call(`/auth/v1/factors/${encodeURIComponent(factorId)}/verify`, {
    body: { challenge_id: challengeId, code },
    accessToken,
  });
  if (raw.status === 0) return { ok: false, error: 'Auth service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<AuthSession>(raw, 'That code is not correct');
  const session = sessionFrom(raw.body);
  if (!session) return { ok: false, error: 'That code is not correct', status: 401 };
  return { ok: true, data: session, status: raw.status };
}

export async function unenrollFactor(accessToken: string, factorId: string): Promise<AuthResult<true>> {
  const raw = await call(`/auth/v1/factors/${encodeURIComponent(factorId)}`, {
    method: 'DELETE',
    accessToken,
  });
  if (raw.status === 0) return { ok: false, error: 'Auth service is unreachable', status: 503 };
  if (raw.status >= 400) return fail<true>(raw, 'Could not turn off two-factor');
  return { ok: true, data: true, status: raw.status };
}

/* ------------------------------------------------------------------ *
 * OAuth providers
 * ------------------------------------------------------------------ */

export type OAuthProvider = 'apple' | 'google' | 'facebook';

const PROVIDERS: Record<OAuthProvider, { label: string; env: string[] }> = {
  apple: { label: 'Apple', env: ['APPLE_CLIENT_ID', 'APPLE_CLIENT_SECRET'] },
  google: { label: 'Google', env: ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET'] },
  facebook: { label: 'Facebook', env: ['FACEBOOK_CLIENT_ID', 'FACEBOOK_CLIENT_SECRET'] },
};

export interface ProviderStatus {
  id: OAuthProvider;
  label: string;
  enabled: boolean;
  env: string[];
  missing: string[];
}

interface SettingsCache {
  at: number;
  external: Record<string, boolean>;
}

let settingsCache: SettingsCache | null = null;

export async function providerStatuses(): Promise<ProviderStatus[]> {
  const creds = config();
  let external: Record<string, boolean> = {};
  if (creds) {
    if (!settingsCache || Date.now() - settingsCache.at > 5 * 60_000) {
      const raw = await call('/auth/v1/settings', { method: 'GET' });
      const body = raw.body ?? {};
      external = (body.external as Record<string, boolean> | undefined) ?? {};
      settingsCache = { at: Date.now(), external };
    } else {
      external = settingsCache.external;
    }
  }
  return (Object.keys(PROVIDERS) as OAuthProvider[]).map((id) => ({
    id,
    label: PROVIDERS[id].label,
    enabled: Boolean(external[id]),
    env: PROVIDERS[id].env,
    missing: PROVIDERS[id].env.filter((name) => !process.env[name]?.trim()),
  }));
}

export function authorizeUrl(provider: OAuthProvider, redirectTo: string): string | null {
  const creds = config();
  if (!creds) return null;
  const params = new URLSearchParams({ provider, redirect_to: redirectTo });
  return `${creds.url}/auth/v1/authorize?${params.toString()}`;
}

export function emailProviderEnabled(): boolean {
  return Boolean(settingsCache?.external.email ?? true);
}
