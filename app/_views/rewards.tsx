'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import PayoutTicker from '../components/PayoutTicker';
import ProofOfReservesBar from '../components/ProofOfReservesBar';
import ShareRow from '../components/ShareRow';
import VipMembershipCard from '../components/VipMembershipCard';
import { REFERRAL_STORAGE_KEY } from '../components/ReferralCapture';
import { useI18n } from '@/lib/i18n-provider';
import { useUid } from '@/lib/use-uid';

/**
 * The retention console.
 *
 * Daily streaks, whale tiers, the referral programme and the account vault all
 * read from the same operator id as the mining console, so a claim made here is
 * the same claim the miner sees there. Two-factor enrolment is real TOTP: the
 * secret is generated server-side, sealed with AES-256-GCM and confirmed against
 * a live code before it is switched on.
 */

interface RewardsSnapshot {
  uid: string;
  referralCode: string;
  streakDays: number;
  streakMultiplier: number;
  claimedToday: boolean;
  nextClaimAt: string;
  vipTier: string;
  vipMultiplier: number;
  effectiveMultiplier: number;
  stakedTokens: number;
  referralEarnings: number;
  referralCount: number;
  referredBy: string | null;
  twoFactorEnabled: boolean;
  leaderboard: Array<{ rank: number; operator: string; minedTokens: number; tier: string; you: boolean }>;
  networkStats: { activeMiners: number; tokensMined: number; stakedTokens: number; burnedTokens: number };
}

interface TokenPayload {
  token: {
    totalSupply: number;
    circulatingSupply: number;
    burned: number;
    holders: number;
    priceUsd: number;
    marketCapUsd: number;
    contracts: { bsc: string | null; eth: string | null; deployed: boolean };
    tiers: Array<{ tier: string; minStake: number; multiplier: number }>;
  };
}

type Tone = 'ok' | 'error' | 'info';

const PROMOTER_COPY: Record<
  string,
  { title: string; lead: string; current: string; tiers: [string, string, string, string] }
> = {
  en: {
    title: 'Affiliate promoter tiers',
    lead: 'Invite more people and your share of their rewards grows automatically.',
    current: 'Your tier',
    tiers: ['Bronze', 'Silver', 'Gold', 'Diamond'],
  },
  ar: {
    title: 'مستويات المسوّقين',
    lead: 'ادعُ المزيد من الأشخاص ويزيد نصيبك من مكافآتهم تلقائيًا.',
    current: 'مستواك',
    tiers: ['برونزي', 'فضي', 'ذهبي', 'ماسي'],
  },
  fr: {
    title: 'Niveaux de parrainage',
    lead: 'Invitez plus de personnes et votre part de leurs récompenses augmente automatiquement.',
    current: 'Votre niveau',
    tiers: ['Bronze', 'Argent', 'Or', 'Diamant'],
  },
  es: {
    title: 'Niveles de afiliado',
    lead: 'Invita a más personas y tu parte de sus recompensas crece automáticamente.',
    current: 'Tu nivel',
    tiers: ['Bronce', 'Plata', 'Oro', 'Diamante'],
  },
  zh: {
    title: '推广人等级',
    lead: '邀请更多人，你从他们奖励中获得的份额会自动提高。',
    current: '你的等级',
    tiers: ['青铜', '白银', '黄金', '钻石'],
  },
  hi: {
    title: 'एफ़िलिएट प्रमोटर स्तर',
    lead: 'अधिक लोगों को आमंत्रित करें और उनके इनाम में आपका हिस्सा अपने आप बढ़ता है।',
    current: 'आपका स्तर',
    tiers: ['ब्रॉन्ज़', 'सिल्वर', 'गोल्ड', 'डायमंड'],
  },
};

const PROMOTER_TIERS = [
  { min: 1, share: '5%' },
  { min: 5, share: '8%' },
  { min: 15, share: '12%' },
  { min: 40, share: '15%' },
];

