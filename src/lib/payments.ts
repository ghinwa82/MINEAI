import { createHmac, timingSafeEqual } from 'node:crypto';

import { createCheckoutSession, stripeMode, type CheckoutSession } from '@/lib/stripe';

/**
 * Fiat payment rails.
 *
 * Three processors are supported behind one interface: Paymob (cards, Apple Pay
 * and local wallets across MENA), Lemon Squeezy (merchant of record for cards
 * worldwide) and Stripe Checkout. Every call is made against the provider REST
 * API — no SDK — and every rail reports its true mode. A missing key never
 * throws; it downgrades the rail to a labelled sandbox session so the storefront
 * can still be exercised without pretending a card was charged.
 */

export type FiatRail = 'kashier' | 'paymob' | 'lemonsqueezy' | 'stripe';
export type RailMode = 'live' | 'test' | 'sandbox';
export type FiatCurrency = 'USD' | 'EGP';

export interface RailStatus {
  rail: FiatRail;
  mode: RailMode;
  configured: boolean;
  detail: string;
  supports: string[];
}

export interface FiatCheckoutRequest {
  rail: FiatRail;
  amountUsd: number;
  tier: string;
  nodeId: string;
  locale: string;
  origin: string;
  currency?: FiatCurrency;
  email?: string;
}

export interface FiatCheckoutResult {
  ok: boolean;
  rail: FiatRail;
  mode: RailMode;
  sessionId: string;
  checkoutUrl: string;
  amountUsd: number;
  currency: string;
  provider: string;
  detail: string;
  error?: string;
}

export interface OwnerProfile {
  bank: {
    accountHolder: string;
    bankName: string;
    iban: string;
    swift: string;
    country: string;
    configured: boolean;
  };
  wallets: {
    evm: string;
    tron: string;
    sol: string;
    ton: string;
    btc: string;
    configured: boolean;
  };
}

function env(name: string): string {
  return process.env[name]?.trim() ?? '';
}

function present(name: string): boolean {
  const value = env(name);
  return Boolean(value) && !/placeholder|change-?me|your[-_]/i.test(value);
}

export function ownerProfile(): OwnerProfile {
  const iban = env('OWNER_BANK_IBAN');
  const swift = env('OWNER_BANK_SWIFT');
  return {
    bank: {
      accountHolder: env('OWNER_BANK_HOLDER') || 'MineAI Node Treasury',
      bankName: env('OWNER_BANK_NAME') || 'Owner settlement bank',
      iban,
      swift,
      country: env('OWNER_BANK_COUNTRY') || 'AE',
      configured: Boolean(iban && swift),
    },
    wallets: {
      evm: env('OWNER_EVM_WALLET'),
      tron: env('OWNER_TRON_WALLET'),
      sol: env('OWNER_SOL_WALLET'),
      ton: env('OWNER_TON_WALLET'),
      btc: env('OWNER_BTC_WALLET'),
      configured: ['OWNER_EVM_WALLET', 'OWNER_TRON_WALLET', 'OWNER_SOL_WALLET', 'OWNER_TON_WALLET', 'OWNER_BTC_WALLET'].every(
        present,
      ),
    },
  };
}

export function paymobMode(): RailMode {
  const key = env('PAYMOB_API_KEY');
  if (!key) return 'sandbox';
  return /_test|test_/i.test(key) ? 'test' : 'live';
}

export function kashierMode(): RailMode {
  const merchant = env('KASHIER_MERCHANT_ID');
  const secret = env('KASHIER_SECRET_KEY');
  if (!merchant || !secret) return 'sandbox';
  const declared = env('KASHIER_MODE').toLowerCase();
  if (declared === 'live' || declared === 'test') return declared;
  return /_test|test_/i.test(secret) ? 'test' : 'live';
}

/**
 * The owner prices every node in USD. Local card rails need a local amount, so
 * the conversion rate is a deployment setting with a conservative default —
 * never a hard-coded number baked into a component.
 */
export function egpPerUsd(): number {
  const configured = Number(env('EGP_PER_USD'));
  return Number.isFinite(configured) && configured > 0 ? configured : 48.65;
}

