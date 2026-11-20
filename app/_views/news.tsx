'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import ShareRow from '../components/ShareRow';
import { useI18n } from '@/lib/i18n-provider';
import { useUid } from '@/lib/use-uid';
import { getNewsCopy } from '@/lib/news-i18n';
import { NEWS_CATEGORIES, type NewsFilter, type NewsItem, type NewsPayload } from '@/lib/news';

/**
 * The news desk.
 *
 * One API call feeds the ticker, the badges and every card on this page. The
 * page never re-sorts a headline into a desk it did not come from: the
 * category is assigned at ingestion, so filtering is a pure client concern and
 * switching tabs costs no request.
 */

const CATEGORY_TONE: Record<string, string> = {
  breaking: 'border-rose/35 text-rose',
  gold: 'border-amber/40 text-amber',
  stocks: 'border-cyan/35 text-cyan',
  economy: 'border-mint/35 text-mint',
  crypto: 'border-gold/35 text-gold',
};

function localeTag(lang: string): string {
  if (lang === 'zh') return 'zh-CN';
  if (lang === 'ar') return 'ar';
  return lang;
}

function relativeTime(iso: string, lang: string, now: number): string {
  const then = Date.parse(iso);
  if (Number.isNaN(then)) return '';
  const minutes = Math.round((then - now) / 60_000);
  const formatter = new Intl.RelativeTimeFormat(localeTag(lang), { numeric: 'auto', style: 'short' });
  if (Math.abs(minutes) < 60) return formatter.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return formatter.format(hours, 'hour');
  return formatter.format(Math.round(hours / 24), 'day');
}

function price(value: number): string {
  const digits = value < 1 ? 4 : value < 100 ? 2 : 2;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: digits,
  }).format(value);
}

