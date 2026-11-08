import { NextRequest, NextResponse } from 'next/server';
import { networkState } from '@/lib/state';
import { StrixSecurityGuard } from '@/lib/security';
import { WithdrawalRecord } from '@/lib/types';

export async function GET() {
  return NextResponse.json({
    treasuryBalance: networkState.treasuryBalance,
    withdrawals: networkState.withdrawals,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawAmount = body.amount;
    const rawMethod = StrixSecurityGuard.sanitizeString(body.method);
    const rawDestination = StrixSecurityGuard.sanitizeString(body.destination);
    const rawCurrency = StrixSecurityGuard.sanitizeString(body.currency || 'USD');

    // Strix AI Security & Mathematical Validation
    const amountValidation = StrixSecurityGuard.validateAmount(rawAmount, networkState.treasuryBalance);
    if (!amountValidation.valid) {
      return NextResponse.json(
        { success: false, error: amountValidation.error },
        { status: 400 }
      );
    }

    if (!rawDestination || rawDestination.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Destination account or wallet address is invalid or too short.' },
        { status: 400 }
      );
    }

    const withdrawAmount = amountValidation.value;
    const feePercent = rawMethod === 'stripe_connect' ? 0.015 : 0.008; // 1.5% for fiat, 0.8% for ledger
    const fee = Number((withdrawAmount * feePercent).toFixed(2));
    const netAmount = Number((withdrawAmount - fee).toFixed(2));

    // Deduct from state treasury
    const deductionSuccess = networkState.deductTreasury(withdrawAmount);
    if (!deductionSuccess) {
      return NextResponse.json(
        { success: false, error: 'Treasury state lock failed. Insufficient funds.' },
        { status: 409 }
      );
    }

    // Generate cryptographic transaction ledger receipt
    const txHash = StrixSecurityGuard.generateTxHash(rawMethod === 'crypto_ledger' ? '0x' : 'strp_tx_');
    const newRecord: WithdrawalRecord = {
      id: `wd-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      amount: withdrawAmount,
      fee,
      netAmount,
      method: rawMethod === 'crypto_ledger' ? 'crypto_ledger' : 'stripe_connect',
      destination: rawDestination,
      currency: rawCurrency,
      txHash,
      timestamp: new Date().toISOString(),
      status: 'completed'
    };

    networkState.withdrawals.unshift(newRecord);

    return NextResponse.json({
      success: true,
      message: 'Transfer Successful! Funds have been securely cleared to your chosen gateway.',
      transaction: newRecord,
      updatedTreasuryBalance: networkState.treasuryBalance,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal Server Error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}