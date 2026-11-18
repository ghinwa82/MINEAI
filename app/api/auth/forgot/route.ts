import { NextResponse } from 'next/server';
import { z } from 'zod';

import { codesVisible, findMember, requestPasswordReset } from '@/lib/auth';
import { mailChannel, sendResetToken } from '@/lib/mailer';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { requestRecovery, supabaseAuthConfigured } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({ email: z.string().trim().email().max(160) });

function siteOrigin(request: Request): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return new URL(request.url).origin;
}

/**
 * Password recovery.
 *
 * Supabase mails its own signed link and redirects to `/reset-password`, where
 * the browser exchanges the recovery session for a new password. Local accounts
 * get a random token mailed through Resend (or shown on screen when no transport
 * exists). The answer is identical either way, so the route cannot be used to
 * discover which addresses have accounts.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-forgot'), 6, 60_000);
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

  const email = parsed.data.email.trim().toLowerCase();
  const localAccount = findMember(email);

  if (supabaseAuthConfigured() && !localAccount) {
    const sent = await requestRecovery(email, `${siteOrigin(request)}/reset-password`);
    return NextResponse.json({
      // Recovery always reports success for a known or unknown address.
      ok: true,
      provider: 'supabase',
      emailDelivered: sent.status !== 0,
      error: sent.status === 0 ? 'Mail service is unreachable' : undefined,
    });
  }

  const result = requestPasswordReset(email);
  let delivered = false;
  if (result.resetToken) {
    const link = `${siteOrigin(request)}/reset-password?token=${encodeURIComponent(result.resetToken)}`;
    delivered =
      mailChannel() !== 'none'
        ? (await sendResetToken(email, result.resetToken, link)).delivered
        : false;
  }

  return NextResponse.json({
    ok: true,
    provider: 'local',
    emailDelivered: delivered,
    emailVisible: !delivered && codesVisible(),
    resetToken: delivered ? undefined : result.resetToken,
  });
}
