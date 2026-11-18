import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createSessionToken,
  findMember,
  resendVerification,
  sessionCookie,
  verifyEmail,
} from '@/lib/auth';
import { mailChannel, sendVerificationCode } from '@/lib/mailer';
import { memberFromSupabaseUser, supabaseSessionToken } from '@/lib/member-session';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { sendEmailOtp, supabaseAuthConfigured, verifyEmailToken } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().email().max(160),
  code: z.string().trim().min(4).max(8).optional(),
  resend: z.boolean().optional(),
});

/**
 * Email confirmation.
 *
 * Supabase accounts verify with the six-digit token Supabase mailed; local
 * accounts verify against the code this server issued and mailed through
 * Resend. Either way a successful check signs the visitor in immediately,
 * because proving control of the inbox is the whole point of the step.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-verify'), 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Wait a minute.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Check the email and code' }, { status: 422 });
  }

  const email = parsed.data.email.trim().toLowerCase();
  const localAccount = findMember(email);

  if (parsed.data.resend) {
    if (supabaseAuthConfigured() && !localAccount) {
      const sent = await sendEmailOtp(email);
      return NextResponse.json(
        { ok: sent.ok, error: sent.ok ? undefined : sent.error, emailDelivered: sent.ok, provider: 'supabase' },
        { status: sent.ok ? 200 : 400 },
      );
    }

    const resent = resendVerification(email);
    if (!resent.ok) return NextResponse.json(resent, { status: 400 });
    let delivered = false;
    if (resent.verificationCode && mailChannel() !== 'none') {
      delivered = (await sendVerificationCode(email, resent.verificationCode)).delivered;
    }
    return NextResponse.json({
      ...resent,
      verificationCode: delivered ? undefined : resent.verificationCode,
      emailDelivered: delivered,
      provider: 'local',
    });
  }

  if (!parsed.data.code) {
    return NextResponse.json({ ok: false, error: 'Enter the code we sent you' }, { status: 422 });
  }

  if (supabaseAuthConfigured() && !localAccount) {
    const verified = await verifyEmailToken(email, parsed.data.code, 'email');
    if (!verified.ok) {
      return NextResponse.json(
        { ok: false, error: verified.error ?? 'That code is not correct' },
        { status: 400 },
      );
    }
    if (verified.data) {
      const response = NextResponse.json({
        ok: true,
        provider: 'supabase',
        signedIn: true,
        member: memberFromSupabaseUser(verified.data.user),
      });
      response.headers.append('Set-Cookie', sessionCookie(supabaseSessionToken(verified.data)));
      return response;
    }
    return NextResponse.json({ ok: true, provider: 'supabase', signedIn: false });
  }

  const result = verifyEmail(email, parsed.data.code);
  if (!result.ok || !result.member) {
    return NextResponse.json(result, { status: 400 });
  }

  const response = NextResponse.json({
    ok: true,
    provider: 'local',
    signedIn: true,
    member: result.member,
  });
  response.headers.append('Set-Cookie', sessionCookie(createSessionToken(result.member)));
  return response;
}
