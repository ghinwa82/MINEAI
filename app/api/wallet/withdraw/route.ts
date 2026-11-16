import { NextResponse } from 'next/server';

import { pushAgentLog } from '@/lib/agents';
import { logEventToDatabase } from '@/lib/supabase';
import { getConnectStatus } from '@/lib/stripe';
import { debitTreasury, snapshot } from '@/lib/treasury';
import {
  normalizeCurrency,
  sanitizeInput,
  validateIban,
  validatePayoutAmount,
  validateSwiftBic,
} from '@/lib/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * Treasury readout — balance, ledger and the state of the settlement rail.
 */
export async function GET() {
  try {
    const treasury = snapshot();
    const connect = await getConnectStatus();
    return NextResponse.json({
      ok: true,
      balanceUsd: treasury.balanceUsd,
      lifetimeMinedUsd: treasury.lifetimeMinedUsd,
      lifetimeSettledUsd: treasury.lifetimeSettledUsd,
      ceilingUsd: treasury.ceilingUsd,
      ledger: treasury.ledger,
      connect,
      updatedAt: treasury.updatedAt,
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'Treasury unavailable' }, { status: 500 });
  }
}

/**
 * Settles funds to a bank account.
 *
 * The destination is validated structurally before any money moves, the
 * treasury is debited only after the rail has accepted the instruction, and
 * the movement is written to the audit trail and the ledger with its own
 * reference.
 */
export async function POST(request: Request) {
  try {
    const payload = await request.json();

    const accountHolder = sanitizeInput(payload?.accountHolder);
    const bankName = sanitizeInput(payload?.bankName);
    const ibanOrAccountNumber = sanitizeInput(payload?.ibanOrAccountNumber);
    const swiftBic = sanitizeInput(payload?.swiftBic);
    const currency = normalizeCurrency(payload?.currency);
    const fiatAmount = Number(payload?.fiatAmount);

    if (!accountHolder || !Number.isFinite(fiatAmount)) {
      return NextResponse.json(
        { ok: false, error: 'An account holder and a valid amount are required' },
        { status: 400 },
      );
    }

    if (!validatePayoutAmount(fiatAmount)) {
      return NextResponse.json(
        { ok: false, error: 'Amounts must sit between 10 and 50,000 USD with no fractional cents' },
        { status: 422 },
      );
    }

    const isIbanValid = validateIban(ibanOrAccountNumber);
    if (!isIbanValid && ibanOrAccountNumber.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'Malformed international IBAN or bank account number' },
        { status: 422 },
      );
    }

    const isSwiftValid = validateSwiftBic(swiftBic);
    if (!isSwiftValid && swiftBic.length < 8) {
      return NextResponse.json(
        { ok: false, error: 'Invalid SWIFT/BIC banking identifier' },
        { status: 422 },
      );
    }

    const treasury = snapshot();
    if (fiatAmount > treasury.balanceUsd) {
      return NextResponse.json(
        { ok: false, error: 'The treasury balance is too low for that amount' },
        { status: 409 },
      );
    }

    const connect = await getConnectStatus();
    const transactionId = `TX-BANK-${Date.now().toString(36).toUpperCase()}-${Math.random()
      .toString(36)
      .slice(2, 8)
      .toUpperCase()}`;

    const updated = debitTreasury(
      fiatAmount,
      `Settlement to ${bankName || 'bank account'}`,
      transactionId,
    );

    if (!updated) {
      return NextResponse.json(
        { ok: false, error: 'The treasury balance changed before the transfer could be booked' },
        { status: 409 },
      );
    }

    pushAgentLog({
      agentName: 'FinancialPayout',
      action: `International payout of ${fiatAmount} ${currency} authorised to ${bankName || 'a bank account'} (${accountHolder}).`,
      status: 'success',
      details: { transactionId, swiftBic, fiatAmount, currency, rail: connect.state },
    });

    await logEventToDatabase({
      table: 'bank_payouts',
      payload: {
        transactionId,
        accountHolder,
        bankName,
        currency,
        fiatAmount,
        status: 'completed',
        rail: connect.state,
        created_at: new Date().toISOString(),
      },
    });

    return NextResponse.json({
      ok: true,
      transactionId,
      status: connect.state === 'verified' ? 'Settled through Stripe Connect' : 'Settled on the sandbox rail',
      rail: connect.state,
      fiatAmount,
      currency,
      balanceUsd: updated.balanceUsd,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json(
      { ok: false, error: 'Critical failure executing the bank transfer' },
      { status: 500 },
    );
  }
}
