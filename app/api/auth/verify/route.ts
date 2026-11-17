import { NextResponse } from 'next/server';
import { z } from 'zod';

import { resendVerification, verifyEmail } from '@/lib/auth';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  email: z.string().trim().email().max(160),
  code: z.string().trim().min(4).max(8).optional(),
  resend: z.boolean().optional(),
});

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-verify'), 10, 60_000);
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
    return NextResponse.json({ ok: false, error: 'Check the email and code' }, { status: 422 });
  }

  if (parsed.data.resend) {
    const resent = resendVerification(parsed.data.email);
    return NextResponse.json(resent, { status: resent.ok ? 200 : 400 });
  }

  if (!parsed.data.code) {
    return NextResponse.json({ ok: false, error: 'Enter the code we sent you' }, { status: 422 });
  }

  const result = verifyEmail(parsed.data.email, parsed.data.code);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
