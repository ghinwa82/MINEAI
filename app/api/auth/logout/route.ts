import { NextResponse } from 'next/server';

import { clearSessionCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.headers.append('Set-Cookie', clearSessionCookie());
  return response;
}
