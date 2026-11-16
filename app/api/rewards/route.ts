import { NextResponse } from 'next/server';

import { applyReferral, claimStreak, isValidUid, snapshotFor } from '@/lib/mining';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { z } from 'zod';
import { describeIssues } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('claim-streak'), uid: z.string().trim().regex(/^[A-Za-z0-9_-]{8,48}$/) }),
  z.object({
    action: z.literal('apply-referral'),
    uid: z.string().trim().regex(/^[A-Za-z0-9_-]{8,48}$/),
    code: z.string().trim().min(4).max(24),
  }),
]);

/** Retention snapshot: streak, VIP tier, referral position and the payout tape. */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const uid = url.searchParams.get('uid') || request.headers.get('x-mineai-uid') || '';
  if (!isValidUid(uid)) {
    return NextResponse.json({ ok: false, error: 'A valid uid is required' }, { status: 400 });
  }

  const snapshot = snapshotFor(uid, 'en');
  return NextResponse.json({
    ok: true,
    uid: snapshot.uid,
    referralCode: snapshot.referralCode,
    streakDays: snapshot.streakDays,
    streakMultiplier: snapshot.streakMultiplier,
    claimedToday: snapshot.claimedToday,
    nextClaimAt: snapshot.nextClaimAt,
    vipTier: snapshot.vipTier,
    vipMultiplier: snapshot.vipMultiplier,
    effectiveMultiplier: snapshot.effectiveMultiplier,
    stakedTokens: snapshot.stakedTokens,
    referralEarnings: snapshot.referralEarnings,
    referralCount: snapshot.referralCount,
    referredBy: snapshot.referredBy,
    twoFactorEnabled: snapshot.twoFactorEnabled,
    leaderboard: snapshot.leaderboard,
    payouts: snapshot.payouts,
    networkStats: snapshot.networkStats,
    tokenPriceUsd: snapshot.tokenPriceUsd,
  });
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'rewards'), 30, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many reward actions. Slow down.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = actionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: describeIssues(parsed.error) }, { status: 422 });
  }

  const input = parsed.data;

  if (input.action === 'claim-streak') {
    const result = claimStreak(input.uid);
    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
    }
    return NextResponse.json({ ok: true, bonus: result.bonus, ...snapshotFor(input.uid, 'en') });
  }

  const result = applyReferral(input.uid, input.code);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error }, { status: 409 });
  }
  return NextResponse.json({ ok: true, ...snapshotFor(input.uid, 'en') });
}
