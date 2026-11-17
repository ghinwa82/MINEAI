'use client';

import React from 'react';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';
import { getInsightsCopy } from '@/lib/insights-i18n';
import type { GrowthBrief } from '@/lib/growth-swarm';

export default function InsightsBoard({ briefs }: { briefs: GrowthBrief[] }) {
  const { lang, href } = useI18n();
  const copy = getInsightsCopy(lang);
  const latest = briefs.slice(0, 10);

  return (
    <div className="py-6">
      <header className="max-w-2xl">
        <p className="mx-eyebrow">{copy.eyebrow}</p>
        <h1 className="mx-display mt-5">{copy.title}</h1>
        <p className="mx-lede mt-5">{copy.lead}</p>
      </header>

      <section className="mt-12">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="mx-section-title">{copy.latest}</h2>
          <a href="/feed.xml" className="mx-btn-quiet">
            RSS
          </a>
        </div>

        <div className="mt-7 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {latest.map((brief) => (
            <article
              key={`${brief.slug}-${brief.lang}`}
              className="flex flex-col rounded-[1.25rem] border border-white/8 bg-[#080d18] p-6 transition hover:border-cyan/35"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="mx-chip">{copy.topics[brief.topic] ?? brief.topic}</span>
                <span className="mx-numeric text-[0.62rem] text-ink-faint">{brief.date}</span>
              </div>
              <h3 className="mt-4 text-base font-bold leading-snug text-ink">{brief.title}</h3>
              <p className="mt-3 flex-1 text-[0.82rem] leading-relaxed text-ink-mute">{brief.summary}</p>
              <div className="mt-5 flex items-center justify-between gap-2">
                <span className="text-[0.64rem] text-ink-faint">
                  {brief.readingMinutes} {copy.minutes}
                </span>
                <Link
                  href={href(`/insights/${brief.slug}`)}
                  className="inline-flex items-center gap-1.5 text-[0.76rem] font-semibold text-cyan transition hover:gap-2.5"
                >
                  {copy.readBrief} <span aria-hidden>→</span>
                </Link>
              </div>
            </article>
          ))}
        </div>

        <p className="mt-8 text-[0.72rem] leading-relaxed text-ink-faint">{copy.feedNote}</p>
      </section>
    </div>
  );
}
