import { NextResponse } from 'next/server';
import { z } from 'zod';

import { resetPassword } from '@/lib/auth';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  token: z.string().trim().min(16).max(128),
  password: z.string().min(8).max(128),
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
    return NextResponse.json({ ok: false, error: 'Check the token and password' }, { status: 422 });
  }

  const result = resetPassword(parsed.data.token, parsed.data.password);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
