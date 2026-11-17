import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  changePassword,
  clearSessionCookie,
  findMemberByUid,
  publicMember,
  sessionFromRequest,
} from '@/lib/auth';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  const session = sessionFromRequest(request);
  if (!session) return NextResponse.json({ ok: false, member: null }, { status: 401 });
  const account = findMemberByUid(session.uid);
  if (!account) return NextResponse.json({ ok: false, member: null }, { status: 401 });
  return NextResponse.json({ ok: true, member: publicMember(account) });
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

  const session = sessionFromRequest(request);
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

  const result = changePassword(session.uid, parsed.data.currentPassword, parsed.data.nextPassword);
  const response = NextResponse.json(result, { status: result.ok ? 200 : 400 });
  // A password change rotates the session version, so the old cookie is spent.
  if (result.ok) response.headers.append('Set-Cookie', clearSessionCookie());
  return response;
}
