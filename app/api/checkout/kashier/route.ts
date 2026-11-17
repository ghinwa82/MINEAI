import { NextResponse } from 'next/server';

import { pushAgentLog } from '@/lib/agents';
import { createFiatCheckout, ownerProfile, railStatuses } from '@/lib/payments';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { logEventToDatabase } from '@/lib/supabase';
import { describeIssues, fiatCheckoutSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Kashier card checkout.
 *
 * Visa, Mastercard and Meeza in USD or EGP. The card form is hosted by
 * Kashier; this route only mints a signed session and reports the true rail
 * mode, so an unconfigured deployment can never pretend a card was charged.
 */
export async function GET() {
  const rail = railStatuses().find((item) => item.rail === 'kashier');
  const owner = ownerProfile();
  return NextResponse.json({
    ok: true,
    rail,
    owner: {
      bankConfigured: owner.bank.configured,
      ibanMasked: owner.bank.iban
        ? `${owner.bank.iban.slice(0, 4)} •••• ${owner.bank.iban.slice(-4)}`
        : null,
    },
  });
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'checkout-kashier'), 12, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many checkout attempts. Try again in a minute.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = fiatCheckoutSchema.safeParse({ ...(body as object), rail: 'kashier' });
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: describeIssues(parsed.error) }, { status: 422 });
  }

  const origin =
    request.headers.get('origin')?.replace(/\/$/, '') ||
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '') ||
    new URL(request.url).origin;

  const result = await createFiatCheckout({ ...parsed.data, origin });

  if (!result.ok) {
    return NextResponse.json(
      { ok: false, error: result.error ?? 'Kashier refused the session', rail: result.rail },
      { status: 502 },
    );
  }

  pushAgentLog({
    agentName: 'FinancialPayout',
    action: `Kashier checkout opened for ${parsed.data.tier} in ${result.currency} on the ${result.mode} rail.`,
    status: 'info',
    details: {
      rail: result.rail,
      mode: result.mode,
      sessionId: result.sessionId,
      amountUsd: result.amountUsd,
      currency: result.currency,
    },
  });

  await logEventToDatabase({
    table: 'payment_sessions',
    payload: {
      rail: result.rail,
      mode: result.mode,
      session_id: result.sessionId,
      node_id: parsed.data.nodeId,
      tier: parsed.data.tier,
      amount_usd: result.amountUsd,
      currency: result.currency,
      created_at: new Date().toISOString(),
    },
  });

  return NextResponse.json(result);
}
