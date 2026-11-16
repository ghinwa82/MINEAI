'use client';

import React, { useCallback, useState } from 'react';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';
import { useMesh } from '@/lib/use-mesh';
import { findPlanById, getCatalogue, type NodePlan } from '@/lib/catalog';
import { formatUsd } from '@/lib/treasury';

/**
 * A single node tier, in detail.
 *
 * The spec sheet is deliberately tabular — compute, cadence, settlement and
 * support read like an equipment datasheet rather than a marketing card.
 */
export default function ProductView({ id }: { id: string }) {
  const { t, lang } = useI18n();
  const { state, dispatch } = useMesh(20_000);
  const catalogue = getCatalogue(lang);

  const plan: NodePlan | undefined = findPlanById(lang, id) ?? catalogue[0];

  const [pending, setPending] = useState(false);
  const [purchasing, setPurchasing] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error'; text: string } | null>(null);

  const isActive = state?.nodes?.[plan.id]?.status === 'active';

  const toggle = useCallback(async () => {
    setPending(true);
    const result = await dispatch(isActive ? 'pause' : 'activate', plan.id);
    setPending(false);
    if (result.ok) {
      setMessage({
        tone: 'success',
        text: (isActive ? t.store.pausedToast : t.store.activatedToast).replace(
          '{name}',
          plan.canonicalName,
        ),
      });
    } else {
      setMessage({ tone: 'error', text: result.error ?? t.store.activationFailed });
    }
  }, [dispatch, isActive, plan.canonicalName, plan.id, t.store.activatedToast, t.store.activationFailed, t.store.pausedToast]);

  const purchase = useCallback(async () => {
    setPurchasing(true);
    try {
      const response = await fetch('/api/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: plan.tierLabel,
          amountUsd: plan.priceUsd,
          nodeId: plan.id,
        }),
      });
      const payload = (await response.json()) as { ok?: boolean; checkoutUrl?: string; error?: string };
      if (!response.ok || !payload.checkoutUrl) {
        setMessage({ tone: 'error', text: payload.error ?? t.store.error });
        return;
      }
      window.open(payload.checkoutUrl, '_blank', 'noopener,noreferrer');
      setMessage({ tone: 'success', text: t.store.purchaseToast });
    } catch {
      setMessage({ tone: 'error', text: t.common.error });
    } finally {
      setPurchasing(false);
    }
  }, [plan.id, plan.priceUsd, plan.tierLabel, t.common.error, t.store.purchaseToast]);

  const specRows: Array<[string, string]> = [
    [t.product.specRows.compute, plan.envelope.compute],
    [t.product.specRows.cadence, plan.envelope.cadence],
    [t.product.specRows.settlement, plan.envelope.settlement],
    [t.product.specRows.support, plan.envelope.support],
  ];

  return (
    <article className="pb-10 pt-14">
      <Link
        href="/store"
        className="inline-flex items-center gap-2 text-[0.78rem] font-semibold text-ink-mute transition hover:text-cyan"
      >
        <span aria-hidden>←</span>
        {t.product.backToStore}
      </Link>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="mx-chip">{plan.tierLabel}</span>
            <span className="mx-chip !border-cyan/35 !text-cyan">{plan.compute}</span>
          </div>

          <h1 className="mx-display mt-7">{plan.name}</h1>

          <p className="mx-lede mt-7 max-w-xl">{plan.description}</p>

          <h2 className="mt-12 text-[0.7rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
            {t.product.includesTitle}
          </h2>
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2">
            {plan.features.map((feature) => (
              <li key={feature} className="flex gap-2.5 text-[0.88rem] text-ink-soft">
                <span className="mt-0.5 text-cyan" aria-hidden>
                  ▹
                </span>
                <span>{feature}</span>
              </li>
            ))}
          </ul>

          <h2 className="mt-12 text-[0.7rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
            {t.product.computeLabel}
          </h2>
          <dl className="mt-5 divide-y divide-white/8 border-y border-white/8">
            {specRows.map(([label, value]) => (
              <div key={label} className="grid gap-1 py-4 sm:grid-cols-[0.4fr_0.6fr] sm:gap-6">
                <dt className="text-[0.8rem] font-medium text-ink-faint">{label}</dt>
                <dd className="text-[0.88rem] text-ink-soft">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-[1.5rem] border border-white/10 bg-[#080d18]/85 p-7 backdrop-blur-xl">
            <p className="text-[0.66rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
              {t.product.deployCta}
            </p>
            <p className="mx-numeric mt-3 text-5xl font-extrabold text-ink">
              {formatUsd(plan.priceUsd, lang)}
            </p>
            <p className="mt-2 text-[0.78rem] text-ink-faint">{plan.periodLabel}</p>

            <p className="mt-6 rounded-xl border border-cyan/25 bg-cyan/6 px-4 py-3 text-[0.82rem] font-semibold text-cyan">
              {plan.roi}
            </p>

            <div className="mt-7 flex flex-col gap-2.5">
              <button type="button" onClick={toggle} disabled={pending} className="mx-btn">
                {pending
                  ? `${t.store.deploying}…`
                  : isActive
                    ? t.store.deactivate
                    : t.store.activate}
              </button>
              <button type="button" onClick={purchase} disabled={purchasing} className="mx-btn-quiet">
                {purchasing ? `${t.store.purchasing}…` : t.product.deployCta}
              </button>
            </div>

            {message ? (
              <p
                role="status"
                className={`mt-5 rounded-xl border px-4 py-3 text-[0.8rem] ${
                  message.tone === 'success'
                    ? 'border-mint/40 bg-mint/8 text-mint'
                    : 'border-rose/40 bg-rose/8 text-rose'
                }`}
              >
                {message.text}
              </p>
            ) : null}

            <p className="mt-6 text-[0.72rem] leading-relaxed text-ink-faint">
              {state?.connect?.detail ?? ''}
            </p>
          </div>
        </aside>
      </div>
    </article>
  );
}
