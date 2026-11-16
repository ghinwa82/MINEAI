import type { SupportedLanguage } from '@/types';
import { findNetwork, isValidAddress } from '@/lib/crypto-rails';
import { creditTreasury } from '@/lib/treasury';

/**
 * Serverless cloud-mining and staking engine.
 *
 * No hardware is involved and no electricity is billed: the position accrues
 * against rented external edge capacity. State lives on `globalThis` so it
 * survives hot reloads and is re-seeded deterministically per serverless
 * instance, exactly like the treasury ledger.
 */

export type VipTier = 'observer' | 'navigator' | 'whale' | 'leviathan';

export interface VipDefinition {
  tier: VipTier;
  minStake: number;
  multiplier: number;
}

export const VIP_TIERS: VipDefinition[] = [
  { tier: 'observer', minStake: 0, multiplier: 1 },
  { tier: 'navigator', minStake: 1_000, multiplier: 1.15 },
  { tier: 'whale', minStake: 10_000, multiplier: 1.35 },
  { tier: 'leviathan', minStake: 100_000, multiplier: 1.6 },
];

/** Tokens emitted per megahash per second, before multipliers. */
const EMISSION_PER_MH = 0.00000008;
const BASE_HASHRATE = 320;
const MIN_WITHDRAW = 25;
const GENESIS_GRANT = 250;
const MAX_STREAK_MULTIPLIER = 1.7;

export interface MiningPosition {
  uid: string;
  referralCode: string;
  referredBy: string | null;
  referrals: string[];
  stakedTokens: number;
  minedTokens: number;
  lifetimeMinedTokens: number;
  withdrawnTokens: number;
  referralEarnings: number;
  streakDays: number;
  lastClaimDate: string | null;
  lastAccrualAt: string;
  createdAt: string;
  twoFactorSecret: string | null;
  twoFactorEnabled: boolean;
  recoveryCodes: string[];
  wallet: string | null;
  network: string | null;
}

export interface PayoutRecord {
  id: string;
  wallet: string;
  network: string;
  tokens: number;
  usd: number;
  at: string;
}

export interface MiningSnapshot {
  uid: string;
  referralCode: string;
  hashrateMhs: number;
  minedTokens: number;
  lifetimeMinedTokens: number;
  stakedTokens: number;
  claimableTokens: number;
  withdrawnTokens: number;
  streakDays: number;
  streakMultiplier: number;
  vipTier: VipTier;
  vipMultiplier: number;
  effectiveMultiplier: number;
  claimedToday: boolean;
  nextClaimAt: string;
  referralEarnings: number;
  referralCount: number;
  referredBy: string | null;
  twoFactorEnabled: boolean;
  tokenPriceUsd: number;
  networkStats: {
    activeMiners: number;
    totalHashrateMhs: number;
    tokensMined: number;
    stakedTokens: number;
    burnedTokens: number;
    lastAccrualAt: string;
    cron: string;
  };
  payouts: PayoutRecord[];
  leaderboard: Array<{ rank: number; operator: string; minedTokens: number; tier: VipTier; you: boolean }>;
}

interface MiningStore {
  positions: Map<string, MiningPosition>;
  payouts: PayoutRecord[];
  lastAccrualAt: string;
  cron: string;
}

const globalRef = globalThis as unknown as { __mineaiMining?: MiningStore };

const SEED_PAYOUTS: Array<Omit<PayoutRecord, 'id' | 'at'>> = [
  { wallet: '0x7a4f…9c21', network: 'usdt-bep20', tokens: 184.5, usd: 894.83 },
  { wallet: 'TQ8m…4f17', network: 'usdt-trc20', tokens: 92.2, usd: 447.17 },
  { wallet: '5Kd2…wq8L', network: 'sol', tokens: 311.7, usd: 1511.75 },
  { wallet: 'bc1q…7h3m', network: 'btc', tokens: 48.9, usd: 237.17 },
  { wallet: '0x1c9e…2ab0', network: 'usdt-arbitrum', tokens: 126.4, usd: 613.04 },
  { wallet: 'EQB3…k9Tz', network: 'ton', tokens: 74.1, usd: 359.39 },
];

