import { NextResponse } from 'next/server';
import { z } from 'zod';

import { verifyOnChain } from '@/lib/crypto-rails';
import {
  activatePlan,
  hashrateFor,
  isValidUid,
  persistPosition,
  snapshotFor,
} from '@/lib/mining';
import { MINING_PLANS } from '@/lib/plans';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { logEventToDatabase, serviceRoleConfigured } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const schema = z.object({
  plan: z.string().trim().min(2).max(60),
  uid: z.string().trim().min(8).max(48),
  rail: z.enum(['crypto', 'kashier', 'paymob']).default('crypto'),
  network: z
    .enum(['usdt-bep20', 'usdt-arbitrum', 'usdt-erc20', 'usdt-trc20', 'sol', 'ton', 'btc', 'ltc'])
    .optional(),
  txHash: z.string().trim().min(32).max(140).optional(),
  memberUid: z.string().trim().max(60).optional(),
});

/** Transaction hashes already redeemed, so one payment cannot buy two plans. */
const globalRef = globalThis as unknown as { __mineaiCheckoutConsumed?: Set<string> };
function consumed(): Set<string> {
  if (!globalRef.__mineaiCheckoutConsumed) globalRef.__mineaiCheckoutConsumed = new Set();
  return globalRef.__mineaiCheckoutConsumed;
}

/**
 * Checkout activation.
 *
 * The free plan activates immediately. A paid plan activates only after the
 * transaction hash is confirmed against a public RPC — never on a promise, a
 * screenshot or a pending intent. Card rails answer honestly: until a processor
 * key exists they refuse to pretend a charge happened.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'checkout-activate'), 12, 60_000);
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, error: 'Too many attempts. Wait a minute.' }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: parsed.error.issues[0]?.message ?? 'Check the order' }, { status: 422 });
  }

  const { plan: planRef, uid, rail, network, txHash, memberUid } = parsed.data;
  if (!isValidUid(uid)) {
    return NextResponse.json({ ok: false, error: 'That operator id is not valid' }, { status: 400 });
  }

  const plan = MINING_PLANS.find((entry) => entry.slug === planRef || entry.id === planRef);
  if (!plan) return NextResponse.json({ ok: false, error: 'Unknown plan' }, { status: 404 });

  const provision = () =>
    activatePlan(uid, {
      id: plan.slug,
      name: plan.canonicalName,
      hashrateMhs: plan.hashrateMhs,
      multiplier: plan.multiplier,
    });

  if (plan.priceUsd <= 0) {
    const position = provision();
    await persistPosition(uid);
    await writeLedgers({ plan, uid, memberUid, rail: 'free', txHash: null });
    return NextResponse.json({
      ok: true,
      activated: true,
      plan: { id: plan.slug, name: plan.canonicalName, hashrateMhs: plan.hashrateMhs },
      position: planState(position),
      ...snapshotFor(uid, 'en'),
    });
  }

  if (rail !== 'crypto') {
    return NextResponse.json(
      {
        ok: false,
        error:
          rail === 'kashier'
            ? 'Card checkout is not configured yet (KASHIER keys absent). Pay in crypto or choose the free plan.'
            : 'Card checkout is not configured yet (PAYMOB keys absent). Pay in crypto or choose the free plan.',
        rail,
      },
      { status: 503 },
    );
  }

  if (!network) {
    return NextResponse.json({ ok: false, error: 'Choose a network to pay on' }, { status: 422 });
  }
  if (!txHash) {
    return NextResponse.json({ ok: false, error: 'Paste the transaction hash once you have paid' }, { status: 422 });
  }

  const key = `${network}:${txHash.trim().toLowerCase()}`;
  if (consumed().has(key)) {
    return NextResponse.json(
      { ok: false, error: 'That transaction was already used for an activation' },
      { status: 409 },
    );
  }

  const verdict = await verifyOnChain(network, txHash);
  if (verdict.state !== 'verified') {
    return NextResponse.json(
      {
        ok: false,
        pending: verdict.state === 'pending' || verdict.state === 'unavailable',
        verdict,
        error: verdict.detail,
      },
      { status: verdict.state === 'pending' || verdict.state === 'unavailable' ? 202 : 400 },
    );
  }

  consumed().add(key);
  const position = provision();
  await persistPosition(uid);
  await writeLedgers({ plan, uid, memberUid, rail, txHash: txHash.trim() });

  return NextResponse.json({
    ok: true,
    activated: true,
    verdict,
    plan: { id: plan.slug, name: plan.canonicalName, hashrateMhs: plan.hashrateMhs },
    position: planState(position),
    ...snapshotFor(uid, 'en'),
  });
}

function planState(position: ReturnType<typeof activatePlan>) {
  return {
    planId: position.planId,
    planName: position.planName,
    hashrateMhs: Number(hashrateFor(position).toFixed(2)),
    miningActive: position.miningActive,
  };
}

async function writeLedgers(input: {
  plan: (typeof MINING_PLANS)[number];
  uid: string;
  memberUid?: string;
  rail: string;
  txHash: string | null;
}): Promise<void> {
  if (!serviceRoleConfigured()) return;
  const now = new Date().toISOString();
  await logEventToDatabase({
    table: 'mining_nodes',
    payload: {
      operator_ref: input.uid,
      member_uid: input.memberUid ?? null,
      plan_id: input.plan.slug,
      plan_name: input.plan.canonicalName,
      hashrate_mhs: input.plan.hashrateMhs,
      multiplier: input.plan.multiplier,
      price_usd: input.plan.priceUsd,
      rail: input.rail,
      tx_hash: input.txHash,
      status: 'active',
      created_at: now,
    },
  });
  await logEventToDatabase({
    table: 'mining_balances',
    payload: {
      operator_ref: input.uid,
      asset: 'MINEAI',
      plan_id: input.plan.slug,
      balance: 0,
      updated_at: now,
    },
  });
}
