import { NextResponse } from 'next/server';
import { z } from 'zod';

import { registerMember } from '@/lib/auth';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().email().max(160),
  password: z.string().min(8).max(128),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-register'), 8, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many sign-up attempts. Wait a minute.' }, { status: 429 });
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

  const result = registerMember(parsed.data.email, parsed.data.password);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
  }

  return NextResponse.json({
    ok: true,
    member: result.member,
    verificationCode: result.verificationCode,
  });
}
