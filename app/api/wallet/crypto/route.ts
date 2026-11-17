import { NextResponse } from 'next/server';

import { validateCryptoAddress } from '@/lib/security';
import { findNetwork } from '@/lib/crypto-rails';

/**
 * A deposit receiver for the crypto checkout.
 *
 * The address always comes from the owner wallet registry, never from a
 * placeholder literal: an unconfigured rail returns an explicit 503 so no
 * visitor is ever shown an address that nobody controls.
 */

const DEFAULT_NETWORK: Record<'EVM' | 'SOL', string> = {
  EVM: 'usdt-bep20',
  SOL: 'sol',
};

const SETTLEMENT_SECONDS: Record<string, number> = {
  evm: 12,
  solana: 15,
  tron: 30,
  ton: 6,
  bitcoin: 900,
  dogecoin: 300,
  litecoin: 300,
};

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ success: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const chain = body.chain === 'SOL' ? 'SOL' : 'EVM';
  const requested = typeof body.network === 'string' ? body.network.trim() : '';
  const network = findNetwork(requested || DEFAULT_NETWORK[chain]);

  if (!network) {
    return NextResponse.json(
      { success: false, error: 'Unknown deposit network', network: requested },
      { status: 422 },
    );
  }

  const userWallet = typeof body.userWallet === 'string' ? body.userWallet.trim() : '';
  if (userWallet && !validateCryptoAddress(userWallet, chain)) {
    return NextResponse.json({ success: false, error: 'Invalid wallet address' }, { status: 422 });
  }

  if (!network.configured || !network.address) {
    return NextResponse.json(
      {
        success: false,
        configured: false,
        network: network.id,
        chain,
        asset: network.asset,
        error: 'This deposit network is not configured yet. Pay by card or contact support.',
      },
      { status: 503 },
    );
  }

  return NextResponse.json({
    success: true,
    configured: true,
    demo: network.demo,
    network: network.id,
    chain,
    family: network.family,
    asset: network.asset,
    minAmountUsd: network.minAmount,
    treasuryAddress: network.address,
    acceptedCurrencies: [network.asset],
    qrCodeData: network.payUri(network.address, network.minAmount),
    settlementTimeSeconds: SETTLEMENT_SECONDS[network.family] ?? 60,
  });
}