export default function NewsView({ initial = null }: { initial?: NewsPayload | null }) {
  const { lang, href } = useI18n();
  const copy = getNewsCopy(lang);
  const uid = useUid();

  const [payload, setPayload] = useState<NewsPayload | null>(initial);
  const [filter, setFilter] = useState<NewsFilter>('all');
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(initial ? 'ready' : 'loading');
  const [now, setNow] = useState(() => Date.now());
  const [code, setCode] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const response = await fetch(`/api/news?lang=${encodeURIComponent(lang)}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`news ${response.status}`);
      const data = (await response.json()) as NewsPayload & { ok?: boolean };
      if (!data.ok) throw new Error('news rejected');
      setPayload(data);
      setStatus('ready');
    } catch {
      setStatus((previous) => (previous === 'ready' ? 'ready' : 'error'));
    }
  }, [lang]);

  useEffect(() => {
    if (!payload) setStatus('loading');
    void load();
    const refresh = window.setInterval(load, 5 * 60_000);
    const clock = window.setInterval(() => setNow(Date.now()), 30_000);
    return () => {
      window.clearInterval(refresh);
      window.clearInterval(clock);
    };
  }, [load]);

  useEffect(() => {
    if (!uid) return;
    let cancelled = false;
    const loadCode = async () => {
      try {
        const response = await fetch(`/api/rewards?uid=${encodeURIComponent(uid)}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = (await response.json()) as { referralCode?: string };
        if (!cancelled && data.referralCode) setCode(data.referralCode);
      } catch {
        // Sharing still works without a referral code.
      }
    };
    void loadCode();
    return () => {
      cancelled = true;
    };
  }, [uid]);

  const items = useMemo(() => payload?.items ?? [], [payload]);
  const visible = useMemo(
    () => (filter === 'all' ? items : items.filter((item) => item.category === filter)),
    [items, filter],
  );

  const featured: NewsItem | undefined = visible[0];
  const rest = visible.slice(1);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items.length };
    for (const category of NEWS_CATEGORIES) {
      map[category] = items.filter((item) => item.category === category).length;
    }
    return map;
  }, [items]);

  const tabs: NewsFilter[] = ['all', ...NEWS_CATEGORIES];

  return (
    <div className="pb-6 pt-12">
      {/* ---------------------------------------------------------- Masthead */}
      <header className="border-b border-white/8 pb-9">
        <div className="flex flex-wrap items-center gap-3">
          <p className="mx-eyebrow">{copy.eyebrow}</p>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose/35 bg-rose/8 px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.16em] text-rose uppercase">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose" />
            </span>
            {copy.live}
          </span>
          {payload?.upstream === 'degraded' ? (
            <span className="mx-chip !border-amber/35 !text-amber">{copy.degraded}</span>
          ) : null}
        </div>

        <h1 className="mt-6 max-w-4xl text-[clamp(1.9rem,4.2vw,3.15rem)] leading-[1.07] font-extrabold tracking-[-0.032em] text-ink">
          {copy.title}
        </h1>
        <p className="mx-lede mt-5 max-w-3xl">{copy.lead}</p>

        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.7rem] text-ink-faint">
          <span>
            {copy.updated}{' '}
            <span className="mx-numeric text-ink-soft">
              {payload ? relativeTime(payload.updatedAt, lang, now) : '—'}
            </span>
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span aria-hidden className="h-1 w-1 rounded-full bg-amber" />
            {copy.refreshNote}
          </span>
        </div>
      </header>

      {/* ------------------------------------------------------------ Badges */}
      {payload && payload.badges.length > 0 ? (
        <section aria-label={copy.marketsTitle} className="mt-8">
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/8 bg-white/8 sm:grid-cols-3 xl:grid-cols-6">
            {payload.badges.map((badge) => {
              const up = badge.changePercent >= 0;
              return (
                <div key={badge.symbol} className="bg-[#070c17] px-4 py-3">
                  <p className="text-[0.6rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                    {badge.label}
                  </p>
                  <p className="mx-numeric mt-1.5 text-[1rem] font-bold text-ink">
                    {badge.symbol === 'MINEAI' ? '$' : ''}
                    {price(badge.price)}
                    {badge.symbol === 'USDEGP=X' ? (
                      <span className="ms-1 text-[0.62rem] font-medium text-ink-faint">EGP</span>
                    ) : null}
                  </p>
                  <p className={`mx-numeric mt-0.5 text-[0.66rem] ${up ? 'text-mint' : 'text-rose'}`}>
                    {up ? '+' : ''}
                    {badge.changePercent.toFixed(2)}%
                  </p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {/* ------------------------------------------------------------- Tabs */}
      <nav aria-label={copy.filterLabel} className="mt-8 overflow-x-auto pb-1">
        <ul className="flex min-w-max items-center gap-1.5">
          {tabs.map((tab) => {
            const active = filter === tab;
            return (
              <li key={tab}>
                <button
                  type="button"
                  onClick={() => setFilter(tab)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[0.78rem] font-medium transition ${
                    active
                      ? 'border-amber/50 bg-amber/12 text-amber'
                      : 'border-white/10 text-ink-mute hover:border-white/25 hover:text-ink'
                  }`}
                >
                  {copy.categories[tab]}
                  <span className="mx-numeric text-[0.6rem] text-ink-faint">{counts[tab] ?? 0}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ------------------------------------------------------------ Cards */}
      <section className="mt-8">
        {status === 'error' && items.length === 0 ? (
          <div className="rounded-2xl border border-rose/30 bg-rose/6 p-8 text-center">
            <p className="text-[0.9rem] text-rose">{copy.error}</p>
            <button type="button" onClick={() => void load()} className="mx-btn mt-5 !py-2.5 !text-[0.8rem]">
              {copy.retry}
            </button>
          </div>
        ) : null}

        {status === 'loading' && items.length === 0 ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-40 animate-pulse rounded-2xl border border-white/6 bg-white/[0.025]"
              />
            ))}
          </div>
        ) : null}

        {featured ? (
          <article className="group relative overflow-hidden rounded-[1.4rem] border border-amber/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.08),rgba(7,12,23,0.9)_45%)] p-6 sm:p-8">
            <div className="pointer-events-none absolute -end-16 -top-16 h-52 w-52 rounded-full bg-amber/10 blur-3xl" />
            <div className="flex flex-wrap items-center gap-2.5">
              <span
                className={`rounded-full border px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.14em] uppercase ${
                  CATEGORY_TONE[featured.category] ?? 'border-white/15 text-ink-mute'
                }`}
              >
                {copy.categories[featured.category]}
              </span>
              <span className="text-[0.68rem] text-ink-faint">{featured.source}</span>
              <span className="text-[0.68rem] text-ink-faint">·</span>
              <span className="mx-numeric text-[0.68rem] text-ink-faint">
                {relativeTime(featured.publishedAt, lang, now)}
              </span>
            </div>

            <h2 className="mt-5 max-w-4xl text-[clamp(1.25rem,2.4vw,1.85rem)] leading-[1.18] font-bold tracking-[-0.02em] text-ink">
              <a
                href={featured.link}
                target="_blank"
                rel="noopener noreferrer"
                className="transition hover:text-amber"
              >
                {featured.title}
              </a>
            </h2>

            {featured.summary ? (
              <p className="mt-4 max-w-3xl text-[0.9rem] leading-relaxed text-ink-mute">
                {featured.summary}
              </p>
            ) : null}

            <a
              href={featured.link}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-amber transition hover:gap-2.5"
            >
              {copy.readMore} <span aria-hidden>→</span>
            </a>
          </article>
        ) : null}

        {rest.length > 0 ? (
          <ol className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((item) => (
              <li
                key={item.id}
                className="group flex flex-col rounded-[1.15rem] border border-white/8 bg-[#080d18] p-5 transition hover:border-amber/25"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[0.55rem] font-bold tracking-[0.12em] uppercase ${
                      CATEGORY_TONE[item.category] ?? 'border-white/15 text-ink-mute'
                    }`}
                  >
                    {copy.categories[item.category]}
                  </span>
                  <span className="mx-numeric text-[0.62rem] text-ink-faint">
                    {relativeTime(item.publishedAt, lang, now)}
                  </span>
                </div>

                <h3 className="mt-3.5 flex-1 text-[0.98rem] leading-snug font-semibold text-ink">
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition group-hover:text-amber"
                  >
                    {item.title}
                  </a>
                </h3>

                {item.summary ? (
                  <p className="mt-2.5 line-clamp-3 text-[0.8rem] leading-relaxed text-ink-mute">
                    {item.summary}
                  </p>
                ) : null}

                <p className="mt-4 text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
                  {item.source}
                </p>
              </li>
            ))}
          </ol>
        ) : null}

        {status === 'ready' && visible.length === 0 ? (
          <p className="rounded-2xl border border-white/8 bg-white/[0.02] p-8 text-center text-[0.85rem] text-ink-faint">
            {copy.empty}
          </p>
        ) : null}
      </section>

      {/* ------------------------------------------------------------ Footer */}
      <section className="mt-12 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <h2 className="text-[1rem] font-bold text-ink">{copy.marketsTitle}</h2>
          <p className="mt-2 text-[0.82rem] leading-relaxed text-ink-mute">{copy.marketsLead}</p>
          <Link
            href={href('/markets')}
            className="mt-4 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-cyan transition hover:gap-2.5"
          >
            {copy.viewMarkets} <span aria-hidden>→</span>
          </Link>
        </article>

        <article className="flex flex-col justify-between gap-4 rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <ShareRow
            code={code}
            path={href('/news')}
            text={`${copy.title} — MineAI Node`}
            label={copy.share}
            shareTitle={copy.shareTitle}
          />
          <p className="text-[0.68rem] leading-relaxed text-ink-faint">{copy.sourcesNote}</p>
        </article>
      </section>
    </div>
  );
}
