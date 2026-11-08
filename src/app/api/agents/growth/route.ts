import { NextResponse } from 'next/server';
import { z } from 'zod';
import { StrixGuard } from '@/lib/security/strix-guard';
import { FinancialPayoutAgent } from '@/lib/agents/payout-agent';

const PayoutSchema = z.object({
  userId: z.string().min(3),
  payoutMethod: z.enum(['IBAN', 'CARD_P2P', 'CRYPTO_WALLET']),
  destinationTarget: z.string().min(8).max(64),
  tokenAmount: z.number().positive(),
  targetCurrency: z.enum(['SAR', 'AED', 'USD', 'EUR']),
  timestamp: z.number()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = StrixGuard.validatePayload(PayoutSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const payload = validation.data;
    if (!StrixGuard.verifyAntiReplay(payload.timestamp, 60)) {
      return NextResponse.json({ error: 'TRANSACTION_REPLAY_REJECTED' }, { status: 403 });
    }

    const result = await FinancialPayoutAgent.processDirectPayout(payload);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'TRANSACTION_SETTLEMENT_ABORTED';
    return NextResponse.json({ error: msg }, { status: 422 });
  }
}