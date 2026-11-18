import { NextResponse } from 'next/server';
import { z } from 'zod';

import { beginTotp, confirmTotp, disableTotp, sessionCookie, verifyRecovery } from '@/lib/auth';
import { resolveSession, supabaseSessionToken, verifiedTotpFactor } from '@/lib/member-session';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import {
  challengeFactor,
  enrollTotp,
  signInWithPassword,
  unenrollFactor,
  verifyFactor,
} from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('begin') }),
  z.object({
    action: z.literal('confirm'),
    code: z.string().trim().min(6).max(8),
    factorId: z.string().trim().max(80).optional(),
  }),
  z.object({
    action: z.literal('disable'),
    password: z.string().min(1).max(128),
    factorId: z.string().trim().max(80).optional(),
  }),
  z.object({ action: z.literal('recover'), code: z.string().trim().min(6).max(24) }),
]);

/**
 * Authenticator (TOTP) management.
 *
 * Supabase members enrol through Supabase MFA, so the factor lives in the
 * `auth` schema and is enforced at every future sign-in by the identity
 * provider itself. Local members keep the self-contained sealed-secret path.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-2fa'), 12, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Wait a minute.' }, { status: 429 });
  }

  const session = await resolveSession(request);
  if (!session) return NextResponse.json({ ok: false, error: 'Please sign in again' }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Check the request' }, { status: 422 });
  }

  if (session.source === 'supabase' && session.accessToken) {
    const token = session.accessToken;

    if (parsed.data.action === 'begin') {
      const enrolled = await enrollTotp(token, 'MineAI');
      if (!enrolled.ok || !enrolled.data) {
        return NextResponse.json({ ok: false, error: enrolled.error }, { status: 400 });
      }
      return NextResponse.json({
        ok: true,
        provider: 'supabase',
        factorId: enrolled.data.id,
        secret: enrolled.data.totp?.secret,
        otpauth: enrolled.data.totp?.uri,
      });
    }

    if (parsed.data.action === 'recover') {
      return NextResponse.json(
        { ok: false, error: 'Use the recovery link on the sign-in page for this account' },
        { status: 400 },
      );
    }

    if (parsed.data.action === 'disable') {
      const proof = await signInWithPassword(session.member.email, parsed.data.password);
      if (!proof.ok) {
        return NextResponse.json({ ok: false, error: 'Password is not correct' }, { status: 400 });
      }
      const factorId = parsed.data.factorId ?? verifiedTotpFactor(session.user);
      if (!factorId) return NextResponse.json({ ok: false, error: 'Two-factor is not active' }, { status: 400 });
      const removed = await unenrollFactor(token, factorId);
      if (!removed.ok) {
        return NextResponse.json(
          { ok: false, error: removed.error ?? 'Could not turn off two-factor' },
          { status: 400 },
        );
      }
      return NextResponse.json({ ok: true, provider: 'supabase' });
    }

    // confirm
    const factorId = parsed.data.factorId;
    if (!factorId) {
      return NextResponse.json({ ok: false, error: 'Start two-factor setup first' }, { status: 400 });
    }
    const challenge = await challengeFactor(token, factorId);
    if (!challenge.ok || !challenge.data) {
      return NextResponse.json({ ok: false, error: challenge.error }, { status: 400 });
    }
    const verified = await verifyFactor(token, factorId, challenge.data.id, parsed.data.code);
    if (!verified.ok || !verified.data) {
      return NextResponse.json({ ok: false, error: 'That code is not correct' }, { status: 400 });
    }

    const ok = NextResponse.json({ ok: true, provider: 'supabase', recoveryCodes: [] as string[] });
    ok.headers.append('Set-Cookie', sessionCookie(supabaseSessionToken(verified.data)));
    return ok;
  }

  if (parsed.data.action === 'begin') {
    return NextResponse.json(beginTotp(session.member.uid));
  }
  if (parsed.data.action === 'confirm') {
    const result = confirmTotp(session.member.uid, parsed.data.code);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  if (parsed.data.action === 'disable') {
    const result = disableTotp(session.member.uid, parsed.data.password);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  const result = verifyRecovery(session.member.uid, parsed.data.code);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
