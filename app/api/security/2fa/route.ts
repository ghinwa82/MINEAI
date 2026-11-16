import { NextResponse } from 'next/server';

import { decryptField, encryptField, encryptionKeySource } from '@/lib/encryption';
import { getPosition, isValidUid, setTwoFactor } from '@/lib/mining';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { consumeRecoveryCode, generateRecoveryCodes, generateTotpSecret, otpauthUrl, verifyTotp } from '@/lib/two-factor';
import { describeIssues, twoFactorSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function uidFrom(request: Request): string | null {
  const url = new URL(request.url);
  const uid = url.searchParams.get('uid') || request.headers.get('x-mineai-uid') || '';
  return isValidUid(uid) ? uid : null;
}

export async function GET(request: Request) {
  const uid = uidFrom(request);
  if (!uid) return NextResponse.json({ ok: false, error: 'A valid uid is required' }, { status: 400 });

  const position = getPosition(uid);
  return NextResponse.json({
    ok: true,
    enabled: position.twoFactorEnabled,
    recoveryCodesRemaining: position.recoveryCodes.length,
    keySource: encryptionKeySource(),
  });
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, '2fa'), 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many vault attempts. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = twoFactorSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: describeIssues(parsed.error) }, { status: 422 });
  }

  const input = parsed.data;
  const position = getPosition(input.uid);

  if (input.action === 'enroll') {
    if (position.twoFactorEnabled) {
      return NextResponse.json({ ok: false, error: 'Two-factor is already enabled' }, { status: 409 });
    }

    const secret = generateTotpSecret();
    const recovery = generateRecoveryCodes();
    setTwoFactor(input.uid, encryptField(secret), false, recovery.hashed);

    return NextResponse.json({
      ok: true,
      secret,
      otpauth: otpauthUrl(secret, `mineai:${input.uid.slice(0, 8)}`),
      recoveryCodes: recovery.plain,
      enabled: false,
      keySource: encryptionKeySource(),
    });
  }

  if (!position.twoFactorSecret) {
    return NextResponse.json({ ok: false, error: 'Enrol an authenticator first' }, { status: 409 });
  }

  if (input.action === 'verify') {
    const secret = decryptField(position.twoFactorSecret) ?? position.twoFactorSecret;
    if (!verifyTotp(secret, input.code)) {
      return NextResponse.json({ ok: false, error: 'That code is not valid right now' }, { status: 401 });
    }

    setTwoFactor(input.uid, position.twoFactorSecret, true, position.recoveryCodes);
    return NextResponse.json({
      ok: true,
      enabled: true,
      recoveryCodesRemaining: position.recoveryCodes.length,
    });
  }

  const result = consumeRecoveryCode(position.recoveryCodes, input.code);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: 'That recovery code has already been used' }, { status: 401 });
  }

  setTwoFactor(input.uid, position.twoFactorSecret, true, result.remaining);
  return NextResponse.json({
    ok: true,
    enabled: true,
    recoveryCodesRemaining: result.remaining.length,
  });
}
