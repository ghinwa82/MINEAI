'use client';

import React, { useId, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * The $MINEAI bullion coin.
 *
 * Struck rather than drawn. The disc is modelled as a physical object: an
 * outer reeded edge, a bevelled collar, a turned face with anisotropic brushing,
 * four concentric guilloché bands, a large sculpted monogram fused with a
 * crowned lion's head, and a ticker plate at the base. Lighting is baked into
 * the gradients — a hot specular at 34 % / 24 %, a cool bounce on the opposite
 * rim and an amber occlusion where the relief meets the field — so the metal
 * reads as gold even in a still frame.
 *
 * Pointer position drives a spring tilt between ±14°. Every gradient id is
 * namespaced with `useId` because the coin is mounted more than once per page
 * and duplicate SVG ids resolve to the first definition.
 */

const CX = 120;
const CY = 120;

/** A rose curve sampled into one closed path — the guilloché engine. */
function rosePath(petals: number, amplitude: number, base: number, phase = 0): string {
  const steps = 560;
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
function manePath(cx: number, cy: number, lobes: number, outer: number, inner: number): string {
  const steps = lobes * 2;
  const points: { x: number; y: number }[] = [];
  for (let index = 0; index < steps; index += 1) {
    const angle = (index / steps) * Math.PI * 2 - Math.PI / 2;
    const radius = index % 2 === 0 ? outer : inner;
    points.push({ x: cx + Math.cos(angle) * radius, y: cy + Math.sin(angle) * radius });
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

/** Four engraved bands: two fine, one broad, one hairlined. */
const GUILLOCHE = [
  rosePath(11, 5.4, 100),
  rosePath(11, 5.4, 100, Math.PI / 11),
  rosePath(23, 3.1, 92),
  rosePath(37, 1.8, 86),
];

const LION_CY = 98;
const MANE = manePath(120, LION_CY, 15, 45, 35);

/** The struck monogram, reused for the shadow, the face and the highlight. */
const MONOGRAM = 'M72 180 V101 L120 150 L168 101 V180';

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

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [14, -14]), {
    stiffness: 150,
    damping: 19,
    mass: 0.55,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-18, 18]), {
    stiffness: 150,
    damping: 19,
    mass: 0.55,
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
      style={{ perspective: 950, width: size, height: size }}
      onPointerMove={onPointerMove}
      onPointerLeave={reset}
    >
      {/* Ambient gold bloom cast onto the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-[-22%] rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover/coin:opacity-100"
        style={{
          background:
            'radial-gradient(circle at 48% 42%, rgba(255,214,102,0.46), rgba(196,132,0,0.18) 46%, transparent 70%)',
        }}
      />

      <motion.div
        className="relative"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', width: size, height: size }}
      >
        {/* Contact shadow: the disc floats a few millimetres above the page */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            transform: 'translateZ(-26px) translateY(12px) scale(0.97)',
            background: 'radial-gradient(circle at 50% 50%, #4d3001 0%, #2a1800 56%, #0f0800 100%)',
            boxShadow: '0 34px 70px -18px rgba(0,0,0,0.94)',
          }}
        />

        {/* Reeded collar: 180 milled flutes, machined rather than painted */}
        <div
          aria-hidden
          className="absolute inset-[1%] rounded-full"
          style={{
            transform: 'translateZ(-12px)',
            background:
              'repeating-conic-gradient(from 0deg, #5d3a03 0deg 0.86deg, #f4d06a 0.86deg 1.42deg, #7d4e04 1.42deg 2deg)',
            boxShadow:
              'inset 0 0 0 1.2px rgba(255,244,196,0.42), inset 0 0 22px rgba(52,30,0,0.86), 0 0 0 0.6px rgba(0,0,0,0.6)',
          }}
        />

        <svg
          viewBox="0 0 240 240"
          className="relative block h-full w-full"
          role="img"
          aria-label={`$${ticker} bullion coin — crowned lion fused with the M monogram, guilloché engraving, reeded edge`}
        >
          <defs>
            {/* Field: smoked obsidian with a champagne bounce along the rim */}
            <radialGradient id={`${id}-face`} cx="34%" cy="23%" r="86%">
              <stop offset="0%" stopColor="#232028" />
              <stop offset="22%" stopColor="#1A1720" />
              <stop offset="46%" stopColor="#121016" />
              <stop offset="70%" stopColor="#0B0A0E" />
              <stop offset="88%" stopColor="#07070A" />
              <stop offset="100%" stopColor="#050507" />
            </radialGradient>
            {/* Collar: light from the top-left, shadow bottom-right */}
            <linearGradient id={`${id}-rim`} x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#FFF8D8" />
              <stop offset="18%" stopColor="#F0CC66" />
              <stop offset="42%" stopColor="#C89A28" />
              <stop offset="62%" stopColor="#7B5204" />
              <stop offset="82%" stopColor="#E4B848" />
              <stop offset="100%" stopColor="#9C6E0A" />
            </linearGradient>
            {/* Relief: ivory crest, gold shoulder, deep occlusion */}
            <linearGradient id={`${id}-relief`} x1="0.15" y1="0" x2="0.85" y2="1">
              <stop offset="0%" stopColor="#FFFDF0" />
              <stop offset="26%" stopColor="#FFF0AE" />
              <stop offset="52%" stopColor="#E9BF4E" />
              <stop offset="68%" stopColor="#A4740C" />
              <stop offset="86%" stopColor="#8A5D06" />
              <stop offset="100%" stopColor="#C79A2C" />
            </linearGradient>
            <linearGradient id={`${id}-mane`} x1="0.1" y1="0" x2="0.9" y2="1">
              <stop offset="0%" stopColor="#FFF6CC" />
              <stop offset="34%" stopColor="#F2CE6A" />
              <stop offset="64%" stopColor="#C9971F" />
              <stop offset="100%" stopColor="#7E5305" />
            </linearGradient>
            <linearGradient id={`${id}-crown`} x1="0" y1="0" x2="0.25" y2="1">
              <stop offset="0%" stopColor="#FFFDF2" />
              <stop offset="38%" stopColor="#F9E39B" />
              <stop offset="72%" stopColor="#D9AE3C" />
              <stop offset="100%" stopColor="#8E6208" />
            </linearGradient>
            {/* Anisotropic brushing: gold hairline passes over the smoked field */}
            <linearGradient id={`${id}-brush`} x1="0" y1="0" x2="0.6" y2="1">
              <stop offset="0%" stopColor="rgba(255,241,193,0.13)" />
              <stop offset="50%" stopColor="rgba(226,194,117,0.05)" />
              <stop offset="100%" stopColor="rgba(255,241,193,0.1)" />
            </linearGradient>
            <linearGradient id={`${id}-sweep`} x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="42%" stopColor="rgba(255,255,255,0.78)" />
              <stop offset="54%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <radialGradient id={`${id}-bounce`} cx="78%" cy="82%" r="46%">
              <stop offset="0%" stopColor="rgba(255,198,92,0.34)" />
              <stop offset="100%" stopColor="rgba(255,198,92,0)" />
            </radialGradient>
            <filter id={`${id}-strike`} x="-25%" y="-25%" width="150%" height="150%">
              <feDropShadow dx="0.6" dy="1.4" stdDeviation="0.9" floodColor="#4A2D02" floodOpacity="0.72" />
            </filter>
            <filter id={`${id}-deep`} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="2" stdDeviation="1.6" floodColor="#3A2301" floodOpacity="0.66" />
            </filter>
            <filter id={`${id}-glow`} x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="2.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <path
              id={`${id}-ring`}
              d={`M ${CX}, ${CY} m -97, 0 a 97,97 0 1,1 194,0 a 97,97 0 1,1 -194,0`}
              fill="none"
            />
            <clipPath id={`${id}-clip`}>
              <circle cx={CX} cy={CY} r="112" />
            </clipPath>
            <clipPath id={`${id}-face-clip`}>
              <circle cx={CX} cy={CY} r="104" />
            </clipPath>
          </defs>

          {/* ------------------------------------------------ Reeded edge */}
          <g aria-hidden>
            {Array.from({ length: 180 }).map((_, index) => {
              const angle = (index / 180) * Math.PI * 2;
              const depth = index % 2 === 0 ? 108.2 : 110.4;
              return (
                <line
                  key={index}
                  x1={CX + Math.cos(angle) * depth}
                  y1={CY + Math.sin(angle) * depth}
                  x2={CX + Math.cos(angle) * 114.4}
                  y2={CY + Math.sin(angle) * 114.4}
                  stroke={index % 2 === 0 ? 'rgba(74,45,2,0.62)' : 'rgba(255,246,206,0.5)'}
                  strokeWidth={index % 2 === 0 ? 1.15 : 0.7}
                  strokeLinecap="butt"
                />
              );
            })}
          </g>

          {/* ------------------------------------------------ Collar */}
          <circle cx={CX} cy={CY} r="113" fill={`url(#${id}-rim)`} />
          <circle cx={CX} cy={CY} r="109.5" fill="none" stroke="rgba(58,35,1,0.55)" strokeWidth="1.4" />
          <circle cx={CX} cy={CY} r="106.8" fill="none" stroke="rgba(255,250,224,0.62)" strokeWidth="0.9" />

          {/* ------------------------------------------------ Face */}
          <circle cx={CX} cy={CY} r="105.4" fill={`url(#${id}-face)`} />
          <circle cx={CX} cy={CY} r="105.4" fill={`url(#${id}-bounce)`} />

          <g clipPath={`url(#${id}-face-clip)`} aria-hidden>
            {/* Anatropic brushing */}
            {Array.from({ length: 46 }).map((_, index) => {
              const y = 18 + index * 4.6;
              return (
                <rect
                  key={index}
                  x="8"
                  y={y}
                  width="224"
                  height="1.1"
                  fill={`url(#${id}-brush)`}
                  opacity={index % 3 === 0 ? 0.5 : 0.26}
                />
              );
            })}

            {/* Guilloché bands */}
            {GUILLOCHE.map((path, index) => (
              <path
                key={index}
                d={path}
                fill="none"
                stroke={index > 1 ? 'rgba(226,194,117,0.2)' : 'rgba(255,241,193,0.42)'}
                strokeWidth={index > 1 ? 0.55 : 0.8}
              />
            ))}
            {Array.from({ length: 7 }).map((_, index) => (
              <circle
                key={index}
                cx={CX}
                cy={CY}
                r={78 + index * 3.6}
                fill="none"
                stroke="rgba(226,194,117,0.16)"
                strokeWidth="0.55"
                strokeDasharray={index % 2 === 0 ? '1 3.6' : '2.4 5.4'}
              />
            ))}

            {/* Raised field boundary around the strike */}
            <circle cx={CX} cy={CY} r="76" fill="none" stroke="rgba(255,241,193,0.3)" strokeWidth="1.1" />
            <circle cx={CX} cy={CY} r="74.4" fill="none" stroke="rgba(182,141,58,0.34)" strokeWidth="0.9" />
          </g>

          {/* Micro-lettered band, counter-clockwise at the top */}
          <text
            fill="rgba(255,241,193,0.66)"
            fontSize="7.1"
            fontWeight="700"
            letterSpacing="3.6"
            fontFamily="ui-monospace, SFMono-Regular, monospace"
          >
            <textPath href={`#${id}-ring`} startOffset="1.5%">
              MINEAI · BULLION RESERVE · $MINEAI · SIX LANGUAGES · SEVEN RAILS · PROOF OF COMPUTE ·
            </textPath>
          </text>

          {/* -------------------------------------- Fused M + crowned lion */}
          {/* The M is struck first and the head rises out of its valley, so the
              two read as one object rather than a stack of two glyphs. */}
          <g filter={`url(#${id}-deep)`}>
            <path
              d={MONOGRAM}
              fill="none"
              stroke="rgba(58,35,1,0.66)"
              strokeWidth="27"
              strokeLinecap="square"
              strokeLinejoin="miter"
              transform="translate(0,3.2)"
            />
            <path
              d={MONOGRAM}
              fill="none"
              stroke={`url(#${id}-relief)`}
              strokeWidth="24"
              strokeLinecap="square"
              strokeLinejoin="miter"
            />
            {/* Chamfer light along the top edge of the gold */}
            <path
              d={MONOGRAM}
              fill="none"
              stroke="rgba(255,253,242,0.6)"
              strokeWidth="1.5"
              strokeLinecap="square"
              transform="translate(-1.5,-1.8)"
            />
            {/* Inner shadow on the right-hand shoulder */}
            <path
              d="M120 150 L168 101 V180"
              fill="none"
              stroke="rgba(74,45,2,0.42)"
              strokeWidth="2.6"
              strokeLinecap="square"
              transform="translate(6,2)"
            />
          </g>

          <g filter={`url(#${id}-strike)`}>
            {/* Mane */}
            <path d={MANE} fill={`url(#${id}-mane)`} stroke="rgba(58,35,1,0.82)" strokeWidth="1.2" />
            {/* Secondary mane ring adds depth behind the face */}
            <path
              d={manePath(120, LION_CY, 15, 36.5, 30)}
              fill="none"
              stroke="rgba(255,250,224,0.34)"
              strokeWidth="0.9"
            />
            {/* Ears */}
            <path d="M102 79 q-4.6 -10 2.2 -14.4 q5.6 4.4 5.6 13.2 Z" fill="#E9BF4E" stroke="rgba(58,35,1,0.66)" strokeWidth="0.9" />
            <path d="M138 79 q4.6 -10 -2.2 -14.4 q-5.6 4.4 -5.6 13.2 Z" fill="#E9BF4E" stroke="rgba(58,35,1,0.66)" strokeWidth="0.9" />
            {/* Face */}
            <ellipse cx="120" cy={LION_CY} rx="18.4" ry="20.6" fill={`url(#${id}-relief)`} stroke="rgba(58,35,1,0.6)" strokeWidth="0.95" />
            {/* Brow ridge */}
            <path d="M109 90 q4.4 -3.2 8.8 0 M122.4 90 q4.4 -3.2 8.8 0" fill="none" stroke="rgba(74,45,2,0.8)" strokeWidth="1.4" strokeLinecap="round" />
            {/* Eyes: struck almond, ivory catchlight */}
            <path d="M110.6 94.4 q3.5 -3 7 0 q-3.5 2.8 -7 0 Z" fill="#33200A" />
            <path d="M122.8 94.4 q3.5 -3 7 0 q-3.5 2.8 -7 0 Z" fill="#33200A" />
            <circle cx="113" cy="93.7" r="0.82" fill="#FFFDF2" />
            <circle cx="125.2" cy="93.7" r="0.82" fill="#FFFDF2" />
            {/* Muzzle */}
            <circle cx="115.4" cy="105.6" r="4.7" fill="rgba(255,246,206,0.5)" />
            <circle cx="124.6" cy="105.6" r="4.7" fill="rgba(255,246,206,0.5)" />
            <path d="M120 100.8 l-3.3 3.7 h6.6 Z" fill="#4E3000" />
            <path
              d="M120 105 v3.6 M120 108.6 q-3.6 2.6 -6.6 0.2 M120 108.6 q3.6 2.6 6.6 0.2"
              fill="none"
              stroke="rgba(74,45,2,0.84)"
              strokeWidth="1.15"
              strokeLinecap="round"
            />
            {/* Whiskers */}
            <path
              d="M106.6 102.4 l-6.4 -1.8 M106.6 105.6 l-6.4 0.8 M133.4 102.4 l6.4 -1.8 M133.4 105.6 l6.4 0.8"
              fill="none"
              stroke="rgba(74,45,2,0.5)"
              strokeWidth="0.75"
              strokeLinecap="round"
            />

            {/* Crown: five points, beaded, sitting in the mane */}
            <path
              d="M100.6 76.4 L103 58 L111.6 66.4 L120 51.6 L128.4 66.4 L137 58 L139.4 76.4 Z"
              fill={`url(#${id}-crown)`}
              stroke="rgba(58,35,1,0.78)"
              strokeWidth="1.15"
              strokeLinejoin="round"
            />
            <path d="M100.6 76.4 h38.8" stroke="rgba(74,45,2,0.6)" strokeWidth="1.7" strokeLinecap="round" />
            <path d="M104.4 62.4 q15.6 4.4 31.2 0" fill="none" stroke="rgba(255,253,242,0.42)" strokeWidth="0.9" />
            {[
              [103, 57.2, 1.75],
              [120, 50.4, 2],
              [137, 57.2, 1.75],
            ].map(([cx, cy, r]) => (
              <circle
                key={`${cx}-${cy}`}
                cx={cx}
                cy={cy}
                r={r}
                fill="#FFFDF2"
                stroke="rgba(58,35,1,0.6)"
                strokeWidth="0.6"
              />
            ))}
            <circle cx="120" cy="71.6" r="1.6" fill="#B8860B" stroke="rgba(58,35,1,0.6)" strokeWidth="0.5" />
          </g>

          {/* ------------------------------------------------ Ticker plate */}
          <g filter={`url(#${id}-glow)`}>
            <rect
              x="82"
              y="186"
              width="76"
              height="19"
              rx="9.5"
              fill="rgba(58,35,1,0.46)"
              stroke="rgba(255,246,206,0.4)"
              strokeWidth="0.8"
            />
            <rect x="85.6" y="188.6" width="68.8" height="13.8" rx="6.9" fill="none" stroke="rgba(255,250,224,0.2)" strokeWidth="0.5" />
            <text
              x="120"
              y="199.8"
              textAnchor="middle"
              fill="#FFF2C0"
              fontSize="9.8"
              fontWeight="800"
              letterSpacing="2.4"
              fontFamily="ui-monospace, SFMono-Regular, monospace"
            >
              ${ticker}
            </text>
          </g>

          {/* ------------------------------------------------ Light passes */}
          {/* Static specular arc, always present */}
          <path
            d="M34 78 a 96 96 0 0 1 52 -46"
            fill="none"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="3.2"
            strokeLinecap="round"
            opacity="0.5"
          />
          <path
            d="M196 168 a 96 96 0 0 1 -34 30"
            fill="none"
            stroke="rgba(255,198,92,0.4)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />

          {/* Moving sheen, only while hovered */}
          <g
            className="pointer-events-none opacity-0 transition-opacity duration-300 group-hover/coin:opacity-100"
            clipPath={`url(#${id}-clip)`}
          >
            <ellipse cx={CX} cy={CY} rx="116" ry="116" fill={`url(#${id}-sweep)`} className="mx-coin-sheen" />
            <ellipse
              cx={CX}
              cy={CY}
              rx="116"
              ry="116"
              fill={`url(#${id}-sweep)`}
              className="mx-coin-sheen"
              style={{ animationDelay: '1.35s', opacity: 0.5 }}
            />
          </g>

          <ellipse cx={CX} cy={CY} rx="111.5" ry="111.5" fill="none" stroke="rgba(255,255,255,0.34)" strokeWidth="0.8" />
        </svg>

        {/* Pointer-tracked highlight on the glass of the case */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 mix-blend-screen transition-opacity duration-300 group-hover/coin:opacity-100"
          style={{
            background: 'radial-gradient(circle at 30% 22%, rgba(255,255,255,0.46), transparent 36%)',
            transform: 'translateZ(16px)',
          }}
        />
      </motion.div>
    </div>
  );
}