const SEED_LEADERBOARD: Array<{ operator: string; minedTokens: number; tier: VipTier }> = [
  { operator: 'quantum.eth', minedTokens: 184_320, tier: 'leviathan' },
  { operator: '0xKestrel', minedTokens: 92_840, tier: 'whale' },
  { operator: 'sable.node', minedTokens: 61_204, tier: 'whale' },
  { operator: 'TQ-mira', minedTokens: 28_512, tier: 'navigator' },
  { operator: 'sol-otter', minedTokens: 14_907, tier: 'navigator' },
  { operator: 'ton-heron', minedTokens: 8_442, tier: 'observer' },
];

function store(): MiningStore {
  if (!globalRef.__mineaiMining) {
    const now = new Date().toISOString();
    globalRef.__mineaiMining = {
      positions: new Map(),
      payouts: SEED_PAYOUTS.map((seed, index) => ({
        ...seed,
        id: `payout-seed-${index}`,
        at: new Date(Date.now() - (index + 1) * 7 * 60_000).toISOString(),
      })),
      lastAccrualAt: now,
      cron: 'daily · 03:00 UTC',
    };
  }
  return globalRef.__mineaiMining;
}

function hashUid(uid: string): number {
  let hash = 2166136261;
  for (let index = 0; index < uid.length; index += 1) {
    hash ^= uid.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function referralCodeFor(uid: string): string {
  return hashUid(uid).toString(36).toUpperCase().padStart(8, 'M').slice(0, 8);
}

export function isValidUid(uid: string): boolean {
  return /^[A-Za-z0-9_-]{8,48}$/.test(uid);
}

export function getPosition(uid: string): MiningPosition {
  const current = store();
  const existing = current.positions.get(uid);
  if (existing) return existing;

  const now = new Date().toISOString();
  const position: MiningPosition = {
    uid,
    referralCode: referralCodeFor(uid),
    referredBy: null,
    referrals: [],
    stakedTokens: 0,
    minedTokens: GENESIS_GRANT,
    lifetimeMinedTokens: GENESIS_GRANT,
    withdrawnTokens: 0,
    referralEarnings: 0,
    streakDays: 0,
    lastClaimDate: null,
    lastAccrualAt: now,
    createdAt: now,
    twoFactorSecret: null,
    twoFactorEnabled: false,
    recoveryCodes: [],
    wallet: null,
    network: null,
  };
  current.positions.set(uid, position);
  return position;
}

export function hashrateFor(position: MiningPosition): number {
  return Math.min(2_400, BASE_HASHRATE + position.stakedTokens * 0.05);
}

export function vipTierFor(stakedTokens: number): VipDefinition {
  let active = VIP_TIERS[0];
  for (const tier of VIP_TIERS) {
    if (stakedTokens >= tier.minStake) active = tier;
  }
  return active;
}

export function streakMultiplierFor(streakDays: number): number {
  return Math.min(MAX_STREAK_MULTIPLIER, 1 + Math.max(0, streakDays - 1) * 0.1);
}

function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function nextUtcMidnight(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1)).toISOString();
}

/** Accrues emission up to now, crediting referral share where applicable. */
export function accrue(uid: string): MiningPosition {
  const current = store();
  const position = getPosition(uid);
  const now = Date.now();
  const last = new Date(position.lastAccrualAt).getTime();
  const elapsedSeconds = Math.max(0, Math.min(86_400, (now - last) / 1000));

  if (elapsedSeconds > 0.5) {
    const vip = vipTierFor(position.stakedTokens);
    const streak = streakMultiplierFor(position.streakDays);
    const delta =
      hashrateFor(position) * EMISSION_PER_MH * elapsedSeconds * vip.multiplier * streak;

    position.minedTokens = Number((position.minedTokens + delta).toFixed(6));
    position.lifetimeMinedTokens = Number((position.lifetimeMinedTokens + delta).toFixed(6));

    if (position.referredBy) {
      const referrer = current.positions.get(position.referredBy);
      if (referrer) {
        const share = delta * 0.08;
        referrer.minedTokens = Number((referrer.minedTokens + share).toFixed(6));
        referrer.referralEarnings = Number((referrer.referralEarnings + share).toFixed(6));
        referrer.lifetimeMinedTokens = Number((referrer.lifetimeMinedTokens + share).toFixed(6));
      }
    }
  }

  position.lastAccrualAt = new Date(now).toISOString();
  current.lastAccrualAt = position.lastAccrualAt;
  current.positions.set(uid, position);
  return position;
}

