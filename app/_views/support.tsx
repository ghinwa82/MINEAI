'use client';

import React from 'react';

import SupportChat from '../components/SupportChat';
import { useI18n } from '@/lib/i18n-provider';
import { supportCopy } from '@/lib/support-i18n';

/**
 * The help centre at /support.
 *
 * The chat answers instantly in every language; the three role inboxes cover
 * anything that needs a human decision. No personal address is published —
 * only the shared role mailboxes the legal pages already use.
 */

const CHANNELS = [
  { email: 'support@mineai.network', key: 'supportLabel' as const },
  { email: 'billing@mineai.network', key: 'billingLabel' as const },
  { email: 'legal@mineai.network', key: 'privacyLabel' as const },
];

export default function SupportView() {
  const { lang } = useI18n();
  const copy = supportCopy(lang);

  return (
    <div className="pb-10 pt-14">
      <header className="border-b border-white/8 pb-10">
        <p className="mx-eyebrow">{copy.page.eyebrow}</p>
        <h1 className="mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.06] font-extrabold tracking-[-0.03em] text-ink">
          {copy.page.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-ink-soft">{copy.page.lead}</p>
      </header>

      <div className="mt-8">
        <SupportChat />
      </div>

      <section className="mt-4 rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7">
        <h2 className="text-[0.95rem] font-bold text-ink">{copy.page.channelsTitle}</h2>
        <p className="mt-2 max-w-2xl text-[0.78rem] leading-relaxed text-ink-mute">{copy.page.channelsLead}</p>

        <ul className="mt-5 grid gap-3 sm:grid-cols-3">
          {CHANNELS.map((channel) => (
            <li key={channel.email} className="rounded-xl border border-white/8 bg-[#050507]/70 p-4">
              <p className="text-[0.6rem] tracking-[0.14em] text-ink-faint uppercase">
                {copy.page[channel.key]}
              </p>
              <a
                href={`mailto:${channel.email}`}
                className="mt-2 block break-all text-[0.8rem] font-semibold text-amber transition hover:text-amber/80"
              >
                {channel.email}
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7">
        <h2 className="text-[0.95rem] font-bold text-ink">{copy.page.topicsTitle}</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(copy.topics).map((topic) => (
            <li
              key={topic}
              className="rounded-lg border border-white/8 bg-[#050507]/70 px-3.5 py-2.5 text-[0.76rem] text-ink-soft"
            >
              {topic}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
