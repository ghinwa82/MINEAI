import { NextRequest, NextResponse } from 'next/server';
import { platformState } from '@/lib/state';

export async function GET() {
  return NextResponse.json({
    walletBalance: platformState.walletBalance,
    totalMinedUsd: platformState.totalMinedUsd,
    totalWithdrawnUsd: platformState.totalWithdrawnUsd,
    withdrawals: platformState.withdrawals,
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const amount = Number(body.amount);
    const method = body.method || 'crypto_usdt';
    const destination = (body.destination || '').trim();

    if (isNaN(amount) || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Please enter a valid payout amount.' }, { status: 400 });
    }

    if (amount > platformState.walletBalance) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance ($${platformState.walletBalance.toFixed(2)} available). Need more earnings to withdraw $${amount.toFixed(2)}.`,
      }, { status: 400 });
    }

    if (!destination || destination.length < 5) {
      return NextResponse.json({ success: false, error: 'Invalid payout destination or account address.' }, { status: 400 });
    }

    // Process deduction
    platformState.withdrawFunds(amount);

    // Create completed withdrawal receipt
    const txHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const newTx = {
      id: `wd-${Date.now()}`,
      amount,
      method,
      destination,
      status: 'completed' as const,
      txHash,
      date: new Date().toISOString(),
    };

    platformState.withdrawals.unshift(newTx);

    return NextResponse.json({
      success: true,
      message: `Payout of $${amount.toFixed(2)} USD has been dispatched successfully!`,
      transaction: newTx,
      updatedBalance: platformState.walletBalance,
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: 'Internal withdrawal error' }, { status: 500 });
  }
}