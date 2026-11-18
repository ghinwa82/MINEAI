import {
  createHmac,
  randomBytes,
  randomInt,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

import { decryptField, encryptField, safeCompare } from '@/lib/encryption';
import { generateRecoveryCodes, generateTotpSecret, hashRecoveryCode, otpauthUrl, verifyTotp } from '@/lib/two-factor';

/**
 * Member authentication.
 *
 * Self-contained and dependency-free: scrypt password hashing, AES-256-GCM
 * sealed TOTP secrets, signed HttpOnly session cookies, brute-force lockout and
 * one-time reset tokens. The account ledger lives in memory and is mirrored to
 * Supabase when a service-role key exists; without it the flow still works on a
 * warm instance, which is how the rest of this platform degrades.
 */

export interface MemberAccount {
  uid: string;
  email: string;
  passwordSalt: string;
  passwordHash: string;
  createdAt: string;
  verified: boolean;
  verificationCode: string | null;
  verificationExpires: number | null;
  resetTokenHash: string | null;
  resetExpires: number | null;
  totpSecret: string | null;
  totpEnabled: boolean;
  recoveryCodes: string[];
  failedAttempts: number;
  lockedUntil: number | null;
  lastLoginAt: string | null;
  sessionVersion: number;
}

export interface PublicMember {
  uid: string;
  email: string;
  verified: boolean;
  totpEnabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface AuthStore {
  accounts: Map<string, MemberAccount>;
}

const globalRef = globalThis as unknown as { __mineaiAuth?: AuthStore };

function store(): AuthStore {
  if (!globalRef.__mineaiAuth) globalRef.__mineaiAuth = { accounts: new Map() };
  return globalRef.__mineaiAuth;
}

const MAX_FAILED = 5;
const LOCK_MS = 15 * 60_000;
const RESET_TTL_MS = 30 * 60_000;
const VERIFY_TTL_MS = 30 * 60_000;
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

function sessionSecret(): Buffer {
  const raw =
    process.env.AUTH_SESSION_SECRET?.trim() ||
    process.env.ENCRYPTION_KEY?.trim() ||
    process.env.CRON_SECRET?.trim() ||
    'mineai-auth-development-session-secret';
  return scryptSync(raw, 'mineai-auth-session-v1', 32);
}

export function mailConfigured(): boolean {
  return Boolean(process.env.AUTH_SMTP_URL?.trim() || process.env.RESEND_API_KEY?.trim());
}

/** Without a mail provider the UI shows the one-time code instead of emailing it. */
export function codesVisible(): boolean {
  return !mailConfigured();
}

function hashPassword(password: string, salt: string): string {
  return scryptSync(password, salt, 64).toString('hex');
}

function uid(): string {
  return `MB-${randomBytes(4).toString('hex').toUpperCase()}`;
}

function code6(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, '0');
}

function tokenHash(token: string): string {
  return createHmac('sha256', sessionSecret()).update(token).digest('hex');
}

function normaliseEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function publicMember(account: MemberAccount): PublicMember {
  return {
    uid: account.uid,
    email: account.email,
    verified: account.verified,
    totpEnabled: account.totpEnabled,
    createdAt: account.createdAt,
    lastLoginAt: account.lastLoginAt,
  };
}

export function findMember(email: string): MemberAccount | undefined {
  return store().accounts.get(normaliseEmail(email));
}

export function findMemberByUid(id: string): MemberAccount | undefined {
  for (const account of store().accounts.values()) {
    if (account.uid === id) return account;
  }
  return undefined;
}

export interface PasswordCheck {
  ok: boolean;
  message?: string;
}

export function checkPasswordStrength(password: string): PasswordCheck {
  if (password.length < 8) return { ok: false, message: 'Use at least 8 characters' };
  if (!/[A-Za-z]/.test(password)) return { ok: false, message: 'Add at least one letter' };
  if (!/[0-9]/.test(password)) return { ok: false, message: 'Add at least one number' };
  if (password.length > 128) return { ok: false, message: 'Use 128 characters or fewer' };
  return { ok: true };
}

export function registerMember(email: string, password: string): {
  ok: boolean;
  member?: PublicMember;
  verificationCode?: string;
  error?: string;
} {
  const clean = normaliseEmail(email);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(clean)) {
    return { ok: false, error: 'Enter a valid email address' };
  }
  if (store().accounts.has(clean)) {
    return { ok: false, error: 'This email already has an account. Sign in instead.' };
  }
  const strength = checkPasswordStrength(password);
  if (!strength.ok) return { ok: false, error: strength.message };

  const salt = randomBytes(16).toString('hex');
  const verificationCode = code6();
  const account: MemberAccount = {
    uid: uid(),
    email: clean,
    passwordSalt: salt,
    passwordHash: hashPassword(password, salt),
    createdAt: new Date().toISOString(),
    verified: false,
    verificationCode,
    verificationExpires: Date.now() + VERIFY_TTL_MS,
    resetTokenHash: null,
    resetExpires: null,
    totpSecret: null,
    totpEnabled: false,
    recoveryCodes: [],
    failedAttempts: 0,
    lockedUntil: null,
    lastLoginAt: null,
    sessionVersion: 1,
  };

  store().accounts.set(clean, account);
  return {
    ok: true,
    member: publicMember(account),
    verificationCode: codesVisible() ? verificationCode : undefined,
  };
}

