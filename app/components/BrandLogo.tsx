'use client';

import React, { useId, useMemo } from 'react';

import { useI18n } from '@/lib/i18n-provider';

/**
 * The MineAI institutional mark.
 *
 * A precision quantum node — a hexagonal lattice cut into six facets — wrapped
 * around an interlocking monogram. The two strokes of the M are separate metals:
 * the left spine is brushed royal gold, the right is electric cyan, and they
 * cross at a diamond core that reads as a node on the lattice. Every gradient id
 * is namespaced with `useId` because the lockup appears in the header, the
 * footer and the auth vault on the same page.
 *
 * The mark is drawn on a 64-unit grid with 0.5px sub-pixel alignment so it stays
 * sharp from a 16px favicon to a 220px hero.
 */

export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl';

const FRAME: Record<BrandLogoSize, { box: string; word: string; node: string; sub: string; gap: string }> = {
  sm: { box: 'h-9 w-9', word: 'text-[0.92rem]', node: 'text-[0.46rem]', sub: 'text-[0.52rem]', gap: 'gap-2.5' },
  md: { box: 'h-11 w-11', word: 'text-[1.06rem]', node: 'text-[0.5rem]', sub: 'text-[0.58rem]', gap: 'gap-3' },
  lg: { box: 'h-14 w-14', word: 'text-[1.32rem]', node: 'text-[0.56rem]', sub: 'text-[0.64rem]', gap: 'gap-3.5' },
  xl: { box: 'h-20 w-20', word: 'text-[1.9rem]', node: 'text-[0.62rem]', sub: 'text-[0.72rem]', gap: 'gap-4' },
};

