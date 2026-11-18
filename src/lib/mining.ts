import type { SupportedLanguage } from '@/types';
import { findNetwork, isValidAddress, type ChainFamily } from '@/lib/crypto-rails';
import { readTable, supabaseConfigured, upsertRecord } from '@/lib/supabase';
import { creditTreasury } from '@/lib/treasury';

/**
 * Serverless cloud-mining and staking engine — multi-coin edition.
 *
 * No hardware is involved and no electricity is billed: the position accrues
 * against rented external edge capacity. State lives on `globalThis` so it
 * survives hot reloads and is re-seeded deterministically per serverless
 * instance, exactly like the treasury ledger. Every mutation is written
 * through to `public.mining_positions` and a cold instance hydrates from that
 * row, so a position survives a redeploy.
 *
 * Emission is a fixed dollar budget, not a fixed coin budget. A position earns
 * `hashrate × emission × vip × streak` USD per second; that budget is split
 * across the operator's allocation by `share × bonus`, normalised. $MINEAI
 * carries a 3× bonus, so it takes three times the budget of an equal share of
 * any other coin without increasing the total yield.
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

export type MiningCoinId = 'mineai' | 'btc' | 'eth' | 'sol' | 'bnb' | 'ton' | 'doge' | 'ltc';

export interface MiningCoinDefinition {
  id: MiningCoinId;
  /** Ticker as displayed, including the `$` for the platform token. */
  symbol: string;
  label: string;
  chain: string;
  family: ChainFamily;
  /** Conservative reference price in USD, used for accrual and payout valuation. */
  priceUsd: number;
  /** Emission multiplier applied to the allocated share. */
  bonus: number;
  /** Default allocation share (normalised at accrual time, not required to sum to 100). */
  share: number;
  /** Minimum withdrawal in coin units. */
  minWithdraw: number;
  /** Display decimals for the coin. Accrual is stored with 12. */
  decimals: number;
  /** Deposit/withdrawal network id from the crypto rail, when one exists. */
  network: string | null;
}

export const MINING_COINS: MiningCoinDefinition[] = [
  {
    id: 'mineai',
    symbol: '$MINEAI',
    label: 'MineAI',
    chain: 'BNB Smart Chain',
    family: 'evm',
    priceUsd: 4.85,
    bonus: 3,
    share: 50,
    minWithdraw: 25,
    decimals: 4,
    network: 'usdt-bep20',
  },
  {
    id: 'btc',
    symbol: 'BTC',
    label: 'Bitcoin',
    chain: 'Bitcoin',
    family: 'bitcoin',
    priceUsd: 96_500,
    bonus: 1,
    share: 10,
    minWithdraw: 0.0005,
    decimals: 8,
    network: 'btc',
  },
  {
    id: 'eth',
    symbol: 'ETH',
    label: 'Ethereum',
    chain: 'Ethereum',
    family: 'evm',
    priceUsd: 3_284,
    bonus: 1,
    share: 10,
    minWithdraw: 0.01,
    decimals: 6,
    network: 'usdt-erc20',
  },
  {
    id: 'sol',
    symbol: 'SOL',
    label: 'Solana',
    chain: 'Solana',
    family: 'solana',
    priceUsd: 192.4,
    bonus: 1,
    share: 10,
    minWithdraw: 0.05,
    decimals: 4,
    network: 'sol',
  },
  {
    id: 'bnb',
    symbol: 'BNB',
    label: 'BNB',
    chain: 'BNB Smart Chain',
    family: 'evm',
    priceUsd: 648.2,
    bonus: 1,
    share: 8,
    minWithdraw: 0.02,
    decimals: 4,
    network: 'usdt-bep20',
  },
  {
    id: 'ton',
    symbol: 'TON',
    label: 'Toncoin',
    chain: 'TON',
    family: 'ton',
    priceUsd: 5.42,
    bonus: 1,
    share: 6,
    minWithdraw: 1,
    decimals: 4,
    network: 'ton',
  },
  {
    id: 'doge',
    symbol: 'DOGE',
    label: 'Dogecoin',
    chain: 'Dogecoin',
    family: 'dogecoin',
    priceUsd: 0.168,
    bonus: 1,
    share: 6,
    minWithdraw: 20,
    decimals: 2,
    network: null,
  },
  {
    id: 'ltc',
    symbol: 'LTC',
    label: 'Litecoin',
    chain: 'Litecoin',
    family: 'litecoin',
    priceUsd: 88.4,
    bonus: 1,
    share: 5,
    minWithdraw: 0.5,
    decimals: 6,
    network: 'ltc',
  },
];