export function verifyEmail(email: string, code: string): { ok: boolean; member?: PublicMember; error?: string } {
  const account = findMember(email);
  if (!account) return { ok: false, error: 'No account found for that email' };
  if (account.verified) return { ok: true, member: publicMember(account) };
  if (!account.verificationCode || !account.verificationExpires) {
    return { ok: false, error: 'Request a new verification code' };
  }
  if (Date.now() > account.verificationExpires) {
    return { ok: false, error: 'That code has expired. Request a new one.' };
  }
  if (!safeCompare(account.verificationCode, code.trim())) {
    return { ok: false, error: 'That code is not correct' };
  }
  account.verified = true;
  account.verificationCode = null;
  account.verificationExpires = null;
  return { ok: true, member: publicMember(account) };
}

export function resendVerification(email: string): { ok: boolean; verificationCode?: string; error?: string } {
  const account = findMember(email);
  if (!account) return { ok: false, error: 'No account found for that email' };
  if (account.verified) return { ok: false, error: 'That email is already verified' };
  const code = code6();
  account.verificationCode = code;
  account.verificationExpires = Date.now() + VERIFY_TTL_MS;
  return { ok: true, verificationCode: codesVisible() ? code : undefined };
}

export function loginMember(
  email: string,
  password: string,
  totpCode?: string,
): { ok: boolean; member?: PublicMember; error?: string; remaining?: number } {
  const account = findMember(email);
  if (!account) return { ok: false, error: 'Email or password is not correct' };

  if (account.lockedUntil && account.lockedUntil > Date.now()) {
    const minutes = Math.ceil((account.lockedUntil - Date.now()) / 60_000);
    return { ok: false, error: `Too many attempts. Try again in ${minutes} minutes.` };
  }

  const candidate = hashPassword(password, account.passwordSalt);
  const expected = Buffer.from(account.passwordHash, 'hex');
  const supplied = Buffer.from(candidate, 'hex');
  const matches = expected.length === supplied.length && timingSafeEqual(expected, supplied);

  if (!matches) {
    account.failedAttempts += 1;
    if (account.failedAttempts >= MAX_FAILED) {
      account.lockedUntil = Date.now() + LOCK_MS;
      account.failedAttempts = 0;
      return { ok: false, error: 'Too many attempts. This account is locked for 15 minutes.' };
    }
    return {
      ok: false,
      error: 'Email or password is not correct',
      remaining: MAX_FAILED - account.failedAttempts,
    };
  }

  if (!account.verified) {
    return { ok: false, error: 'Please verify your email first' };
  }

  if (account.totpEnabled) {
    const secret = account.totpSecret ? decryptField(account.totpSecret) : null;
    if (!secret) return { ok: false, error: 'Two-factor setup is damaged. Contact support.' };
    if (!totpCode || !verifyTotp(secret, totpCode)) {
      return { ok: false, error: 'Enter the 6-digit code from your authenticator app' };
    }
  }

  account.failedAttempts = 0;
  account.lockedUntil = null;
  account.lastLoginAt = new Date().toISOString();
  return { ok: true, member: publicMember(account) };
}

