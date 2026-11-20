'use client';

import React, { useId, useMemo } from 'react';

import { useI18n } from '@/lib/i18n-provider';

/**
 * The MineAI royal monogram.
 *
 * A chamfered diamond shield struck in champagne gold, holding a sculpted "M"
 * whose centre valley rises into a crown spire — the mark reads as a crest at
 * 220px and as a clean golden lozenge at 16px. A faint prismatic refraction
 * sits behind the shield so the metal appears to bend light rather than glow.
 *
 * Every gradient id is namespaced with `useId` because the lockup is mounted in
 * the header, the footer and the auth vault on the same document, and duplicate
 * SVG ids resolve to the first definition.
 */

export type BrandLogoSize = 'sm' | 'md' | 'lg' | 'xl';

const FRAME: Record<BrandLogoSize, { box: string; word: string; node: string; sub: string; gap: string }> = {
  sm: { box: 'h-9 w-9', word: 'text-[0.92rem]', node: 'text-[0.46rem]', sub: 'text-[0.52rem]', gap: 'gap-2.5' },
  md: { box: 'h-11 w-11', word: 'text-[1.06rem]', node: 'text-[0.5rem]', sub: 'text-[0.58rem]', gap: 'gap-3' },
  lg: { box: 'h-14 w-14', word: 'text-[1.32rem]', node: 'text-[0.56rem]', sub: 'text-[0.64rem]', gap: 'gap-3.5' },
  xl: { box: 'h-20 w-20', word: 'text-[1.9rem]', node: 'text-[0.62rem]', sub: 'text-[0.72rem]', gap: 'gap-4' },
};

