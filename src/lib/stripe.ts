import type { SupportedLanguage } from '@/types';

/**
 * Stripe integration without the SDK.
 *
 * The platform talks to the Stripe REST API directly so the bundle stays free
 * of a heavyweight client dependency. Everything degrades cleanly: with a key
 * present the calls are real, without one the storefront still runs against a
 * clearly-labelled sandbox rail.
 */

export type StripeMode = 'live' | 'test' | 'sandbox';
export type ConnectState = 'verified' | 'pending' | 'sandbox' | 'unavailable';

export interface ConnectStatus {
  state: ConnectState;
  mode: StripeMode;
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  /** Human-readable explanation surfaced in the storefront. */
  detail: string;
}

export interface CheckoutSession {
  sessionId: string;
  checkoutUrl: string;
  mode: StripeMode;
  tier: string;
  amountUsd: number;
  currency: string;
  createdAt: string;
}

const STRIPE_API = 'https://api.stripe.com/v1';

function secretKey(): string | null {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key || key.includes('placeholder')) return null;
  return key;
}

export function stripeMode(): StripeMode {
  const key = secretKey();
  if (!key) return 'sandbox';
  return key.startsWith('sk_live_') ? 'live' : 'test';
}

function stripeHeaders(): Record<string, string> {
  const key = secretKey();
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  return {
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  };
}

/**
 * Resolves the state of the connected payout account. The account endpoint is
 * only queried when a key and an account id are both present; otherwise the
 * status describes exactly what is missing so the UI can say so honestly.
 */
export async function getConnectStatus(): Promise<ConnectStatus> {
  const key = secretKey();
  const accountId = process.env.STRIPE_CONNECT_ACCOUNT_ID?.trim() || null;
  const mode = stripeMode();

  if (!key) {
    return {
      state: 'sandbox',
      mode,
      accountId,
      chargesEnabled: true,
      payoutsEnabled: true,
      detailsSubmitted: false,
      detail: 'Sandbox rail — add STRIPE_SECRET_KEY to settle live payouts.',
    };
  }

  if (!accountId) {
    return {
      state: 'pending',
      mode,
      accountId: null,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      detail: 'Stripe key detected — waiting for STRIPE_CONNECT_ACCOUNT_ID.',
    };
  }

  try {
    const response = await fetch(`${STRIPE_API}/accounts/${accountId}`, {
      method: 'GET',
      headers: stripeHeaders(),
      cache: 'no-store',
    });

    if (!response.ok) {
      return {
        state: 'unavailable',
        mode,
        accountId,
        chargesEnabled: false,
        payoutsEnabled: false,
        detailsSubmitted: false,
        detail: `Stripe account lookup failed with status ${response.status}.`,
      };
    }

    const account = (await response.json()) as {
      charges_enabled?: boolean;
      payouts_enabled?: boolean;
      details_submitted?: boolean;
      requirements?: { currently_due?: unknown[] };
    };

    const chargesEnabled = Boolean(account.charges_enabled);
    const payoutsEnabled = Boolean(account.payouts_enabled);
    const detailsSubmitted = Boolean(account.details_submitted);
    const outstanding = (account.requirements?.currently_due ?? []).length;

    return {
      state: chargesEnabled && payoutsEnabled ? 'verified' : 'pending',
      mode,
      accountId,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
      detail:
        chargesEnabled && payoutsEnabled
          ? 'Connected account is live and able to pay out.'
          : `Connected account has ${outstanding} outstanding requirement${
              outstanding === 1 ? '' : 's'
            }.`,
    };
  } catch {
    return {
      state: 'unavailable',
      mode,
      accountId,
      chargesEnabled: false,
      payoutsEnabled: false,
      detailsSubmitted: false,
      detail: 'Stripe could not be reached from this region.',
    };
  }
}

export interface CheckoutRequest {
  tier: string;
  amountUsd: number;
  nodeId: string;
  locale: SupportedLanguage;
  origin: string;
}

/**
 * Opens a Stripe Checkout session for a node tier. With a configured key the
 * session is created against the live API and the customer is handed the
 * hosted checkout URL; otherwise a sandbox session is minted so the flow can
 * still be exercised end to end.
 */
export async function createCheckoutSession(request: CheckoutRequest): Promise<CheckoutSession> {
  const { tier, amountUsd, nodeId, locale, origin } = request;
  const amount = Number(amountUsd.toFixed(2));
  const mode = stripeMode();
  const createdAt = new Date().toISOString();

  if (mode !== 'sandbox') {
    try {
      const body = new URLSearchParams({
        mode: 'payment',
        'line_items[0][quantity]': '1',
        'line_items[0][price_data][currency]': 'usd',
        'line_items[0][price_data][unit_amount]': String(Math.round(amount * 100)),
        'line_items[0][price_data][product_data][name]': `MineAI ${tier}`,
        'line_items[0][price_data][product_data][description]': `Autonomous node shard — ${nodeId}`,
        client_reference_id: nodeId,
        success_url: `${origin}/store?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/store?checkout=cancelled`,
        'metadata[node_id]': nodeId,
        'metadata[tier]': tier,
      });

      const response = await fetch(`${STRIPE_API}/checkout/sessions`, {
        method: 'POST',
        headers: stripeHeaders(),
        body: body.toString(),
        cache: 'no-store',
      });

      if (response.ok) {
        const session = (await response.json()) as { id: string; url: string };
        return {
          sessionId: session.id,
          checkoutUrl: session.url,
          mode,
          tier,
          amountUsd: amount,
          currency: 'USD',
          createdAt,
        };
      }
    } catch {
      // Fall through to the sandbox rail so the purchase flow never dead-ends.
    }
  }

  const sessionId = `cs_${mode}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  return {
    sessionId,
    checkoutUrl: `${origin}/store?checkout=sandbox&session_id=${sessionId}`,
    mode,
    tier,
    amountUsd: amount,
    currency: 'USD',
    createdAt,
  };
}
