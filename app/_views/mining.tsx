'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import MineAICoinLogo from '../components/MineAICoinLogo';
import PayoutTicker from '../components/PayoutTicker';
import { useI18n } from '@/lib/i18n-provider';
import { useUid } from '@/lib/use-uid';

/**
 * The mining console.
 *
 * A position accrues every second against rented edge capacity — no hardware
 * and no power draw. Emission is a fixed dollar budget split across seven coin
 * rails; $MINEAI carries a 3× bonus. The console reads its snapshot from
 * `/api/mining`, and every action (streak, stake, allocate, withdraw) posts to
 * the same route and replaces the snapshot with the server's answer rather
 * than guessing.
 */

interface CoinRow {
  id: string;
  symbol: string;
  label: string;
  chain: string;
  family: string;
  bonus: number;
  priceUsd: number;
  minWithdraw: number;
  decimals: number;
  amount: number;
  lifetime: number;
  withdrawn: number;
  usdValue: number;
  sharePct: number;
  share: number;
}

interface Snapshot {
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
  vipTier: string;
  vipMultiplier: number;
  effectiveMultiplier: number;
  claimedToday: boolean;
  nextClaimAt: string;
  twoFactorEnabled: boolean;
  referralEarnings: number;
  referralCount: number;
  tokenPriceUsd: number;
  coins: CoinRow[];
  allocations: Record<string, number>;
  totalUsdValue: number;
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
  payouts: Array<{
    id: string;
    wallet: string;
    network: string;
    coin: string;
    symbol: string;
    tokens: number;
    usd: number;
    at: string;
  }>;
  leaderboard: Array<{ rank: number; operator: string; minedTokens: number; tier: string; you: boolean }>;
  constants?: { minWithdraw: number; genesisGrant: number; tokenPriceUsd: number };
}

type Tone = 'ok' | 'error' | 'info';

const COIN_TONE: Record<string, string> = {
  mineai: 'from-[#FFF3B0] via-[#D4AF37] to-[#8a6a12] text-[#241a02]',
  btc: 'from-[#f7931a] via-[#e07b12] to-[#7a3f05] text-[#1a0d00]',
  eth: 'from-[#c3cbe6] via-[#8b96c9] to-[#3c477a] text-[#0b1024]',
  sol: 'from-[#a6f5d6] via-[#4ade9f] to-[#0f9d63] text-[#04231a]',
  bnb: 'from-[#ffe082] via-[#f3ba2f] to-[#8a6300] text-[#1f1500]',
  ton: 'from-[#bfe6ff] via-[#3aa7e0] to-[#0b5c86] text-[#03141f]',
  doge: 'from-[#f6e3a1] via-[#c9a94a] to-[#6d5a12] text-[#1a1602]',
};

const WALLET_PLACEHOLDER: Record<string, string> = {
  evm: '0x…',
  bitcoin: 'bc1…',
  dogecoin: 'D…',
  solana: '5…',
  ton: 'UQ…',
  tron: 'T…',
};

function coinTone(id: string): string {
  return COIN_TONE[id] ?? 'from-white/30 via-white/15 to-white/5 text-ink';
}

