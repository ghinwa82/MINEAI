import { NextResponse } from 'next/server';
import { z } from 'zod';
import { StrixGuard } from '@/lib/security/strix-guard';
import { DropshipSupplyService } from '@/lib/dropship/dropship-service';

const OrderSchema = z.object({
  userId: z.string().min(2),
  productId: z.string().min(2),
  quantity: z.number().int().positive().max(50),
  shippingFullName: z.string().min(3),
  shippingAddressLine: z.string().min(5),
  shippingCity: z.string().min(2),
  shippingCountry: z.string().min(2),
  shippingPhone: z.string().min(7),
  currency: z.enum(['SAR', 'AED', 'USD', 'EUR']),
  timestamp: z.number()
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validation = StrixGuard.validatePayload(OrderSchema, body);

    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const orderData = validation.data;
    if (!StrixGuard.verifyAntiReplay(orderData.timestamp, 120)) {
      return NextResponse.json({ error: 'REPLAY_VIOLATION_SUPPLIER_REJECT' }, { status: 403 });
    }

    const response = await DropshipSupplyService.executeFactoryOrder(orderData);
    return NextResponse.json({ success: true, ...response });
  } catch {
    return NextResponse.json({ error: 'DROPSHIP_FACTORY_DISPATCH_FAILURE' }, { status: 502 });
  }
}