import { NextResponse } from 'next/server';
import { z } from 'zod';

import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { sendEmailOtp, supabaseAuthConfigured } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().email().max(160),
});

/**
 * Passwordless entry: mail a six-digit code, then finish at `/api/auth/verify`.
 *
 * The code is minted and delivered by Supabase Auth, which also enforces its
 * own per-address rate limit. Without a project there is no mailer that can
 * mint a token, so the route says so instead of failing silently.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-otp'), 5, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many requests. Wait a minute.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Enter a valid email address' }, { status: 422 });
  }

  if (!supabaseAuthConfigured()) {
    return NextResponse.json(
      { ok: false, error: 'Email codes are unavailable right now. Use your password.' },
      { status: 503 },
    );
  }

  const sent = await sendEmailOtp(parsed.data.email.trim().toLowerCase(), { createUser: true });
  return NextResponse.json(
    {
      ok: sent.ok,
      provider: 'supabase',
      emailDelivered: sent.ok,
      error: sent.ok ? undefined : sent.error,
    },
    { status: sent.ok ? 200 : sent.status >= 400 && sent.status < 500 ? 400 : 503 },
  );
}
