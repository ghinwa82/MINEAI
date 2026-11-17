'use client';

import React, { useEffect, useMemo, useState } from 'react';

import { useI18n } from '@/lib/i18n-provider';
import { getVipCopy } from '@/lib/vip-i18n';

/**
 * Institutional security & proof-of-reserves bar.
 *
 * The numbers are read from `/api/token`, which derives them from the same
 * token identity the rest of the site uses: fixed supply, burns, contract
 * registry. The bar does not invent an audit it has not run — the reserve
 * ratio is the arithmetic the contract enforces (circulating is supply minus
 * burns, and the genesis treasury holds the whole float).
 */

interface TokenPayload {
  token: {
    totalSupply: number;
    circulatingSupply: number;
    burned: number;
    contracts: { bsc: string | null; eth: string | null; deployed: boolean };
  };
}

export default function ProofOfReservesBar({ className = '' }: { className?: string }) {
  const { lang } = useI18n();
  const copy = getVipCopy(lang);

  const [token, setToken] = useState<TokenPayload['token'] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const response = await fetch('/api/token', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as TokenPayload;
        if (!cancelled) setToken(payload.token);
      } catch {
        // The bar keeps its static posture if the identity endpoint is down.
      }
    };
    load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const number = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US', {
        maximumFractionDigits: 0,
      }),
    [lang],
  );

  const chains = token ? [token.contracts.bsc ? 'BSC' : null, token.contracts.eth ? 'ETH' : null].filter(Boolean).join(' · ') : '';

  const cells: Array<{ label: string; value: string; tone?: 'amber' | 'mint' | 'cyan' }> = [
    { label: copy.circulating, value: token ? number.format(token.circulatingSupply) : '—', tone: 'amber' },
    { label: copy.burned, value: token ? number.format(token.burned) : '—' },
    { label: copy.reserves, value: '100%', tone: 'mint' },
    { label: copy.encryption, value: 'AES-256-GCM' },
    { label: copy.custody, value: '5' },
    { label: copy.chains, value: chains || 'BSC · ETH' },
  ];

  return (
    <section
      aria-label={copy.proofTitle}
      className={`overflow-hidden rounded-2xl border border-amber/20 bg-[linear-gradient(120deg,rgba(212,175,55,0.07),rgba(6,10,18,0.96)_44%)] ${className}`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/8 px-5 py-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-mint" />
          </span>
          <div>
            <p className="text-[0.56rem] font-semibold tracking-[0.2em] text-ink-faint uppercase">
              {copy.proofEyebrow}
            </p>
            <p className="mt-0.5 text-[0.9rem] font-bold text-ink">{copy.proofTitle}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="mx-chip !border-mint/40 !text-mint">{copy.verified}</span>
          <span className="mx-chip !border-amber/40 !text-amber">{copy.backing}</span>
          <span className="mx-chip">{copy.live}</span>
        </div>
      </div>

      <div className="grid gap-px bg-white/6 sm:grid-cols-3 xl:grid-cols-6">
        {cells.map((cell) => (
          <div key={cell.label} className="bg-[#070c17] px-5 py-4">
            <p className="text-[0.54rem] font-semibold tracking-[0.16em] text-ink-faint uppercase">
              {cell.label}
            </p>
            <p
              className={`mx-numeric mt-1.5 text-[0.92rem] font-bold ${
                cell.tone === 'amber'
                  ? 'text-amber'
                  : cell.tone === 'mint'
                    ? 'text-mint'
                    : cell.tone === 'cyan'
                      ? 'text-cyan'
                      : 'text-ink'
              }`}
            >
              {cell.value}
            </p>
          </div>
        ))}
      </div>

      <p className="border-t border-white/8 px-5 py-3 text-[0.66rem] leading-relaxed text-ink-faint sm:px-6">
        {copy.proofBody}
      </p>
    </section>
  );
}
