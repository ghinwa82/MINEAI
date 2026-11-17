import { NextResponse } from 'next/server';
import { z } from 'zod';

import { normalizeLanguage } from '@/lib/languages';
import { answerFor } from '@/lib/support-i18n';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { insertServiceRow, serviceRoleConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  message: z.string().trim().min(1).max(600),
  lang: z.string().trim().max(8).optional(),
});

/**
 * The 24/7 support agent endpoint.
 *
 * Answers come from a deterministic multilingual knowledge base, so the route
 * works on every instance with no model key and cannot invent a fee or a
 * promise. It is rate-limited like the other public write routes.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'support'), 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many messages. Wait a minute.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Write a short question first' }, { status: 422 });
  }

  const lang = normalizeLanguage(parsed.data.lang ?? 'en');
  const answer = answerFor(parsed.data.message, lang);

  // Keep the question in `support_tickets` when the database is reachable, so a
  // human can follow up on anything the assistant could not settle. Without a
  // service-role key the route simply answers and stores nothing — it never
  // pretends a row was written.
  let stored = false;
  if (serviceRoleConfigured()) {
    stored = await insertServiceRow('support_tickets', {
      lang,
      topic: answer.intent,
      message: parsed.data.message.slice(0, 2000),
      status: 'open',
    });
  }

  return NextResponse.json({ ok: true, lang, stored, ...answer });
}
