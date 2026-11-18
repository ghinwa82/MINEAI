'use client';

import React, { useEffect, useState } from 'react';

import { useI18n } from '@/lib/i18n-provider';

/**
 * The settlement tape.
 *
 * Every card is a real record from `/api/payouts`: a withdrawal that left the
 * mining pool, the network it left on and its value in both tokens and dollars.
 * Wallet addresses arrive already masked, so the tape can be public without
 * publishing anyone's destination.
 */

export interface PayoutEntry {
  id: string;
  wallet: string;
  network: string;
  tokens: number;
  usd: number;
  at: string;
  status?: 'pending' | 'processing' | 'sent';
  txHash?: string;
}

const NETWORK_LABEL: Record<string, string> = {
  'usdt-bep20': 'BEP-20',
  'usdt-arbitrum': 'Arbitrum',
  'usdt-erc20': 'ERC-20',
  'usdt-trc20': 'TRC-20',
  sol: 'Solana',
  ton: 'TON',
  btc: 'Bitcoin',
};

export default function PayoutTicker({ limit = 8 }: { limit?: number }) {
  const { eco, t, lang } = useI18n();
  const [payouts, setPayouts] = useState<PayoutEntry[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/payouts', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as { payouts?: PayoutEntry[] };
        if (!cancelled) {
          setPayouts(payload.payouts ?? []);
          setLoaded(true);
        }
      } catch {
        if (!cancelled) setLoaded(true);
      }
    };

    load();
    const timer = window.setInterval(load, 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const entries = payouts.slice(0, limit);
  const number = new Intl.NumberFormat(lang === 'ar' ? 'en-US' : lang === 'zh' ? 'zh-CN' : 'en-US', {
    maximumFractionDigits: 2,
  });

  const tape = entries.length > 0 ? entries : [];

  return (
    <section className="overflow-hidden rounded-2xl border border-white/8 bg-[#060a14]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-3.5">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
          </span>
          <p className="text-[0.78rem] font-semibold text-ink">{eco.mining.payoutsTitle}</p>
        </div>
        <p className="text-[0.68rem] text-ink-faint">{eco.mining.payoutsBody}</p>
      </div>

      {tape.length === 0 ? (
        <p className="px-5 py-6 text-[0.8rem] text-ink-faint">
          {loaded ? eco.mining.payoutsBody : `${t.common.loading}…`}
        </p>
      ) : (
        <div className="mx-tape group relative overflow-hidden py-3.5">
          <div className="mx-tape-track flex w-max gap-3 motion-reduce:w-full motion-reduce:flex-wrap">
            {tape.map((entry) => (
              <TapeCard key={entry.id} entry={entry} number={number} />
            ))}
            <div className="flex gap-3 motion-reduce:hidden" aria-hidden>
              {tape.map((entry) => (
                <TapeCard key={`${entry.id}-repeat`} entry={entry} number={number} />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function TapeCard({
  entry,
  number,
}: {
  entry: PayoutEntry;
  number: Intl.NumberFormat;
}) {
  const { eco } = useI18n();
  const status = entry.status ?? 'sent';
  const label = eco.mining.pipeline[status];
  const tone = status === 'sent' ? 'text-mint' : status === 'processing' ? 'text-amber' : 'text-ink-faint';

  return (
    <article className="flex shrink-0 items-center gap-3 rounded-xl border border-white/8 bg-white/[0.025] px-3.5 py-2">
      <span className="mx-numeric rounded-md border border-cyan/25 bg-cyan/8 px-1.5 py-0.5 text-[0.58rem] font-bold tracking-[0.08em] text-cyan">
        {NETWORK_LABEL[entry.network] ?? entry.network}
      </span>
      <span className="mx-numeric text-[0.72rem] text-ink-mute">{entry.wallet}</span>
      <span className="mx-numeric text-[0.75rem] font-semibold text-ink">
        {number.format(entry.tokens)} <span className="text-ink-faint">$MINEAI</span>
      </span>
      <span className="mx-numeric text-[0.68rem] text-mint">${number.format(entry.usd)}</span>
      <span className={`inline-flex items-center gap-1 text-[0.58rem] font-semibold ${tone}`}>
        <span
          aria-hidden
          className={`h-1.5 w-1.5 rounded-full ${
            status === 'sent' ? 'bg-mint' : status === 'processing' ? 'animate-pulse bg-amber' : 'bg-ink-faint'
          }`}
        />
        {label}
      </span>
      {status === 'sent' && entry.txHash ? (
        <span className="mx-numeric text-[0.58rem] text-ink-faint" title={entry.txHash}>
          {entry.txHash.slice(0, 10)}…
        </span>
      ) : null}
    </article>
  );
}
