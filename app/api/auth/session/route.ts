import { NextResponse } from 'next/server';
import { z } from 'zod';

import { changePassword, clearSessionCookie, sessionCookie } from '@/lib/auth';
import { resolveSession } from '@/lib/member-session';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { signInWithPassword, updatePassword } from '@/lib/supabase-auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Current member, or 401 when the cookie is absent, spent or revoked. */
export async function GET(request: Request) {
  const session = await resolveSession(request);
  if (!session) {
    const response = NextResponse.json({ ok: false, member: null }, { status: 401 });
    response.headers.append('Set-Cookie', clearSessionCookie());
    return response;
  }

  const response = NextResponse.json({
    ok: true,
    member: session.member,
    source: session.source,
  });
  if (session.renewedToken) {
    response.headers.append('Set-Cookie', sessionCookie(session.renewedToken));
  }
  return response;
}

const schema = z.object({
  action: z.literal('change-password'),
  currentPassword: z.string().min(1).max(128),
  nextPassword: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-session'), 10, 60_000);
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
    return NextResponse.json({ ok: false, error: 'Check both password fields' }, { status: 422 });
  }

  if (session.source === 'supabase' && session.accessToken) {
    // Prove knowledge of the current password before rotating it, exactly as the
    // local path does. Supabase would accept the bearer alone, but a stolen
    // cookie should not be enough to lock the owner out.
    const proof = await signInWithPassword(session.member.email, parsed.data.currentPassword);
    if (!proof.ok) {
      return NextResponse.json({ ok: false, error: 'Current password is not correct' }, { status: 400 });
    }
    const updated = await updatePassword(session.accessToken, parsed.data.nextPassword);
    if (!updated.ok) {
      return NextResponse.json({ ok: false, error: updated.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true, provider: 'supabase' });
  }

  const result = changePassword(session.member.uid, parsed.data.currentPassword, parsed.data.nextPassword);
  const response = NextResponse.json(result, { status: result.ok ? 200 : 400 });
  // A password change rotates the session version, so the old cookie is spent.
  if (result.ok) response.headers.append('Set-Cookie', clearSessionCookie());
  return response;
}
