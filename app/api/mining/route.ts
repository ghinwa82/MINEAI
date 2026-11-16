import { NextResponse } from 'next/server';

import { pushAgentLog } from '@/lib/agents';
import { decryptField } from '@/lib/encryption';
import {
  MINING_CONSTANTS,
  VIP_TIERS,
  applyReferral,
  claimStreak,
  getPosition,
  isValidUid,
  requestWithdrawal,
  snapshotFor,
  stake,
  unstake,
} from '@/lib/mining';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { logEventToDatabase } from '@/lib/supabase';
import { verifyTotp } from '@/lib/two-factor';
import { describeIssues, miningActionSchema } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function uidFrom(request: Request): string | null {
  const url = new URL(request.url);
  const candidate = url.searchParams.get('uid') || request.headers.get('x-mineai-uid') || '';
  return isValidUid(candidate) ? candidate : null;
}

export async function GET(request: Request) {
  const uid = uidFrom(request);
  if (!uid) {
    return NextResponse.json(
      { ok: false, error: 'A valid uid query parameter is required' },
      { status: 400 },
    );
  }

  return NextResponse.json({
    ok: true,
    ...snapshotFor(uid, 'en'),
    constants: MINING_CONSTANTS,
    vipTiers: VIP_TIERS,
  });
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'mining'), 40, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many mining actions. Slow down.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = miningActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: describeIssues(parsed.error) }, { status: 422 });
  }

  const input = parsed.data;

  try {
    if (input.action === 'claim-streak') {
      const result = claimStreak(input.uid);
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error, ...snapshotFor(input.uid, 'en') }, { status: 409 });
      }
      pushAgentLog({
        agentName: 'GrowthHacker',
        action: `Daily streak claimed: day ${result.position.streakDays}, bonus ${result.bonus} $MINEAI.`,
        status: 'success',
        details: { uid: input.uid, streak: result.position.streakDays, bonus: result.bonus },
      });
      return NextResponse.json({ ok: true, bonus: result.bonus, ...snapshotFor(input.uid, 'en') });
    }

    if (input.action === 'stake' || input.action === 'unstake') {
      const result =
        input.action === 'stake' ? stake(input.uid, input.amount) : unstake(input.uid, input.amount);
      if (!result.ok) {
        return NextResponse.json({ ok: false, error: result.error, ...snapshotFor(input.uid, 'en') }, { status: 409 });
      }
      return NextResponse.json({ ok: true, ...snapshotFor(input.uid, 'en') });
    }

    if (input.action === 'withdraw') {
      // Once the operator has enrolled TOTP, every withdrawal must carry a
      // live code. Before enrolment the field is absent and the rail stays open,
      // which is the state the account vault invites them to close.
      const position = getPosition(input.uid);
      if (position.twoFactorEnabled) {
        if (!input.code) {
          return NextResponse.json(
            { ok: false, error: 'Two-factor code required', ...snapshotFor(input.uid, 'en') },
            { status: 401 },
          );
        }
        if (!position.twoFactorSecret || !verifyTotp(decryptField(position.twoFactorSecret) ?? position.twoFactorSecret, input.code)) {
          return NextResponse.json(
            { ok: false, error: 'Two-factor code rejected', ...snapshotFor(input.uid, 'en') },
            { status: 401 },
          );
        }
      }

      const result = requestWithdrawal(input.uid, input.amount, input.wallet, input.network);
      if (!result.ok || !result.payout) {
        return NextResponse.json({ ok: false, error: result.error, ...snapshotFor(input.uid, 'en') }, { status: 422 });
      }
      pushAgentLog({
        agentName: 'FinancialPayout',
        action: `Mining withdrawal ${result.payout.id} of ${result.payout.tokens} $MINEAI queued to ${result.payout.wallet}.`,
        status: 'success',
        details: { payout: result.payout },
      });
      await logEventToDatabase({
        table: 'mining_withdrawals',
        payload: {
          payout_id: result.payout.id,
          uid: input.uid,
          network: input.network,
          tokens: result.payout.tokens,
          usd: result.payout.usd,
          wallet_masked: result.payout.wallet,
          created_at: new Date().toISOString(),
        },
      });
      return NextResponse.json({ ok: true, payout: result.payout, ...snapshotFor(input.uid, 'en') });
    }

    const result = applyReferral(input.uid, input.code);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error, ...snapshotFor(input.uid, 'en') }, { status: 409 });
    }
    return NextResponse.json({ ok: true, ...snapshotFor(input.uid, 'en') });
  } catch {
    return NextResponse.json({ ok: false, error: 'The mining engine rejected that action' }, { status: 500 });
  }
}
