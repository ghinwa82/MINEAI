import { NextResponse } from 'next/server';
import { z } from 'zod';

import { sessionCookie } from '@/lib/auth';
import { memberFromSupabaseUser, supabaseSessionToken } from '@/lib/member-session';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { getUser } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  accessToken: z.string().trim().min(20).max(4000),
  refreshToken: z.string().trim().min(6).max(400),
});

/**
 * Turns the fragment Supabase returns to `/auth/callback` into an HttpOnly
 * session. The tokens only travel from the browser to this route once, over the
 * same origin, and the cookie that results never exposes them to JavaScript.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-oauth'), 12, 60_000);
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
    return NextResponse.json({ ok: false, error: 'The provider response was incomplete' }, { status: 422 });
  }

  const user = await getUser(parsed.data.accessToken);
  if (!user.ok || !user.data) {
    return NextResponse.json({ ok: false, error: 'That provider session is not valid' }, { status: 401 });
  }

  const response = NextResponse.json({
    ok: true,
    member: memberFromSupabaseUser(user.data),
    provider: 'supabase',
  });
  response.headers.append(
    'Set-Cookie',
    sessionCookie(
      supabaseSessionToken({
        access_token: parsed.data.accessToken,
        refresh_token: parsed.data.refreshToken,
        user: user.data,
      }),
    ),
  );
  return response;
}
