'use client';

import React from 'react';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';
import {
  getLegalCopy,
  LEGAL_SLUGS,
  LEGAL_UPDATED,
  type LegalSlug,
} from '@/lib/legal-i18n';

/**
 * The compliance surface.
 *
 * Card-acquiring reviewers open these four pages before approving a
 * merchant. They therefore render the full text server-side, keep a visible
 * last-updated date and expose the other documents in a persistent rail, so a
 * reviewer never has to hunt for the refund policy from the terms page.
 */

const SLUG_PATH: Record<LegalSlug, string> = {
  terms: '/terms',
  privacy: '/privacy',
  'refund-policy': '/refund-policy',
  contact: '/contact',
};

function navLabel(slug: LegalSlug, copy: ReturnType<typeof getLegalCopy>): string {
  if (slug === 'terms') return copy.nav.terms;
  if (slug === 'privacy') return copy.nav.privacy;
  if (slug === 'refund-policy') return copy.nav.refund;
  return copy.nav.contact;
}

export default function LegalView({ slug }: { slug: LegalSlug }) {
  const { lang, href } = useI18n();
  const copy = getLegalCopy(lang);
  const doc = copy.docs[slug];

  return (
    <div className="pb-8 pt-14">
      {/* ---------------------------------------------------------- Masthead */}
      <header className="border-b border-white/8 pb-10">
        <p className="mx-eyebrow">{doc.eyebrow}</p>
        <h1 className="mt-6 text-[clamp(2rem,4.4vw,3.25rem)] leading-[1.06] font-extrabold tracking-[-0.03em] text-ink">
          {doc.title}
        </h1>
        <p className="mt-5 max-w-2xl text-[1rem] leading-relaxed text-ink-soft">{doc.intro}</p>

        <dl className="mt-7 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.72rem] tracking-[0.12em] uppercase">
          <div className="flex items-center gap-2">
            <dt className="text-ink-faint">{copy.common.updated}</dt>
            <dd className="mx-numeric text-amber">{LEGAL_UPDATED}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-ink-faint">{copy.common.effective}</dt>
            <dd className="mx-numeric text-amber">{LEGAL_UPDATED}</dd>
          </div>
          <div className="flex items-center gap-2">
            <dt className="text-ink-faint">{copy.common.company}</dt>
            <dd className="text-ink-soft">MineAI Node</dd>
          </div>
        </dl>
      </header>

      <div className="mt-12 grid gap-12 lg:grid-cols-[16rem_1fr] lg:items-start">
        {/* ------------------------------------------------------------ Rail */}
        <nav aria-label={copy.common.company} className="lg:sticky lg:top-24">
          <p className="text-[0.64rem] font-semibold tracking-[0.2em] text-ink-faint uppercase">
            {doc.eyebrow}
          </p>
          <ul className="mt-4 flex flex-col gap-1.5">
            {LEGAL_SLUGS.map((item) => {
              const active = item === slug;
              return (
                <li key={item}>
                  <Link
                    href={href(SLUG_PATH[item])}
                    aria-current={active ? 'page' : undefined}
                    className={`flex items-center justify-between gap-3 rounded-xl border px-3.5 py-2.5 text-[0.82rem] transition ${
                      active
                        ? 'border-amber/40 bg-amber/10 text-amber'
                        : 'border-white/8 text-ink-mute hover:border-white/20 hover:text-ink'
                    }`}
                  >
                    <span>{navLabel(item, copy)}</span>
                    <span aria-hidden className="text-[0.7rem] opacity-60">
                      →
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="mt-7 rounded-xl border border-white/8 bg-[#080d18]/70 p-4">
            <p className="text-[0.68rem] leading-relaxed text-ink-faint">
              {copy.common.billingEmail}
            </p>
            <p className="mt-2 text-[0.68rem] leading-relaxed text-ink-faint">
              {copy.common.legalEmail}
            </p>
          </div>

          <div className="mt-6 flex flex-col gap-2">
            <Link href={href('/')} className="text-[0.78rem] text-ink-mute transition hover:text-amber">
              ← {copy.common.backHome}
            </Link>
            <Link
              href={href('/store')}
              className="text-[0.78rem] text-ink-mute transition hover:text-amber"
            >
              {copy.common.backStore} →
            </Link>
          </div>
        </nav>

        {/* ----------------------------------------------------------- Article */}
        <article className="min-w-0">
          <ol className="flex flex-col gap-9">
            {doc.sections.map((section) => (
              <li key={section.heading} className="border-t border-white/6 pt-8 first:border-0 first:pt-0">
                <h2 className="text-[1.05rem] font-bold tracking-[-0.01em] text-ink">
                  {section.heading}
                </h2>
                <div className="mt-3 flex flex-col gap-3">
                  {section.body.map((paragraph, index) => (
                    <p key={index} className="text-[0.9rem] leading-[1.75] text-ink-mute">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </li>
            ))}
          </ol>

          <div className="mx-rule my-10" />

          <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[0.72rem] text-ink-faint">
            <a
              href={`mailto:${copy.common.supportEmail}`}
              className="text-amber/90 underline decoration-amber/30 underline-offset-4 transition hover:text-amber"
            >
              {copy.common.supportEmail}
            </a>
            <a
              href={`mailto:${copy.common.legalEmail}`}
              className="text-amber/90 underline decoration-amber/30 underline-offset-4 transition hover:text-amber"
            >
              {copy.common.legalEmail}
            </a>
            <span>
              © {new Date().getFullYear()} {copy.common.company}
            </span>
          </footer>
        </article>
      </div>
    </div>
  );
}
