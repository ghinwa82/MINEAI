'use client';

import React from 'react';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';
import { useMesh } from '@/lib/use-mesh';
import { getCatalogue } from '@/lib/catalog';
import { formatUsd } from '@/lib/treasury';
import ExplainerVideoPlayer from '../components/ExplainerVideoPlayer';
import LiveMarketTracker from '../components/LiveMarketTracker';
import MineAICoinLogo from '../components/MineAICoinLogo';
import PayoutTicker from '../components/PayoutTicker';
import ProofOfReservesBar from '../components/ProofOfReservesBar';

/**
 * The overview.
 *
 * Asymmetric hero, an editorial four-column system map, the live agent
 * timeline, the catalogue preview and the closing answers — laid out so no two
 * sections repeat the same shape.
 */
export default function HomeView() {
  const { t, lang, eco, href: to } = useI18n();
  const { state } = useMesh(20_000);
  const catalogue = getCatalogue(lang);

  const stats = state?.stats;
  const agents = state?.agents ?? [];
  const balance = state?.treasury.balanceUsd ?? 0;

  return (
    <>
      {/* ---------------------------------------------------------- Hero */}
      <section className="grid gap-14 pb-20 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:gap-20 lg:pt-24">
        <div>
          <p className="mx-eyebrow">{t.home.eyebrow}</p>

          <h1 className="mx-display mt-6">
            {t.home.headline}{' '}
            <span className="mx-neon-text">{t.home.headlineAccent}</span>
          </h1>

          <p className="mx-lede mt-7 max-w-xl">{t.home.lead}</p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link href={to('/store')} className="mx-btn">
              {t.home.ctaPrimary}
              <svg width="14" height="10" viewBox="0 0 14 10" aria-hidden>
                <path d="M1 5h11M8.5 1.5L12 5l-3.5 3.5" stroke="currentColor" strokeWidth="1.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link href={to('/mining')} className="mx-btn-quiet">
              {eco.nav.mining}
            </Link>
          </div>

          <dl className="mt-14 grid grid-cols-2 gap-x-8 gap-y-7 border-t border-white/8 pt-8 sm:grid-cols-4">
            <Stat
              value={stats ? `${stats.activeNodes}/${stats.totalNodes}` : '—'}
              label={t.home.stats.shards}
            />
            <Stat value={stats ? `${stats.uptimeHours}h` : '—'} label={t.home.stats.uptime} />
            <Stat value={stats ? String(stats.cycleCount) : '—'} label={t.home.stats.cycles} />
            <Stat value={stats ? String(stats.languages) : '6'} label={t.home.stats.locales} />
          </dl>
        </div>

        {/* Telemetry panel */}
        <aside className="relative">
          <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_50%_0%,rgba(34,224,255,0.16),transparent_68%)] blur-2xl" aria-hidden />

          <div className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#080d18]/85 p-6 backdrop-blur-xl sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="mx-chip">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
                </span>
                {t.home.liveNetwork}
              </span>
              <span className="mx-numeric text-[0.68rem] text-ink-faint">
                {stats?.settlementRail ?? '—'}
              </span>
            </div>

            <p className="mt-7 text-[0.68rem] font-semibold tracking-[0.2em] text-ink-faint uppercase">
              {t.store.balanceLabel}
            </p>
            <p className="mx-numeric mt-2 text-4xl font-bold text-ink sm:text-5xl">
              {formatUsd(balance, lang)}
            </p>

            <div className="mx-rule my-7" />

            <ul className="space-y-4">
              {(agents.slice(0, 4)).map((agent) => (
                <li key={agent.id} className="flex gap-3">
                  <span
                    className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                      agent.status === 'success'
                        ? 'bg-mint'
                        : agent.status === 'warning'
                          ? 'bg-amber'
                          : 'bg-cyan'
                    }`}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <p className="text-[0.8rem] leading-snug text-ink-soft">{agent.action}</p>
                    <p className="mx-numeric mt-1 text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
                      {agent.agentName}
                    </p>
                  </div>
                </li>
              ))}
              {agents.length === 0 ? (
                <li className="text-[0.8rem] text-ink-faint">{t.store.feedEmpty}</li>
              ) : null}
            </ul>

            <Link
              href={to('/notes')}
              className="mt-7 inline-flex items-center gap-2 text-[0.78rem] font-semibold text-cyan transition hover:gap-3"
            >
              {t.notes.feedTitle}
              <span aria-hidden>→</span>
            </Link>
          </div>
        </aside>
      </section>

      {/* ------------------------------------------------------ Markets */}
      <section className="pb-20">
        <LiveMarketTracker variant="strip" />
      </section>

      {/* ------------------------------------------------------- Systems */}
      <section className="border-t border-white/8 py-20">
        <div className="max-w-2xl">
          <p className="mx-eyebrow">{t.home.pillarsTitle}</p>
          <p className="mx-lede mt-5">{t.home.pillarsLead}</p>
        </div>

        <ol className="mt-12 grid gap-px overflow-hidden rounded-[1.5rem] border border-white/8 bg-white/8 sm:grid-cols-2 xl:grid-cols-4">
          {t.home.pillars.map((pillar, index) => (
            <li
              key={pillar.title}
              className="group relative bg-[#070c17] p-7 transition-colors hover:bg-[#0a1120]"
            >
              <span className="mx-numeric text-[0.68rem] tracking-[0.2em] text-cyan/70">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h3 className="mt-5 text-lg font-bold text-ink">{pillar.title}</h3>
              <p className="mt-3 text-[0.85rem] leading-relaxed text-ink-mute">{pillar.body}</p>
              <span
                className="absolute inset-x-0 bottom-0 h-px scale-x-0 bg-gradient-to-r from-transparent via-cyan to-transparent transition-transform duration-500 group-hover:scale-x-100"
                aria-hidden
              />
            </li>
          ))}
        </ol>
      </section>

      {/* --------------------------------------------------------- Swarm */}
      <section className="grid gap-12 border-t border-white/8 py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <p className="mx-eyebrow">{t.home.swarmTitle}</p>
          <h2 className="mx-section-title mt-5">{t.home.swarmLead}</h2>
          <p className="mx-lede mt-5">{t.home.swarmBody}</p>

          <div className="mt-9 flex flex-wrap gap-3">
            <span className="mx-chip">{t.store.cycleTitle}</span>
            <span className="mx-chip">
              {t.store.lastCycle}:{' '}
              {state?.cycle.lastCycleAt
                ? new Date(state.cycle.lastCycleAt).toLocaleTimeString(lang === 'zh' ? 'zh-CN' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })
                : '—'}
            </span>
          </div>
        </div>

        <ol className="relative space-y-0 border-s border-white/10 ps-6">
          {(state?.cycle.lastObservations ?? []).map((observation, index) => (
            <li key={index} className="relative pb-7 last:pb-0">
              <span
                className="absolute -start-[1.6rem] top-1.5 h-2 w-2 rounded-full border border-cyan bg-[#070c17]"
                aria-hidden
              />
              <p className="text-[0.9rem] leading-relaxed text-ink-soft">{observation}</p>
            </li>
          ))}
          {(state?.cycle.lastObservations ?? []).length === 0 ? (
            <li className="text-[0.9rem] text-ink-faint">{t.notes.feedEmpty}</li>
          ) : null}
        </ol>
      </section>

      {/* ------------------------------------------------------- Explainer */}
      <section className="border-t border-white/8 py-20">
        <ExplainerVideoPlayer />
      </section>

      {/* -------------------------------------------------------- Mining */}
      <section className="grid gap-12 border-t border-white/8 py-20 lg:grid-cols-[1fr_0.85fr] lg:items-center lg:gap-20">
        <div>
          <p className="mx-eyebrow">{eco.mining.eyebrow}</p>
          <h2 className="mx-section-title mt-5">{eco.mining.title}</h2>
          <p className="mx-lede mt-5">{eco.mining.lead}</p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={to('/mining')} className="mx-btn">
              {eco.nav.mining}
            </Link>
            <Link href={to('/rewards')} className="mx-btn-quiet">
              {eco.nav.rewards}
            </Link>
          </div>

          <dl className="mt-9 grid gap-6 border-t border-white/8 pt-7 sm:grid-cols-2">
            <div>
              <dt className="text-[0.72rem] font-semibold text-mint">{eco.mining.zeroPower}</dt>
              <dd className="mt-2 text-[0.82rem] leading-relaxed text-ink-mute">{eco.mining.zeroPowerBody}</dd>
            </div>
            <div>
              <dt className="text-[0.72rem] font-semibold text-cyan">{eco.mining.compliance}</dt>
              <dd className="mt-2 text-[0.82rem] leading-relaxed text-ink-mute">{eco.mining.edgeBody}</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col items-center gap-8">
          <MineAICoinLogo size={250} />
          <div className="w-full">
            <PayoutTicker limit={6} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------- Reserves posture */}
      <section className="border-t border-white/8 py-16">
        <ProofOfReservesBar />
      </section>

      {/* ---------------------------------------------------- Catalogue */}
      <section className="border-t border-white/8 py-20">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="mx-eyebrow">{t.home.tiersTitle}</p>
            <h2 className="mx-section-title mt-5">{t.home.tiersLead}</h2>
          </div>
          <Link href={to('/store')} className="mx-btn-quiet">
            {t.home.tiersCta}
            <span aria-hidden>→</span>
          </Link>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {catalogue.map((plan) => (
            <Link
              key={plan.id}
              href={to(`/store/${plan.canonicalName.toLowerCase().replace(/\s+/g, '-')}`)}
              className="group relative overflow-hidden rounded-[1.35rem] border border-white/8 bg-[#080d18] p-7 transition duration-500 hover:border-cyan/35 hover:bg-[#0a1120]"
            >
              <div
                className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-[radial-gradient(circle,rgba(34,224,255,0.16),transparent_70%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                aria-hidden
              />
              <div className="relative flex items-center justify-between gap-3">
                <span className="mx-chip">{plan.tierLabel}</span>
                <span className="mx-numeric text-xs font-semibold text-cyan">
                  {formatUsd(plan.priceUsd, lang)}
                </span>
              </div>
              <h3 className="relative mt-6 text-lg font-bold text-ink">{plan.canonicalName}</h3>
              <p className="relative mt-3 text-[0.85rem] leading-relaxed text-ink-mute">
                {plan.description}
              </p>
              <p className="relative mt-6 text-[0.78rem] font-semibold text-cyan">{plan.roi}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ----------------------------------------------------------- FAQ */}
      <section className="border-t border-white/8 py-20">
        <h2 className="mx-section-title">{t.home.faqTitle}</h2>
        <dl className="mt-10 divide-y divide-white/8 border-y border-white/8">
          {t.home.faq.map((entry) => (
            <div key={entry.question} className="grid gap-3 py-7 md:grid-cols-[0.42fr_0.58fr] md:gap-10">
              <dt className="text-[0.95rem] font-semibold text-ink">{entry.question}</dt>
              <dd className="text-[0.9rem] leading-relaxed text-ink-mute">{entry.answer}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ------------------------------------------------------- Closing */}
      <section className="relative overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#080d18] px-7 py-14 sm:px-14">
        <div
          className="pointer-events-none absolute -top-24 left-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(74,222,159,0.18),transparent_70%)] blur-2xl"
          aria-hidden
        />
        <div className="relative flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <h2 className="mx-section-title max-w-2xl">{t.home.closingTitle}</h2>
          </div>
          <Link href={to('/store')} className="mx-btn shrink-0">
            {t.home.ctaPrimary}
          </Link>
        </div>
      </section>
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="mx-numeric block text-2xl font-bold text-ink sm:text-[1.75rem]">{value}</span>
        <span className="mt-1.5 block text-[0.68rem] font-medium tracking-[0.14em] text-ink-faint uppercase">
          {label}
        </span>
      </dd>
    </div>
  );
}