export function requestPasswordReset(email: string): {
  ok: boolean;
  resetToken?: string;
  error?: string;
} {
  const account = findMember(email);
  // Always answer the same way so the endpoint cannot be used to enumerate accounts.
  if (!account) return { ok: true };
  const token = randomBytes(24).toString('hex');
  account.resetTokenHash = tokenHash(token);
  account.resetExpires = Date.now() + RESET_TTL_MS;
  return { ok: true, resetToken: codesVisible() ? token : undefined };
}

export function resetPassword(token: string, password: string): { ok: boolean; error?: string } {
  const digest = tokenHash(token.trim());
  let account: MemberAccount | undefined;
  for (const candidate of store().accounts.values()) {
    if (candidate.resetTokenHash && safeCompare(candidate.resetTokenHash, digest)) {
      account = candidate;
      break;
    }
  }
  if (!account) return { ok: false, error: 'That reset link is not valid' };
  if (!account.resetExpires || Date.now() > account.resetExpires) {
    return { ok: false, error: 'That reset link has expired. Request a new one.' };
  }
  const strength = checkPasswordStrength(password);
  if (!strength.ok) return { ok: false, error: strength.message };

  const salt = randomBytes(16).toString('hex');
  account.passwordSalt = salt;
  account.passwordHash = hashPassword(password, salt);
  account.resetTokenHash = null;
  account.resetExpires = null;
  account.failedAttempts = 0;
  account.lockedUntil = null;
  account.sessionVersion += 1;
  return { ok: true };
}

export function changePassword(
  memberUid: string,
  currentPassword: string,
  nextPassword: string,
): { ok: boolean; error?: string } {
  const account = findMemberByUid(memberUid);
  if (!account) return { ok: false, error: 'Session not found' };
  const candidate = hashPassword(currentPassword, account.passwordSalt);
  if (!safeCompare(candidate, account.passwordHash)) {
    return { ok: false, error: 'Current password is not correct' };
  }
  const strength = checkPasswordStrength(nextPassword);
  if (!strength.ok) return { ok: false, error: strength.message };
  const salt = randomBytes(16).toString('hex');
  account.passwordSalt = salt;
  account.passwordHash = hashPassword(nextPassword, salt);
  account.sessionVersion += 1;
  return { ok: true };
}

/* ------------------------------------------------------------------ *
 * TOTP
 * ------------------------------------------------------------------ */

export function beginTotp(memberUid: string): { ok: boolean; secret?: string; otpauth?: string; error?: string } {
  const account = findMemberByUid(memberUid);
  if (!account) return { ok: false, error: 'Session not found' };
  const secret = generateTotpSecret();
  account.totpSecret = encryptField(secret);
  account.totpEnabled = false;
  return { ok: true, secret, otpauth: otpauthUrl(secret, account.email) };
}

export function confirmTotp(memberUid: string, code: string): { ok: boolean; recoveryCodes?: string[]; error?: string } {
  const account = findMemberByUid(memberUid);
  if (!account || !account.totpSecret) return { ok: false, error: 'Start two-factor setup first' };
  const secret = decryptField(account.totpSecret);
  if (!secret) return { ok: false, error: 'Two-factor setup is damaged' };
  if (!verifyTotp(secret, code)) return { ok: false, error: 'That code is not correct' };
  const { plain, hashed } = generateRecoveryCodes();
  account.recoveryCodes = hashed;
  account.totpEnabled = true;
  return { ok: true, recoveryCodes: plain };
}

export function disableTotp(memberUid: string, password: string): { ok: boolean; error?: string } {
  const account = findMemberByUid(memberUid);
  if (!account) return { ok: false, error: 'Session not found' };
  if (!safeCompare(hashPassword(password, account.passwordSalt), account.passwordHash)) {
    return { ok: false, error: 'Password is not correct' };
  }
  account.totpEnabled = false;
  account.totpSecret = null;
  account.recoveryCodes = [];
  return { ok: true };
}

export function verifyRecovery(memberUid: string, code: string): { ok: boolean; error?: string } {
  const account = findMemberByUid(memberUid);
  if (!account) return { ok: false, error: 'Session not found' };
  const target = hashRecoveryCode(code);
  const index = account.recoveryCodes.indexOf(target);
  if (index === -1) return { ok: false, error: 'That recovery code is not valid' };
  account.recoveryCodes = account.recoveryCodes.filter((_, position) => position !== index);
  account.totpEnabled = false;
  account.totpSecret = null;
  return { ok: true };
}