/** Chamfered diamond shield — the crest's outer plate. */
const SHIELD = 'M48 3 L85 24.5 V63.5 L48 93 L11 63.5 V24.5 Z';
/** Same plate inset by 3.4 units: the engraved second hairline. */
const INNER = 'M48 7.6 L81.2 26.6 V61.4 L48 88.4 L14.8 61.4 V26.6 Z';
/** Sculptural M: two gold spines and the valley that becomes the spire. */
const MONOGRAM = 'M29 71 V41.5 L48 58.5 L67 41.5 V71';
/** The crown spire rising out of the M's valley to the apex. */
const SPIRE = 'M48 58.5 V13.5';

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
      {/* Warm bloom, only on approach. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-1.5 rounded-[34%] bg-[radial-gradient(circle_at_40%_30%,rgba(255,241,193,0.34),rgba(182,141,58,0.18)_54%,transparent_74%)] opacity-0 blur-md transition-opacity duration-500 group-hover/logo:opacity-100"
      />
      {/* Prismatic halo released on hover — the refraction pass. */}
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-2 rounded-full opacity-0 blur-xl transition-opacity duration-500 group-hover/logo:opacity-70"
        style={{
          background:
            'conic-gradient(from 210deg, rgba(226,194,117,0.32), rgba(52,211,153,0.22), rgba(255,241,193,0.3), rgba(182,141,58,0.24), rgba(226,194,117,0.32))',
        }}
      />
      {/* Engraved ring released on hover. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[30%] border border-gold/35 opacity-0 group-hover/logo:animate-[mx-ring_1.5s_cubic-bezier(0.22,1,0.36,1)_infinite]"
      />

      <svg viewBox="0 0 96 96" className={`relative ${scale.box}`} role="presentation" aria-hidden>
        <defs>
          {/* Champagne ramp: highlight upper-left, shadow lower-right. */}
          <linearGradient id={`${id}-gold`} x1="0.12" y1="0" x2="0.88" y2="1">
            <stop offset="0%" stopColor="#FFF9E6" />
            <stop offset="18%" stopColor="#FFF1C1" />
            <stop offset="44%" stopColor="#E2C275" />
            <stop offset="72%" stopColor="#B68D3A" />
            <stop offset="100%" stopColor="#8A6A22" />
          </linearGradient>
          <linearGradient id={`${id}-gold-soft`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#FFF1C1" />
            <stop offset="50%" stopColor="#D9B463" />
            <stop offset="100%" stopColor="#9C7A2C" />
          </linearGradient>
          <linearGradient id={`${id}-edge`} x1="0.1" y1="0" x2="0.9" y2="1">
            <stop offset="0%" stopColor="rgba(255,241,193,0.92)" />
            <stop offset="42%" stopColor="rgba(226,194,117,0.34)" />
            <stop offset="100%" stopColor="rgba(182,141,58,0.86)" />
          </linearGradient>
          <radialGradient id={`${id}-plate`} cx="36%" cy="26%" r="82%">
            <stop offset="0%" stopColor="#191519" />
            <stop offset="58%" stopColor="#0E0C10" />
            <stop offset="100%" stopColor="#050507" />
          </radialGradient>
          <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0)" />
            <stop offset="46%" stopColor="rgba(255,253,240,0.9)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0)" />
          </linearGradient>
          <radialGradient id={`${id}-core`} cx="42%" cy="34%" r="64%">
            <stop offset="0%" stopColor="#FFFDF4" />
            <stop offset="48%" stopColor="#FFF1C1" />
            <stop offset="100%" stopColor="#B68D3A" />
          </radialGradient>
          <filter id={`${id}-strike`} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow dx="0.5" dy="1" stdDeviation="0.7" floodColor="#3A2A08" floodOpacity="0.7" />
          </filter>
          <filter id={`${id}-glow`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="1.1" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <clipPath id={`${id}-clip`}>
            <path d={SHIELD} />
          </clipPath>
        </defs>

        {/* ---------------------------------------------- Prism refraction */}
        <g clipPath={`url(#${id}-clip)`} className="mx-refract" aria-hidden opacity="0.5">
          <path d={SHIELD} transform="translate(-1.15,0)" fill="rgba(232,133,143,0.2)" />
          <path d={SHIELD} transform="translate(1.15,0)" fill="rgba(52,211,153,0.18)" />
          <path d={SHIELD} transform="translate(0,1.15)" fill="rgba(255,241,193,0.2)" />
        </g>

        {/* ---------------------------------------------- Shield plate */}
        <path d={SHIELD} fill={`url(#${id}-plate)`} stroke={`url(#${id}-edge)`} strokeWidth="1.9" strokeLinejoin="miter" />
        <path d={INNER} fill="none" stroke="rgba(255,241,193,0.16)" strokeWidth="0.7" strokeLinejoin="miter" />

        {/* Milled edge: short hairlines around the chamfers, machined not painted */}
        <g aria-hidden stroke="rgba(255,241,193,0.2)" strokeWidth="0.45">
          <path d="M48 3.9V7.2M85 24.9v3.1M85 60v3.1M48 92.1v-3.1M11 60v3.1M11 24.9v3.1" />
        </g>

        {/* ---------------------------------------------- The M and its spire */}
        <g filter={`url(#${id}-strike)`}>
          {/* Occlusion under the gold, so the relief sits *in* the plate */}
          <path d={MONOGRAM} fill="none" stroke="rgba(0,0,0,0.72)" strokeWidth="8.4" strokeLinecap="square" strokeLinejoin="miter" transform="translate(0.9,1.4)" />
          <path d={MONOGRAM} fill="none" stroke={`url(#${id}-gold)`} strokeWidth="7.2" strokeLinecap="square" strokeLinejoin="miter" />
          {/* Chamfer light walking the upper edge */}
          <path d={MONOGRAM} fill="none" stroke="rgba(255,253,240,0.72)" strokeWidth="0.9" strokeLinecap="square" strokeLinejoin="miter" transform="translate(-0.7,-0.8)" />

          {/* Spire: a tapering needle out of the valley */}
          <path d={SPIRE} fill="none" stroke="rgba(0,0,0,0.66)" strokeWidth="5.4" strokeLinecap="round" transform="translate(0.8,1.2)" />
          <path d={SPIRE} fill="none" stroke={`url(#${id}-gold-soft)`} strokeWidth="4.2" strokeLinecap="round" />

          {/* Crown finial: a cut diamond at the apex */}
          <path d="M48 7.4 51.4 12.4 48 17.4 44.6 12.4Z" fill={`url(#${id}-core)`} stroke="rgba(58,42,8,0.7)" strokeWidth="0.6" strokeLinejoin="round" />
          <path d="M48 8.6 50.2 12.4 48 16.2" fill="none" stroke="rgba(255,253,242,0.6)" strokeWidth="0.45" />
        </g>

        {/* Ticker plinth — the base of the crest */}
        <g filter={`url(#${id}-glow)`} aria-hidden>
          <rect x="33" y="76.4" width="30" height="5.4" rx="1.6" fill="rgba(226,194,117,0.14)" stroke="rgba(255,241,193,0.34)" strokeWidth="0.5" />
          <path d="M36.4 79.1h23.2" stroke="rgba(255,241,193,0.55)" strokeWidth="0.55" strokeLinecap="round" />
        </g>

        {/* Hover sheen sweeping across the plate */}
        <rect
          x="-30"
          y="0"
          width="30"
          height="96"
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
            className={`rounded-[4px] border border-gold/35 px-[0.34rem] py-[0.1rem] ${scale.node} font-bold tracking-[0.18em] text-gold/90 uppercase`}
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
      className={`group/logo relative flex items-center ${scale.gap} rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-gold/45 ${className}`}
    >
      {emblem}
      {wordmark}
    </a>
  );
}
