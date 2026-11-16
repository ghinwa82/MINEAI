'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { useI18n } from '@/lib/i18n-provider';

/**
 * Dual-rail checkout.
 *
 * Fiat clears through a hosted processor page — card data never reaches this
 * server. Crypto clears directly to the owner's wallet on seven networks and is
 * credited only after the transaction hash is verified against a public RPC.
 *
 * Every rail reports its true mode. When a processor key is absent the rail is
 * labelled `sandbox` and the button refuses to pretend a charge happened.
 */

interface CheckoutPlan {
  id: string;
  name: string;
  tierLabel: string;
  priceUsd: number;
}

interface RailStatus {
  rail: 'paymob' | 'lemonsqueezy' | 'stripe';
  mode: 'live' | 'test' | 'sandbox';
  configured: boolean;
  detail: string;
  supports: string[];
}

interface OwnerBank {
  accountHolder: string;
  bankName: string;
  ibanMasked: string | null;
  swift: string | null;
  country: string;
  configured: boolean;
}

interface CryptoNetwork {
  id: string;
  family: string;
  label: string;
  chain: string;
  asset: string;
  minAmount: number;
  address: string;
  configured: boolean;
  demo: boolean;
  explorer: string;
}

interface DepositIntent {
  id: string;
  network: string;
  amountUsd: number;
  assetAmount: number;
  address: string;
  payUri: string;
  qrDataUrl: string;
  expiresAt: string;
  status: 'awaiting' | 'verified' | 'failed';
  demo: boolean;
}

interface Verdict {
  state: 'verified' | 'pending' | 'failed' | 'unavailable';
  confirmations: number;
  detail: string;
  creditedUsd: number;
}

const RAIL_LABEL: Record<RailStatus['rail'], string> = {
  paymob: 'Paymob',
  lemonsqueezy: 'Lemon Squeezy',
  stripe: 'Stripe',
};