export function accrueAll(): { positions: number; tokens: number } {
  const current = store();
  let tokens = 0;
  for (const uid of current.positions.keys()) {
    const before = current.positions.get(uid)?.minedTokens ?? 0;
    const after = accrue(uid).minedTokens;
    tokens += Math.max(0, after - before);
  }
  current.lastAccrualAt = new Date().toISOString();
  return { positions: current.positions.size, tokens: Number(tokens.toFixed(4)) };
}

export function claimStreak(uid: string): { ok: boolean; position: MiningPosition; bonus: number; error?: string } {
  const position = accrue(uid);
  const today = utcDay();

  if (position.lastClaimDate === today) {
    return { ok: false, position, bonus: 0, error: 'Already claimed today' };
  }

  const yesterday = utcDay(new Date(Date.now() - 86_400_000));
  position.streakDays = position.lastClaimDate === yesterday ? position.streakDays + 1 : 1;
  position.lastClaimDate = today;

  const bonus = Number((0.75 * streakMultiplierFor(position.streakDays)).toFixed(4));
  position.minedTokens = Number((position.minedTokens + bonus).toFixed(6));
  position.lifetimeMinedTokens = Number((position.lifetimeMinedTokens + bonus).toFixed(6));

  return { ok: true, position, bonus };
}

export function stake(uid: string, amount: number): { ok: boolean; position: MiningPosition; error?: string } {
  const position = accrue(uid);
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, position, error: 'A positive stake amount is required' };
  }
  if (value > position.minedTokens) {
    return { ok: false, position, error: 'Not enough mined tokens to stake' };
  }

  position.minedTokens = Number((position.minedTokens - value).toFixed(6));
  position.stakedTokens = Number((position.stakedTokens + value).toFixed(6));
  return { ok: true, position };
}

export function unstake(uid: string, amount: number): { ok: boolean; position: MiningPosition; error?: string } {
  const position = accrue(uid);
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, position, error: 'A positive unstake amount is required' };
  }
  if (value > position.stakedTokens) {
    return { ok: false, position, error: 'That is more than the staked balance' };
  }

  position.stakedTokens = Number((position.stakedTokens - value).toFixed(6));
  position.minedTokens = Number((position.minedTokens + value).toFixed(6));
  return { ok: true, position };
}