export default function MiningView() {
  const { eco, t, lang, href: to } = useI18n();
  const uid = useUid();

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [allocation, setAllocation] = useState<Record<string, number> | null>(null);
  const [selectedCoin, setSelectedCoin] = useState('mineai');
  const [stakeAmount, setStakeAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('25');
  const [wallet, setWallet] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: Tone; text: string } | null>(null);

  const copy = eco.mining;

  const notify = useCallback((tone: Tone, text: string) => {
    setToast({ tone, text });
    window.setTimeout(() => setToast(null), 5200);
  }, []);

  const apply = useCallback((payload: Partial<Snapshot>) => {
    setSnapshot((previous) => (previous ? { ...previous, ...payload } : (payload as Snapshot)));
  }, []);

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const response = await fetch(`/api/mining?uid=${encodeURIComponent(uid)}`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as Snapshot & { ok?: boolean };
      if (payload.ok) apply(payload);
    } catch {
      // Keep the last snapshot; accrual continues server-side.
    }
  }, [uid, apply]);

  useEffect(() => {
    if (!uid) return;
    load();
    const timer = window.setInterval(load, 15_000);
    return () => window.clearInterval(timer);
  }, [uid, load]);

  useEffect(() => {
    if (snapshot && !allocation) setAllocation({ ...snapshot.allocations });
  }, [snapshot, allocation]);

  const act = useCallback(
    async (action: 'claim-streak' | 'stake' | 'unstake' | 'withdraw' | 'allocate', body: Record<string, unknown>) => {
      if (!uid) return;
      setBusy(action);
      try {
        const response = await fetch('/api/mining', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, uid, ...body }),
        });
        const payload = (await response.json()) as Snapshot & {
          ok?: boolean;
          error?: string;
          bonus?: number;
          payout?: { id: string; wallet: string; symbol?: string };
        };

        if (!payload.ok) {
          notify('error', payload.error ?? t.common.error);
          if (payload.hashrateMhs !== undefined) apply(payload);
          return;
        }

        apply(payload);
        if (action === 'claim-streak') {
          notify('ok', `+${payload.bonus ?? 0} $MINEAI`);
        } else if (action === 'withdraw') {
          notify('ok', `${copy.withdrawSuccess} ${payload.payout?.wallet ?? ''}`);
        } else if (action === 'allocate') {
          notify('ok', copy.allocationSaved);
        } else {
          notify('info', action === 'stake' ? copy.stake : copy.unstake);
        }
      } catch {
        notify('error', t.common.error);
      } finally {
        setBusy(null);
      }
    },
    [uid, apply, notify, copy.stake, copy.unstake, copy.withdrawSuccess, copy.allocationSaved, t.common.error],
  );

  const number = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        maximumFractionDigits: 2,
      }),
    [lang],
  );

  const tokens = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }),
    [lang],
  );

  const usd = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [lang],
  );

  const coins = snapshot?.coins ?? [];
  const selected = coins.find((coin) => coin.id === selectedCoin) ?? coins[0] ?? null;
  const claimIn = snapshot
    ? new Date(snapshot.nextClaimAt).toLocaleTimeString(
        lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US',
        { hour: '2-digit', minute: '2-digit' },
      )
    : '—';

  const allocationTotal = useMemo(
    () => Object.values(allocation ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [allocation],
  );

  const formatCoin = useCallback((value: number, decimals: number) => {
    const digits = Math.min(8, Math.max(0, decimals));
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: value > 0 && value < 1 ? Math.min(digits, 6) : 0,
      maximumFractionDigits: digits,
    }).format(value);
  }, []);

  const selectCoin = (id: string) => {
    setSelectedCoin(id);
    const coin = coins.find((item) => item.id === id);
    if (coin) setWithdrawAmount(String(coin.minWithdraw));
    setWallet('');
  };

  return (
    <>
      {/* ---------------------------------------------------------- Header */}
      <section className="grid gap-10 pb-14 pt-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="mx-eyebrow">{copy.eyebrow}</p>
          <h1 className="mx-display mt-6">{copy.title}</h1>
          <p className="mx-lede mt-6 max-w-xl">{copy.lead}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="mx-chip !border-mint/40 !text-mint">{copy.zeroPower}</span>
            <span className="mx-chip !border-cyan/35 !text-cyan">{copy.compliance}</span>
            <span className="mx-chip">{copy.edgeTitle}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8">
          <MineAICoinLogo size={190} />
          <dl className="space-y-4">
            <div>
              <dt className="text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">{copy.hashrate}</dt>
              <dd className="mx-numeric mt-1 text-xl font-bold text-ink">
                {snapshot ? number.format(snapshot.hashrateMhs) : '—'} <span className="text-[0.7rem] text-ink-faint">MH/s</span>
              </dd>
            </div>
            <div>
              <dt className="text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">{copy.multiplier}</dt>
              <dd className="mx-numeric mt-1 text-xl font-bold text-cyan">
                {snapshot ? `${snapshot.effectiveMultiplier.toFixed(2)}x` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">{copy.vip}</dt>
              <dd className="mt-1 text-[0.95rem] font-semibold text-amber">
                {snapshot ? snapshot.vipTier : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {toast ? (
        <div
          role="status"
          className={`mb-8 rounded-xl border px-4 py-3 text-[0.82rem] font-medium ${
            toast.tone === 'ok'
              ? 'border-mint/40 bg-mint/8 text-mint'
              : toast.tone === 'error'
                ? 'border-rose/40 bg-rose/8 text-rose'
                : 'border-cyan/40 bg-cyan/8 text-cyan'
          }`}
        >
          {toast.text}
        </div>
      ) : null}

      {/* ----------------------------------------------------------- Stats */}
      <section className="grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label={copy.hashrate} value={snapshot ? `${number.format(snapshot.hashrateMhs)} MH/s` : '—'} />
        <Stat label={copy.mined} value={snapshot ? tokens.format(snapshot.lifetimeMinedTokens) : '—'} accent="cyan" />
        <Stat label={copy.portfolio} value={snapshot ? usd.format(snapshot.totalUsdValue) : '—'} accent="mint" />
        <Stat label={copy.pending} value={snapshot ? tokens.format(snapshot.claimableTokens) : '—'} accent="mint" />
        <Stat
          label={copy.streak}
          value={snapshot ? `${snapshot.streakDays}d · ${snapshot.streakMultiplier.toFixed(1)}x` : '—'}
          accent="amber"
        />
      </section>

      {/* -------------------------------------------------- Coin terminal */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-amber/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.06),rgba(8,13,24,0.97)_46%)]">
        <div className="border-b border-white/8 p-6 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mx-eyebrow">{copy.coin}</p>
              <h2 className="mt-3 text-[1.15rem] font-bold tracking-[-0.01em] text-ink">
                {copy.terminalTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-[0.8rem] leading-relaxed text-ink-mute">
                {copy.terminalBody}
              </p>
            </div>
            <div className="text-end">
              <p className="text-[0.6rem] tracking-[0.14em] text-ink-faint uppercase">{copy.perDay}</p>
              <p className="mx-numeric mt-1 text-[1rem] font-bold text-amber">
                {snapshot ? usd.format(snapshot.emissionUsdPerDay) : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/6">
          {coins.map((coin) => {
            const share = allocation?.[coin.id] ?? coin.share;
            const selectedRow = coin.id === selectedCoin;
            return (
              <div
                key={coin.id}
                className={`grid items-center gap-3 px-5 py-3.5 sm:grid-cols-[1.6fr_1fr_1fr_7.5rem] sm:px-7 ${
                  selectedRow ? 'bg-white/[0.03]' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectCoin(coin.id)}
                  className="flex min-w-0 items-center gap-3 text-start"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-[0.62rem] font-extrabold shadow-[0_6px_16px_-6px_rgba(0,0,0,0.9)] ${coinTone(
                      coin.id,
                    )}`}
                  >
                    {coin.symbol.replace('$', '').slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[0.84rem] font-semibold text-ink">{coin.symbol}</span>
                      {coin.bonus > 1 ? (
                        <span className="rounded-full border border-amber/45 bg-amber/12 px-1.5 py-0.5 text-[0.52rem] font-bold tracking-[0.08em] text-amber uppercase">
                          {coin.bonus}× {copy.bonus}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.62rem] text-ink-faint">{coin.chain}</span>
                  </span>
                </button>

                <div>
                  <p className="text-[0.58rem] tracking-[0.12em] text-ink-faint uppercase">{copy.pending}</p>
                  <p className="mx-numeric mt-0.5 text-[0.82rem] font-semibold text-ink">
                    {formatCoin(coin.amount, coin.decimals)}{' '}
                    <span className="text-[0.6rem] font-normal text-ink-faint">{coin.symbol}</span>
                  </p>
                  <p className="mx-numeric text-[0.6rem] text-ink-faint">{usd.format(coin.usdValue)}</p>
                </div>

                <div>
                  <p className="text-[0.58rem] tracking-[0.12em] text-ink-faint uppercase">{copy.allocation}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-[#FFF3B0] to-[#D4AF37]"
                        style={{ width: `${Math.min(100, coin.sharePct)}%` }}
                      />
                    </div>
                    <span className="mx-numeric text-[0.68rem] text-amber">{coin.sharePct.toFixed(1)}%</span>
                  </div>
                </div>

                <label className="block">
                  <span className="sr-only">
                    {copy.allocation} — {coin.symbol}
                  </span>
                  <input
                    inputMode="decimal"
                    value={share}
                    onChange={(event) => {
                      const value = Number(event.target.value.replace(/[^0-9.]/g, ''));
                      setAllocation((previous) => ({
                        ...(previous ?? snapshot?.allocations ?? {}),
                        [coin.id]: Number.isFinite(value) ? value : 0,
                      }));
                    }}
                    className="mx-numeric w-full rounded-lg border border-white/12 bg-[#04060d] px-2.5 py-2 text-[0.78rem] text-ink outline-none focus:border-amber/55"
                  />
                </label>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 bg-[#050810]/60 px-5 py-4 sm:px-7">
          <p className="text-[0.66rem] leading-relaxed text-ink-faint">
            {copy.allocationHint}{' '}
            <span className="mx-numeric text-ink-mute">
              Σ {number.format(allocationTotal)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => act('allocate', { allocation: allocation ?? snapshot?.allocations ?? {} })}
            disabled={busy === 'allocate'}
            className="mx-btn !py-2 !text-[0.76rem]"
          >
            {busy === 'allocate' ? copy.savingAllocation : copy.saveAllocation}
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------ Workbench */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Streak */}
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <h2 className="text-[0.95rem] font-bold text-ink">{copy.streak}</h2>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">
            {snapshot?.claimedToday ? copy.tomorrow : eco.rewards.streakBody}
          </p>

          <div className="mt-6 flex items-end gap-2">
            <span className="mx-numeric text-4xl font-extrabold text-amber">
              {snapshot?.streakDays ?? 0}
            </span>
            <span className="mb-1 text-[0.7rem] text-ink-faint">/ 7</span>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full ${
                  (snapshot?.streakDays ?? 0) > index ? 'bg-amber' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => act('claim-streak', {})}
            disabled={busy === 'claim-streak' || snapshot?.claimedToday}
            className="mx-btn mt-6 w-full !py-2.5 !text-[0.8rem]"
          >
            {snapshot?.claimedToday ? copy.claimed : copy.claimStreak}
          </button>
          <p className="mx-numeric mt-3 text-center text-[0.66rem] text-ink-faint">
            {eco.rewards.tomorrow} {claimIn}
          </p>
        </article>

        {/* Stake */}
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <h2 className="text-[0.95rem] font-bold text-ink">{copy.stakeTitle}</h2>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.stakeBody}</p>

          <div className="mt-5 rounded-xl border border-white/8 bg-[#050810] p-4">
            <p className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">{eco.token.staked}</p>
            <p className="mx-numeric mt-1 text-lg font-bold text-ink">
              {snapshot ? tokens.format(snapshot.stakedTokens) : '—'}{' '}
              <span className="text-[0.66rem] text-ink-faint">$MINEAI</span>
            </p>
          </div>

          <label htmlFor="stake-amount" className="mt-4 block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
            {copy.stakeAmount}
          </label>
          <input
            id="stake-amount"
            inputMode="decimal"
            value={stakeAmount}
            onChange={(event) => setStakeAmount(event.target.value.replace(/[^0-9.]/g, ''))}
            className="mx-numeric mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.85rem] text-ink outline-none focus:border-cyan/55"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => act('stake', { amount: Number(stakeAmount) })}
              disabled={busy === 'stake'}
              className="mx-btn !py-2 !text-[0.76rem]"
            >
              {copy.stake}
            </button>
            <button
              type="button"
              onClick={() => act('unstake', { amount: Number(stakeAmount) })}
              disabled={busy === 'unstake'}
              className="mx-btn-quiet !py-2 !text-[0.76rem]"
            >
              {copy.unstake}
            </button>
          </div>
        </article>

        {/* Withdraw */}
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <h2 className="text-[0.95rem] font-bold text-ink">{copy.withdrawTitle}</h2>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.withdrawBody}</p>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-mint/25 bg-mint/[0.05] px-4 py-3">
            <span className="text-[0.66rem] text-ink-mute">
              {copy.pending} · {selected?.symbol ?? '$MINEAI'}
            </span>
            <span className="mx-numeric text-[0.95rem] font-bold text-mint">
              {selected ? formatCoin(selected.amount, selected.decimals) : '—'}
            </span>
          </div>

          <label htmlFor="withdraw-coin" className="mt-4 block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
            {copy.coin}
          </label>
          <select
            id="withdraw-coin"
            value={selectedCoin}
            onChange={(event) => selectCoin(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.8rem] text-ink outline-none focus:border-cyan/55"
          >
            {coins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.symbol} — {coin.chain}
              </option>
            ))}
          </select>

          <label htmlFor="withdraw-wallet" className="mt-3 block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
            {copy.wallet}
          </label>
          <input
            id="withdraw-wallet"
            value={wallet}
            onChange={(event) => setWallet(event.target.value.trim())}
            placeholder={WALLET_PLACEHOLDER[selected?.family ?? 'evm'] ?? '0x…'}
            className="mx-numeric mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.75rem] text-ink outline-none focus:border-cyan/55"
          />
          <p className="mt-1.5 text-[0.6rem] leading-relaxed text-ink-faint">{copy.addressHint}</p>

          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="withdraw-amount" className="block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                {copy.withdraw}
              </label>
              <input
                id="withdraw-amount"
                inputMode="decimal"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value.replace(/[^0-9.]/g, ''))}
                className="mx-numeric mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.85rem] text-ink outline-none focus:border-cyan/55"
              />
            </div>
            <span className="mx-numeric mb-2.5 text-[0.62rem] text-ink-faint">
              {copy.min} {selected ? formatCoin(selected.minWithdraw, selected.decimals) : '25'}
            </span>
          </div>

          {snapshot?.twoFactorEnabled ? (
            <div className="mt-3">
              <label htmlFor="withdraw-2fa" className="block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                {eco.rewards.securityCode}
              </label>
              <input
                id="withdraw-2fa"
                inputMode="numeric"
                value={twoFactorCode}
                onChange={(event) => setTwoFactorCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                className="mx-numeric mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.85rem] tracking-[0.2em] text-ink outline-none focus:border-cyan/55"
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={() =>
              act('withdraw', {
                coin: selectedCoin,
                amount: Number(withdrawAmount),
                wallet,
                ...(twoFactorCode ? { code: twoFactorCode } : {}),
              })
            }
            disabled={
              busy === 'withdraw' ||
              !wallet ||
              !selectedCoin ||
              Boolean(snapshot?.twoFactorEnabled && twoFactorCode.length !== 6)
            }
            className="mx-btn mt-3 w-full !py-2.5 !text-[0.78rem]"
          >
            {busy === 'withdraw' ? `${copy.withdrawing}…` : copy.withdraw}
          </button>

          <p className="mt-3 text-[0.64rem] leading-relaxed text-ink-faint">
            {eco.rewards.securityBody}
          </p>
        </article>
      </section>

      {/* --------------------------------------------------- Tape + board */}
      <div className="mt-6">
        <PayoutTicker limit={8} />
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[0.95rem] font-bold text-ink">{eco.rewards.leaderboard}</h2>
            <Link href={to('/rewards')} className="text-[0.72rem] font-semibold text-cyan hover:underline">
              {eco.nav.rewards}
            </Link>
          </div>

          <ol className="mt-4 divide-y divide-white/6">
            {(snapshot?.leaderboard ?? []).map((row) => (
              <li
                key={`${row.rank}-${row.operator}`}
                className={`flex items-center justify-between gap-3 py-2.5 ${row.you ? 'text-cyan' : 'text-ink-soft'}`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="mx-numeric w-5 text-[0.68rem] text-ink-faint">{row.rank}</span>
                  <span className="truncate text-[0.8rem] font-medium">{row.operator}</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[0.55rem] uppercase text-ink-faint">
                    {row.tier}
                  </span>
                </span>
                <span className="mx-numeric text-[0.76rem]">{number.format(row.minedTokens)}</span>
              </li>
            ))}
            {!snapshot ? <li className="py-3 text-[0.8rem] text-ink-faint">{t.common.loading}…</li> : null}
          </ol>
        </article>

        <div className="grid gap-5">
          <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
            <h2 className="text-[0.95rem] font-bold text-ink">{copy.zeroPower}</h2>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.zeroPowerBody}</p>

            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                  {copy.cron}
                </dt>
                <dd className="mx-numeric mt-1 text-[0.76rem] text-ink-soft">
                  {snapshot?.networkStats.lastAccrualAt
                    ? new Date(snapshot.networkStats.lastAccrualAt).toLocaleTimeString(
                        lang === 'zh' ? 'zh-CN' : 'en-US',
                        { hour: '2-digit', minute: '2-digit', second: '2-digit' },
                      )
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                  {eco.markets.live}
                </dt>
                <dd className="mx-numeric mt-1 text-[0.76rem] text-ink-soft">
                  {snapshot ? number.format(snapshot.networkStats.activeMiners) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                  {copy.hashrate}
                </dt>
                <dd className="mx-numeric mt-1 text-[0.76rem] text-ink-soft">
                  {snapshot ? `${number.format(snapshot.networkStats.totalHashrateMhs)} MH/s` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                  {eco.token.burned}
                </dt>
                <dd className="mx-numeric mt-1 text-[0.76rem] text-ink-soft">
                  {snapshot ? number.format(snapshot.networkStats.burnedTokens) : '—'}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
            <h2 className="text-[0.95rem] font-bold text-ink">{copy.edgeTitle}</h2>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.edgeBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="mx-chip">{snapshot?.networkStats.cron ?? 'daily · 03:00 UTC'}</span>
              <Link href={to('/rewards')} className="mx-chip !border-cyan/35 !text-cyan">
                {eco.nav.rewards}
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  accent = 'ink',
}: {
  label: string;
  value: string;
  accent?: 'ink' | 'cyan' | 'mint' | 'amber';
}) {
  const tone =
    accent === 'cyan' ? 'text-cyan' : accent === 'mint' ? 'text-mint' : accent === 'amber' ? 'text-amber' : 'text-ink';

  return (
    <div className="bg-[#070c17] px-5 py-5">
      <p className="text-[0.6rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">{label}</p>
      <p className={`mx-numeric mt-2 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
