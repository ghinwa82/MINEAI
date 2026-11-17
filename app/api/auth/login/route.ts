import { NextResponse } from 'next/server';
import { z } from 'zod';

import { createSessionToken, loginMember, sessionCookie } from '@/lib/auth';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(1).max(128),
  code: z.string().trim().max(8).optional(),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-login'), 12, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many sign-in attempts. Wait a minute.' }, { status: 429 });
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

  const result = loginMember(parsed.data.email, parsed.data.password, parsed.data.code);
  if (!result.ok || !result.member) {
    return NextResponse.json({ ok: false, error: result.error, remaining: result.remaining }, { status: 401 });
  }

  const token = createSessionToken(result.member);
  const response = NextResponse.json({ ok: true, member: result.member });
  response.headers.append('Set-Cookie', sessionCookie(token));
  return response;
}