export function exchangeRates(): Record<FiatCurrency, number> {
  return { USD: 1, EGP: egpPerUsd() };
}

/** Converts a USD list price into the currency the processor will charge. */
export function amountInCurrency(amountUsd: number, currency: FiatCurrency = 'USD'): number {
  return Number((amountUsd * exchangeRates()[currency]).toFixed(2));
}

/** Converts a settled processor amount back to the USD treasury unit. */
export function toUsd(amount: number, currency: string | null | undefined): number {
  const code = (currency ?? 'USD').toUpperCase();
  if (code === 'EGP') return Number((amount / egpPerUsd()).toFixed(2));
  return Number(amount.toFixed(2));
}

export function lemonMode(): RailMode {
  const key = env('LEMONSQUEEZY_API_KEY');
  if (!key) return 'sandbox';
  return /_test|test_/i.test(key) ? 'test' : 'live';
}

export function railStatuses(): RailStatus[] {
  const kashier = kashierMode();
  const paymob = paymobMode();
  const lemon = lemonMode();
  const stripe = stripeMode();

  return [
    {
      rail: 'kashier',
      mode: kashier,
      configured: kashier !== 'sandbox',
      detail:
        kashier === 'sandbox'
          ? 'Add KASHIER_MERCHANT_ID and KASHIER_SECRET_KEY to accept Visa, Mastercard and Meeza in USD and EGP.'
          : `Kashier is armed in ${kashier} mode and settles to the owner bank account in USD or EGP.`,
      supports: ['Visa', 'Mastercard', 'Meeza', 'Debit', 'EGP', 'USD'],
    },
    {
      rail: 'paymob',
      mode: paymob,
      configured: paymob !== 'sandbox',
      detail:
        paymob === 'sandbox'
          ? 'Add PAYMOB_API_KEY, PAYMOB_INTEGRATION_ID and PAYMOB_IFRAME_ID to accept cards, Apple Pay and local wallets.'
          : `Paymob is armed in ${paymob} mode and settles to the owner bank account.`,
      supports: ['Visa', 'Mastercard', 'Debit', 'Apple Pay', 'Local wallets'],
    },
    {
      rail: 'lemonsqueezy',
      mode: lemon,
      configured: lemon !== 'sandbox',
      detail:
        lemon === 'sandbox'
          ? 'Add LEMONSQUEEZY_API_KEY, LEMONSQUEEZY_STORE_ID and LEMONSQUEEZY_VARIANT_ID to sell worldwide.'
          : `Lemon Squeezy is armed in ${lemon} mode as merchant of record.`,
      supports: ['Visa', 'Mastercard', 'Apple Pay', 'PayPal'],
    },
    {
      rail: 'stripe',
      mode: stripe,
      configured: stripe !== 'sandbox',
      detail:
        stripe === 'sandbox'
          ? 'Add STRIPE_SECRET_KEY and STRIPE_CONNECT_ACCOUNT_ID to settle via Stripe Connect.'
          : `Stripe is armed in ${stripe} mode with a connected payout account.`,
      supports: ['Visa', 'Mastercard', 'Apple Pay', 'Bank transfer'],
    },
  ];
}