export default function RewardsView() {
  const { eco, t, lang, href: to } = useI18n();
  const uid = useUid();

  const [snapshot, setSnapshot] = useState<RewardsSnapshot | null>(null);
  const [token, setToken] = useState<TokenPayload['token'] | null>(null);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: Tone; text: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const [twoFactor, setTwoFactor] = useState<{ enabled: boolean; remaining: number } | null>(null);
  const [enrolment, setEnrolment] = useState<{ secret: string; otpauth: string; codes: string[] } | null>(null);
  const [codeInput, setCodeInput] = useState('');

  const copy = eco.rewards;
  const promoter = PROMOTER_COPY[lang] ?? PROMOTER_COPY.en;
  const promoterIndex = PROMOTER_TIERS.reduce(
    (reached, tier, index) => ((snapshot?.referralCount ?? 0) >= tier.min ? index : reached),
    -1,
  );

  const notify = useCallback((tone: Tone, text: string) => {
    setToast({ tone, text });
    window.setTimeout(() => setToast(null), 5200);
  }, []);

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const response = await fetch(`/api/rewards?uid=${encodeURIComponent(uid)}`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as RewardsSnapshot & { ok?: boolean };
      if (payload.ok) setSnapshot(payload);
    } catch {
      // Keep the last snapshot.
    }
  }, [uid]);

  useEffect(() => {
    if (!uid) return;
    load();
    const timer = window.setInterval(load, 20_000);
    return () => window.clearInterval(timer);
  }, [uid, load]);

  useEffect(() => {
    let cancelled = false;
    const loadToken = async () => {
      try {
        const response = await fetch('/api/token', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as TokenPayload;
        if (!cancelled) setToken(payload.token);
      } catch {
        // Tier table falls back to the static ladder below.
      }
    };
    loadToken();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const loadVault = async () => {
      try {
        const response = await fetch(`/api/security/2fa?uid=${encodeURIComponent(uid)}`, { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as {
          enabled?: boolean;
          recoveryCodesRemaining?: number;
        };
        if (!cancelled) {
          setTwoFactor({ enabled: Boolean(payload.enabled), remaining: payload.recoveryCodesRemaining ?? 0 });
        }
      } catch {
        // Vault state simply stays unknown.
      }
    };
    loadVault();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const act = useCallback(
    async (action: 'claim-streak' | 'apply-referral', body: Record<string, unknown>) => {
      if (!uid) return;
      setBusy(action);
      try {
        const response = await fetch('/api/rewards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, uid, ...body }),
        });
        const payload = (await response.json()) as RewardsSnapshot & { ok?: boolean; error?: string; bonus?: number };

        if (!payload.ok) {
          notify('error', payload.error ?? t.common.error);
          return;
        }

        setSnapshot((previous) => (previous ? { ...previous, ...payload } : (payload as RewardsSnapshot)));
        notify('ok', action === 'claim-streak' ? `+${payload.bonus ?? 0} $MINEAI` : copy.copied);
        if (action === 'apply-referral') setCode('');
      } catch {
        notify('error', t.common.error);
      } finally {
        setBusy(null);
      }
    },
    [uid, notify, copy.copied, t.common.error],
  );

  /**
   * Referral links arrive on any page and are stashed by `ReferralCapture`.
   * The first time this console sees an unattached operator, the stored code
   * is offered back to the server once — guarded by a ref so a failed attempt
   * (an expired code, a self-referral) never loops.
   */
  const autoReferral = useRef(false);
  useEffect(() => {
    if (!snapshot || snapshot.referredBy || autoReferral.current) return;
    autoReferral.current = true;

    let stored = '';
    try {
      stored = window.localStorage.getItem(REFERRAL_STORAGE_KEY) ?? '';
    } catch {
      return;
    }

    if (!stored || stored === snapshot.referralCode) return;
    setCode(stored);
    act('apply-referral', { code: stored });
  }, [snapshot, act]);

  const enroll = async () => {
    if (!uid) return;
    setBusy('enroll');
    try {
      const response = await fetch('/api/security/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enroll', uid }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        secret?: string;
        otpauth?: string;
        recoveryCodes?: string[];
        error?: string;
      };
      if (!response.ok || !payload.ok || !payload.secret) {
        notify('error', payload.error ?? t.common.error);
        return;
      }
      setEnrolment({
        secret: payload.secret,
        otpauth: payload.otpauth ?? '',
        codes: payload.recoveryCodes ?? [],
      });
    } catch {
      notify('error', t.common.error);
    } finally {
      setBusy(null);
    }
  };

  const verify = async () => {
    if (!uid) return;
    setBusy('verify');
    try {
      const response = await fetch('/api/security/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', uid, code: codeInput }),
      });
      const payload = (await response.json()) as { ok?: boolean; error?: string; recoveryCodesRemaining?: number };
      if (!response.ok || !payload.ok) {
        notify('error', payload.error ?? t.common.error);
        return;
      }
      setTwoFactor({ enabled: true, remaining: payload.recoveryCodesRemaining ?? 0 });
      setEnrolment(null);
      setCodeInput('');
      notify('ok', copy.securityVerified);
    } catch {
      notify('error', t.common.error);
    } finally {
      setBusy(null);
    }
  };

  const copyCode = async () => {
    if (!snapshot) return;
    try {
      await navigator.clipboard.writeText(snapshot.referralCode);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      notify('error', t.common.error);
    }
  };

  const number = useMemo(
    () => new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 0 }),
    [lang],
  );
  const money = useMemo(
    () => new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 2 }),
    [lang],
  );

  const tiers = token?.tiers ?? [
    { tier: 'observer', minStake: 0, multiplier: 1 },
    { tier: 'navigator', minStake: 1_000, multiplier: 1.15 },
    { tier: 'whale', minStake: 10_000, multiplier: 1.35 },
    { tier: 'leviathan', minStake: 100_000, multiplier: 1.6 },
  ];

  return (
    <>
      {/* ---------------------------------------------------------- Header */}
      <section className="pb-14 pt-14">
        <p className="mx-eyebrow">{copy.eyebrow}</p>
        <h1 className="mx-display mt-6 max-w-3xl">{copy.title}</h1>
        <p className="mx-lede mt-6 max-w-2xl">{copy.lead}</p>

        <div className="mt-8 flex flex-wrap gap-2">
          <span className="mx-chip !border-amber/40 !text-amber">
            {copy.multiplier} {snapshot ? `${snapshot.effectiveMultiplier.toFixed(2)}x` : '—'}
          </span>
          <span className="mx-chip">{copy.vipTitle}: {snapshot?.vipTier ?? '—'}</span>
          <span className="mx-chip !border-mint/35 !text-mint">
            {copy.invited}: {snapshot?.referralCount ?? 0}
          </span>
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

      {/* ------------------------------------------------- Streak + vault */}
      <section className="grid gap-5 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">{copy.streakTitle}</h2>
              <p className="mt-2 max-w-md text-[0.8rem] leading-relaxed text-ink-mute">{copy.streakBody}</p>
            </div>
            <span className="mx-numeric shrink-0 rounded-xl border border-amber/35 bg-amber/8 px-3 py-2 text-lg font-bold text-amber">
              {snapshot?.streakMultiplier.toFixed(1) ?? '1.0'}x
            </span>
          </div>

          <ol className="mt-7 grid grid-cols-7 gap-1.5">
            {Array.from({ length: 7 }).map((_, index) => {
              const reached = (snapshot?.streakDays ?? 0) > index;
              return (
                <li key={index} className="text-center">
                  <span
                    className={`block h-1.5 rounded-full ${reached ? 'bg-amber' : 'bg-white/10'}`}
                    aria-hidden
                  />
                  <span className={`mx-numeric mt-2 block text-[0.58rem] ${reached ? 'text-amber' : 'text-ink-faint'}`}>
                    {(1 + index * 0.1).toFixed(1)}x
                  </span>
                </li>
              );
            })}
          </ol>

          <div className="mt-7 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => act('claim-streak', {})}
              disabled={busy === 'claim-streak' || snapshot?.claimedToday}
              className="mx-btn !py-2.5 !text-[0.8rem]"
            >
              {snapshot?.claimedToday ? copy.claimed : copy.claim}
            </button>
            <p className="text-[0.7rem] text-ink-faint">
              {copy.tomorrow}
              {snapshot ? ` · ${new Date(snapshot.nextClaimAt).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', { hour: '2-digit', minute: '2-digit' })}` : ''}
            </p>
          </div>
        </article>

        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-ink">{copy.securityTitle}</h2>
              <p className="mt-2 max-w-md text-[0.8rem] leading-relaxed text-ink-mute">{copy.securityBody}</p>
            </div>
            <span
              className={`mx-chip shrink-0 ${
                twoFactor?.enabled ? '!border-mint/45 !text-mint' : '!border-amber/40 !text-amber'
              }`}
            >
              {twoFactor?.enabled ? copy.securityVerified : copy.securityEnroll}
            </span>
          </div>

          {!twoFactor?.enabled && !enrolment ? (
            <button
              type="button"
              onClick={enroll}
              disabled={busy === 'enroll'}
              className="mx-btn mt-6 !py-2.5 !text-[0.8rem]"
            >
              {busy === 'enroll' ? `${t.common.loading}…` : copy.securityEnroll}
            </button>
          ) : null}

          {enrolment ? (
            <div className="mt-5">
              <p className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{copy.securitySecret}</p>
              <p className="mx-numeric mt-1.5 break-all rounded-lg border border-white/10 bg-[#050507] px-3 py-2.5 text-[0.78rem] tracking-[0.08em] text-cyan">
                {enrolment.secret}
              </p>

              <p className="mt-4 text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">Recovery</p>
              <div className="mt-1.5 grid grid-cols-2 gap-1.5">
                {enrolment.codes.map((recovery) => (
                  <span
                    key={recovery}
                    className="mx-numeric rounded border border-white/8 bg-white/[0.02] px-2 py-1 text-[0.68rem] text-ink-soft"
                  >
                    {recovery}
                  </span>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input
                  value={codeInput}
                  onChange={(event) => setCodeInput(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  placeholder={copy.securityCode}
                  inputMode="numeric"
                  className="mx-numeric flex-1 rounded-lg border border-white/12 bg-[#050507] px-3 py-2.5 text-[0.85rem] tracking-[0.2em] text-ink outline-none focus:border-cyan/55"
                />
                <button
                  type="button"
                  onClick={verify}
                  disabled={busy === 'verify' || codeInput.length !== 6}
                  className="mx-btn !px-4 !py-2.5 !text-[0.78rem]"
                >
                  {copy.securityVerify}
                </button>
              </div>
            </div>
          ) : null}

          {twoFactor?.enabled ? (
            <p className="mx-numeric mt-6 text-[0.72rem] text-ink-faint">
              Recovery codes remaining: {twoFactor.remaining}
            </p>
          ) : null}
        </article>
      </section>

      {/* ------------------------------------------------------ VIP tiers */}
      <section className="mt-6 rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">{copy.vipTitle}</h2>
            <p className="mt-2 max-w-xl text-[0.8rem] leading-relaxed text-ink-mute">{copy.vipBody}</p>
          </div>
          <span className="mx-numeric text-[0.72rem] text-ink-faint">
            {eco.token.staked}: {snapshot ? number.format(snapshot.stakedTokens) : '—'} $MINEAI
          </span>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <VipMembershipCard
            tier={snapshot?.vipTier ?? 'observer'}
            code={snapshot?.referralCode ?? null}
            multiplier={snapshot?.effectiveMultiplier ?? 1}
            staked={snapshot?.stakedTokens ?? 0}
          />

          <div className="grid gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8 sm:grid-cols-2">
            {tiers.map((tier) => {
              const active = snapshot?.vipTier === tier.tier;
              return (
                <div
                  key={tier.tier}
                  className={`bg-[#070c17] p-5 ${active ? 'ring-1 ring-inset ring-amber/45' : ''}`}
                >
                  <p className={`text-[0.8rem] font-bold capitalize ${active ? 'text-amber' : 'text-ink'}`}>
                    {tier.tier}
                  </p>
                  <p className="mx-numeric mt-2 text-2xl font-extrabold text-cyan">{tier.multiplier.toFixed(2)}x</p>
                  <p className="mx-numeric mt-1 text-[0.62rem] text-ink-faint">
                    {number.format(tier.minStake)} $MINEAI
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <ProofOfReservesBar className="mt-6" />

      {/* --------------------------------------------- Referral + board */}
      <section className="mt-6 grid gap-5 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7">
          <h2 className="text-lg font-bold text-ink">{copy.referralTitle}</h2>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-mute">{copy.referralBody}</p>

          <p className="mt-6 text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{copy.yourCode}</p>
          <div className="mt-2 flex gap-2">
            <p className="mx-numeric flex-1 rounded-xl border border-cyan/35 bg-cyan/[0.06] px-4 py-3 text-[1.05rem] font-bold tracking-[0.18em] text-cyan">
              {snapshot?.referralCode ?? '—'}
            </p>
            <button type="button" onClick={copyCode} className="mx-btn-quiet !px-4 !py-3 !text-[0.76rem]">
              {copied ? copy.copied : copy.copy}
            </button>
          </div>

          <div className="mt-4">
            <ShareRow
              code={snapshot?.referralCode ?? null}
              path={to('/rewards')}
              text={copy.referralBody}
              label={copy.referralTitle}
              shareTitle={copy.referralTitle}
            />
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-4">
            <div>
              <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">{copy.invited}</dt>
              <dd className="mx-numeric mt-1 text-xl font-bold text-ink">{snapshot?.referralCount ?? 0}</dd>
            </div>
            <div>
              <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">{copy.earned}</dt>
              <dd className="mx-numeric mt-1 text-xl font-bold text-mint">
                {snapshot ? money.format(snapshot.referralEarnings) : '—'}
              </dd>
            </div>
          </dl>

          <div className="mt-6 rounded-xl border border-white/8 bg-[#050810] p-4">
            <p className="text-[0.66rem] tracking-[0.12em] text-amber uppercase">{promoter.title}</p>
            <p className="mt-1 text-[0.72rem] leading-relaxed text-ink-mute">{promoter.lead}</p>
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {PROMOTER_TIERS.map((tier, index) => {
                const reached = index <= promoterIndex;
                return (
                  <div
                    key={tier.share}
                    className={`rounded-lg border px-2 py-2 text-center ${
                      reached ? 'border-amber/40 bg-amber/[0.07]' : 'border-white/8'
                    }`}
                  >
                    <p className={`text-[0.62rem] font-semibold ${reached ? 'text-amber' : 'text-ink-faint'}`}>
                      {promoter.tiers[index]}
                    </p>
                    <p className="mx-numeric mt-0.5 text-[0.7rem] text-ink-soft">{tier.share}</p>
                    <p className="mx-numeric mt-0.5 text-[0.55rem] text-ink-faint">{tier.min}+</p>
                  </div>
                );
              })}
            </div>
            <p className="mt-2 text-[0.62rem] text-ink-faint">
              {promoter.current}: {promoterIndex >= 0 ? promoter.tiers[promoterIndex] : '—'}
            </p>
          </div>

          {!snapshot?.referredBy ? (
            <div className="mt-6 border-t border-white/8 pt-5">
              <label htmlFor="referral-code" className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">
                {copy.yourCode}
              </label>
              <div className="mt-2 flex gap-2">
                <input
                  id="referral-code"
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase().slice(0, 12))}
                  className="mx-numeric flex-1 rounded-lg border border-white/12 bg-[#050507] px-3 py-2.5 text-[0.8rem] tracking-[0.1em] text-ink outline-none focus:border-cyan/55"
                />
                <button
                  type="button"
                  onClick={() => act('apply-referral', { code })}
                  disabled={busy === 'apply-referral' || code.length < 4}
                  className="mx-btn !px-4 !py-2.5 !text-[0.76rem]"
                >
                  {copy.copy}
                </button>
              </div>
            </div>
          ) : null}
        </article>

        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7">
          <h2 className="text-lg font-bold text-ink">{copy.leaderboard}</h2>
          <ol className="mt-4 divide-y divide-white/6">
            {(snapshot?.leaderboard ?? []).map((row) => (
              <li
                key={`${row.rank}-${row.operator}`}
                className={`flex items-center justify-between gap-3 py-2.5 ${row.you ? 'text-cyan' : 'text-ink-soft'}`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="mx-numeric w-5 text-[0.68rem] text-ink-faint">{row.rank}</span>
                  <span className="truncate text-[0.82rem] font-medium">{row.operator}</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[0.55rem] uppercase text-ink-faint">
                    {row.tier}
                  </span>
                </span>
                <span className="mx-numeric text-[0.78rem]">{number.format(row.minedTokens)}</span>
              </li>
            ))}
            {!snapshot ? <li className="py-3 text-[0.8rem] text-ink-faint">{t.common.loading}…</li> : null}
          </ol>

          <div className="mt-5 flex flex-wrap gap-2 border-t border-white/8 pt-5">
            <Link href={to('/mining')} className="mx-chip !border-cyan/35 !text-cyan">
              {eco.nav.mining}
            </Link>
            <Link href={to('/markets')} className="mx-chip">
              {eco.nav.markets}
            </Link>
            <span className="mx-chip">
              {eco.token.holders}: {token ? number.format(token.holders) : '—'}
            </span>
          </div>
        </article>
      </section>

      <div className="mt-6">
        <PayoutTicker limit={8} />
      </div>
    </>
  );
}
