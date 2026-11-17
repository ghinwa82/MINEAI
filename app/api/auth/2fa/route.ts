import { NextResponse } from 'next/server';
import { z } from 'zod';

import { beginTotp, confirmTotp, disableTotp, sessionFromRequest, verifyRecovery } from '@/lib/auth';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('begin') }),
  z.object({ action: z.literal('confirm'), code: z.string().trim().min(6).max(8) }),
  z.object({ action: z.literal('disable'), password: z.string().min(1).max(128) }),
  z.object({ action: z.literal('recover'), code: z.string().trim().min(6).max(24) }),
]);

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'auth-2fa'), 12, 60_000);
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
    return NextResponse.json({ ok: false, error: 'Check the request' }, { status: 422 });
  }

  if (parsed.data.action === 'begin') {
    return NextResponse.json(beginTotp(session.uid));
  }
  if (parsed.data.action === 'confirm') {
    const result = confirmTotp(session.uid, parsed.data.code);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }
  if (parsed.data.action === 'disable') {
    const result = disableTotp(session.uid, parsed.data.password);
    return NextResponse.json(result, { status: result.ok ? 200 : 400 });
  }

  const result = verifyRecovery(session.uid, parsed.data.code);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
