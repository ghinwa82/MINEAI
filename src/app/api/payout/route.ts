import { NextResponse } from 'next/server';
import { z } from 'zod';

const PayoutSchema = z.object({
  userId: z.string().min(1),
  iban: z.string().min(15).max(34),
  tokenAmount: z.number().positive(),
  currency: z.enum(['SAR', 'AED', 'USD']),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = PayoutSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: 'INVALID_PAYOUT_PARAMETERS' }, { status: 400 });
    }

    const { tokenAmount, currency, iban } = result.data;
    const exchangeRates: Record<string, number> = { SAR: 3.75, AED: 3.67, USD: 1.0 };
    const fiatValue = (tokenAmount * 0.42 * exchangeRates[currency]).toFixed(2);
    const txId = `TX-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;

    return NextResponse.json({
      success: true,
      transactionId: txId,
      dispatchedAmount: fiatValue,
      currency,
      destinationIbanMasked: `${iban.slice(0, 4)}••••${iban.slice(-4)}`,
      timestamp: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: 'PAYOUT_GATEWAY_COMMUNICATION_FAULT' }, { status: 502 });
  }
}