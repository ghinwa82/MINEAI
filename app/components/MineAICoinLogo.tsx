'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

/**
 * The $MINEAI coin.
 *
 * A layered, metallic gold disc rendered entirely in SVG and CSS: a milled
 * edge, a brushed face, an embossed M, a ring of micro-text and a specular
 * sweep that travels across the surface. Pointer position drives a spring
 * tilt so the coin behaves like a physical object under the cursor.
 */
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

  const rotateX = useSpring(useTransform(pointerY, [-0.5, 0.5], [16, -16]), {
    stiffness: 140,
    damping: 18,
    mass: 0.6,
  });
  const rotateY = useSpring(useTransform(pointerX, [-0.5, 0.5], [-20, 20]), {
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
        className="pointer-events-none absolute inset-[-18%] rounded-full opacity-60 blur-2xl transition-opacity duration-500 group-hover/coin:opacity-95"
        style={{
          background:
            'radial-gradient(circle at 50% 45%, rgba(255,214,102,0.42), rgba(255,166,0,0.16) 45%, transparent 72%)',
        }}
      />

      <motion.div
        className="relative"
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d', width: size, height: size }}
      >
        {/* Milled edge, offset to fake thickness */}
        <div
          aria-hidden
          className="absolute inset-0 rounded-full"
          style={{
            transform: 'translateZ(-18px) translateY(6px)',
            background:
              'radial-gradient(circle at 50% 50%, #7a4c05 0%, #4a2c02 55%, #241400 100%)',
            boxShadow: '0 26px 60px -18px rgba(0,0,0,0.9)',
          }}
        />
        <div
          aria-hidden
          className="absolute inset-[3%] rounded-full"
          style={{
            transform: 'translateZ(-9px)',
            background:
              'conic-gradient(from 0deg, #8a5a06, #d9a63a, #6b4204, #f0c95a, #7a4c05, #d9a63a, #8a5a06)',
          }}
        />

        <svg viewBox="0 0 240 240" className="relative block h-full w-full" role="img" aria-label={`$${ticker} coin`}>
          <defs>
            <radialGradient id="coinFace" cx="38%" cy="28%" r="78%">
              <stop offset="0%" stopColor="#fff8d6" />
              <stop offset="22%" stopColor="#ffe38a" />
              <stop offset="46%" stopColor="#f2bf3f" />
              <stop offset="70%" stopColor="#c98d17" />
              <stop offset="88%" stopColor="#8f5c07" />
              <stop offset="100%" stopColor="#5a3903" />
            </radialGradient>
            <linearGradient id="coinRim" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#fff3b0" />
              <stop offset="30%" stopColor="#e0a52b" />
              <stop offset="55%" stopColor="#7a4c05" />
              <stop offset="78%" stopColor="#f6cf63" />
              <stop offset="100%" stopColor="#b87b0c" />
            </linearGradient>
            <linearGradient id="coinEmboss" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffbe8" />
              <stop offset="45%" stopColor="#f7d873" />
              <stop offset="55%" stopColor="#a86f0a" />
              <stop offset="100%" stopColor="#5d3b03" />
            </linearGradient>
            <linearGradient id="coinSweep" x1="0" y1="0" x2="1" y2="0.4">
              <stop offset="0%" stopColor="rgba(255,255,255,0)" />
              <stop offset="45%" stopColor="rgba(255,255,255,0.85)" />
              <stop offset="55%" stopColor="rgba(255,255,255,0.9)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
            </linearGradient>
            <filter id="coinGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <path
              id="coinTextPath"
              d="M 120, 120 m -88, 0 a 88,88 0 1,1 176,0 a 88,88 0 1,1 -176,0"
              fill="none"
            />
          </defs>

          {/* Face */}
          <circle cx="120" cy="120" r="112" fill="url(#coinFace)" stroke="url(#coinRim)" strokeWidth="5" />
          <circle cx="120" cy="120" r="101" fill="none" stroke="rgba(90,57,3,0.55)" strokeWidth="1.5" />
          <circle cx="120" cy="120" r="94" fill="none" stroke="rgba(255,248,214,0.55)" strokeWidth="1" />
          <circle cx="120" cy="120" r="88" fill="none" stroke="rgba(90,57,3,0.35)" strokeWidth="1" strokeDasharray="2 5" />

          {/* Micro-text ring */}
          <text
            fill="rgba(90,57,3,0.78)"
            fontSize="9.5"
            fontWeight="700"
            letterSpacing="5.2"
            fontFamily="ui-monospace, monospace"
          >
            <textPath href="#coinTextPath" startOffset="2%">
              MINE AI · DECENTRALISED COMPUTE · $MINEAI · SIX LANGUAGES ·
            </textPath>
          </text>

          {/* Embossed M */}
          <g filter="url(#coinGlow)">
            <path
              d="M76 158 V84 L120 132 L164 84 V158"
              fill="none"
              stroke="rgba(60,36,0,0.55)"
              strokeWidth="17"
              strokeLinecap="round"
              strokeLinejoin="round"
              transform="translate(0,2)"
            />
            <path
              d="M76 158 V84 L120 132 L164 84 V158"
              fill="none"
              stroke="url(#coinEmboss)"
              strokeWidth="15"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </g>

          {/* Tick marks */}
          {Array.from({ length: 24 }).map((_, index) => {
            const angle = (index / 24) * Math.PI * 2;
            const inner = 104;
            const outer = index % 6 === 0 ? 96 : 100;
            return (
              <line
                key={index}
                x1={120 + Math.cos(angle) * inner}
                y1={120 + Math.sin(angle) * inner}
                x2={120 + Math.cos(angle) * outer}
                y2={120 + Math.sin(angle) * outer}
                stroke="rgba(90,57,3,0.45)"
                strokeWidth={index % 6 === 0 ? 2 : 1}
                strokeLinecap="round"
              />
            );
          })}

          {/* Ticker plate */}
          <rect x="86" y="166" width="68" height="18" rx="9" fill="rgba(60,36,0,0.35)" />
          <text
            x="120"
            y="179.5"
            textAnchor="middle"
            fill="#ffe9a8"
            fontSize="10"
            fontWeight="800"
            letterSpacing="2.4"
            fontFamily="ui-monospace, monospace"
          >
            ${ticker}
          </text>

          {/* Specular sweep */}
          <g className="pointer-events-none opacity-0 transition-opacity duration-300 group-hover/coin:opacity-100">
            <ellipse cx="120" cy="120" rx="108" ry="108" fill="url(#coinSweep)" className="mx-coin-sheen" />
          </g>
          <ellipse cx="120" cy="120" rx="110" ry="110" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="0.8" />
        </svg>

        {/* Floating highlight that tracks the pointer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 rounded-full opacity-0 mix-blend-screen transition-opacity duration-300 group-hover/coin:opacity-100"
          style={{
            background:
              'radial-gradient(circle at 32% 24%, rgba(255,255,255,0.55), transparent 38%)',
            transform: 'translateZ(12px)',
          }}
        />
      </motion.div>
    </div>
  );
}