export default function BrandLogo({
  size = 'md',
  showTagline = true,
  showNode = true,
  href = '/',
  asLink = true,
  className = '',
}: {
  size?: BrandLogoSize;
  showTagline?: boolean;
  showNode?: boolean;
  href?: string;
  asLink?: boolean;
  className?: string;
}) {
  const { t, href: to } = useI18n();
  const scale = FRAME[size];
  const rawId = useId();
  const id = useMemo(() => `brand-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [rawId]);

  const emblem = (
    <span className={`relative grid shrink-0 ${scale.box} place-items-center`}>
      {/* Ambient bloom, only on approach. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1.5 rounded-[38%] bg-[radial-gradient(circle_at_38%_32%,rgba(245,215,127,0.34),rgba(6,182,212,0.16)_52%,transparent_72%)] opacity-0 blur-md transition-opacity duration-500 group-hover/logo:opacity-100"
      />
      {/* Outer precision ring released on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[30%] border border-amber/30 opacity-0 group-hover/logo:animate-[mx-ring_1.5s_cubic-bezier(0.22,1,0.36,1)_infinite]"
      />

      <svg viewBox="0 0 64 64" className={`relative ${scale.box}`} role="presentation" aria-hidden>
        <defs>
          <linearGradient id={`${id}-gold`} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="#FFF6D2" />
            <stop offset="26%" stopColor="#F5D77F" />
            <stop offset="58%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#9A7414" />
          </linearGradient>
          <linearGradient id={`${id}-cyan`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#A5F3FC" />
            <stop offset="45%" stopColor="#22D3EE" />
            <stop offset="100%" stopColor="#0693AD" />
          </linearGradient>
          <linearGradient id={`${id}-frame`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgba(245,215,127,0.9)" />
            <stop offset="46%" stopColor="rgba(212,175,55,0.34)" />
            <stop offset="100%" stopColor="rgba(6,182,212,0.72)" />
          </linearGradient>
          <linearGradient id={`${id}-facet`} x1="0" y1="0" x2="0.4" y2="1">
            <stop offset="0%" stopColor="rgba(248,250,252,0.1)" />
            <stop offset="100%" stopColor="rgba(6,8,13,0)" />
          </linearGradient>
          <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="48%" stopColor="rgba(255,255,255,0.85)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id={`${id}-core`} cx="42%" cy="38%" r="62%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="52%" stopColor="#BFEFFF" />
            <stop offset="100%" stopColor="#06B6D4" />
          </radialGradient>
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`${id}-clip`}>
            <path d="M32 3.2 56.6 17.6v28.8L32 60.8 7.4 46.4V17.6Z" />
          </clipPath>
        </defs>

        {/* Obsidian body of the node */}
        <path
          d="M32 3.2 56.6 17.6v28.8L32 60.8 7.4 46.4V17.6Z"
          fill="#06080D"
          stroke={`url(#${id}-frame)`}
          strokeWidth="1.35"
          strokeLinejoin="round"
        />
        {/* Inner bevel */}
        <path
          d="M32 7.4 52.8 19.4v25.2L32 56.6 11.2 44.6V19.4Z"
          fill="none"
          stroke="rgba(248,250,252,0.14)"
          strokeWidth="0.7"
          strokeLinejoin="round"
        />

        {/* Six lattice facets: every vertex is a quantum node */}
        <g clipPath={`url(#${id}-clip)`} aria-hidden>
          <path d="M32 3.2 32 32 7.4 17.6Z" fill={`url(#${id}-facet)`} />
          <path d="M32 32 56.6 17.6 32 3.2Z" fill="rgba(6,182,212,0.05)" />
          <path d="M7.4 46.4 32 32 32 60.8Z" fill="rgba(245,215,127,0.05)" />
          <path d="M56.6 46.4 32 60.8 32 32Z" fill={`url(#${id}-facet)`} />
          <path d="M7.4 17.6 32 32 7.4 46.4Z" fill="rgba(248,250,252,0.03)" />
          <path d="M56.6 17.6 56.6 46.4 32 32Z" fill="rgba(6,182,212,0.04)" />
        </g>

        {/* Lattice edges drawn as hairline telemetry */}
        <g stroke="rgba(248,250,252,0.1)" strokeWidth="0.5" aria-hidden>
          <path d="M32 3.2V32M32 32v28.8M7.4 17.6 32 32l24.6-14.4M7.4 46.4 32 32l24.6 14.4" fill="none" />
        </g>

        {/* ------------------------------- Interlocking M + node core */}
        <g filter={`url(#${id}-glow)`}>
          {/* Gold spine: a cut diamond stroke */}
          <path
            d="M17.4 47.2V20.6L32 36.4"
            fill="none"
            stroke={`url(#${id}-gold)`}
            strokeWidth="4.6"
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeMiterlimit={3}
          />
          {/* Cyan counter-spine, crossing behind the core */}
          <path
            d="M46.6 47.2V20.6L32 36.4"
            fill="none"
            stroke={`url(#${id}-cyan)`}
            strokeWidth="4.6"
            strokeLinecap="square"
            strokeLinejoin="miter"
            strokeMiterlimit={3}
          />
          {/* Hairline highlight on the gold face */}
          <path
            d="M17.4 47.2V20.6L32 36.4"
            fill="none"
            stroke="rgba(255,250,230,0.65)"
            strokeWidth="0.9"
            strokeLinecap="square"
          />
        </g>

        {/* The crossing is the node: a faceted diamond with a live pupil */}
        <path
          d="M32 30.2 36.4 36.4 32 42.6 27.6 36.4Z"
          fill="#06080D"
          stroke={`url(#${id}-gold)`}
          strokeWidth="1.1"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="36.4" r="2.55" fill={`url(#${id}-core)`} />
        <circle cx="32" cy="36.4" r="4.6" fill="none" stroke="rgba(6,182,212,0.42)" strokeWidth="0.55" />

        {/* Vertex pins */}
        <g fill="#F8FAFC" aria-hidden>
          <circle cx="32" cy="3.2" r="1.05" />
          <circle cx="56.6" cy="17.6" r="1.05" />
          <circle cx="56.6" cy="46.4" r="1.05" />
          <circle cx="32" cy="60.8" r="1.05" />
          <circle cx="7.4" cy="46.4" r="1.05" />
          <circle cx="7.4" cy="17.6" r="1.05" />
        </g>

        {/* Hover sheen sweeping across the emblem */}
        <rect
          x="-24"
          y="0"
          width="24"
          height="64"
          fill={`url(#${id}-sheen)`}
          clipPath={`url(#${id}-clip)`}
          className="mx-logo-sheen"
          aria-hidden
        />
      </svg>
    </span>
  );

  const wordmark = (
    <span className={`flex min-w-0 flex-col justify-center leading-none ${size === 'sm' ? 'gap-1' : 'gap-1.5'}`}>
      <span className="flex items-baseline gap-2">
        <span className={`mx-brand-word ${scale.word} font-extrabold tracking-[0.2em]`}>
          {t.brand.name.toUpperCase()}
        </span>
        {showNode ? (
          <span
            className={`rounded-[4px] border border-amber/35 px-[0.34rem] py-[0.1rem] ${scale.node} font-bold tracking-[0.18em] text-amber/90 uppercase`}
          >
            {t.brand.product.toUpperCase()}
          </span>
        ) : null}
      </span>
      {showTagline ? (
        <span className={`${scale.sub} max-w-[19rem] truncate font-medium tracking-[0.16em] text-ink-faint uppercase`}>
          {t.brand.tagline}
        </span>
      ) : null}
    </span>
  );

  if (!asLink) {
    return (
      <span className={`group/logo relative flex items-center ${scale.gap} ${className}`}>
        {emblem}
        {wordmark}
      </span>
    );
  }

  return (
    <a
      href={to(href)}
      aria-label={`${t.brand.name} ${t.brand.product} — ${t.brand.tagline}`}
      className={`group/logo relative flex items-center ${scale.gap} rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-amber/45 ${className}`}
    >
      {emblem}
      {wordmark}
    </a>
  );
}