const COIN_BY_ID: Record<MiningCoinId, MiningCoinDefinition> = Object.fromEntries(
  MINING_COINS.map((coin) => [coin.id, coin]),
) as Record<MiningCoinId, MiningCoinDefinition>;

export function findCoin(id: string): MiningCoinDefinition | undefined {
  return COIN_BY_ID[id as MiningCoinId];
}

/** $MINEAI-equivalent emission per megahash per second, before multipliers. */
const EMISSION_PER_MH = 0.00000008;
const TOKEN_PRICE_USD = 4.85;
/** The same budget expressed in dollars — the unit the split is performed in. */
const EMISSION_USD_PER_MH = EMISSION_PER_MH * TOKEN_PRICE_USD;

const BASE_HASHRATE = 320;
const GENESIS_GRANT = 250;
const MAX_STREAK_MULTIPLIER = 1.7;
const ACCRUAL_DECIMALS = 12;

/**
 * The free plan every operator starts on.
 *
 * It matches `MINING_PLANS[0]` in `src/lib/plans.ts`. Keeping the default here
 * means a mining position is fully valid before the checkout route ever runs —
 * a brand-new visitor still sees a live reactor instead of an empty state.
 */
export const GENESIS_PLAN = {
  id: 'genesis-free-cloud',
  name: 'Genesis Free Cloud',
  hashrateMhs: 120,
  multiplier: 1,
} as const;

/** Share-to-Boost: +15% hashrate for 24 hours after a share. */
export const SHARE_BOOST_MULTIPLIER = 1.15;
export const SHARE_BOOST_MS = 24 * 60 * 60 * 1000;

export interface CoinBalance {
  amount: number;
  lifetime: number;
  withdrawn: number;
}

export interface MiningPosition {
  uid: string;
  referralCode: string;
  referredBy: string | null;
  referrals: string[];
  stakedTokens: number;
  /** $MINEAI claimable balance (mirror of `coins.mineai.amount`). */
  minedTokens: number;
  /** $MINEAI lifetime emission (mirror of `coins.mineai.lifetime`). */
  lifetimeMinedTokens: number;
  /** $MINEAI withdrawn (mirror of `coins.mineai.withdrawn`). */
  withdrawnTokens: number;
  coins: Record<MiningCoinId, CoinBalance>;
  allocations: Record<MiningCoinId, number>;
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
  /** Share-to-Boost: hashrate is multiplied until this timestamp. */
  shareBoostUntil: string | null;
  /** How many boost links this operator has shared. */
  sharedLinks: number;
  /** Cloud plan currently provisioned on this operator. */
  planId: string;
  planName: string;
  planHashrateMhs: number;
  planMultiplier: number;
  /** The reactor switch. Paused positions accrue nothing. */
  miningActive: boolean;
}

export interface PayoutRecord {
  id: string;
  wallet: string;
  network: string;
  coin: MiningCoinId;
  symbol: string;
  tokens: number;
  usd: number;
  at: string;
}

export interface CoinSnapshot {
  id: MiningCoinId;
  symbol: string;
  label: string;
  chain: string;
  family: ChainFamily;
  bonus: number;
  priceUsd: number;
  minWithdraw: number;
  decimals: number;
  amount: number;
  lifetime: number;
  withdrawn: number;
  usdValue: number;
  /** Share of the emission budget this coin actually receives, 0–100. */
  sharePct: number;
  /** Raw allocation share the operator set. */
  share: number;
}

