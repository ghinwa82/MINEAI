'use client';

import React from 'react';
import { useI18n } from '@/lib/i18n-provider';

/**
 * The MineAI mark.
 *
 * A compute cell drawn around a stylised M: the outer frame is the node
 * boundary, the dashed orbit is the mesh it is tethered to, and the diagonal
 * seam is the data path through the core. The whole lockup reacts to hover —
 * the gradient sweeps, the orbit spins up and a flare crosses the wordmark.
 */
export default function Logo({
  size = 'md',
  showTagline = true,
  href = '/',
}: {
  size?: 'sm' | 'md' | 'lg';
  showTagline?: boolean;
  href?: string;
}) {
  const { t, href: to } = useI18n();

  const frame = size === 'sm' ? 'h-9 w-9' : size === 'lg' ? 'h-14 w-14' : 'h-11 w-11';
  const radius = size === 'sm' ? 'rounded-[11px]' : size === 'lg' ? 'rounded-[17px]' : 'rounded-[14px]';

  return (
    <a
      href={to(href)}
      className="group/logo relative flex items-center gap-3 rounded-xl outline-none"
      aria-label={`${t.brand.name} ${t.brand.product}`}
    >
      <span className={`relative grid ${frame} place-items-center`}>
        {/* Ambient bloom that only appears on approach. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -inset-2 rounded-[18px] bg-[radial-gradient(circle_at_50%_50%,rgba(34,224,255,0.42),rgba(34,224,255,0)_68%)] opacity-0 blur-lg transition-opacity duration-500 group-hover/logo:opacity-100"
        />
        {/* Pulse ring released on hover. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-[14px] border border-cyan-300/45 opacity-0 group-hover/logo:animate-[mx-ring_1.4s_cubic-bezier(0.22,1,0.36,1)_infinite]"
        />

        <svg viewBox="0 0 48 48" className={`relative ${frame}`} role="presentation">
          <defs>
            <linearGradient id="mxMarkSweep" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8ef4ff" />
              <stop offset="38%" stopColor="#22e0ff" />
              <stop offset="72%" stopColor="#4ade9f" />
              <stop offset="100%" stopColor="#8ef4ff" />
            </linearGradient>
            <linearGradient id="mxMarkFrame" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="rgba(142,244,255,0.85)" />
              <stop offset="55%" stopColor="rgba(34,224,255,0.35)" />
              <stop offset="100%" stopColor="rgba(74,222,159,0.6)" />
            </linearGradient>
            <radialGradient id="mxMarkCore" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#eaffff" />
              <stop offset="100%" stopColor="#22e0ff" />
            </radialGradient>
          </defs>

          {/* Node boundary */}
          <rect
            x="1.4"
            y="1.4"
            width="45.2"
            height="45.2"
            rx="12.4"
            fill="rgba(5,8,16,0.82)"
            stroke="url(#mxMarkFrame)"
            strokeWidth="1.3"
          />

          {/* Mesh orbit */}
          <rect
            x="4.6"
            y="4.6"
            width="38.8"
            height="38.8"
            rx="10"
            fill="none"
            stroke="rgba(34,224,255,0.42)"
            strokeWidth="1"
            strokeDasharray="3 9"
            strokeLinecap="round"
            className="origin-center animate-[mx-spin_14s_linear_infinite]"
          />

          {/* Data seam */}
          <path
            d="M9 39 L24 24 L39 39"
            fill="none"
            stroke="rgba(34,224,255,0.22)"
            strokeWidth="1"
          />

          {/* The M */}
          <path
            d="M14.5 34.5V14.5L24 25.5L33.5 14.5V34.5"
            fill="none"
            stroke="url(#mxMarkSweep)"
            strokeWidth="2.7"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-glyph"
          />

          {/* Core */}
          <circle cx="24" cy="25.5" r="2.9" fill="#04060d" />
          <circle cx="24" cy="25.5" r="2.9" fill="none" stroke="url(#mxMarkCore)" strokeWidth="1.5" />

          {/* Traversal light */}
          <circle r="1.5" fill="#eaffff" className="mx-pip" />
        </svg>
      </span>

      <span className="flex min-w-0 flex-col gap-1 leading-none">
        <span className="flex items-baseline gap-2">
          <span className="mx-wordmark text-[1.05rem] font-extrabold tracking-[0.16em] sm:text-[1.15rem]">
            {t.brand.name.toUpperCase()}
          </span>
          <span className="mx-wordmark-node">{t.brand.product.toUpperCase()}</span>
        </span>
        {showTagline ? (
          <span className="mx-wordmark-sub truncate text-[0.625rem] font-medium tracking-[0.14em] uppercase">
            {t.brand.tagline}
          </span>
        ) : null}
      </span>
    </a>
  );
}
