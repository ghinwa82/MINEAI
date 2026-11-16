import { NextResponse } from 'next/server';

import { pushAgentLog } from '@/lib/agents';
import { createFiatCheckout, ownerProfile, railStatuses } from '@/lib/payments';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { logEventToDatabase } from '@/lib/supabase';
import { describeIssues, fiatCheckoutSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/** Rail inventory and the owner's masked settlement destination. */
export async function GET() {
  const owner = ownerProfile();
  return NextResponse.json({
    ok: true,
    rails: railStatuses(),
    owner: {
      bank: {
        accountHolder: owner.bank.accountHolder,
        bankName: owner.bank.bankName,
        ibanMasked: owner.bank.iban
          ? `${owner.bank.iban.slice(0, 4)} •••• ${owner.bank.iban.slice(-4)}`
          : null,
        swift: owner.bank.swift || null,
        country: owner.bank.country,
        configured: owner.bank.configured,
      },
      walletsConfigured: owner.wallets.configured,
    },
  });
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'checkout'), 12, 60_000);
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

  const parsed = fiatCheckoutSchema.safeParse(body);
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
      { ok: false, error: result.error ?? 'The processor refused the session', rail: result.rail },
      { status: 502 },
    );
  }

  pushAgentLog({
    agentName: 'FinancialPayout',
    action: `${result.provider} checkout opened for ${parsed.data.tier} on the ${result.mode} rail.`,
    status: 'info',
    details: {
      rail: result.rail,
      mode: result.mode,
      sessionId: result.sessionId,
      amountUsd: result.amountUsd,
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
      created_at: new Date().toISOString(),
    },
  });

  return NextResponse.json({
    ...result,
    owner: ownerProfile().bank.configured ? 'owner-bank' : 'owner-bank-unset',
  });
}
