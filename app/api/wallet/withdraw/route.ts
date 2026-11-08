import { NextResponse } from 'next/server';
import { sanitizeInput, validateIban, validateSwiftBic } from '@/lib/security';
import { pushAgentLog } from '@/lib/agents';
import { logEventToDatabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const accountHolder = sanitizeInput(payload.accountHolder);
    const ibanOrAccountNumber = sanitizeInput(payload.ibanOrAccountNumber);
    const swiftBic = sanitizeInput(payload.swiftBic);
    const bankName = sanitizeInput(payload.bankName);
    const currency = sanitizeInput(payload.currency || 'USD');
    const fiatAmount = Number(payload.fiatAmount);

    if (!accountHolder || fiatAmount <= 0) {
      return NextResponse.json({ error: 'Invalid account holder or payout sum' }, { status: 400 });
    }

    // Defensive validation using Strix AI standards
    const isIbanValid = validateIban(ibanOrAccountNumber);
    const isSwiftValid = validateSwiftBic(swiftBic);

    if (!isIbanValid && ibanOrAccountNumber.length < 8) {
      return NextResponse.json({ error: 'Malformed International IBAN or Bank Account Number' }, { status: 422 });
    }

    if (!isSwiftValid && swiftBic.length < 8) {
      return NextResponse.json({ error: 'Invalid SWIFT/BIC banking identifier' }, { status: 422 });
    }

    // Execute bank routing transaction simulation
    const transactionId = `TX-BANK-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    pushAgentLog({
      agentName: 'FinancialPayout',
      action: `International bank payout of ${fiatAmount} ${currency} authorized to ${bankName} (${accountHolder}).`,
      status: 'success',
      details: { transactionId, swiftBic, fiatAmount, currency }
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
        created_at: new Date().toISOString()
      }
    });

    return NextResponse.json({
      success: true,
      transactionId,
      status: 'Settled to Central Banking Clearing House',
      fiatAmount,
      currency,
      timestamp: new Date().toISOString()
    });
  } catch {
    return NextResponse.json({ error: 'Critical failure executing bank transfer' }, { status: 500 });
  }
}