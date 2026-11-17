'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';
import {
  EMISSION_USD_PER_MH_PER_DAY,
  MINING_PLANS,
  PLAN_NOTES,
  estimateDailyUsd,
  getPlans,
} from '@/lib/plans';
import { formatUsd } from '@/lib/treasury';

/**
 * The five-plan matrix and the live earnings calculator.
 *
 * Both surfaces read the same record so a price shown in the hero can never
 * disagree with the price on the store. The calculator is pure arithmetic on
 * the engine's published emission constant — no invented numbers.
 */
export default function MiningPlans({ withCalculator = true }: { withCalculator?: boolean }) {
  const { lang, href } = useI18n();
  const plans = getPlans(lang);
  const notes = PLAN_NOTES[lang];
  const [power, setPower] = useState(1600);

  const selected = useMemo(() => {
    return (
      plans.find((plan) => plan.hashrateMhs === power) ??
      plans.reduce((closest, plan) =>
        Math.abs(plan.hashrateMhs - power) < Math.abs(closest.hashrateMhs - power) ? plan : closest,
      )
    );
  }, [plans, power]);

  const daily = estimateDailyUsd(selected.hashrateMhs, selected.multiplier);
  const monthly = Number((daily * 30).toFixed(2));

  return (
    <div className="space-y-14">
      <header className="max-w-2xl">
        <h2 className="mx-section-title">{notes.title}</h2>
        <p className="mx-lede mt-5">{notes.lead}</p>
      </header>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-5">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`relative flex flex-col overflow-hidden rounded-[1.35rem] border p-6 transition duration-500 ${
              plan.popular
                ? 'border-amber/45 bg-[linear-gradient(160deg,rgba(212,175,55,0.14),rgba(8,13,24,0.95))]'
                : 'border-white/8 bg-[#080d18] hover:border-cyan/35'
            }`}
          >
            {plan.text.badge ? (
              <span className="absolute end-4 top-4 rounded-full border border-amber/40 bg-amber/15 px-2.5 py-1 text-[0.62rem] font-bold tracking-wide text-amber uppercase">
                {plan.text.badge}
              </span>
            ) : null}

            <span className="text-[0.66rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
              {plan.text.tier}
            </span>
            <h3 className="mt-3 text-lg font-bold text-ink">{plan.text.name}</h3>
            <p className="mx-numeric mt-4 text-2xl font-bold text-cyan">
              {plan.priceUsd === 0 ? formatUsd(0, lang) : formatUsd(plan.priceUsd, lang)}
            </p>
            <p className="mt-1 text-[0.68rem] text-ink-faint">{plan.text.tagline}</p>
            <p className="mt-4 min-h-[3.5rem] text-[0.82rem] leading-relaxed text-ink-mute">
              {plan.text.description}
            </p>

            <dl className="mt-4 flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-2">
              <div className="flex-1">
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">MH/s</dt>
                <dd className="mx-numeric text-sm font-semibold text-ink">
                  {plan.hashrateMhs.toLocaleString('en-US')}
                </dd>
              </div>
              <div className="h-8 w-px bg-white/10" aria-hidden />
              <div className="flex-1">
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">$MINEAI</dt>
                <dd className="mx-numeric text-sm font-semibold text-amber">{plan.multiplier.toFixed(1)}x</dd>
              </div>
            </dl>

            <ul className="mt-5 flex-1 space-y-2.5">
              {plan.text.features.map((feature) => (
                <li key={feature} className="flex gap-2 text-[0.78rem] leading-snug text-ink-soft">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-mint" aria-hidden />
                  {feature}
                </li>
              ))}
            </ul>

            <Link
              href={href(plan.priceUsd === 0 ? '/register' : `/store?plan=${plan.id}`)}
              className={`mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[0.78rem] font-semibold transition ${
                plan.popular
                  ? 'bg-[linear-gradient(100deg,#d4af37,#fff3b0)] text-[#120d02] hover:brightness-110'
                  : 'border border-white/12 text-ink hover:border-cyan/40 hover:text-cyan'
              }`}
            >
              {plan.text.cta}
            </Link>
          </article>
        ))}
      </div>

      <div className="grid gap-4 rounded-[1.35rem] border border-white/8 bg-[#070c17] p-6 md:grid-cols-3">
        <div>
          <h3 className="text-[0.72rem] font-semibold tracking-[0.14em] text-cyan uppercase">
            {notes.payoutTitle}
          </h3>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-mute">{notes.payoutBody}</p>
          <ol className="mt-3 flex flex-wrap gap-2 text-[0.66rem] text-ink-faint">
            {notes.statuses.map((status, index) => (
              <li key={status} className="inline-flex items-center gap-1.5">
                <span className="mx-numeric text-cyan">{index + 1}</span>
                {status}
                {index < notes.statuses.length - 1 ? <span aria-hidden>→</span> : null}
              </li>
            ))}
          </ol>
        </div>
        <div>
          <h3 className="text-[0.72rem] font-semibold tracking-[0.14em] text-amber uppercase">
            {notes.fees}
          </h3>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-mute">{notes.gas}</p>
          <p className="mt-2 text-[0.8rem] leading-relaxed text-ink-mute">{notes.minimum}</p>
        </div>
        <p className="self-center rounded-xl border border-white/8 bg-white/[0.03] p-4 text-[0.72rem] leading-relaxed text-ink-faint">
          {notes.disclaimer}
        </p>
      </div>

      {withCalculator ? (
        <section className="rounded-[1.35rem] border border-white/10 bg-[linear-gradient(140deg,rgba(34,224,255,0.07),rgba(8,13,24,0.9))] p-6 sm:p-9">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mx-eyebrow">{notes.calculatorTitle}</p>
              <p className="mt-2 max-w-xl text-[0.86rem] leading-relaxed text-ink-mute">
                {notes.calculatorLead}
              </p>
            </div>
            <span className="mx-chip">{selected.text.name}</span>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <label htmlFor="earnings-power" className="flex items-center justify-between text-[0.72rem] font-semibold text-ink-soft">
                <span>{notes.powerLabel}</span>
                <span className="mx-numeric text-cyan">{power.toLocaleString('en-US')} MH/s</span>
              </label>
              <input
                id="earnings-power"
                type="range"
                min={MINING_PLANS[0].hashrateMhs}
                max={MINING_PLANS[MINING_PLANS.length - 1].hashrateMhs}
                step={120}
                value={power}
                onChange={(event) => setPower(Number(event.target.value))}
                className="mt-3 w-full accent-[#22e0ff]"
              />
              <div className="mt-3 flex justify-between text-[0.62rem] text-ink-faint">
                <span>120 MH/s</span>
                <span>12,000 MH/s</span>
              </div>
              <p className="mt-4 text-[0.7rem] leading-relaxed text-ink-faint">{notes.estimateNote}</p>
            </div>

            <dl className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-white/8 bg-[#04060d]/70 p-4">
                <dt className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{notes.daily}</dt>
                <dd className="mx-numeric mt-1 text-xl font-bold text-mint">{formatUsd(daily, lang)}</dd>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#04060d]/70 p-4">
                <dt className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{notes.monthly}</dt>
                <dd className="mx-numeric mt-1 text-xl font-bold text-cyan">{formatUsd(monthly, lang)}</dd>
              </div>
              <div className="col-span-2 rounded-xl border border-amber/25 bg-amber/[0.06] p-4">
                <dt className="text-[0.62rem] tracking-[0.12em] text-amber uppercase">{notes.tokenLabel}</dt>
                <dd className="mx-numeric mt-1 text-xl font-bold text-amber">{selected.multiplier.toFixed(1)}x</dd>
                <p className="mt-1 text-[0.66rem] text-ink-faint">
                  {selected.text.name} · {EMISSION_USD_PER_MH_PER_DAY.toFixed(5)} USD/MH/day
                </p>
              </div>
            </dl>
          </div>

          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={href('/register')} className="mx-btn">
              {selected.text.cta}
            </Link>
            <Link href={href('/mining')} className="mx-btn-quiet">
              {notes.planLabel}
            </Link>
          </div>
        </section>
      ) : null}
    </div>
  );
}
