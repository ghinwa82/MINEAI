import { NextResponse } from 'next/server';
import { z } from 'zod';

import { registerMember, sessionCookie } from '@/lib/auth';
import { mailChannel, sendVerificationCode } from '@/lib/mailer';
import { memberFromSupabaseUser, supabaseSessionToken } from '@/lib/member-session';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { signUp, supabaseAuthConfigured } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
});

/**
 * Account creation.
 *
 * Supabase Auth is the primary ledger: it owns the password hash, sends the
 * confirmation mail and survives a cold instance. Only when the project is
 * unreachable does the route fall back to the local store, which still works but
 * lives in this process. The response says which path was taken (`provider`) and
 * whether mail actually left the building (`emailDelivered`).
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-register'), 8, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many sign-up attempts. Wait a minute.' },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Check your details' },
      { status: 422 },
    );
  }

  const { email, password } = parsed.data;

  if (supabaseAuthConfigured()) {
    const created = await signUp(email, password);
    // status 0 means the request never reached Supabase; only then do we fall
    // back. A 4xx is a real answer and must be shown to the visitor.
    if (created.status === 0) {
      // fall through to the local store below
    } else if (!created.ok) {
      return NextResponse.json(
        { ok: false, error: created.error ?? 'Could not create the account' },
        { status: created.status === 409 ? 409 : 400 },
      );
    } else if (created.data?.state === 'session') {
      const session = created.data.session;
      const response = NextResponse.json({
        ok: true,
        provider: 'supabase',
        member: memberFromSupabaseUser(session.user),
        emailDelivered: false,
      });
      response.headers.append('Set-Cookie', sessionCookie(supabaseSessionToken(session)));
      return response;
    } else {
      const user = created.data?.state === 'confirm' ? created.data.user : null;
      return NextResponse.json({
        ok: true,
        provider: 'supabase',
        needsVerification: true,
        emailDelivered: true,
        member: user
          ? memberFromSupabaseUser(user)
          : { uid: '', email: email.trim().toLowerCase(), verified: false, totpEnabled: false },
      });
    }
  }

  const result = registerMember(email, password);
  if (!result.ok) {
    return NextResponse.json(result, { status: 409 });
  }

  let emailDelivered = false;
  if (result.verificationCode && mailChannel() !== 'none') {
    const mailed = await sendVerificationCode(email.trim().toLowerCase(), result.verificationCode);
    emailDelivered = mailed.delivered;
  }

  const response = NextResponse.json({
    ...result,
    // Keep the code in the payload only when no transport exists, so a
    // developer can finish the flow without a mailbox.
    verificationCode: emailDelivered ? undefined : result.verificationCode,
    provider: 'local',
    emailDelivered,
    emailVisible: !emailDelivered,
  });

  return response;
}