function sandboxResult(request: FiatCheckoutRequest, rail: FiatRail, detail: string): FiatCheckoutResult {
  const currency = request.currency ?? 'USD';
  const sessionId = `sandbox_${rail}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  return {
    ok: true,
    rail,
    mode: 'sandbox',
    sessionId,
    checkoutUrl: `${request.origin}/store?checkout=sandbox&rail=${rail}&session_id=${sessionId}`,
    amountUsd: request.amountUsd,
    currency,
    provider: rail,
    detail,
  };
}

function kashierHash(params: Record<string, string>): string {
  const secret = env('KASHIER_SECRET_KEY');
  if (!secret) return '';
  const ordered = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');
  return createHmac('sha256', secret).update(`/?${ordered}`).digest('hex');
}

/**
 * Kashier hosted checkout.
 *
 * The card form is hosted by Kashier, so no card number ever reaches this
 * server. The amount is charged in the requested currency (USD or EGP) and the
 * signed redirect returns the visitor to the storefront.
 */
async function kashierCheckout(request: FiatCheckoutRequest): Promise<FiatCheckoutResult> {
  const merchantId = env('KASHIER_MERCHANT_ID');
  const secret = env('KASHIER_SECRET_KEY');

  if (!merchantId || !secret) {
    return sandboxResult(request, 'kashier', 'Kashier keys are absent — sandbox session minted.');
  }

  const currency = request.currency ?? 'USD';
  const amount = amountInCurrency(request.amountUsd, currency);
  const orderId = `MINEAI-${request.nodeId}-${Date.now().toString(36).toUpperCase()}`;
  const mode = kashierMode() === 'live' ? 'live' : 'test';

  const params: Record<string, string> = {
    merchantId,
    orderId,
    amount: amount.toFixed(2),
    currency,
    mode,
    type: 'external',
    allowedMethods: 'card',
    display: request.locale === 'ar' ? 'ar' : 'en',
    merchantRedirect: `${request.origin}/store?checkout=success&rail=kashier`,
    failureRedirect: `${request.origin}/store?checkout=failed&rail=kashier`,
    serverWebhook: `${request.origin}/api/webhooks/payment?provider=kashier`,
  };

  const hash = kashierHash(params);
  const query = new URLSearchParams({ ...params, hash }).toString();

  return {
    ok: true,
    rail: 'kashier',
    mode: kashierMode(),
    sessionId: orderId,
    checkoutUrl: `https://payments.kashier.io/?${query}`,
    amountUsd: request.amountUsd,
    currency,
    provider: 'Kashier',
    detail: `Kashier hosted checkout created in ${mode} mode for ${amount.toFixed(2)} ${currency}. Settlement routes to the owner bank account.`,
  };
}