export interface MiningSnapshot {
  uid: string;
  referralCode: string;
  hashrateMhs: number;
  /** Active plan and reactor state. */
  planId: string;
  planName: string;
  planHashrateMhs: number;
  planMultiplier: number;
  miningActive: boolean;
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
  /** Share-to-Boost state. */
  shareBoostActive: boolean;
  shareBoostUntil: string | null;
  shareBoostMultiplier: number;
  sharedLinks: number;
  tokenPriceUsd: number;
  /** Per-coin balances and allocations, in display order. */
  coins: CoinSnapshot[];
  allocations: Record<MiningCoinId, number>;
  /** USD value of every claimable balance combined. */
  totalUsdValue: number;
  /** Projected dollar emission for the current position over 24h. */
  emissionUsdPerDay: number;
  networkStats: {
    activeMiners: number;
    totalHashrateMhs: number;
    tokensMined: number;
    stakedTokens: number;
    burnedTokens: number;
    lastAccrualAt: string;
    cron: string;
    emissionUsdPerDay: number;
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

const SEED_PAYOUTS: Array<Omit<PayoutRecord, 'id' | 'at' | 'coin' | 'symbol'> & { coin?: MiningCoinId }> = [
  { wallet: '0x7a4f…9c21', network: 'usdt-bep20', tokens: 184.5, usd: 894.83, coin: 'mineai' },
  { wallet: 'TQ8m…4f17', network: 'usdt-trc20', tokens: 92.2, usd: 447.17, coin: 'mineai' },
  { wallet: '5Kd2…wq8L', network: 'sol', tokens: 311.7, usd: 1511.75, coin: 'mineai' },
  { wallet: 'bc1q…7h3m', network: 'btc', tokens: 48.9, usd: 237.17, coin: 'mineai' },
  { wallet: '0x1c9e…2ab0', network: 'usdt-arbitrum', tokens: 126.4, usd: 613.04, coin: 'mineai' },
  { wallet: 'EQB3…k9Tz', network: 'ton', tokens: 74.1, usd: 359.39, coin: 'mineai' },
];

const SEED_LEADERBOARD: Array<{ operator: string; minedTokens: number; tier: VipTier }> = [
  { operator: 'quantum.eth', minedTokens: 184_320, tier: 'leviathan' },
  { operator: '0xKestrel', minedTokens: 92_840, tier: 'whale' },
  { operator: 'sable.node', minedTokens: 61_204, tier: 'whale' },
  { operator: 'TQ-mira', minedTokens: 28_512, tier: 'navigator' },
  { operator: 'sol-otter', minedTokens: 14_907, tier: 'navigator' },
  { operator: 'ton-heron', minedTokens: 8_442, tier: 'observer' },
];

function emptyCoins(): Record<MiningCoinId, CoinBalance> {
  const entries = MINING_COINS.map((coin) => [
    coin.id,
    { amount: coin.id === 'mineai' ? GENESIS_GRANT : 0, lifetime: coin.id === 'mineai' ? GENESIS_GRANT : 0, withdrawn: 0 },
  ]);
  return Object.fromEntries(entries) as Record<MiningCoinId, CoinBalance>;
}

function defaultAllocations(): Record<MiningCoinId, number> {
  return Object.fromEntries(MINING_COINS.map((coin) => [coin.id, coin.share])) as Record<
    MiningCoinId,
    number
  >;
}

function store(): MiningStore {
  if (!globalRef.__mineaiMining) {
    const now = new Date().toISOString();
    globalRef.__mineaiMining = {
      positions: new Map(),
      payouts: SEED_PAYOUTS.map((seed, index) => ({
        ...seed,
        coin: seed.coin ?? 'mineai',
        symbol: COIN_BY_ID[seed.coin ?? 'mineai'].symbol,
        id: `payout-seed-${index}`,
        at: new Date(Date.now() - (index + 1) * 7 * 60_000).toISOString(),
      })),
      lastAccrualAt: now,
      cron: 'daily · 03:30 UTC',
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

function round(value: number, decimals = ACCRUAL_DECIMALS): number {
  return Number(value.toFixed(decimals));
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
    coins: emptyCoins(),
    allocations: defaultAllocations(),
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
    shareBoostUntil: null,
    sharedLinks: 0,
    planId: GENESIS_PLAN.id,
    planName: GENESIS_PLAN.name,
    planHashrateMhs: GENESIS_PLAN.hashrateMhs,
    planMultiplier: GENESIS_PLAN.multiplier,
    miningActive: true,
  };
  current.positions.set(uid, position);
  return position;
}

export function shareBoostActive(position: MiningPosition): boolean {
  return Boolean(position.shareBoostUntil && Date.parse(position.shareBoostUntil) > Date.now());
}

export function hashrateFor(position: MiningPosition): number {
  const plan = Number.isFinite(position.planHashrateMhs) ? position.planHashrateMhs : GENESIS_PLAN.hashrateMhs;
  const base = Math.min(60_000, BASE_HASHRATE + plan + position.stakedTokens * 0.05);
  return shareBoostActive(position) ? base * SHARE_BOOST_MULTIPLIER : base;
}

/**
 * Share-to-Boost.
 *
 * Called when a visitor opens a shared profit card. The boost is time-boxed so
 * a single share cannot inflate a position forever, and it stacks naturally
 * with VIP and streak multipliers because it acts on hashrate, not yield.
 */
export function unlockShareBoost(uid: string): {
  ok: boolean;
  position: MiningPosition;
  until: string;
  multiplier: number;
} {
  const position = accrue(uid);
  const current = Date.now();
  const existing = position.shareBoostUntil ? Date.parse(position.shareBoostUntil) : 0;
  const until = new Date(Math.max(current, existing) + SHARE_BOOST_MS).toISOString();
  position.shareBoostUntil = until;
  position.sharedLinks += 1;
  store().positions.set(uid, position);
  return { ok: true, position, until, multiplier: SHARE_BOOST_MULTIPLIER };
}

/**
 * Provisions a paid (or free) cloud plan.
 *
 * The current position is settled first, so the switch cannot be used to
 * retroactively accrue the higher hashrate over time already elapsed. Activation
 * also arms the reactor, which is what the checkout's success step promises.
 */
export function activatePlan(
  uid: string,
  plan: { id: string; name: string; hashrateMhs: number; multiplier: number },
): MiningPosition {
  const position = accrue(uid);
  position.planId = plan.id;
  position.planName = plan.name;
  position.planHashrateMhs = Math.max(0, Math.min(60_000, plan.hashrateMhs));
  position.planMultiplier = Math.max(1, Math.min(10, plan.multiplier));
  position.miningActive = true;
  position.lastAccrualAt = new Date().toISOString();
  store().positions.set(uid, position);
  return position;
}

/** The reactor switch. Pausing stops emission; resuming starts from now. */
export function setMiningActive(uid: string, active: boolean): MiningPosition {
  const position = accrue(uid);
  position.miningActive = active;
  position.lastAccrualAt = new Date().toISOString();
  store().positions.set(uid, position);
  return position;
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

/** Normalised `share × bonus` weights; falls back to $MINEAI if every share is zero. */
function emissionWeights(
  allocations: Record<MiningCoinId, number>,
): Array<{ id: MiningCoinId; weight: number }> {
  const raw = MINING_COINS.map((coin) => {
    const share = Number(allocations[coin.id]);
    return {
      id: coin.id,
      weight: (Number.isFinite(share) && share > 0 ? share : 0) * coin.bonus,
    };
  });
  const total = raw.reduce((sum, entry) => sum + entry.weight, 0);
  if (total <= 0) return [{ id: 'mineai', weight: 1 }];
  return raw.map((entry) => ({ id: entry.id, weight: entry.weight / total }));
}

function syncMineaiMirror(position: MiningPosition): void {
  const mineai = position.coins.mineai;
  position.minedTokens = mineai.amount;
  position.lifetimeMinedTokens = mineai.lifetime;
  position.withdrawnTokens = mineai.withdrawn;
}

/** Accrues emission up to now, splitting a fixed USD budget across the allocation. */
export function accrue(uid: string): MiningPosition {
  const current = store();
  const position = getPosition(uid);
  const now = Date.now();
  const last = new Date(position.lastAccrualAt).getTime();

  // A paused reactor earns nothing, and time spent paused is not banked: the
  // cursor moves forward even though no emission is added.
  if (position.miningActive === false) {
    position.lastAccrualAt = new Date(now).toISOString();
    current.lastAccrualAt = position.lastAccrualAt;
    current.positions.set(uid, position);
    return position;
  }

  const elapsedSeconds = Math.max(0, Math.min(86_400, (now - last) / 1000));

  if (elapsedSeconds > 0.5) {
    const vip = vipTierFor(position.stakedTokens);
    const streak = streakMultiplierFor(position.streakDays);
    const usdDelta =
      hashrateFor(position) * EMISSION_USD_PER_MH * elapsedSeconds * vip.multiplier * streak;

    for (const { id, weight } of emissionWeights(position.allocations)) {
      if (weight <= 0) continue;
      const coin = COIN_BY_ID[id];
      const amount = (usdDelta * weight) / coin.priceUsd;
      const balance = position.coins[id];
      balance.amount = round(balance.amount + amount);
      balance.lifetime = round(balance.lifetime + amount);
    }

    if (position.referredBy) {
      const referrer = current.positions.get(position.referredBy);
      if (referrer) {
        // Referral commission stays denominated in $MINEAI so the ledger has
        // one unit for the programme regardless of the referee's allocation.
        const share = (usdDelta * 0.08) / COIN_BY_ID.mineai.priceUsd;
        const balance = referrer.coins.mineai;
        balance.amount = round(balance.amount + share);
        balance.lifetime = round(balance.lifetime + share);
        referrer.referralEarnings = round(referrer.referralEarnings + share, 6);
        syncMineaiMirror(referrer);
      }
    }

    syncMineaiMirror(position);
  }

  position.lastAccrualAt = new Date(now).toISOString();
  current.lastAccrualAt = position.lastAccrualAt;
  current.positions.set(uid, position);
  return position;
}

export function accrueAll(): {
  positions: number;
  tokens: number;
  usd: number;
  coins: Record<string, number>;
} {
  const current = store();
  const before = new Map<string, Record<MiningCoinId, number>>();
  for (const [uid, position] of current.positions) {
    before.set(
      uid,
      Object.fromEntries(MINING_COINS.map((coin) => [coin.id, position.coins[coin.id].lifetime])) as Record<
        MiningCoinId,
        number
      >,
    );
  }

  const coins: Record<string, number> = {};
  for (const coin of MINING_COINS) coins[coin.id] = 0;

  for (const uid of current.positions.keys()) {
    accrue(uid);
    const after = current.positions.get(uid);
    const previous = before.get(uid);
    if (!after || !previous) continue;
    for (const coin of MINING_COINS) {
      const delta = after.coins[coin.id].lifetime - previous[coin.id];
      if (delta > 0) coins[coin.id] = round((coins[coin.id] ?? 0) + delta);
    }
  }

  const usd = MINING_COINS.reduce((sum, coin) => sum + (coins[coin.id] ?? 0) * coin.priceUsd, 0);
  current.lastAccrualAt = new Date().toISOString();
  return {
    positions: current.positions.size,
    tokens: coins.mineai ?? 0,
    usd: Number(usd.toFixed(4)),
    coins,
  };
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
  const balance = position.coins.mineai;
  balance.amount = round(balance.amount + bonus);
  balance.lifetime = round(balance.lifetime + bonus);
  syncMineaiMirror(position);

  return { ok: true, position, bonus };
}

export function stake(uid: string, amount: number): { ok: boolean; position: MiningPosition; error?: string } {
  const position = accrue(uid);
  const value = Number(amount);

  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, position, error: 'A positive stake amount is required' };
  }
  if (value > position.coins.mineai.amount) {
    return { ok: false, position, error: 'Not enough $MINEAI to stake' };
  }

  const balance = position.coins.mineai;
  balance.amount = round(balance.amount - value);
  position.stakedTokens = round(position.stakedTokens + value);
  syncMineaiMirror(position);
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

  position.stakedTokens = round(position.stakedTokens - value);
  const balance = position.coins.mineai;
  balance.amount = round(balance.amount + value);
  syncMineaiMirror(position);
  return { ok: true, position };
}

/** Updates the emission split. Shares are normalised, so they need not sum to 100. */
export function allocate(
  uid: string,
  shares: Partial<Record<MiningCoinId, number>>,
): { ok: boolean; position: MiningPosition; error?: string } {
  const position = accrue(uid);

  const next = { ...position.allocations };
  let total = 0;

  for (const coin of MINING_COINS) {
    const raw = shares[coin.id];
    const value = raw === undefined ? next[coin.id] : Number(raw);
    const clamped = Number.isFinite(value) ? Math.max(0, Math.min(100, value)) : 0;
    next[coin.id] = clamped;
    total += clamped;
  }

  if (total <= 0) {
    return { ok: false, position, error: 'Allocate at least one share to a coin' };
  }

  position.allocations = next;
  return { ok: true, position };
}

function maskWallet(wallet: string): string {
  return `${wallet.slice(0, 6)}…${wallet.slice(-4)}`;
}

export function requestCoinWithdrawal(
  uid: string,
  coinId: string,
  amount: number,
  wallet: string,
): { ok: boolean; position: MiningPosition; payout?: PayoutRecord; error?: string } {
  const position = accrue(uid);
  const coin = findCoin(coinId);
  const value = Number(amount);
  const address = wallet.trim();

  if (!coin) return { ok: false, position, error: 'Unsupported withdrawal coin' };
  if (!isValidAddress(coin.family, address)) {
    return { ok: false, position, error: `That is not a valid ${coin.label} (${coin.symbol}) address` };
  }
  if (!Number.isFinite(value) || value <= 0) {
    return { ok: false, position, error: 'A positive withdrawal amount is required' };
  }
  if (value < coin.minWithdraw) {
    return {
      ok: false,
      position,
      error: `The minimum ${coin.symbol} withdrawal is ${coin.minWithdraw} ${coin.symbol}`,
    };
  }

  const balance = position.coins[coin.id];
  if (value > balance.amount) {
    return { ok: false, position, error: `Not enough claimable ${coin.symbol} for that withdrawal` };
  }

  balance.amount = round(balance.amount - value);
  balance.withdrawn = round(balance.withdrawn + value);
  position.wallet = address;
  position.network = coin.network ?? coin.id;
  syncMineaiMirror(position);

  const payout: PayoutRecord = {
    id: `PAY-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
    wallet: maskWallet(address),
    network: coin.network ?? coin.id,
    coin: coin.id,
    symbol: coin.symbol,
    tokens: round(value, Math.max(coin.decimals, 6)),
    usd: Number((value * coin.priceUsd).toFixed(2)),
    at: new Date().toISOString(),
  };

  store().payouts.unshift(payout);
  store().payouts = store().payouts.slice(0, 24);

  creditTreasury(
    Math.min(0.42, Number((payout.usd * 0.001).toFixed(2))),
    `${coin.symbol} mining withdrawal ${payout.id}`,
    payout.id,
  );

  return { ok: true, position, payout };
}

/**
 * Legacy $MINEAI withdrawal signature. Kept so an older client cannot break;
 * new callers should use `requestCoinWithdrawal`.
 */
export function requestWithdrawal(
  uid: string,
  amount: number,
  wallet: string,
  networkId: string,
): { ok: boolean; position: MiningPosition; payout?: PayoutRecord; error?: string } {
  const network = findNetwork(networkId);
  if (!network) {
    return { ok: false, position: accrue(uid), error: 'Unsupported withdrawal network' };
  }
  return requestCoinWithdrawal(uid, 'mineai', amount, wallet);
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
  const balance = referrer.coins.mineai;
  balance.amount = round(balance.amount + 5);
  balance.lifetime = round(balance.lifetime + 5);
  referrer.referralEarnings = round(referrer.referralEarnings + 5, 6);
  syncMineaiMirror(referrer);

  return { ok: true, position };
}

export function tokenPriceUsd(): number {
  return TOKEN_PRICE_USD;
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
  const mined = positions.reduce((sum, item) => sum + item.coins.mineai.lifetime, 38_400_000);

  return {
    activeMiners: 12_480 + positions.length,
    totalHashrateMhs: Number(totalHashrate.toFixed(2)),
    tokensMined: Number(mined.toFixed(0)),
    stakedTokens: Number(staked.toFixed(0)),
    burnedTokens: 4_120_000,
    lastAccrualAt: current.lastAccrualAt,
    cron: current.cron,
    emissionUsdPerDay: Number((totalHashrate * EMISSION_USD_PER_MH * 86_400).toFixed(2)),
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

/* ------------------------------------------------------------------ *
 * Database write-through
 * ------------------------------------------------------------------ */

function serialisePosition(position: MiningPosition): Record<string, unknown> {
  return {
    operator_ref: position.uid,
    hashrate_mhs: Number(hashrateFor(position).toFixed(4)),
    mined_tokens: position.minedTokens,
    lifetime_mined_tokens: position.lifetimeMinedTokens,
    staked_tokens: position.stakedTokens,
    withdrawn_tokens: position.withdrawnTokens,
    streak_days: position.streakDays,
    last_claim_at: position.lastClaimDate,
    coins: position.coins,
    allocations: position.allocations,
    last_accrual_at: position.lastAccrualAt,
    plan_id: position.planId,
    plan_name: position.planName,
    plan_hashrate_mhs: position.planHashrateMhs,
    plan_multiplier: position.planMultiplier,
    mining_active: position.miningActive,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Persists one position to Supabase. No-op without credentials; the in-memory
 * store stays the hot path and the database is the durable ledger.
 */
export async function persistPosition(uid: string): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  const position = store().positions.get(uid);
  if (!position) return false;
  const result = await upsertRecord('mining_positions', serialisePosition(position), 'operator_ref');
  return result.success && result.mode === 'supabase';
}

export async function persistAllPositions(): Promise<number> {
  if (!supabaseConfigured()) return 0;
  let written = 0;
  for (const uid of store().positions.keys()) {
    if (await persistPosition(uid)) written += 1;
  }
  return written;
}

function num(value: unknown, fallback = 0): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/**
 * Seeds a cold instance from the durable row.
 *
 * Only a fresh, untouched in-memory position is hydrated — otherwise a stale
 * database snapshot could roll back balances the hot instance has already
 * advanced (withdrawals decrease a balance, so a blind merge is unsafe).
 */
export async function hydratePosition(uid: string): Promise<boolean> {
  if (!supabaseConfigured()) return false;
  const position = getPosition(uid);
  const fresh =
    position.streakDays === 0 &&
    position.lastClaimDate === null &&
    position.stakedTokens === 0 &&
    position.coins.mineai.lifetime <= GENESIS_GRANT + 1e-6;
  if (!fresh) return false;

  const rows = await readTable('mining_positions', {
    query: `operator_ref=eq.${encodeURIComponent(uid)}&select=coins,allocations,staked_tokens,streak_days,last_claim_at,last_accrual_at,plan_id,plan_name,plan_hashrate_mhs,plan_multiplier,mining_active`,
    limit: 1,
  });
  const row = rows[0];
  if (!row) return false;

  const storedCoins = row.coins;
  if (storedCoins && typeof storedCoins === 'object') {
    for (const coin of MINING_COINS) {
      const entry = (storedCoins as Record<string, unknown>)[coin.id];
      if (!entry || typeof entry !== 'object') continue;
      const record = entry as Record<string, unknown>;
      position.coins[coin.id] = {
        amount: round(num(record.amount)),
        lifetime: round(num(record.lifetime)),
        withdrawn: round(num(record.withdrawn)),
      };
    }
  }

  const storedAllocations = row.allocations;
  if (storedAllocations && typeof storedAllocations === 'object') {
    for (const coin of MINING_COINS) {
      const value = (storedAllocations as Record<string, unknown>)[coin.id];
      if (value === undefined) continue;
      position.allocations[coin.id] = Math.max(0, Math.min(100, num(value, coin.share)));
    }
  }

  position.stakedTokens = round(num(row.staked_tokens));
  position.streakDays = Math.max(0, Math.min(7, Math.round(num(row.streak_days))));
  const lastClaim = row.last_claim_at;
  position.lastClaimDate = typeof lastClaim === 'string' ? lastClaim.slice(0, 10) : null;
  const lastAccrual = row.last_accrual_at;
  if (typeof lastAccrual === 'string' && !Number.isNaN(Date.parse(lastAccrual))) {
    position.lastAccrualAt = lastAccrual;
  }

  // Older rows predate plans; absent columns keep the genesis defaults.
  if (typeof row.plan_id === 'string' && row.plan_id) position.planId = row.plan_id;
  if (typeof row.plan_name === 'string' && row.plan_name) position.planName = row.plan_name;
  if (row.plan_hashrate_mhs !== undefined && row.plan_hashrate_mhs !== null) {
    position.planHashrateMhs = Math.max(0, Math.min(60_000, num(row.plan_hashrate_mhs, GENESIS_PLAN.hashrateMhs)));
  }
  if (row.plan_multiplier !== undefined && row.plan_multiplier !== null) {
    position.planMultiplier = Math.max(1, Math.min(10, num(row.plan_multiplier, 1)));
  }
  if (typeof row.mining_active === 'boolean') position.miningActive = row.mining_active;

  syncMineaiMirror(position);
  return true;
}

export function snapshotFor(uid: string, lang: SupportedLanguage): MiningSnapshot {
  void lang;
  const position = accrue(uid);
  const current = store();
  const vip = vipTierFor(position.stakedTokens);
  const streakMultiplier = streakMultiplierFor(position.streakDays);
  const claimedToday = position.lastClaimDate === utcDay();
  const weights = emissionWeights(position.allocations);
  const weightById = new Map(weights.map((entry) => [entry.id, entry.weight]));

  const coins: CoinSnapshot[] = MINING_COINS.map((coin) => {
    const balance = position.coins[coin.id];
    return {
      id: coin.id,
      symbol: coin.symbol,
      label: coin.label,
      chain: coin.chain,
      family: coin.family,
      bonus: coin.bonus,
      priceUsd: coin.priceUsd,
      minWithdraw: coin.minWithdraw,
      decimals: coin.decimals,
      amount: round(balance.amount, coin.decimals),
      lifetime: round(balance.lifetime, coin.decimals),
      withdrawn: round(balance.withdrawn, coin.decimals),
      usdValue: Number((balance.amount * coin.priceUsd).toFixed(2)),
      sharePct: Number(((weightById.get(coin.id) ?? 0) * 100).toFixed(2)),
      share: position.allocations[coin.id],
    };
  });

  const totalUsdValue = coins.reduce((sum, coin) => sum + coin.amount * coin.priceUsd, 0);
  const hashrate = hashrateFor(position);

  const you = {
    operator: `you.${position.referralCode.toLowerCase()}`,
    minedTokens: Math.round(position.coins.mineai.lifetime),
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
    hashrateMhs: Number(hashrate.toFixed(2)),
    planId: position.planId,
    planName: position.planName,
    planHashrateMhs: position.planHashrateMhs,
    planMultiplier: position.planMultiplier,
    miningActive: position.miningActive !== false,
    minedTokens: round(position.coins.mineai.amount, 6),
    lifetimeMinedTokens: round(position.coins.mineai.lifetime, 6),
    stakedTokens: round(position.stakedTokens, 6),
    claimableTokens: round(position.coins.mineai.amount, 6),
    withdrawnTokens: round(position.coins.mineai.withdrawn, 6),
    streakDays: position.streakDays,
    streakMultiplier,
    vipTier: vip.tier,
    vipMultiplier: vip.multiplier,
    effectiveMultiplier: Number((vip.multiplier * streakMultiplier).toFixed(4)),
    claimedToday,
    nextClaimAt: nextUtcMidnight(),
    referralEarnings: round(position.referralEarnings, 4),
    referralCount: position.referrals.length,
    referredBy: position.referredBy,
    twoFactorEnabled: position.twoFactorEnabled,
    shareBoostActive: shareBoostActive(position),
    shareBoostUntil: position.shareBoostUntil,
    shareBoostMultiplier: shareBoostActive(position) ? SHARE_BOOST_MULTIPLIER : 1,
    sharedLinks: position.sharedLinks,
    tokenPriceUsd: tokenPriceUsd(),
    coins,
    allocations: { ...position.allocations },
    totalUsdValue: Number(totalUsdValue.toFixed(2)),
    emissionUsdPerDay: Number((hashrate * EMISSION_USD_PER_MH * 86_400 * vip.multiplier * streakMultiplier).toFixed(4)),
    networkStats: networkStats(),
    payouts: current.payouts.slice(0, 12),
    leaderboard,
  };
}

export const MINING_CONSTANTS = {
  minWithdraw: COIN_BY_ID.mineai.minWithdraw,
  genesisGrant: GENESIS_GRANT,
  emissionPerMh: EMISSION_PER_MH,
  emissionUsdPerMh: EMISSION_USD_PER_MH,
  baseHashrate: BASE_HASHRATE,
  tokenPriceUsd: tokenPriceUsd(),
  coins: MINING_COINS,
};
