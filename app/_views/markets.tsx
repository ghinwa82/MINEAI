'use client';

import React, { useEffect, useMemo, useState } from 'react';

import MineAICoinLogo from '../components/MineAICoinLogo';
import LiveMarketTracker from '../components/LiveMarketTracker';
import { useI18n } from '@/lib/i18n-provider';

/**
 * The terminal.
 *
 * The market board does the polling; this view frames it with the $MINEAI
 * identity panel: supply, burn, staking pools and the deployed contract. Until
 * a contract address is present in the environment the panel says so instead of
 * linking to a dead explorer page.
 */

interface TokenInfo {
  totalSupply: number;
  circulatingSupply: number;
  burned: number;
  holders: number;
  priceUsd: number;
  marketCapUsd: number;
  stakingPools: Array<{ name: string; apr: number; lockDays: number }>;
  contracts: { bsc: string | null; eth: string | null; dex: string | null; deployed: boolean };
}

export default function MarketsView() {
  const { eco, t, lang } = useI18n();
  const [token, setToken] = useState<TokenInfo | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/token', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as { token?: TokenInfo };
        if (!cancelled) setToken(payload.token ?? null);
      } catch {
        // The identity panel degrades to placeholders.
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const number = useMemo(
    () => new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', { maximumFractionDigits: 0 }),
    [lang],
  );
  const money = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }),
    [lang],
  );

  const contract = token?.contracts.bsc ?? token?.contracts.eth ?? '';

  const copyContract = async () => {
    if (!contract) return;
    try {
      await navigator.clipboard.writeText(contract);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard denied — the address is still selectable on screen.
    }
  };

  return (
    <>
      <section className="pb-12 pt-14">
        <p className="mx-eyebrow">{eco.token.eyebrow}</p>
        <h1 className="mx-display mt-6 max-w-3xl">{eco.token.title}</h1>
        <p className="mx-lede mt-6 max-w-2xl">{eco.token.lead}</p>
      </section>

      <section className="grid gap-6 rounded-[1.5rem] border border-white/10 bg-[#080d18] p-6 sm:p-8 lg:grid-cols-[0.55fr_1.45fr] lg:items-center">
        <div className="flex items-center justify-center gap-6">
          <MineAICoinLogo size={200} />
        </div>

        <div>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <p className="text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">{eco.token.price}</p>
              <p className="mx-numeric mt-1 text-4xl font-extrabold text-amber">
                ${money.format(token?.priceUsd ?? 4.85)}
              </p>
            </div>
            <span className="mx-chip !border-amber/40 !text-amber">$MINEAI</span>
            <span className="mx-chip">{eco.markets.internal}</span>
          </div>

          <dl className="mt-7 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4">
            <Fact label={eco.token.supply} value={token ? number.format(token.totalSupply) : '—'} />
            <Fact label={eco.token.burned} value={token ? number.format(token.burned) : '—'} tone="rose" />
            <Fact label={eco.token.holders} value={token ? number.format(token.holders) : '—'} />
            <Fact
              label="Market cap"
              value={token ? `$${number.format(token.marketCapUsd)}` : '—'}
              tone="mint"
            />
          </dl>

          <div className="mt-7 rounded-xl border border-white/8 bg-[#050810] p-4">
            <p className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{eco.token.contract}</p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <code className="mx-numeric min-w-0 flex-1 break-all text-[0.74rem] text-ink-soft">
                {contract || (t.common.loading + '…')}
              </code>
              <button
                type="button"
                onClick={copyContract}
                disabled={!contract}
                className="mx-btn-quiet !px-3 !py-1.5 !text-[0.7rem]"
              >
                {copied ? eco.checkout.copied : eco.token.copyContract}
              </button>
            </div>
            <p className="mt-3 text-[0.66rem] leading-relaxed text-ink-faint">{eco.token.auditNote}</p>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
        {(token?.stakingPools ?? [
          { name: 'Observer', apr: 8.4, lockDays: 0 },
          { name: 'Navigator', apr: 12.6, lockDays: 30 },
          { name: 'Whale', apr: 18.2, lockDays: 90 },
          { name: 'Leviathan', apr: 24.5, lockDays: 180 },
        ]).map((pool) => (
          <div key={pool.name} className="bg-[#070c17] p-5">
            <p className="text-[0.8rem] font-semibold text-ink">{pool.name}</p>
            <p className="mx-numeric mt-2 text-2xl font-extrabold text-cyan">{pool.apr.toFixed(1)}%</p>
            <p className="mt-1 text-[0.62rem] text-ink-faint">
              {eco.token.staked} · {pool.lockDays === 0 ? eco.rewards.claim : `${pool.lockDays}d`}
            </p>
          </div>
        ))}
      </section>

      <div className="mt-14">
        <LiveMarketTracker />
      </div>
    </>
  );
}

function Fact({
  label,
  value,
  tone = 'ink',
}: {
  label: string;
  value: string;
  tone?: 'ink' | 'mint' | 'rose';
}) {
  const colour = tone === 'mint' ? 'text-mint' : tone === 'rose' ? 'text-rose' : 'text-ink';
  return (
    <div>
      <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">{label}</dt>
      <dd className={`mx-numeric mt-1 text-[0.95rem] font-bold ${colour}`}>{value}</dd>
    </div>
  );
}