async function paymobCheckout(request: FiatCheckoutRequest): Promise<FiatCheckoutResult> {
  const apiKey = env('PAYMOB_API_KEY');
  const integrationId = env('PAYMOB_INTEGRATION_ID');
  const iframeId = env('PAYMOB_IFRAME_ID');

  if (!apiKey || !integrationId || !iframeId) {
    return sandboxResult(request, 'paymob', 'Paymob keys are absent — sandbox session minted.');
  }

  const base = 'https://accept.paymob.com/api';

  const authResponse = await fetch(`${base}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: apiKey }),
    cache: 'no-store',
  });
  if (!authResponse.ok) throw new Error(`Paymob auth failed (${authResponse.status})`);
  const auth = (await authResponse.json()) as { token?: string };
  if (!auth.token) throw new Error('Paymob auth returned no token');

  const amountCents = Math.round(amountInCurrency(request.amountUsd, request.currency ?? 'USD') * 100);
  const chargeCurrency = request.currency ?? 'USD';
  const merchantOrderId = `MINEAI-${request.nodeId}-${Date.now().toString(36).toUpperCase()}`;

  const orderResponse = await fetch(`${base}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: auth.token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: chargeCurrency,
      merchant_order_id: merchantOrderId,
      items: [
        {
          name: `MineAI ${request.tier}`,
          amount_cents: amountCents,
          quantity: 1,
          description: `Autonomous node shard ${request.nodeId}`,
        },
      ],
    }),
    cache: 'no-store',
  });
  if (!orderResponse.ok) throw new Error(`Paymob order failed (${orderResponse.status})`);
  const order = (await orderResponse.json()) as { id?: number };
  if (!order.id) throw new Error('Paymob order returned no id');

  const keyResponse = await fetch(`${base}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: auth.token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: order.id,
      billing_data: {
        first_name: 'MineAI',
        last_name: 'Operator',
        email: request.email || 'operator@mineai.network',
        phone_number: '+10000000000',
        apartment: 'NA',
        floor: 'NA',
        street: 'NA',
        building: 'NA',
        shipping_method: 'NA',
        postal_code: 'NA',
        city: 'NA',
        country: 'NA',
        state: 'NA',
      },
      currency: chargeCurrency,
      integration_id: Number(integrationId),
      lock_order_when_paid: true,
    }),
    cache: 'no-store',
  });
  if (!keyResponse.ok) throw new Error(`Paymob payment key failed (${keyResponse.status})`);
  const paymentKey = (await keyResponse.json()) as { token?: string };
  if (!paymentKey.token) throw new Error('Paymob payment key returned no token');

  return {
    ok: true,
    rail: 'paymob',
    mode: paymobMode(),
    sessionId: merchantOrderId,
    checkoutUrl: `${base}/acceptance/iframes/${iframeId}?payment_token=${paymentKey.token}`,
    amountUsd: request.amountUsd,
    currency: chargeCurrency,
    provider: 'Paymob',
    detail: 'Paymob iframe session created. Settlement routes to the owner bank account.',
  };
}

async function lemonCheckout(request: FiatCheckoutRequest): Promise<FiatCheckoutResult> {
  const apiKey = env('LEMONSQUEEZY_API_KEY');
  const storeId = env('LEMONSQUEEZY_STORE_ID');
  const variantId = env('LEMONSQUEEZY_VARIANT_ID');

  if (!apiKey || !storeId || !variantId) {
    return sandboxResult(request, 'lemonsqueezy', 'Lemon Squeezy keys are absent — sandbox session minted.');
  }

  const response = await fetch('https://api.lemonsqueezy.com/v1/checkouts', {
    method: 'POST',
    headers: {
      Accept: 'application/vnd.api+json',
      'Content-Type': 'application/vnd.api+json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      data: {
        type: 'checkouts',
        attributes: {
          custom_price: Math.round(request.amountUsd * 100),
          product_options: {
            name: `MineAI ${request.tier}`,
            description: `Autonomous node shard ${request.nodeId}`,
            redirect_url: `${request.origin}/store?checkout=success`,
          },
          checkout_data: {
            email: request.email,
            custom: { node_id: request.nodeId, tier: request.tier, locale: request.locale },
          },
          expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        },
        relationships: {
          store: { data: { type: 'stores', id: storeId } },
          variant: { data: { type: 'variants', id: variantId } },
        },
      },
    }),
    cache: 'no-store',
  });

  if (!response.ok) throw new Error(`Lemon Squeezy checkout failed (${response.status})`);
  const payload = (await response.json()) as { data?: { id?: string; attributes?: { url?: string } } };
  const url = payload.data?.attributes?.url;
  if (!url) throw new Error('Lemon Squeezy returned no checkout url');

  return {
    ok: true,
    rail: 'lemonsqueezy',
    mode: lemonMode(),
    sessionId: payload.data?.id ?? `ls_${Date.now()}`,
    checkoutUrl: url,
    amountUsd: request.amountUsd,
    currency: 'USD',
    provider: 'Lemon Squeezy',
    detail: 'Lemon Squeezy checkout created as merchant of record.',
  };
}

export async function createFiatCheckout(request: FiatCheckoutRequest): Promise<FiatCheckoutResult> {
  const origin = request.origin.replace(/\/$/, '');
  const normalised = { ...request, origin };

  try {
    if (normalised.rail === 'kashier') return await kashierCheckout(normalised);

    if (normalised.rail === 'paymob') return await paymobCheckout(normalised);

    if (normalised.rail === 'lemonsqueezy') return await lemonCheckout(normalised);

    const session: CheckoutSession = await createCheckoutSession({
      tier: normalised.tier,
      amountUsd: normalised.amountUsd,
      nodeId: normalised.nodeId,
      locale: normalised.locale as 'en' | 'ar' | 'fr' | 'es' | 'zh' | 'hi',
      origin,
    });

    return {
      ok: true,
      rail: 'stripe',
      mode: session.mode,
      sessionId: session.sessionId,
      checkoutUrl: session.checkoutUrl,
      amountUsd: session.amountUsd,
      currency: session.currency,
      provider: 'Stripe',
      detail:
        session.mode === 'sandbox'
          ? 'Stripe key absent — sandbox checkout session minted.'
          : `Stripe Checkout created in ${session.mode} mode.`,
    };
  } catch (cause) {
    return {
      ok: false,
      rail: normalised.rail,
      mode: 'sandbox',
      sessionId: '',
      checkoutUrl: '',
      amountUsd: normalised.amountUsd,
      currency: 'USD',
      provider: normalised.rail,
      detail: 'The processor did not answer.',
      error: cause instanceof Error ? cause.message : 'Checkout failed',
    };
  }
}

/* ------------------------------------------------------------------ *
 * Webhook verification
 * ------------------------------------------------------------------ */

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

/** Paymob signs a fixed, ordered concatenation of transaction fields. */
export function verifyPaymobHmac(
  transaction: Record<string, unknown>,
  received: string | null,
  secret = env('PAYMOB_HMAC_SECRET'),
): boolean {
  if (!received || !secret) return false;

  const source = (transaction.source_data ?? {}) as Record<string, unknown>;
  const order = (transaction.order ?? {}) as Record<string, unknown>;
  const fields = [
    'amount_cents',
    'created_at',
    'currency',
    'error_occured',
    'has_parent_transaction',
    'id',
    'integration_id',
    'is_3d_secure',
    'is_auth',
    'is_capture',
    'is_refunded',
    'is_standalone_payment',
    'is_voided',
  ];

  const parts = fields.map((field) => String(transaction[field] ?? ''));
  parts.push(String(order.id ?? ''));
  parts.push(String(transaction.owner ?? ''));
  parts.push(String(transaction.pending ?? ''));
  parts.push(String(source.pan ?? ''));
  parts.push(String(source.sub_type ?? ''));
  parts.push(String(source.type ?? ''));
  parts.push(String(transaction.success ?? ''));

  const expected = createHmac('sha512', secret).update(parts.join('')).digest('hex');
  return safeEqual(expected, received);
}

/** Lemon Squeezy signs the raw request body with HMAC-SHA256. */
export function verifyLemonSignature(
  rawBody: string,
  signature: string | null,
  secret = env('LEMONSQUEEZY_WEBHOOK_SECRET'),
): boolean {
  if (!signature || !secret) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  return safeEqual(expected, signature);
}

/** Stripe's `t=…,v1=…` scheme with replay tolerance. */
export function verifyStripeSignature(
  rawBody: string,
  header: string | null,
  secret = env('STRIPE_WEBHOOK_SECRET'),
  toleranceSeconds = 300,
): boolean {
  if (!header || !secret) return false;

  const parts = header.split(',').reduce<Record<string, string>>((acc, chunk) => {
    const [key, value] = chunk.split('=');
    if (key && value) acc[key.trim()] = value.trim();
    return acc;
  }, {});

  const timestamp = Number(parts.t);
  if (!Number.isFinite(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - timestamp) > toleranceSeconds) return false;

  const expected = createHmac('sha256', secret).update(`${parts.t}.${rawBody}`).digest('hex');
  return parts.v1 ? safeEqual(expected, parts.v1) : false;
}

/**
 * Kashier signs the transaction payload with HMAC-SHA256.
 *
 * Depending on the integration, the payload arrives either as a JSON string in
 * a `data` field or as a plain object. Both shapes are accepted, and the
 * signature is compared in constant time. A missing secret always fails.
 */
export function verifyKashierSignature(
  payload: unknown,
  signature: string | null,
  secret = env('KASHIER_WEBHOOK_SECRET') || env('KASHIER_SECRET_KEY'),
): boolean {
  if (!signature || !secret) return false;

  let source: string;
  if (typeof payload === 'string') {
    source = payload;
  } else if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>;
    const ordered = Object.keys(record)
      .sort()
      .reduce<Record<string, unknown>>((acc, key) => {
        acc[key] = record[key];
        return acc;
      }, {});
    source = JSON.stringify(ordered);
  } else {
    return false;
  }

  const expected = createHmac('sha256', secret).update(source).digest('hex');
  return safeEqual(expected, signature.replace(/^sha256=/i, ''));
}
