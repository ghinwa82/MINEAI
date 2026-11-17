'use client';

import React, { useId, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * The $MINEAI coin.
 *
 * Drawn as a physical object rather than an icon: a reeded rim cut from a
 * conic gradient, a face turned from #D4AF37 into #FFF3B0, three guilloché
 * bands engraved with a rose curve, a crowned lion's head struck in relief and
 * an embossed M below it. Pointer position drives a spring tilt; the specular
 * sweeps only run while the coin is hovered, so an idle page stays still.
 *
 * Every gradient id is namespaced with `useId` because the coin appears more
 * than once on a page and duplicated SVG ids resolve to the first definition.
 */

const CX = 120;
const CY = 120;

/** A rose curve sampled into one closed path — the guilloché engine. */
function rosePath(petals: number, amplitude: number, base: number, phase = 0): string {
  const steps = 480;
  const points: string[] = [];
  for (let index = 0; index <= steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2;
    const radius = base + amplitude * Math.sin(petals * angle + phase);
    const x = CX + Math.cos(angle) * radius;
    const y = CY + Math.sin(angle) * radius;
    points.push(`${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`);
  }
  return `${points.join(' ')} Z`;
}

/** A scalloped mane: alternating outer and inner radii joined by quadratics. */
function manePath(lobes: number, outer: number, inner: number): string {
  const steps = lobes * 2;
  const points: { x: number; y: number }[] = [];
  for (let index = 0; index < steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2 - Math.PI / 2;
    const radius = index % 2 === 0 ? outer : inner;
    points.push({ x: 120 + Math.cos(angle) * radius, y: 92 + Math.sin(angle) * radius });
  }
  const first = points[0];
  const segments = points.map((point, index) => {
    const next = points[(index + 1) % points.length];
    return `Q${point.x.toFixed(2)} ${point.y.toFixed(2)} ${((point.x + next.x) / 2).toFixed(2)} ${(
      (point.y + next.y) /
      2
    ).toFixed(2)}`;
  });
  return `M${first.x.toFixed(2)} ${first.y.toFixed(2)} ${segments.join(' ')} Z`;
}

const GUILLOCHE = [
  rosePath(9, 7, 86),
  rosePath(9, 7, 86, Math.PI / 9),
  rosePath(17, 4, 74),
];

const MANE = manePath(13, 41, 32);

export default function MineAICoinLogo({
  size = 220,
  ticker = 'MINEAI',
  className = '',
}: {
  size?: number;
  ticker?: string;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const rawId = useId();
  const id = useMemo(() => `coin-${rawId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [rawId]);

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [15, -15]), {
    stiffness: 140,
    damping: 18,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-19, 19]), {
    stiffness: 140,
    damping: 18,
    mass: 0.6,
  });

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    pointerX.set((event.clientX - bounds.left) / bounds.width - 0.5);
    pointerY.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const reset = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  return (
    <div
      ref={ref}
      className={`group/coin relative grid place-items-center ${className}`}
      style={{ perspective: 900, width: size, height: size }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {/* Ambient gold bloom */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-20%] rounded-full opacity-55 blur-2xl transition-opacity duration-500 group-hover/coin:opacity-95"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(255,214,102,0.44), rgba(255,166,0,0.15) 46%, transparent 72%)',
        }}
      />

      <motion.div
        className="relative"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', width: size, height: size }}
      >
        {/* Cast shadow under the disc */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            transform: 'translateZ(-22px) translateY(10px) scale(0.98)',
            background: 'radial-gradient(circle at 50% 50%, #5c3a02 0%, #2c1a00 58%, #120a00 100%)',
            boxShadow: '0 30px 64px -20px rgba(0,0,0,0.92)',
          }}
        />

        {/* Reeded edge: a conic milled band sitting behind the face */}
        <div
          aria-hidden
          className="absolute inset-[1.5%] rounded-full"
          style={{
            transform: 'translateZ(-10px)',
            background:
              'repeating-conic-gradient(from 0deg, #6b4204 0deg 1.1deg, #f0c95a 1.1deg 1.9deg, #8a5a06 1.9deg 3deg)',
            boxShadow: 'inset 0 0 0 1px rgba(255,240,190,0.35), inset 0 0 18px rgba(60,36,0,0.75)',
          }}
        />

        <svg
          viewBox="0 0 240 240"
          className="relative block h-full w-full"
          role="img"
          aria-label={`$${ticker} coin — crowned lion, engraved guilloché, reeded edge`}
        >
          <defs>
            <radialGradient id={`${id}-face`} cx="36%" cy="26%" r="82%">
              <stop offset="0%" stopColor="#fffdf0" />
              <stop offset="16%" stopColor="#fff3b0" />
              <stop offset="38%" stopColor="#f6d061" />
              <stop offset="58%" stopColor="#e2ad2c" />
              <stop offset="78%" stopColor="#b57c10" />
              <stop offset="92%" stopColor="#7d4f05" />
              <stop offset="100%" stopColor="#4a2d02" />
            </radialGradient>
            <linearGradient id={`${id}-rim`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff3b0" />
              <stop offset="26%" stopColor="#e6b53c" />
              <stop offset="52%" stopColor="#8a5a06" />
              <stop offset="74%" stopColor="#f8d573" />
              <stop offset="100%" stopColor="#a96f08" />
            </linearGradient>
            <linearGradient id={`${id}-emboss`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffbe8" />
              <stop offset="42%" stopColor="#f9dd85" />
              <stop offset="56%" stopColor="#a86f0a" />
              <stop offset="100%" stopColor="#593803" />
            </linearGradient>
            <linearGradient id={`${id}-mane`} x1="0" y1="0" x2="0.8" y2="1">
              <stop offset="0%" stopColor="#fff0b8" />
              <stop offset="38%" stopColor="#e7b83f" />
              <stop offset="72%" stopColor="#b77d0e" />
              <stop offset="100%" stopColor="#7a4c05" />
            </linearGradient>
            <linearGradient id={`${id}-crown`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffbe0" />
              <stop offset="48%" stopColor="#f3ca5c" />
              <stop offset="100%" stopColor="#9a6606" />
            </linearGradient>
            <linearGradient id={`${id}-sweep`} x1="0" y1="0" x2="1" y2="0.45">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="44%" stopColor="rgba(255,255,255,0.82)" />
              <stop offset="56%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.6" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id={`${id}-relief`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="1.1" stdDeviation="0.7" floodColor="#4a2d02" floodOpacity="0.65" />
            </filter>
            <path
              id={`${id}-ring`}
              d={`M ${CX}, ${CY} m -90, 0 a 90,90 0 1,1 180,0 a 90,90 0 1,1 -180,0`}
              fill="none"
            />
            <clipPath id={`${id}-clip`}>
              <circle cx={CX} cy={CY} r="110" />
            </clipPath>
          </defs>

          {/* Reeded rim drawn as engraved ticks over the face edge */}
          <g aria-hidden>
            {Array.from({ length: 144 }).map((_, index) => {
              const angle = (index / 144) * Math.PI * 2;
              const inner = index % 3 === 0 ? 106 : 108.4;
              return (
                <line
                  key={index}
                  x1={CX + Math.cos(angle) * inner}
                  y1={CY + Math.sin(angle) * inner}
                  x2={CX + Math.cos(angle) * 113}
                  y2={CY + Math.sin(angle) * 113}
                  stroke={index % 3 === 0 ? 'rgba(74,45,2,0.55)' : 'rgba(255,243,176,0.42)'}
                  strokeWidth={index % 3 === 0 ? 1.4 : 0.8}
                  strokeLinecap="round"
                />
              );
            })}
          </g>

          {/* Face */}
          <circle cx={CX} cy={CY} r="110" fill={`url(#${id}-face)`} stroke={`url(#${id}-rim)`} strokeWidth="5" />
          <circle cx={CX} cy={CY} r="105" fill="none" stroke="rgba(255,248,214,0.55)" strokeWidth="1.1" />
          <circle cx={CX} cy={CY} r="99" fill="none" stroke="rgba(74,45,2,0.45)" strokeWidth="1.6" />

          {/* Guilloché engraving */}
          <g clipPath={`url(#${id}-clip)`} aria-hidden>
            {GUILLOCHE.map((path, index) => (
              <path
                key={index}
                d={path}
                fill="none"
                stroke={index === 2 ? 'rgba(255,243,176,0.3)' : 'rgba(74,45,2,0.24)'}
                strokeWidth={index === 2 ? 0.55 : 0.75}
              />
            ))}
            {Array.from({ length: 5 }).map((_, index) => (
              <circle
                key={index}
                cx={CX}
                cy={CY}
                r={92 + index * 2.2}
                fill="none"
                stroke="rgba(74,45,2,0.16)"
                strokeWidth="0.5"
                strokeDasharray={index % 2 === 0 ? '1 4' : '2 6'}
              />
            ))}
          </g>

          {/* Micro-text ring */}
          <text
            fill="rgba(74,45,2,0.72)"
            fontSize="7.6"
            fontWeight="700"
            letterSpacing="4.1"
            fontFamily="ui-monospace, monospace"
          >
            <textPath href={`#${id}-ring`} startOffset="2%">
              MINE AI · DECENTRALISED COMPUTE · $MINEAI · SEVEN RAILS · SIX LANGUAGES ·
            </textPath>
          </text>

          {/* ------------------------------------------ Crowned lion's head */}
          <g filter={`url(#${id}-relief)`}>
            {/* Mane */}
            <path d={MANE} fill={`url(#${id}-mane)`} stroke="rgba(74,45,2,0.7)" strokeWidth="1.1" />
            {/* Ears */}
            <path d="M105 76 q-4 -9 2 -13 q5 4 5 12 Z" fill="#e7b83f" stroke="rgba(74,45,2,0.6)" strokeWidth="0.9" />
            <path d="M135 76 q4 -9 -2 -13 q-5 4 -5 12 Z" fill="#e7b83f" stroke="rgba(74,45,2,0.6)" strokeWidth="0.9" />
            {/* Face */}
            <ellipse cx="120" cy="93" rx="17.5" ry="19.5" fill={`url(#${id}-face)`} stroke="rgba(74,45,2,0.55)" strokeWidth="0.9" />
            {/* Brow */}
            <path d="M110 86 q4 -3 8 0 M122 86 q4 -3 8 0" fill="none" stroke="rgba(74,45,2,0.75)" strokeWidth="1.3" strokeLinecap="round" />
            {/* Eyes */}
            <path d="M111.5 90 q3.2 -2.8 6.4 0 q-3.2 2.6 -6.4 0 Z" fill="#3a2301" />
            <path d="M122.1 90 q3.2 -2.8 6.4 0 q-3.2 2.6 -6.4 0 Z" fill="#3a2301" />
            <circle cx="113.6" cy="89.4" r="0.75" fill="#fff8d6" />
            <circle cx="124.2" cy="89.4" r="0.75" fill="#fff8d6" />
            {/* Muzzle */}
            <circle cx="115.6" cy="100.6" r="4.3" fill="rgba(255,246,206,0.55)" />
            <circle cx="124.4" cy="100.6" r="4.3" fill="rgba(255,246,206,0.55)" />
            <path d="M120 96.4 l-3.1 3.4 h6.2 Z" fill="#5c3a02" />
            <path d="M120 100.4 v3.2 M120 103.6 q-3.4 2.4 -6.2 0.2 M120 103.6 q3.4 2.4 6.2 0.2" fill="none" stroke="rgba(74,45,2,0.8)" strokeWidth="1.1" strokeLinecap="round" />
            {/* Whiskers */}
            <path d="M108 98 l-6 -1.6 M108 101 l-6 0.6 M132 98 l6 -1.6 M132 101 l6 0.6" fill="none" stroke="rgba(74,45,2,0.45)" strokeWidth="0.7" strokeLinecap="round" />

            {/* Crown */}
            <path
              d="M103 74 L105.2 58.4 L112.6 65.6 L120 52.4 L127.4 65.6 L134.8 58.4 L137 74 Z"
              fill={`url(#${id}-crown)`}
              stroke="rgba(74,45,2,0.7)"
              strokeWidth="1.1"
              strokeLinejoin="round"
            />
            <path d="M103 74 h34" stroke="rgba(74,45,2,0.55)" strokeWidth="1.6" strokeLinecap="round" />
            <circle cx="105.2" cy="57.6" r="1.7" fill="#fff8d6" stroke="rgba(74,45,2,0.55)" strokeWidth="0.6" />
            <circle cx="120" cy="51.4" r="1.9" fill="#fff8d6" stroke="rgba(74,45,2,0.55)" strokeWidth="0.6" />
            <circle cx="134.8" cy="57.6" r="1.7" fill="#fff8d6" stroke="rgba(74,45,2,0.55)" strokeWidth="0.6" />
            <circle cx="120" cy="69.4" r="1.5" fill="#b8860b" stroke="rgba(74,45,2,0.55)" strokeWidth="0.5" />
          </g>

          {/* --------------------------------------------- Embossed letter M */}
          <g filter={`url(#${id}-glow)`}>
            <path
              d="M84 166 V120 L120 152 L156 120 V166"
              fill="none"
              stroke="rgba(60,36,0,0.5)"
              strokeWidth="15.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0,2.2)"
            />
            <path
              d="M84 166 V120 L120 152 L156 120 V166"
              fill="none"
              stroke={`url(#${id}-emboss)`}
              strokeWidth="13"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M84 166 V120 L120 152 L156 120 V166"
              fill="none"
              stroke="rgba(255,251,232,0.55)"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(-1.4,-1.6)"
            />
          </g>

          {/* Ticker plate */}
          <rect x="86" y="176" width="68" height="17" rx="8.5" fill="rgba(60,36,0,0.42)" stroke="rgba(255,243,176,0.32)" strokeWidth="0.7" />
          <text
            x="120"
            y="188.6"
            textAnchor="middle"
            fill="#ffe9a8"
            fontSize="9.4"
            fontWeight="800"
            letterSpacing="2.3"
            fontFamily="ui-monospace, monospace"
          >
            ${ticker}
          </text>

          {/* Specular sweeps — only while hovered */}
          <g className="pointer-events-none opacity-0 transition-opacity duration-300 group-hover/coin:opacity-100" clipPath={`url(#${id}-clip)`}>
            <ellipse cx={CX} cy={CY} rx="112" ry="112" fill={`url(#${id}-sweep)`} className="mx-coin-sheen" />
            <ellipse
              cx={CX}
              cy={CY}
              rx="112"
              ry="112"
              fill={`url(#${id}-sweep)`}
              className="mx-coin-sheen"
              style={{ animationDelay: '1.3s', opacity: 0.55 }}
            />
          </g>
          <ellipse cx={CX} cy={CY} rx="110" ry="110" fill="none" stroke="rgba(255,255,255,0.32)" strokeWidth="0.8" />
        </svg>

        {/* Floating highlight that tracks the pointer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 mix-blend-screen transition-opacity duration-300 group-hover/coin:opacity-100"
          style={{
            background: 'radial-gradient(circle at 32% 24%, rgba(255,255,255,0.5), transparent 38%)',
            transform: 'translateZ(14px)',
          }}
        />
      </motion.div>
    </div>
  );
}
