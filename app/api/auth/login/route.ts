import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  createMfaTicket,
  createSessionToken,
  loginMember,
  readMfaTicket,
  sessionCookie,
} from '@/lib/auth';
import {
  memberFromSupabaseUser,
  supabaseSessionToken,
  tokenAssuranceLevel,
  verifiedTotpFactor,
} from '@/lib/member-session';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import {
  challengeFactor,
  getUser,
  signInWithPassword,
  supabaseAuthConfigured,
  verifyFactor,
} from '@/lib/supabase-auth';
import { findMember } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(128),
  code: z.string().trim().max(8).optional(),
  /** Sealed aal1 tokens handed back by the first step of a two-factor login. */
  ticket: z.string().trim().max(4000).optional(),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-login'), 12, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many sign-in attempts. Wait a minute.' },
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
    return NextResponse.json({ ok: false, error: 'Check your email and password' }, { status: 422 });
  }

  const { email, password, code, ticket } = parsed.data;

  /* ------------------------------------------------ second factor finish */
  if (supabaseAuthConfigured() && ticket) {
    const pending = readMfaTicket(ticket);
    if (!pending) {
      return NextResponse.json(
        { ok: false, error: 'That sign-in attempt expired. Enter your password again.' },
        { status: 401 },
      );
    }
    if (!code) {
      return NextResponse.json({ ok: false, error: 'Enter the 6-digit code from your app' }, { status: 422 });
    }

    const user = await getUser(pending.accessToken);
    const factorId = verifiedTotpFactor(user.data);
    if (!user.ok || !factorId) {
      return NextResponse.json(
        { ok: false, error: 'Two-factor is not active on this account' },
        { status: 401 },
      );
    }

    const challenge = await challengeFactor(pending.accessToken, factorId);
    if (!challenge.ok || !challenge.data) {
      return NextResponse.json({ ok: false, error: challenge.error }, { status: 400 });
    }
    const verified = await verifyFactor(pending.accessToken, factorId, challenge.data.id, code);
    if (!verified.ok || !verified.data) {
      return NextResponse.json({ ok: false, error: verified.error ?? 'That code is not correct' }, { status: 401 });
    }

    const response = NextResponse.json({
      ok: true,
      provider: 'supabase',
      member: memberFromSupabaseUser(verified.data.user),
    });
    response.headers.append('Set-Cookie', sessionCookie(supabaseSessionToken(verified.data)));
    return response;
  }

  if (supabaseAuthConfigured()) {
    const result = await signInWithPassword(email, password);

    if (result.status === 0) {
      // Identity provider unreachable: the local ledger still gets a turn.
    } else if (result.ok && result.data) {
      const factorId = verifiedTotpFactor(result.data.user);
      const aal = tokenAssuranceLevel(result.data.access_token);
      if (factorId && aal !== 'aal2') {
        return NextResponse.json({
          ok: true,
          mfaRequired: true,
          provider: 'supabase',
          ticket: createMfaTicket({
            accessToken: result.data.access_token,
            refreshToken: result.data.refresh_token,
            email,
          }),
        });
      }

      const response = NextResponse.json({
        ok: true,
        provider: 'supabase',
        member: memberFromSupabaseUser(result.data.user),
      });
      response.headers.append('Set-Cookie', sessionCookie(supabaseSessionToken(result.data)));
      return response;
    } else if (result.code !== 'email_not_confirmed') {
      // An existing local account may predate Supabase; give it a chance before
      // reporting the Supabase error, but never mask an unverified address.
      const localAccount = findMember(email);
      if (!localAccount) {
        return NextResponse.json(
          { ok: false, error: result.error ?? 'Email or password is not correct' },
          { status: 401 },
        );
      }
    } else {
      return NextResponse.json(
        { ok: false, error: result.error ?? 'Please verify your email first', needsVerification: true },
        { status: 403 },
      );
    }
  }

  const result = loginMember(email, password, code);
  if (!result.ok || !result.member) {
    return NextResponse.json(
      { ok: false, error: result.error, remaining: result.remaining },
      { status: 401 },
    );
  }

  const token = createSessionToken(result.member);
  const response = NextResponse.json({ ok: true, provider: 'local', member: result.member });
  response.headers.append('Set-Cookie', sessionCookie(token));
  return response;
}