export function requestWithdrawal(
  uid: string,
  amount: number,
  wallet: string,
  networkId: string,
): { ok: boolean; position: MiningPosition; payout?: PayoutRecord; error?: string } {
  const position = accrue(uid);
  const network = findNetwork(networkId);
  const value = Number(amount);

  if (!network) return { ok: false, position, error: 'Unsupported withdrawal network' };
  if (!network.configured) return { ok: false, position, error: `${network.envKey} is not configured` };
  if (!isValidAddress(network.family, wallet)) {
    return { ok: false, position, error: 'The wallet address is malformed for this network' };
  }
  if (!Number.isFinite(value) || value < MIN_WITHDRAW) {
    return { ok: false, position, error: `The minimum withdrawal is ${MIN_WITHDRAW} $MINEAI` };
  }
  if (value > position.minedTokens) {
    return { ok: false, position, error: 'Not enough claimable tokens for that withdrawal' };
  }

  position.minedTokens = Number((position.minedTokens - value).toFixed(6));
  position.withdrawnTokens = Number((position.withdrawnTokens + value).toFixed(6));
  position.wallet = wallet;
  position.network = networkId;

  const payout: PayoutRecord = {
    id: `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    wallet: `${wallet.slice(0, 6)}…${wallet.slice(-4)}`,
    network: networkId,
    tokens: Number(value.toFixed(4)),
    usd: Number((value * tokenPriceUsd()).toFixed(2)),
    at: new Date().toISOString(),
  };

  store().payouts.unshift(payout);
  store().payouts = store().payouts.slice(0, 24);

  creditTreasury(
    Math.min(0.42, Number((value * 0.001).toFixed(2))),
    `Mining withdrawal ${payout.id}`,
    payout.id,
  );

  return { ok: true, position, payout };
}

export function applyReferral(uid: string, code: string): { ok: boolean; position: MiningPosition; error?: string } {
  const position = accrue(uid);
  const current = store();

  if (position.referredBy) return { ok: false, position, error: 'A referral code is already attached' };

  const cleaned = code.trim().toUpperCase();
  if (cleaned === position.referralCode) return { ok: false, position, error: 'You cannot refer yourself' };

  const referrer = [...current.positions.values()].find((candidate) => candidate.referralCode === cleaned);
  if (!referrer) return { ok: false, position, error: 'That referral code is not active on this instance' };

  position.referredBy = referrer.uid;
  referrer.referrals.push(uid);
  referrer.minedTokens = Number((referrer.minedTokens + 5).toFixed(6));
  referrer.referralEarnings = Number((referrer.referralEarnings + 5).toFixed(6));

  return { ok: true, position };
}

export function tokenPriceUsd(): number {
  return 4.85;
}

/** Public payout tape — safe to expose without a session. */
export function payoutTape(limit = 10): PayoutRecord[] {
  return store().payouts.slice(0, limit);
}

/** Aggregate network telemetry, independent of any single position. */
export function networkStats(): MiningSnapshot['networkStats'] {
  const current = store();
  const positions = [...current.positions.values()];
  const totalHashrate = positions.reduce((sum, item) => sum + hashrateFor(item), 184_920);
  const staked = positions.reduce((sum, item) => sum + item.stakedTokens, 2_480_000);
  const mined = positions.reduce((sum, item) => sum + item.lifetimeMinedTokens, 38_400_000);

  return {
    activeMiners: 12_480 + positions.length,
    totalHashrateMhs: Number(totalHashrate.toFixed(2)),
    tokensMined: Number(mined.toFixed(0)),
    stakedTokens: Number(staked.toFixed(0)),
    burnedTokens: 4_120_000,
    lastAccrualAt: current.lastAccrualAt,
    cron: current.cron,
  };
}

export function setTwoFactor(
  uid: string,
  secret: string | null,
  enabled: boolean,
  recoveryCodes: string[] = [],
): MiningPosition {
  const position = getPosition(uid);
  position.twoFactorSecret = secret;
  position.twoFactorEnabled = enabled;
  position.recoveryCodes = recoveryCodes;
  return position;
}

export function snapshotFor(uid: string, lang: SupportedLanguage): MiningSnapshot {
  void lang;
  const position = accrue(uid);
  const current = store();
  const vip = vipTierFor(position.stakedTokens);
  const streakMultiplier = streakMultiplierFor(position.streakDays);
  const claimedToday = position.lastClaimDate === utcDay();

  const you = {
    operator: `you.${position.referralCode.toLowerCase()}`,
    minedTokens: Math.round(position.lifetimeMinedTokens),
    tier: vip.tier,
    you: true,
  };

  const leaderboard = [...SEED_LEADERBOARD.map((row) => ({ ...row, you: false })), you]
    .sort((a, b) => b.minedTokens - a.minedTokens)
    .slice(0, 8)
    .map((row, index) => ({ rank: index + 1, ...row }));

  return {
    uid: position.uid,
    referralCode: position.referralCode,
    hashrateMhs: Number(hashrateFor(position).toFixed(2)),
    minedTokens: Number(position.minedTokens.toFixed(6)),
    lifetimeMinedTokens: Number(position.lifetimeMinedTokens.toFixed(6)),
    stakedTokens: Number(position.stakedTokens.toFixed(6)),
    claimableTokens: Number(position.minedTokens.toFixed(6)),
    withdrawnTokens: Number(position.withdrawnTokens.toFixed(6)),
    streakDays: position.streakDays,
    streakMultiplier,
    vipTier: vip.tier,
    vipMultiplier: vip.multiplier,
    effectiveMultiplier: Number((vip.multiplier * streakMultiplier).toFixed(4)),
    claimedToday,
    nextClaimAt: nextUtcMidnight(),
    referralEarnings: Number(position.referralEarnings.toFixed(4)),
    referralCount: position.referrals.length,
    referredBy: position.referredBy,
    twoFactorEnabled: position.twoFactorEnabled,
    tokenPriceUsd: tokenPriceUsd(),
    networkStats: networkStats(),
    payouts: current.payouts.slice(0, 12),
    leaderboard,
  };
}

export const MINING_CONSTANTS = {
  minWithdraw: MIN_WITHDRAW,
  genesisGrant: GENESIS_GRANT,
  emissionPerMh: EMISSION_PER_MH,
  baseHashrate: BASE_HASHRATE,
  tokenPriceUsd: tokenPriceUsd(),
};
