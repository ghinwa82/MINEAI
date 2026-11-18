import { NextResponse } from 'next/server';
import { z } from 'zod';

import { resetPassword, sessionCookie } from '@/lib/auth';
import { supabaseSessionToken } from '@/lib/member-session';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { supabaseAuthConfigured, updatePassword, verifyTokenHash } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z
  .object({
    /** Local one-time reset token. */
    token: z.string().trim().min(16).max(128).optional(),
    /** Access token from a Supabase recovery URL fragment. */
    accessToken: z.string().trim().min(20).max(4000).optional(),
    /** `token_hash` query value from a Supabase recovery email link. */
    tokenHash: z.string().trim().min(16).max(256).optional(),
    password: z.string().min(8).max(128),
  })
  .refine((value) => Boolean(value.token || value.accessToken || value.tokenHash), {
    message: 'A reset token is required',
  });

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-reset'), 8, 60_000);
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
    return NextResponse.json(
      { ok: false, error: parsed.error.issues[0]?.message ?? 'Check the token and password' },
      { status: 422 },
    );
  }

  const { token, accessToken, tokenHash, password } = parsed.data;

  if (supabaseAuthConfigured() && (accessToken || tokenHash)) {
    let bearer = accessToken;
    let session: string | null = null;

    if (!bearer && tokenHash) {
      const exchanged = await verifyTokenHash(tokenHash, 'recovery');
      if (!exchanged.ok || !exchanged.data) {
        return NextResponse.json(
          { ok: false, error: exchanged.error ?? 'That reset link has expired' },
          { status: 400 },
        );
      }
      bearer = exchanged.data.access_token;
      session = supabaseSessionToken(exchanged.data);
    }

    const updated = await updatePassword(bearer!, password);
    if (!updated.ok) {
      return NextResponse.json({ ok: false, error: updated.error }, { status: 400 });
    }

    const response = NextResponse.json({ ok: true, provider: 'supabase', signedIn: Boolean(session) });
    if (session) response.headers.append('Set-Cookie', sessionCookie(session));
    return response;
  }

  if (!token) {
    return NextResponse.json({ ok: false, error: 'That reset link is not valid' }, { status: 400 });
  }

  const result = resetPassword(token, password);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