export default function PaymentCheckout({
  plan,
  onClose,
}: {
  plan: CheckoutPlan;
  onClose: () => void;
}) {
  const { eco, t, lang } = useI18n();
  const reduce = useReducedMotion();
  const copy = eco.checkout;

  const [tab, setTab] = useState<'fiat' | 'crypto'>('fiat');
  const [rails, setRails] = useState<RailStatus[]>([]);
  const [owner, setOwner] = useState<OwnerBank | null>(null);
  const [networks, setNetworks] = useState<CryptoNetwork[]>([]);
  const [rail, setRail] = useState<RailStatus['rail']>('paymob');
  const [network, setNetwork] = useState<string>('');
  const [amount, setAmount] = useState(String(plan.priceUsd));
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [intent, setIntent] = useState<DepositIntent | null>(null);
  const [txHash, setTxHash] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [fiatResponse, cryptoResponse] = await Promise.all([
          fetch('/api/payments/checkout', { cache: 'no-store' }),
          fetch('/api/payments/crypto', { cache: 'no-store' }),
        ]);

        if (fiatResponse.ok) {
          const payload = (await fiatResponse.json()) as { rails?: RailStatus[]; owner?: { bank?: OwnerBank } };
          if (cancelled) return;
          setRails(payload.rails ?? []);
          setOwner(payload.owner?.bank ?? null);
          const firstArmed = payload.rails?.find((item) => item.configured);
          if (firstArmed) setRail(firstArmed.rail);
        }

        if (cryptoResponse.ok) {
          const payload = (await cryptoResponse.json()) as { networks?: CryptoNetwork[] };
          if (cancelled) return;
          const list = payload.networks ?? [];
          setNetworks(list);
          const first = list.find((item) => item.configured) ?? list[0];
          if (first) setNetwork(first.id);
        }
      } catch {
        if (!cancelled) setError(t.common.error);
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [t.common.error]);

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const selectedNetwork = useMemo(
    () => networks.find((item) => item.id === network) ?? null,
    [networks, network],
  );

  const numericAmount = Number(amount);
  const minutesLeft = intent
    ? Math.max(0, Math.ceil((new Date(intent.expiresAt).getTime() - now) / 60_000))
    : 0;

  const flash = useCallback((message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 6000);
  }, []);

  const copyText = async (value: string, key: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2200);
    } catch {
      setError(t.common.error);
    }
  };

  const startFiat = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);

    try {
      const response = await fetch('/api/payments/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rail,
          amountUsd: numericAmount,
          tier: plan.tierLabel,
          nodeId: plan.id,
          locale: lang,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        mode?: string;
        checkoutUrl?: string;
        detail?: string;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        setError(payload.error ?? copy.failed);
        return;
      }

      if (payload.mode === 'sandbox' || !payload.checkoutUrl) {
        flash(payload.detail ?? copy.sandboxNote);
        return;
      }

      window.location.assign(payload.checkoutUrl);
    } catch {
      setError(t.common.error);
    } finally {
      setBusy(false);
    }
  };

  const createIntent = async () => {
    if (!selectedNetwork) return;
    setBusy(true);
    setError(null);
    setVerdict(null);
    setIntent(null);

    try {
      const response = await fetch('/api/payments/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'intent', network: selectedNetwork.id, amountUsd: numericAmount }),
      });
      const payload = (await response.json()) as { ok?: boolean; intent?: DepositIntent; error?: string };

      if (!response.ok || !payload.ok || !payload.intent) {
        setError(payload.error ?? copy.failed);
        return;
      }

      setIntent(payload.intent);
    } catch {
      setError(t.common.error);
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    if (!intent) return;
    setVerifying(true);
    setError(null);

    try {
      const response = await fetch('/api/payments/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'verify', intentId: intent.id, txHash: txHash.trim() }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        state?: Verdict['state'];
        confirmations?: number;
        detail?: string;
        creditedUsd?: number;
        error?: string;
      };

      setVerdict({
        state: payload.state ?? 'pending',
        confirmations: payload.confirmations ?? 0,
        detail: payload.detail ?? payload.error ?? copy.pending,
        creditedUsd: payload.creditedUsd ?? 0,
      });
    } catch {
      setError(t.common.error);
    } finally {
      setVerifying(false);
    }
  };

  const modeTone = (mode: RailStatus['mode']) =>
    mode === 'live'
      ? '!border-mint/45 !text-mint'
      : mode === 'test'
        ? '!border-amber/45 !text-amber'
        : '!border-white/15 !text-ink-faint';

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <button
        type="button"
        aria-label={copy.close}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-[#01030a]/85 backdrop-blur-md"
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="checkout-title"
        initial={{ opacity: 0, y: reduce ? 0 : 28, scale: reduce ? 1 : 0.985 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 flex max-h-[94dvh] w-full max-w-5xl flex-col overflow-hidden rounded-t-[1.5rem] border border-white/12 bg-[#060a14] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.95)] sm:rounded-[1.5rem]"
      >
        {/* ------------------------------------------------------ Header */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-white/8 px-5 py-5 sm:px-7">
          <div>
            <p className="mx-eyebrow">{copy.title}</p>
            <h2 id="checkout-title" className="mt-3 text-xl font-bold text-ink">
              {plan.name}
            </h2>
            <p className="mt-1 text-[0.76rem] text-ink-faint">{plan.tierLabel}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-end">
              <p className="text-[0.6rem] font-semibold tracking-[0.16em] text-ink-faint uppercase">
                {copy.amountDue}
              </p>
              <p className="mx-numeric mt-1 text-2xl font-bold text-ink">${plan.priceUsd.toFixed(2)}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-9 w-9 place-items-center rounded-xl border border-white/12 text-ink-mute transition hover:border-rose/45 hover:text-rose"
              aria-label={copy.close}
            >
              ✕
            </button>
          </div>
        </header>

        {/* -------------------------------------------------------- Tabs */}
        <div className="flex gap-1 border-b border-white/8 px-5 pt-4 sm:px-7">
          {(
            [
              { key: 'fiat' as const, label: copy.fiatTitle },
              { key: 'crypto' as const, label: copy.cryptoTitle },
            ]
          ).map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-pressed={tab === item.key}
              className={`relative rounded-t-lg px-4 py-2.5 text-[0.82rem] font-semibold transition ${
                tab === item.key ? 'text-cyan' : 'text-ink-mute hover:text-ink'
              }`}
            >
              {item.label}
              {tab === item.key ? (
                <span className="absolute inset-x-2 -bottom-px h-px bg-gradient-to-r from-transparent via-cyan to-transparent" />
              ) : null}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-6 sm:px-7">
          <p className="max-w-2xl text-[0.82rem] leading-relaxed text-ink-mute">{copy.lead}</p>

          {notice ? (
            <p role="status" className="mt-4 rounded-xl border border-amber/35 bg-amber/8 px-4 py-3 text-[0.78rem] text-amber">
              {notice}
            </p>
          ) : null}
          {error ? (
            <p role="alert" className="mt-4 rounded-xl border border-rose/35 bg-rose/8 px-4 py-3 text-[0.78rem] text-rose">
              {error}
            </p>
          ) : null}

          <AnimatePresence mode="wait">
            {tab === 'fiat' ? (
              <motion.div
                key="fiat"
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]"
              >
                <div>
                  <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                    {copy.payWith}
                  </p>

                  <div className="mt-3 space-y-2.5">
                    {rails.length === 0 ? (
                      <div className="h-24 animate-pulse rounded-xl border border-white/8 bg-white/[0.02]" />
                    ) : (
                      rails.map((item) => (
                        <button
                          key={item.rail}
                          type="button"
                          onClick={() => setRail(item.rail)}
                          aria-pressed={rail === item.rail}
                          className={`w-full rounded-xl border p-4 text-start transition ${
                            rail === item.rail
                              ? 'border-cyan/55 bg-cyan/[0.06]'
                              : 'border-white/8 bg-white/[0.02] hover:border-white/20'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-[0.88rem] font-semibold text-ink">
                              {RAIL_LABEL[item.rail]}
                            </span>
                            <span className={`mx-chip !px-2 !py-0.5 !text-[0.58rem] ${modeTone(item.mode)}`}>
                              {item.mode === 'sandbox' ? copy.notConfigured : item.mode}
                            </span>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {item.supports.slice(0, 4).map((support) => (
                              <span
                                key={support}
                                className="rounded border border-white/10 px-1.5 py-0.5 text-[0.58rem] text-ink-mute"
                              >
                                {support}
                              </span>
                            ))}
                          </div>
                          <p className="mt-2 text-[0.68rem] leading-relaxed text-ink-faint">{item.detail}</p>
                        </button>
                      ))
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={startFiat}
                    disabled={busy || !Number.isFinite(numericAmount) || numericAmount <= 0}
                    className="mx-btn mt-5 w-full"
                  >
                    {busy ? `${copy.opening}…` : copy.openCheckout}
                  </button>

                  <p className="mt-3 text-[0.68rem] leading-relaxed text-ink-faint">{copy.cardNote}</p>
                </div>

                <aside className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
                  <p className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                    {copy.ownerBank}
                  </p>

                  {owner ? (
                    <dl className="mt-4 space-y-3 text-[0.78rem]">
                      <div>
                        <dt className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
                          {copy.railMode}
                        </dt>
                        <dd className="mt-0.5 text-ink-soft">
                          {owner.configured ? copy.configured : copy.notConfigured}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">IBAN</dt>
                        <dd className="mx-numeric mt-0.5 text-ink">{owner.ibanMasked ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">SWIFT</dt>
                        <dd className="mx-numeric mt-0.5 text-ink">{owner.swift ?? '—'}</dd>
                      </div>
                      <div>
                        <dt className="text-[0.62rem] tracking-[0.1em] text-ink-faint uppercase">
                          {owner.bankName}
                        </dt>
                        <dd className="mt-0.5 text-ink-soft">
                          {owner.accountHolder} · {owner.country}
                        </dd>
                      </div>
                    </dl>
                  ) : (
                    <p className="mt-4 text-[0.76rem] text-ink-faint">{t.common.loading}…</p>
                  )}

                  <p className="mt-5 border-t border-white/8 pt-4 text-[0.68rem] leading-relaxed text-ink-faint">
                    {copy.settleNote}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {[copy.applePay, copy.localWallets].map((label) => (
                      <span key={label} className="mx-chip !text-[0.58rem]">
                        {label}
                      </span>
                    ))}
                  </div>
                </aside>
              </motion.div>
            ) : (
              <motion.div
                key="crypto"
                initial={{ opacity: 0, y: reduce ? 0 : 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22 }}
                className="mt-6 grid gap-6 lg:grid-cols-[0.95fr_1.05fr]"
              >
                <div>
                  <label
                    htmlFor="checkout-amount"
                    className="text-[0.7rem] font-semibold tracking-[0.14em] text-ink-faint uppercase"
                  >
                    {copy.amountLabel} (USD)
                  </label>
                  <input
                    id="checkout-amount"
                    inputMode="decimal"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value.replace(/[^0-9.]/g, ''))}
                    className="mx-numeric mt-2 w-full rounded-xl border border-white/12 bg-[#04060d] px-4 py-3 text-[0.95rem] text-ink outline-none transition focus:border-cyan/55"
                  />

                  <p className="mt-5 text-[0.7rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">
                    {copy.selectNetwork}
                  </p>
                  <div className="mt-2.5 grid grid-cols-2 gap-2">
                    {networks.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setNetwork(item.id);
                          setIntent(null);
                          setVerdict(null);
                        }}
                        aria-pressed={network === item.id}
                        className={`rounded-lg border px-3 py-2.5 text-start transition ${
                          network === item.id
                            ? 'border-cyan/55 bg-cyan/[0.06]'
                            : 'border-white/8 bg-white/[0.02] hover:border-white/20'
                        } ${item.configured ? '' : 'opacity-55'}`}
                      >
                        <span className="block text-[0.76rem] font-semibold text-ink">{item.label}</span>
                        <span className="mt-0.5 flex items-center gap-1.5 text-[0.6rem] text-ink-faint">
                          {copy.minLabel} ${item.minAmount}
                          {item.demo ? (
                            <span className="rounded border border-amber/35 px-1 text-[0.52rem] text-amber">
                              {copy.demo}
                            </span>
                          ) : null}
                        </span>
                      </button>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={createIntent}
                    disabled={busy || !selectedNetwork?.configured || numericAmount < (selectedNetwork?.minAmount ?? 0)}
                    className="mx-btn mt-5 w-full"
                  >
                    {busy ? `${t.common.loading}…` : copy.openCheckout}
                  </button>

                  {selectedNetwork && !selectedNetwork.configured ? (
                    <p className="mt-3 text-[0.7rem] text-amber">{copy.notConfigured}</p>
                  ) : null}
                  {selectedNetwork?.demo ? (
                    <p className="mt-3 text-[0.7rem] text-amber">{copy.demo}</p>
                  ) : null}
                </div>

                <div className="rounded-xl border border-white/8 bg-white/[0.02] p-5">
                  {!intent ? (
                    <div className="grid h-full min-h-[15rem] place-items-center text-center">
                      <div>
                        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-dashed border-white/15 text-2xl text-ink-faint">
                          ⬡
                        </div>
                        <p className="mt-4 max-w-[16rem] text-[0.76rem] leading-relaxed text-ink-faint">
                          {copy.cryptoLead}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">
                            {copy.amountDue}
                          </p>
                          <p className="mx-numeric mt-1 text-lg font-bold text-ink">
                            {intent.assetAmount} {selectedNetwork?.asset ?? ''}
                          </p>
                          <p className="mx-numeric text-[0.68rem] text-ink-faint">
                            ≈ ${intent.amountUsd.toFixed(2)} · {intent.id}
                          </p>
                        </div>
                        <span className="mx-chip !text-[0.56rem]">
                          {copy.expiryLabel} {minutesLeft}m
                        </span>
                      </div>

                      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={intent.qrDataUrl}
                          alt={copy.qrAlt}
                          width={168}
                          height={168}
                          className="rounded-xl border border-white/10 bg-white p-1.5"
                        />

                        <div className="min-w-0 flex-1">
                          <p className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">
                            {copy.addressLabel}
                          </p>
                          <p className="mx-numeric mt-1.5 break-all text-[0.72rem] leading-relaxed text-ink">
                            {intent.address}
                          </p>
                          <button
                            type="button"
                            onClick={() => copyText(intent.address, 'address')}
                            className="mx-btn-quiet mt-3 w-full !px-3 !py-1.5 !text-[0.7rem]"
                          >
                            {copied === 'address' ? copy.copied : copy.copy}
                          </button>

                          <p className="mt-3 text-[0.62rem] leading-relaxed text-ink-faint">
                            {selectedNetwork?.chain} · {copy.minLabel} ${selectedNetwork?.minAmount}
                          </p>
                        </div>
                      </div>

                      <div className="mx-rule my-5" />

                      <label
                        htmlFor="tx-hash"
                        className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase"
                      >
                        {copy.txHashLabel}
                      </label>
                      <input
                        id="tx-hash"
                        value={txHash}
                        onChange={(event) => setTxHash(event.target.value.trim())}
                        placeholder="0x…"
                        className="mx-numeric mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.76rem] text-ink outline-none transition focus:border-cyan/55"
                      />
                      <button
                        type="button"
                        onClick={verify}
                        disabled={verifying || txHash.length < 32}
                        className="mx-btn-quiet mt-3 w-full !py-2.5 !text-[0.78rem]"
                      >
                        {verifying ? `${copy.verifying}…` : copy.verify}
                      </button>

                      {verdict ? (
                        <div
                          className={`mt-4 rounded-lg border px-3.5 py-3 text-[0.74rem] leading-relaxed ${
                            verdict.state === 'verified'
                              ? 'border-mint/40 bg-mint/8 text-mint'
                              : verdict.state === 'failed'
                                ? 'border-rose/40 bg-rose/8 text-rose'
                                : verdict.state === 'unavailable'
                                  ? 'border-amber/40 bg-amber/8 text-amber'
                                  : 'border-cyan/40 bg-cyan/8 text-cyan'
                          }`}
                        >
                          <p className="font-semibold">
                            {verdict.state === 'verified'
                              ? copy.verified
                              : verdict.state === 'failed'
                                ? copy.failed
                                : verdict.state === 'unavailable'
                                  ? copy.pending
                                  : copy.pending}
                          </p>
                          <p className="mt-1 opacity-85">{verdict.detail}</p>
                          {verdict.confirmations > 0 ? (
                            <p className="mx-numeric mt-1 opacity-75">
                              {verdict.confirmations} confirmations
                              {verdict.creditedUsd > 0 ? ` · $${verdict.creditedUsd.toFixed(2)}` : ''}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/8 px-5 py-4 sm:px-7">
          <button type="button" onClick={onClose} className="mx-btn-quiet !px-4 !py-2 !text-[0.76rem]">
            {copy.close}
          </button>
          <p className="text-[0.66rem] text-ink-faint">
            {copy.ownerWallet}:{' '}
            <span className="mx-numeric">
              {networks.filter((item) => item.configured).length}/{networks.length || 7} {copy.configured}
            </span>
          </p>
        </footer>
      </motion.div>
    </div>
  );
}