/* ------------------------------------------------------------------ *
 * Sessions
 * ------------------------------------------------------------------ */

export interface SessionPayload {
  uid: string;
  email: string;
  sv: number;
  iat: number;
  /**
   * Which account ledger owns this session. `local` accounts live in the
   * in-memory store and rotate a session version on every password change;
   * `supabase` accounts live in Supabase Auth, where the version check does not
   * apply and the sealed refresh token (`srt`) is the real proof of life.
   */
  src?: 'local' | 'supabase';
  /** AES-256-GCM sealed Supabase refresh token (supabase sessions only). */
  srt?: string;
}

function sign(value: string): string {
  return createHmac('sha256', sessionSecret()).update(value).digest('base64url');
}

function sealSession(payload: SessionPayload): string {
  const body = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  return `${body}.${sign(body)}`;
}

export function createSessionToken(member: PublicMember): string {
  const account = findMember(member.email);
  return sealSession({
    uid: member.uid,
    email: member.email,
    sv: account?.sessionVersion ?? 1,
    iat: Date.now(),
    src: 'local',
  });
}

/** Strips the UUID prefix so a Supabase member gets a short, stable operator id. */
export function supabaseMemberUid(supabaseUserId: string): string {
  return `SB-${supabaseUserId}`;
}

export function createSupabaseSessionToken(user: {
  id: string;
  email?: string | null;
  refreshToken: string;
}): string {
  return sealSession({
    uid: supabaseMemberUid(user.id),
    email: user.email?.trim().toLowerCase() ?? '',
    sv: 0,
    iat: Date.now(),
    src: 'supabase',
    srt: encryptField(user.refreshToken),
  });
}

export function readSessionToken(token: string | undefined | null): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  if (!safeCompare(sign(body), signature)) return null;
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as SessionPayload;
    if (!payload.uid || typeof payload.iat !== 'number') return null;
    // Supabase sessions are refreshed against the identity provider, so their
    // 7-day cookie is the authority; local sessions additionally check that the
    // account's session version has not been rotated by a password change.
    if (Date.now() - payload.iat > SESSION_TTL_SECONDS * 1000) return null;
    if (payload.src !== 'supabase') {
      const account = findMemberByUid(payload.uid);
      if (account && account.sessionVersion !== payload.sv) return null;
    }
    return payload;
  } catch {
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Short-lived MFA tickets
 * ------------------------------------------------------------------ */

const MFA_TICKET_TTL_MS = 10 * 60_000;

interface MfaTicket {
  accessToken: string;
  refreshToken: string;
  email: string;
  exp: number;
}

/**
 * A password grant that still owes a second factor cannot set the session
 * cookie yet. The aal1 tokens are sealed into a ten-minute ticket instead, so
 * any serverless instance can finish the challenge without shared memory.
 */
export function createMfaTicket(input: {
  accessToken: string;
  refreshToken: string;
  email: string;
}): string {
  return encryptField(
    JSON.stringify({
      accessToken: input.accessToken,
      refreshToken: input.refreshToken,
      email: input.email,
      exp: Date.now() + MFA_TICKET_TTL_MS,
    } satisfies MfaTicket),
  );
}

export function readMfaTicket(ticket: string | undefined | null): MfaTicket | null {
  if (!ticket) return null;
  const raw = decryptField(ticket);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as MfaTicket;
    if (!parsed.accessToken || !parsed.refreshToken || typeof parsed.exp !== 'number') return null;
    if (Date.now() > parsed.exp) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function sessionFromRequest(request: Request): SessionPayload | null {
  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(/(?:^|;\s*)mineai_session=([^;]+)/);
  return readSessionToken(match?.[1]);
}

export function sessionCookie(token: string): string {
  const secure = process.env.NODE_ENV === 'production';
  return [
    `mineai_session=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${SESSION_TTL_SECONDS}`,
    secure ? 'Secure' : '',
  ]
    .filter(Boolean)
    .join('; ');
}

export function clearSessionCookie(): string {
  return 'mineai_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0';
}

/** A stable mining operator id derived from the member uid. */
export function miningUidFor(member: PublicMember): string {
  return `member-${member.uid.toLowerCase()}`;
}
