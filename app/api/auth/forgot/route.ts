import { NextResponse } from 'next/server';
import { z } from 'zod';

import { requestPasswordReset } from '@/lib/auth';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({ email: z.string().trim().email().max(160) });

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

  const result = requestPasswordReset(parsed.data.email);
  return NextResponse.json(result);
}
