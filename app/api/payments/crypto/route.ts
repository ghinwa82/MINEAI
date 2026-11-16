import { NextResponse } from 'next/server';
import { z } from 'zod';

import { pushAgentLog } from '@/lib/agents';
import { createDepositIntent, cryptoNetworks, settleDeposit } from '@/lib/crypto-rails';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { logEventToDatabase } from '@/lib/supabase';
import { describeIssues } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const requestSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('intent'),
    network: z.enum([
      'usdt-bep20',
      'usdt-arbitrum',
      'usdt-erc20',
      'usdt-trc20',
      'sol',
      'ton',
      'btc',
    ]),
    amountUsd: z.coerce.number().finite().positive().max(100_000),
  }),
  z.object({
    action: z.literal('verify'),
    intentId: z.string().trim().min(6).max(80),
    txHash: z.string().trim().min(32).max(140),
  }),
]);

export async function GET() {
  const networks = cryptoNetworks().map((network) => ({
    id: network.id,
    family: network.family,
    label: network.label,
    chain: network.chain,
    asset: network.asset,
    decimals: network.decimals,
    minAmount: network.minAmount,
    address: network.address,
    configured: network.configured,
    demo: network.demo,
    explorer: network.explorer,
  }));

  return NextResponse.json({ ok: true, networks });
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'crypto'), 20, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many on-chain requests. Try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = requestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: describeIssues(parsed.error) }, { status: 422 });
  }

  if (parsed.data.action === 'intent') {
    const result = await createDepositIntent(parsed.data.network, parsed.data.amountUsd);
    if (!result.ok || !result.intent) {
      return NextResponse.json({ ok: false, error: result.error ?? 'Intent failed' }, { status: 422 });
    }
    return NextResponse.json({ ok: true, intent: result.intent });
  }

  const result = await settleDeposit(parsed.data.intentId, parsed.data.txHash);
  const verdict = result.verdict;

  if (result.ok) {
    pushAgentLog({
      agentName: 'FinancialPayout',
      action: `On-chain deposit ${parsed.data.intentId} verified with ${verdict?.confirmations ?? 0} confirmations.`,
      status: 'success',
      details: {
        intentId: parsed.data.intentId,
        txHash: parsed.data.txHash,
        network: result.intent?.network,
        creditedUsd: result.credited,
      },
    });

    await logEventToDatabase({
      table: 'crypto_deposits',
      payload: {
        intent_id: parsed.data.intentId,
        tx_hash: parsed.data.txHash,
        network: result.intent?.network,
        amount_usd: result.credited,
        confirmations: verdict?.confirmations ?? 0,
        created_at: new Date().toISOString(),
      },
    });
  }

  const status =
    verdict?.state === 'failed' ? 422 : verdict?.state === 'unavailable' ? 503 : verdict?.state === 'pending' ? 202 : 200;

  return NextResponse.json(
    {
      ok: result.ok,
      state: verdict?.state ?? 'pending',
      confirmations: verdict?.confirmations ?? 0,
      detail: verdict?.detail ?? result.error ?? 'Awaiting confirmation',
      creditedUsd: result.credited ?? 0,
      intent: result.intent
        ? {
            id: result.intent.id,
            network: result.intent.network,
            amountUsd: result.intent.amountUsd,
            status: result.intent.status,
          }
        : null,
    },
    { status },
  );
}
