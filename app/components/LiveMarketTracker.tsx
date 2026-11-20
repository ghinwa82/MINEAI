'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n-provider';

/**
 * The market board.
 *
 * One polling loop feeds every panel. Quotes carry their own source, so a
 * fallback print is never dressed up as a live one: the board says `cached`
 * when the upstream went quiet. $MINEAI sits in its own panel and is labelled
 * as an internal utility index because it is not listed on a DEX yet.
 */

export type QuoteSource = 'yahoo' | 'cached' | 'fallback' | 'internal';

export interface Quote {
  symbol: string;
  name: string;
  category: 'indices' | 'forex' | 'commodities' | 'crypto' | 'internal';
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  spark: number[];
  source: QuoteSource;
}

const CATEGORY_ORDER = ['indices', 'forex', 'commodities', 'crypto', 'internal'] as const;

export default function LiveMarketTracker({ variant = 'board' }: { variant?: 'board' | 'strip' }) {
  const { eco, t, lang } = useI18n();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [upstream, setUpstream] = useState<'ok' | 'degraded' | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const load = useCallback(async (force = false) => {
    if (force) setRefreshing(true);
    try {
      const response = await fetch(`/api/markets${force ? '?refresh=1' : ''}`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as {
        quotes?: Quote[];
        updatedAt?: string;
        upstream?: 'ok' | 'degraded';
      };
      setQuotes(payload.quotes ?? []);
      setUpdatedAt(payload.updatedAt ?? null);
      setUpstream(payload.upstream ?? null);
    } catch {
      // Keep the last good board rather than blanking it.
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load();
    const timer = window.setInterval(() => load(), 30_000);
    return () => window.clearInterval(timer);
  }, [load]);

  const priceText = useCallback(
    (quote: Quote) =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        minimumFractionDigits: quote.price < 10 ? 4 : 2,
        maximumFractionDigits: quote.price < 10 ? 4 : 2,
      }).format(quote.price),
    [lang],
  );

  const grouped = useMemo(() => {
    return CATEGORY_ORDER.map((category) => ({
      category,
      rows: quotes.filter((quote) => quote.category === category),
    })).filter((group) => group.rows.length > 0);
  }, [quotes]);

  const time = updatedAt
    ? new Date(updatedAt).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
    : '—';

  const clock = now
    ? now.toLocaleString(
        lang === 'ar'
          ? 'ar-EG'
          : lang === 'zh'
            ? 'zh-CN'
            : lang === 'fr'
              ? 'fr-FR'
              : lang === 'es'
                ? 'es-ES'
                : lang === 'hi'
                  ? 'hi-IN'
                  : 'en-GB',
        { weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' },
      )
    : '—';

  if (variant === 'strip') {
    return (
      <section className="overflow-hidden rounded-2xl border border-white/8 bg-[#060a14]">
        <div className="flex items-center justify-between gap-4 border-b border-white/8 px-5 py-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-cyan" />
            </span>
            <p className="text-[0.78rem] font-semibold text-ink">{eco.markets.eyebrow}</p>
          </div>
          <p className="mx-numeric text-[0.66rem] text-ink-faint">
            {eco.markets.updated} {time}
          </p>
        </div>
        <div className="border-t border-white/8 px-5 py-2">
          <p className="mx-numeric flex items-center gap-2 text-[0.64rem] text-ink-faint">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
            </span>
            {clock}
          </p>
        </div>

        <div className="flex snap-x gap-px overflow-x-auto bg-white/8">
          {(quotes.length > 0 ? quotes : PLACEHOLDER).slice(0, 9).map((quote) => (
            <div
              key={quote.symbol}
              className="min-w-[10.5rem] shrink-0 snap-start bg-[#060a14] px-4 py-3.5"
            >
              <p className="flex items-center gap-1.5 text-[0.66rem] font-semibold tracking-[0.08em] text-ink-faint uppercase">
                {quote.symbol.replace('=X', '').replace('-USD', '').replace('^', '')}
                {quote.category === 'internal' ? (
                  <span className="rounded border border-amber/35 px-1 text-[0.5rem] text-amber">INT</span>
                ) : null}
              </p>
              <p className={`mx-numeric mt-1.5 text-[0.95rem] font-semibold ${quote.category === 'internal' ? 'text-amber' : 'text-ink'}`}>
                {priceText(quote)}
              </p>
              <Change percent={quote.changePercent} small />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mx-eyebrow">{eco.markets.eyebrow}</p>
          <h2 className="mx-section-title mt-4">{eco.markets.title}</h2>
          <p className="mx-lede mt-4 max-w-2xl">{eco.markets.lead}</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-xl border border-white/8 bg-[#050507]/70 px-3 py-2 text-end">
            <p className="mx-numeric text-[0.56rem] tracking-[0.14em] text-ink-faint uppercase">
              {eco.markets.updated}
            </p>
            <p className="mx-numeric mt-0.5 flex items-center justify-end gap-1.5 text-[0.74rem] text-ink-soft">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              {clock}
            </p>
            <p className="mx-numeric mt-0.5 text-[0.6rem] text-ink-faint">{time}</p>
          </div>
          <button
            type="button"
            onClick={() => load(true)}
            disabled={refreshing}
            className="mx-btn-quiet !px-3.5 !py-2 !text-[0.76rem]"
          >
            {refreshing ? `${t.common.loading}…` : eco.markets.refresh}
          </button>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span className={`mx-chip ${upstream === 'degraded' ? '!border-amber/45 !text-amber' : '!border-mint/40 !text-mint'}`}>
          {upstream === 'degraded' ? 'cached' : eco.markets.live}
        </span>
        <span className="mx-chip">{eco.markets.change}</span>
      </div>

      {loading && quotes.length === 0 ? (
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {[0, 1, 2, 3].map((index) => (
            <div key={index} className="h-48 animate-pulse rounded-2xl border border-white/8 bg-white/[0.02]" />
          ))}
        </div>
      ) : (
        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {grouped.map((group) => (
            <article
              key={group.category}
              className={`overflow-hidden rounded-2xl border ${
                group.category === 'internal' ? 'border-amber/30 bg-[#0d0a04]' : 'border-white/8 bg-[#060a14]'
              }`}
            >
              <header className="flex items-center justify-between gap-3 border-b border-white/8 px-5 py-3.5">
                <h3 className="text-[0.8rem] font-semibold text-ink">{eco.markets[group.category]}</h3>
                <span className="mx-numeric text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
                  {group.rows.length} {group.category === 'internal' ? '' : '· USD'}
                </span>
              </header>

              <ul className="divide-y divide-white/6">
                {group.rows.map((quote) => (
                  <li
                    key={quote.symbol}
                    className={`grid grid-cols-[1fr_auto_auto] items-center gap-4 px-5 py-3 ${
                      quote.category === 'internal' ? 'bg-amber/[0.04]' : ''
                    }`}
                  >
                    <div className="min-w-0">
                      <p className={`truncate text-[0.84rem] font-medium ${quote.category === 'internal' ? 'text-amber' : 'text-ink'}`}>
                        {quote.name}
                      </p>
                      <p className="mx-numeric mt-0.5 text-[0.6rem] tracking-[0.08em] text-ink-faint uppercase">
                        {quote.symbol.replace('=X', '')}
                        {quote.category === 'internal' ? ` · ${eco.markets.internal}` : ''}
                        {quote.source === 'cached' || quote.source === 'fallback' ? ' · cached' : ''}
                      </p>
                    </div>

                    <Spark points={quote.spark} positive={quote.changePercent >= 0} />

                    <div className="text-end">
                      <p className="mx-numeric text-[0.86rem] font-semibold text-ink">{priceText(quote)}</p>
                      <Change percent={quote.changePercent} small />
                    </div>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      )}

    </section>
  );
}

function Change({ percent, small = false }: { percent: number; small?: boolean }) {
  const positive = percent >= 0;
  return (
    <span
      className={`mx-numeric inline-flex items-center gap-1 font-semibold ${
        small ? 'mt-1 text-[0.66rem]' : 'text-[0.78rem]'
      } ${positive ? 'text-mint' : 'text-rose'}`}
    >
      <span aria-hidden>{positive ? '▲' : '▼'}</span>
      {positive ? '+' : ''}
      {percent.toFixed(2)}%
    </span>
  );
}

function Spark({ points, positive }: { points: number[]; positive: boolean }) {
  if (points.length < 2) return <span className="w-24" aria-hidden />;

  const width = 96;
  const height = 26;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const coords = points.map((value, index) => {
    const x = (index / (points.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return [Number(x.toFixed(1)), Number(y.toFixed(1))] as const;
  });
  const line = coords.map(([x, y], index) => `${index === 0 ? 'M' : 'L'}${x} ${y}`).join(' ');
  const stroke = positive ? '#34D399' : '#E8858F';
  const last = coords[coords.length - 1];

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="hidden sm:block">
      <path d={line} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinejoin="round" strokeLinecap="round" opacity="0.85" />
      <circle cx={last[0]} cy={last[1]} r="2" fill={stroke} />
    </svg>
  );
}

const PLACEHOLDER: Quote[] = [
  { symbol: '^GSPC', name: 'S&P 500', category: 'indices', price: 5840.2, change: 12.4, changePercent: 0.21, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: '^IXIC', name: 'Nasdaq', category: 'indices', price: 19120.4, change: -42.1, changePercent: -0.22, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: 'USDEGP=X', name: 'USD / EGP', category: 'forex', price: 48.65, change: 0.08, changePercent: 0.16, currency: 'EGP', spark: [], source: 'fallback' },
  { symbol: 'GC=F', name: 'Gold', category: 'commodities', price: 2648.4, change: 8.2, changePercent: 0.31, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: 'BTC-USD', name: 'Bitcoin', category: 'crypto', price: 96450, change: 1240, changePercent: 1.3, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: 'ETH-USD', name: 'Ethereum', category: 'crypto', price: 3284, change: -18.2, changePercent: -0.55, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: 'SOL-USD', name: 'Solana', category: 'crypto', price: 192.4, change: 3.1, changePercent: 1.64, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: 'BNB-USD', name: 'BNB', category: 'crypto', price: 648.2, change: 4.6, changePercent: 0.71, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: 'TON11419-USD', name: 'Toncoin', category: 'crypto', price: 5.42, change: 0.06, changePercent: 1.12, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', category: 'crypto', price: 0.168, change: 0.002, changePercent: 1.2, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: 'LTC-USD', name: 'Litecoin', category: 'crypto', price: 88.4, change: 0.9, changePercent: 1.02, currency: 'USD', spark: [], source: 'fallback' },
  { symbol: 'MINEAI', name: 'Mine AI', category: 'internal', price: 4.85, change: 0.05, changePercent: 1.04, currency: 'USD', spark: [], source: 'internal' },
];
