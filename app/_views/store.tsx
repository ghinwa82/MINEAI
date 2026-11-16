'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n-provider';
import { useMesh } from '@/lib/use-mesh';
import { getCatalogue } from '@/lib/catalog';
import { formatUsd } from '@/lib/treasury';
import type { NodePlan } from '@/lib/catalog';

type Tone = 'success' | 'error' | 'info';

interface Toast {
  tone: Tone;
  text: string;
}

/**
 * The node catalogue.
 *
 * Every control is wired to a live endpoint: activation is dispatched to the
 * autonomous mesh, the purchase button opens a Stripe Checkout session, and
 * settlement posts to the wallet route. The card state is driven by the
 * response, never by an optimistic guess.
 */
export default function StoreView() {
  const { t, lang } = useI18n();
  const { state, loading, dispatch } = useMesh(12_000);
  const catalogue = getCatalogue(lang);

  const [activeNodes, setActiveNodes] = useState<Record<string, boolean>>({});
  const [pendingNode, setPendingNode] = useState<string | null>(null);
  const [purchasingNode, setPurchasingNode] = useState<string | null>(null);
  const [toast, setToast] = useState<Toast | null>(null);
  const [withdrawOpen, setWithdrawOpen] = useState(false);

  // Adopt whatever the mesh already reports, so a refresh never desynchronises
  // the cards from the running shards.
  useEffect(() => {
    if (!state?.nodes) return;
    const next: Record<string, boolean> = {};
    for (const [id, node] of Object.entries(state.nodes)) {
      next[id] = node.status === 'active';
    }
    setActiveNodes(next);
  }, [state?.nodes]);

  const notify = useCallback((tone: Tone, text: string) => {
    setToast({ tone, text });
    window.setTimeout(() => setToast(null), 5200);
  }, []);

  const handleToggle = useCallback(
    async (plan: NodePlan) => {
      const isActive = activeNodes[plan.id] ?? false;
      setPendingNode(plan.id);
      const action = isActive ? 'pause' : 'activate';
      const result = await dispatch(action, plan.id);

      if (result.ok) {
        setActiveNodes((previous) => ({ ...previous, [plan.id]: !isActive }));
        notify(
          'success',
          (isActive ? t.store.pausedToast : t.store.activatedToast).replace(
            '{name}',
            plan.canonicalName,
          ),
        );
      } else {
        notify('error', result.error ?? t.store.activationFailed);
      }
      setPendingNode(null);
    },
    [activeNodes, dispatch, notify, t.store.activatedToast, t.store.activationFailed, t.store.pausedToast],
  );

  const handlePurchase = useCallback(
    async (plan: NodePlan) => {
      setPurchasingNode(plan.id);
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
        const payload = (await response.json()) as {
          ok?: boolean;
          checkoutUrl?: string;
          mode?: string;
          error?: string;
        };

        if (!response.ok || !payload.checkoutUrl) {
          notify('error', payload.error ?? 'The checkout gateway did not answer.');
          return;
        }

        notify('info', t.store.purchaseToast);
        window.open(payload.checkoutUrl, '_blank', 'noopener,noreferrer');
      } catch {
        notify('error', t.common.error);
      } finally {
        setPurchasingNode(null);
      }
    },
    [notify, t.common.error, t.store.purchaseToast],
  );

  const connect = state?.connect;
  const connectLabel =
    connect?.state === 'verified'
      ? t.store.connectVerified
      : connect?.state === 'pending'
        ? t.store.connectPending
        : t.store.connectSandbox;

  const cycleRunning = state?.cycle.running ?? false;

  return (
    <>
      {/* --------------------------------------------------------- Header */}
      <section className="grid gap-10 pb-14 pt-14 lg:grid-cols-[1.25fr_0.75fr] lg:items-end">
        <div>
          <p className="mx-eyebrow">{t.store.eyebrow}</p>
          <h1 className="mx-display mt-6">{t.store.title}</h1>
          <p className="mx-lede mt-6 max-w-xl">{t.store.lead}</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-[#080d18]/80 p-5">
            <p className="text-[0.66rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
              {t.store.balanceLabel}
            </p>
            <p className="mx-numeric mt-2 text-3xl font-bold text-ink">
              {formatUsd(state?.treasury.balanceUsd ?? 0, lang)}
            </p>
            <p className="mx-numeric mt-2 text-[0.68rem] text-ink-faint">
              {t.store.maxLabel}: {formatUsd(state?.treasury.ceilingUsd ?? 0, lang)}
            </p>
            <button
              type="button"
              onClick={() => setWithdrawOpen(true)}
              className="mx-btn-quiet mt-4 w-full !py-2 !text-[0.78rem]"
            >
              {t.store.withdraw}
            </button>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#080d18]/80 p-5">
            <p className="text-[0.66rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
              {t.store.connectTitle}
            </p>
            <p className="mt-2 flex items-center gap-2 text-[0.85rem] font-semibold text-ink">
              <span
                className={`h-2 w-2 rounded-full ${
                  connect?.state === 'verified'
                    ? 'bg-mint'
                    : connect?.state === 'pending'
                      ? 'bg-amber'
                      : 'bg-cyan'
                }`}
                aria-hidden
              />
              {connectLabel}
            </p>
            <p className="mt-2 text-[0.7rem] leading-relaxed text-ink-faint">{connect?.detail}</p>
            <p className="mt-4 flex items-center gap-2 text-[0.7rem] text-ink-mute">
              <span
                className={`h-1.5 w-1.5 rounded-full ${cycleRunning ? 'animate-ping bg-cyan' : 'bg-ink-faint'}`}
                aria-hidden
              />
              {cycleRunning ? t.store.cycleRunning : t.store.lastCycle}:{' '}
              {state?.cycle.lastCycleAt
                ? new Date(state.cycle.lastCycleAt).toLocaleTimeString(
                    lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US',
                    { hour: '2-digit', minute: '2-digit' },
                  )
                : '—'}
            </p>
          </div>
        </div>
      </section>

      {toast ? (
        <div
          role="status"
          className={`mb-10 rounded-2xl border px-5 py-4 text-[0.85rem] font-medium ${
            toast.tone === 'success'
              ? 'border-mint/40 bg-mint/8 text-mint'
              : toast.tone === 'error'
                ? 'border-rose/40 bg-rose/8 text-rose'
                : 'border-cyan/40 bg-cyan/8 text-cyan'
          }`}
        >
          {toast.text}
        </div>
      ) : null}

      {/* ---------------------------------------------------------- Tiers */}
      <section className="grid gap-5 lg:grid-cols-3">
        {catalogue.map((plan, index) => {
          const isActive = activeNodes[plan.id] ?? false;
          const isPending = pendingNode === plan.id;
          const badge =
            index === 0 ? t.store.tierLabels.popular : index === 1 ? t.store.tierLabels.yield : t.store.tierLabels.sovereign;

          return (
            <article
              key={plan.id}
              className={`relative flex flex-col overflow-hidden rounded-[1.5rem] border p-7 transition duration-500 ${
                isActive
                  ? 'border-mint/45 bg-[#080f19] shadow-[0_0_50px_-24px_rgba(74,222,159,0.75)]'
                  : 'border-white/8 bg-[#080d18] hover:border-cyan/30'
              }`}
            >
              <div
                className="pointer-events-none absolute -top-24 -right-20 h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(34,224,255,0.14),transparent_70%)] opacity-0 transition-opacity duration-500 hover:opacity-100"
                aria-hidden
              />

              <div className="relative flex items-center justify-between gap-3">
                <span className="mx-chip">{plan.tierLabel}</span>
                <span
                  className={`mx-chip ${isActive ? '!border-mint/45 !text-mint' : '!border-cyan/35 !text-cyan'}`}
                >
                  {badge}
                </span>
              </div>

              <h2 className="relative mt-6 text-xl font-bold text-ink">{plan.name}</h2>

              <p className="relative mt-3 flex items-center gap-2 text-[0.78rem] font-medium text-cyan">
                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? 'bg-mint' : 'bg-amber'}`} aria-hidden />
                {plan.compute}
              </p>

              <p className="relative mt-5 text-[0.87rem] leading-relaxed text-ink-mute">
                {plan.description}
              </p>

              <div className="relative mt-7 rounded-2xl border border-white/8 bg-[#050810] p-5">
                <div className="flex items-baseline gap-2">
                  <span className="mx-numeric text-4xl font-extrabold text-ink">
                    {formatUsd(plan.priceUsd, lang)}
                  </span>
                  <span className="text-[0.72rem] font-medium text-ink-faint">
                    {plan.periodLabel}
                  </span>
                </div>
                <p className="mt-3 text-[0.75rem] font-semibold text-cyan">{plan.roi}</p>
              </div>

              <div className="relative mt-7">
                <p className="text-[0.68rem] font-semibold tracking-[0.16em] text-ink-faint uppercase">
                  {t.store.featuresTitle}
                </p>
                <ul className="mt-4 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5 text-[0.82rem] text-ink-soft">
                      <span className="mt-0.5 text-cyan" aria-hidden>
                        ▹
                      </span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="relative mt-8 flex flex-col gap-2.5">
                <button
                  type="button"
                  onClick={() => handleToggle(plan)}
                  disabled={isPending}
                  className={`w-full rounded-xl px-4 py-3 text-[0.82rem] font-bold transition ${
                    isActive
                      ? 'border border-mint/45 bg-mint/10 text-mint hover:bg-mint/16'
                      : 'bg-gradient-to-r from-[#6ff0ff] via-[#22e0ff] to-[#4ade9f] text-[#01121a] hover:brightness-110'
                  } disabled:opacity-50`}
                >
                  {isPending
                    ? `${t.store.deploying}…`
                    : isActive
                      ? t.store.deactivate
                      : t.store.activate}
                </button>

                <button
                  type="button"
                  onClick={() => handlePurchase(plan)}
                  disabled={purchasingNode === plan.id}
                  className="mx-btn-quiet w-full !py-3 !text-[0.82rem]"
                >
                  {purchasingNode === plan.id ? `${t.store.purchasing}…` : t.store.deploy}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      {/* ---------------------------------------------------- Agent feed */}
      <section className="mt-20 grid gap-10 border-t border-white/8 pt-16 lg:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="mx-eyebrow">{t.store.feedTitle}</p>
          <h2 className="mx-section-title mt-5">{t.store.cycleTitle}</h2>
          <p className="mx-lede mt-5">{t.home.swarmBody}</p>
        </div>

        <ol className="space-y-3">
          {(state?.agents ?? []).map((agent) => (
            <li
              key={agent.id}
              className="flex flex-col gap-1.5 rounded-2xl border border-white/8 bg-[#080d18]/70 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6"
            >
              <div className="min-w-0">
                <p className="text-[0.85rem] leading-snug text-ink-soft">{agent.action}</p>
                <p className="mx-numeric mt-1.5 text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">
                  {agent.agentName}
                </p>
              </div>
              <span className="mx-numeric shrink-0 text-[0.68rem] text-ink-faint">
                {new Date(agent.timestamp).toLocaleTimeString(
                  lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US',
                  { hour: '2-digit', minute: '2-digit', second: '2-digit' },
                )}
              </span>
            </li>
          ))}
          {loading ? (
            <li className="text-[0.85rem] text-ink-faint">{t.common.loading}…</li>
          ) : (state?.agents ?? []).length === 0 ? (
            <li className="text-[0.85rem] text-ink-faint">{t.store.feedEmpty}</li>
          ) : null}
        </ol>
      </section>

      {withdrawOpen ? (
        <WithdrawModal
          onClose={() => setWithdrawOpen(false)}
          balanceUsd={state?.treasury.balanceUsd ?? 0}
          onSettled={(message) => {
            setWithdrawOpen(false);
            notify('success', message);
          }}
        />
      ) : null}
    </>
  );
}

/* -------------------------------------------------------------------- */

function WithdrawModal({
  onClose,
  balanceUsd,
  onSettled,
}: {
  onClose: () => void;
  balanceUsd: number;
  onSettled: (message: string) => void;
}) {
  const { t, lang } = useI18n();
  const [amount, setAmount] = useState('150');
  const [currency, setCurrency] = useState('USD');
  const [holder, setHolder] = useState('');
  const [bank, setBank] = useState('');
  const [iban, setIban] = useState('');
  const [swift, setSwift] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const numericAmount = useMemo(() => Number(amount), [amount]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError(t.common.error);
      return;
    }
    if (numericAmount > balanceUsd) {
      setError(t.store.insufficient);
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiatAmount: numericAmount,
          currency,
          accountHolder: holder,
          bankName: bank,
          ibanOrAccountNumber: iban,
          swiftBic: swift,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        error?: string;
        transactionId?: string;
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? t.store.error);
        return;
      }

      onSettled(
        `${t.store.success} · ${payload.transactionId ?? ''} · ${formatUsd(numericAmount, lang)}`,
      );
    } catch {
      setError(t.common.error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={t.store.modalTitle}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/78 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <form
        onSubmit={submit}
        className="max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-[1.5rem] border border-white/12 bg-[#080d18] p-7 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.95)]"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="mx-eyebrow">{t.store.connectTitle}</p>
            <h2 className="mt-3 text-xl font-bold text-ink">{t.store.modalTitle}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={t.common.close}
            className="rounded-lg border border-white/10 px-2.5 py-1 text-ink-faint transition hover:border-white/25 hover:text-ink"
          >
            ✕
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <Field label={t.store.amountLabel}>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              className="mx-numeric w-full rounded-xl border border-white/10 bg-[#050810] px-4 py-2.5 text-[0.9rem] text-ink outline-none transition focus:border-cyan/60"
            />
          </Field>
          <Field label={t.store.currencyLabel}>
            <select
              value={currency}
              onChange={(event) => setCurrency(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050810] px-4 py-2.5 text-[0.9rem] text-ink outline-none transition focus:border-cyan/60"
            >
              {['USD', 'EUR', 'SAR', 'AED', 'INR', 'CNY'].map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.store.holderLabel} className="sm:col-span-2">
            <input
              type="text"
              required
              value={holder}
              onChange={(event) => setHolder(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050810] px-4 py-2.5 text-[0.9rem] text-ink outline-none transition focus:border-cyan/60"
            />
          </Field>
          <Field label={t.store.bankLabel} className="sm:col-span-2">
            <input
              type="text"
              required
              value={bank}
              onChange={(event) => setBank(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050810] px-4 py-2.5 text-[0.9rem] text-ink outline-none transition focus:border-cyan/60"
            />
          </Field>
          <Field label={t.store.destinationLabel}>
            <input
              type="text"
              required
              value={iban}
              onChange={(event) => setIban(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050810] px-4 py-2.5 text-[0.9rem] text-ink outline-none transition focus:border-cyan/60"
            />
          </Field>
          <Field label={t.store.swiftLabel}>
            <input
              type="text"
              required
              value={swift}
              onChange={(event) => setSwift(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#050810] px-4 py-2.5 text-[0.9rem] text-ink outline-none transition focus:border-cyan/60"
            />
          </Field>
        </div>

        <p className="mx-numeric mt-4 text-[0.72rem] text-ink-faint">
          {t.store.balanceLabel}: {formatUsd(balanceUsd, lang)}
        </p>

        {error ? (
          <p role="alert" className="mt-4 rounded-xl border border-rose/40 bg-rose/8 px-4 py-3 text-[0.8rem] text-rose">
            {error}
          </p>
        ) : null}

        <div className="mt-7 flex flex-col gap-2.5 sm:flex-row">
          <button type="submit" disabled={submitting} className="mx-btn flex-1">
            {submitting ? `${t.store.processing}…` : t.store.confirm}
          </button>
          <button type="button" onClick={onClose} className="mx-btn-quiet">
            {t.store.cancel}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[0.68rem] font-semibold tracking-[0.12em] text-ink-faint uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}
