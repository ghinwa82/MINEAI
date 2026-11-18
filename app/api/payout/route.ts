import { NextResponse } from 'next/server';

import { pushAgentLog } from '@/lib/agents';
import { sanitizeInput } from '@/lib/security';
import { createCheckoutSession, getConnectStatus } from '@/lib/stripe';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Reads the state of the connected payout account.
 */
export async function GET() {
  try {
    const connect = await getConnectStatus();
    return NextResponse.json({ ok: true, connect });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'The payout rail could not be reached' },
      { status: 500 },
    );
  }
}

/**
 * Opens a checkout session for a node tier.
 *
 * With a Stripe key configured the session is created against the live API
 * and the hosted checkout URL is returned. Without one the endpoint still
 * returns a valid sandbox session so the purchase flow can be exercised.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const tier = sanitizeInput(body?.tier) || 'Node shard';
    const nodeId = sanitizeInput(body?.nodeId) || 'node-1';
    const amountUsd = Number(body?.amountUsd);
    const locale = sanitizeInput(body?.locale) || 'en';

    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      return NextResponse.json(
        { ok: false, error: 'A positive amount is required' },
        { status: 400 },
      );
    }

    const origin =
      sanitizeInput(body?.origin) ||
      request.headers.get('origin') ||
      process.env.NEXT_PUBLIC_SITE_URL ||
      'http://localhost:3000';

    const session = await createCheckoutSession({
      tier,
      amountUsd,
      nodeId,
      locale: locale as 'en' | 'ar' | 'fr' | 'es' | 'zh' | 'hi',
      origin: origin.replace(/\/$/, ''),
    });

    pushAgentLog({
      agentName: 'FinancialPayout',
      action: `Checkout session opened for ${tier} on the ${session.mode} rail.`,
      status: 'info',
      details: { sessionId: session.sessionId, amountUsd: session.amountUsd, nodeId },
    });

    return NextResponse.json({ ok: true, ...session });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Failed to initialize the card checkout gateway' },
      { status: 500 },
    );
  }
}
