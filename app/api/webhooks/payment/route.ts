import { NextResponse } from 'next/server';

import { pushAgentLog } from '@/lib/agents';
import {
  toUsd,
  verifyKashierSignature,
  verifyPaymobHmac,
  verifyStripeSignature,
} from '@/lib/payments';
import { creditTreasury } from '@/lib/treasury';
import { logEventToDatabase } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Payment webhooks.
 *
 * One endpoint, three processors, each verified with its own signature scheme
 * before a single cent is credited. If the matching secret is absent the
 * endpoint refuses the call with 503 rather than trusting an unsigned body —
 * an unverified webhook is worse than a missing one.
 */

type Provider = 'kashier' | 'paymob' | 'stripe';

function providerFrom(request: Request): Provider | null {
  const url = new URL(request.url);
  const explicit = url.searchParams.get('provider');
  if (explicit === 'kashier' || explicit === 'paymob' || explicit === 'stripe') {
    return explicit;
  }
  if (request.headers.get('x-kashier-signature')) return 'kashier';
  if (request.headers.get('stripe-signature')) return 'stripe';
  if (url.searchParams.get('hmac')) return 'paymob';
  return null;
}

function cents(value: unknown): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? Number((parsed / 100).toFixed(2)) : 0;
}

export async function POST(request: Request) {
  const provider = providerFrom(request);

  if (!provider) {
    return NextResponse.json(
      { ok: false, error: 'Unknown provider. Append ?provider=kashier|paymob|stripe.' },
      { status: 400 },
    );
  }

  const raw = await request.text();
  const url = new URL(request.url);

  if (provider === 'kashier') {
    let payload: { data?: Record<string, unknown>; signature?: string };
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 });
    }

    const data = payload.data ?? (payload as unknown as Record<string, unknown>);
    const signature =
      payload.signature ?? request.headers.get('x-kashier-signature') ?? url.searchParams.get('signature');

    if (!verifyKashierSignature(data, signature)) {
      return NextResponse.json(
        { ok: false, error: 'Kashier signature missing or invalid' },
        { status: process.env.KASHIER_WEBHOOK_SECRET || process.env.KASHIER_SECRET_KEY ? 401 : 503 },
      );
    }

    const status = String(data.status ?? data.paymentStatus ?? '').toLowerCase();
    if (status !== 'success' && status !== 'captured' && status !== 'paid') {
      return NextResponse.json({ ok: true, credited: 0, detail: 'Transaction not successful; ignored.' });
    }

    const amount = Number(data.amount ?? 0);
    const amountUsd = toUsd(amount, String(data.currency ?? 'USD'));
    if (amountUsd <= 0) {
      return NextResponse.json({ ok: false, error: 'Zero-value transaction' }, { status: 422 });
    }

    creditTreasury(amountUsd, 'Kashier card settlement', String(data.transactionId ?? data.orderId ?? 'kashier'));
    pushAgentLog({
      agentName: 'FinancialPayout',
      action: `Kashier settled ${amountUsd} USD on the owner bank rail.`,
      status: 'success',
      details: { provider: 'kashier', transactionId: data.transactionId, amountUsd },
    });
    await logEventToDatabase({
      table: 'payment_webhooks',
      payload: {
        provider: 'kashier',
        event: status,
        amount_usd: amountUsd,
        reference: String(data.transactionId ?? data.orderId ?? ''),
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ok: true, credited: amountUsd });
  }

  if (provider === 'paymob') {
    let payload: { type?: string; obj?: Record<string, unknown> };
    try {
      payload = JSON.parse(raw);
    } catch {
      return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 });
    }

    const transaction = payload.obj ?? (payload as unknown as Record<string, unknown>);
    if (!verifyPaymobHmac(transaction, url.searchParams.get('hmac'))) {
      return NextResponse.json(
        { ok: false, error: 'Paymob HMAC missing or invalid' },
        { status: process.env.PAYMOB_HMAC_SECRET ? 401 : 503 },
      );
    }

    if (transaction.success !== true) {
      return NextResponse.json({ ok: true, credited: 0, detail: 'Transaction not successful; ignored.' });
    }

    const amountUsd = toUsd(cents(transaction.amount_cents), String(transaction.currency ?? 'USD'));
    if (amountUsd <= 0) {
      return NextResponse.json({ ok: false, error: 'Zero-value transaction' }, { status: 422 });
    }

    creditTreasury(amountUsd, 'Paymob card settlement', String(transaction.id ?? 'paymob'));
    pushAgentLog({
      agentName: 'FinancialPayout',
      action: `Paymob settled ${amountUsd} USD on the owner bank rail.`,
      status: 'success',
      details: { provider: 'paymob', transactionId: transaction.id, amountUsd },
    });
    await logEventToDatabase({
      table: 'payment_webhooks',
      payload: {
        provider: 'paymob',
        event: payload.type ?? 'TRANSACTION',
        amount_usd: amountUsd,
        reference: String(transaction.id ?? ''),
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({ ok: true, credited: amountUsd });
  }

  if (!verifyStripeSignature(raw, request.headers.get('stripe-signature'))) {
    return NextResponse.json(
      { ok: false, error: 'Stripe signature missing or invalid' },
      { status: process.env.STRIPE_WEBHOOK_SECRET ? 401 : 503 },
    );
  }

  let payload: {
    type?: string;
    data?: { object?: { id?: string; amount_total?: number; currency?: string; payment_status?: string } };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ ok: false, error: 'Malformed JSON' }, { status: 400 });
  }

  if (payload.type !== 'checkout.session.completed' && payload.type !== 'payment_intent.succeeded') {
    return NextResponse.json({ ok: true, credited: 0, detail: 'Event acknowledged, no credit.' });
  }

  const amountUsd = cents(payload.data?.object?.amount_total);
  if (amountUsd <= 0) {
    return NextResponse.json({ ok: false, error: 'Zero-value session' }, { status: 422 });
  }

  creditTreasury(amountUsd, 'Stripe Checkout settlement', String(payload.data?.object?.id ?? 'stripe'));
  pushAgentLog({
    agentName: 'FinancialPayout',
    action: `Stripe settled ${amountUsd} USD through the connected payout account.`,
    status: 'success',
    details: { provider: 'stripe', sessionId: payload.data?.object?.id, amountUsd },
  });

  return NextResponse.json({ ok: true, credited: amountUsd });
}
