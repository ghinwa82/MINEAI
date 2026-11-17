'use client';

import React, { useState } from 'react';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';
import { getInsightsCopy } from '@/lib/insights-i18n';
import type { GrowthBrief } from '@/lib/growth-swarm';

const CHANNELS: Array<{ key: keyof GrowthBrief['scripts']; label: string }> = [
  { key: 'tiktok', label: 'TikTok' },
  { key: 'youtubeShort', label: 'YouTube Shorts' },
  { key: 'x', label: 'X / Twitter' },
  { key: 'telegram', label: 'Telegram' },
];

export default function BriefReader({ brief }: { brief: GrowthBrief }) {
  const { lang, href } = useI18n();
  const copy = getInsightsCopy(lang);
  const [copied, setCopied] = useState<string | null>(null);

  async function copyText(key: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setCopied(null);
    }
  }

  return (
    <article className="mx-auto max-w-3xl py-6">
      <Link href={href('/insights')} className="text-[0.76rem] font-semibold text-cyan hover:underline">
        ← {copy.back}
      </Link>

      <header className="mt-6">
        <span className="mx-chip">{copy.topics[brief.topic] ?? brief.topic}</span>
        <h1 className="mx-display mt-5 text-3xl sm:text-4xl">{brief.title}</h1>
        <p className="mt-4 text-[0.86rem] leading-relaxed text-ink-mute">{brief.description}</p>
        <p className="mt-3 text-[0.68rem] text-ink-faint">
          {copy.published} {new Date(brief.publishedAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')} ·{' '}
          {brief.readingMinutes} {copy.minutes}
        </p>
      </header>

      <div className="mt-8 space-y-7">
        {brief.sections.map((section) => (
          <section key={section.heading}>
            <h2 className="text-sm font-semibold tracking-[0.08em] text-amber uppercase">{section.heading}</h2>
            <p className="mt-2 text-[0.9rem] leading-relaxed text-ink-soft">{section.body}</p>
          </section>
        ))}
      </div>

      <section className="mt-10 rounded-[1.25rem] border border-white/10 bg-[#070c17] p-6">
        <h2 className="text-sm font-semibold text-ink">{copy.scriptsTitle}</h2>
        <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.scriptsLead}</p>
        <div className="mt-5 space-y-4">
          {CHANNELS.map((channel) => (
            <div key={channel.key} className="rounded-xl border border-white/8 bg-[#04060d]/70 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.68rem] font-semibold tracking-[0.1em] text-cyan uppercase">{channel.label}</span>
                <button
                  type="button"
                  onClick={() => copyText(channel.key, brief.scripts[channel.key])}
                  className="rounded-lg border border-white/12 px-2.5 py-1 text-[0.66rem] font-semibold text-ink-soft transition hover:border-cyan/40 hover:text-cyan"
                >
                  {copied === channel.key ? copy.copied : copy.copy}
                </button>
              </div>
              <p className="mt-2 whitespace-pre-line text-[0.76rem] leading-relaxed text-ink-mute">
                {brief.scripts[channel.key]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-8 grid gap-3 rounded-[1.25rem] border border-white/8 bg-white/[0.02] p-5 sm:grid-cols-3">
        {brief.ticker.slice(0, 6).map((item) => (
          <div key={item.symbol} className="rounded-lg border border-white/8 px-3 py-2">
            <p className="text-[0.6rem] tracking-[0.1em] text-ink-faint uppercase">{item.symbol}</p>
            <p className="mx-numeric mt-1 text-sm font-semibold text-ink">
              {item.price.toLocaleString('en-US', { maximumFractionDigits: 2 })}{' '}
              <span className={item.changePercent >= 0 ? 'text-mint' : 'text-rose-300'}>
                {item.changePercent >= 0 ? '+' : ''}
                {item.changePercent.toFixed(2)}%
              </span>
            </p>
          </div>
        ))}
      </section>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3 rounded-[1.25rem] border border-amber/25 bg-amber/[0.06] p-5">
        <p className="max-w-md text-[0.82rem] leading-relaxed text-ink-soft">{copy.cta}</p>
        <Link href={href('/register')} className="mx-btn">
          {copy.cta}
        </Link>
      </div>

      <p className="mt-6 text-[0.66rem] leading-relaxed text-ink-faint">
        {copy.keywords}: {brief.keywords.join(' · ')}
      </p>
    </article>
  );
}
