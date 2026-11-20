'use client';

import React, { useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

import { useI18n } from '@/lib/i18n-provider';
import { getVipCopy } from '@/lib/vip-i18n';

/**
 * The VIP membership card.
 *
 * A single metallic object: brushed gold foil, a guilloché rosette printed
 * under the data, an embedded chip and a crowned lion crest. The card tilts
 * toward the pointer with spring damping and a specular band follows the tilt,
 * which is the whole interaction — no scroll hijacking, no autoplay.
 *
 * The holder name is deliberately generic. The operator id is anonymous by
 * design, so the card personalises with the referral code and tier rather than
 * inventing a name the platform does not hold.
 */

const TIER_LABEL: Record<string, string> = {
  observer: 'Observer',
  navigator: 'Navigator',
  whale: 'Whale',
  leviathan: 'Leviathan',
};

export default function VipMembershipCard({
  tier = 'observer',
  code = null,
  multiplier = 1,
  staked = 0,
  since = null,
  className = '',
}: {
  tier?: string;
  code?: string | null;
  multiplier?: number;
  staked?: number;
  since?: string | null;
  className?: string;
}) {
  const { lang } = useI18n();
  const copy = getVipCopy(lang);

  const ref = useRef<HTMLDivElement>(null);
  const px = useMotionValue(0);
  const py = useMotionValue(0);

  const rotateX = useSpring(useTransform(py, [-0.5, 0.5], [11, -11]), {
    stiffness: 160,
    damping: 20,
    mass: 0.55,
  });
  const rotateY = useSpring(useTransform(px, [-0.5, 0.5], [-15, 15]), {
    stiffness: 160,
    damping: 20,
    mass: 0.55,
  });
  const glareX = useTransform(px, [-0.5, 0.5], [18, 82]);
  const glareY = useTransform(py, [-0.5, 0.5], [12, 88]);
  const glare = useTransform(
    [glareX, glareY],
    ([x, y]: number[]) =>
      `radial-gradient(circle at ${x}% ${y}%, rgba(255,255,255,0.55), rgba(255,243,176,0.12) 34%, transparent 62%)`,
  );

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return;
    px.set((event.clientX - bounds.left) / bounds.width - 0.5);
    py.set((event.clientY - bounds.top) / bounds.height - 0.5);
  };

  const reset = () => {
    px.set(0);
    py.set(0);
  };

  const number = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US', {
        maximumFractionDigits: 0,
      }),
    [lang],
  );

  const memberSince = useMemo(() => {
    const date = since ? new Date(since) : new Date();
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleDateString(lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US', {
      month: '2-digit',
      year: 'numeric',
    });
  }, [since, lang]);

  const tierName = TIER_LABEL[tier] ?? tier;

  return (
    <div className={`mx-vip-scene ${className}`} style={{ perspective: 1100 }}>
      <motion.div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerLeave={reset}
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="group/vip relative aspect-[1.62/1] w-full overflow-hidden rounded-[1.15rem] border border-[#f4d67a]/35 shadow-[0_28px_60px_-26px_rgba(0,0,0,0.95)]"
      >
        {/* Metallic foil */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(128deg, #2a1d05 0%, #6a4a0b 16%, #E2C275 34%, #fff3b0 46%, #E2C275 58%, #7d5708 74%, #241804 100%)',
          }}
        />
        {/* Guilloché rosette printed under the data */}
        <div
          aria-hidden
          className="absolute -right-10 -top-16 h-[26rem] w-[26rem] rounded-full opacity-40"
          style={{
            background:
              'repeating-radial-gradient(circle at 50% 50%, rgba(255,243,176,0.34) 0 1px, transparent 1px 5px), repeating-conic-gradient(from 0deg, rgba(74,45,2,0.32) 0deg 1.4deg, transparent 1.4deg 4deg)',
            maskImage: 'radial-gradient(circle, #000 38%, transparent 72%)',
            WebkitMaskImage: 'radial-gradient(circle, #000 38%, transparent 72%)',
          }}
        />
        {/* Fine engine-turned lines across the face */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-30"
          style={{
            background:
              'repeating-linear-gradient(96deg, rgba(255,255,255,0.16) 0 1px, transparent 1px 6px)',
          }}
        />
        {/* Pointer-tracked glare */}
        <motion.div
          aria-hidden
          className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover/vip:opacity-100"
          style={{
            background: glare,
            mixBlendMode: 'screen',
          }}
        />

        <div className="relative flex h-full flex-col justify-between p-5 text-[#241804] sm:p-6" style={{ transform: 'translateZ(26px)' }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[0.5rem] font-bold tracking-[0.28em] uppercase opacity-70">
                {copy.cardLabel}
              </p>
              <p className="mt-1 text-[0.95rem] font-extrabold tracking-[0.14em] uppercase">
                MineAI
              </p>
            </div>

            {/* Crowned lion crest */}
            <svg viewBox="0 0 64 64" aria-hidden className="h-11 w-11 drop-shadow-[0_2px_2px_rgba(74,45,2,0.5)]">
              <path
                d="M32 20c7 0 12 5 12 12s-5 12-12 12-12-5-12-12 5-12 12-12Z"
                fill="rgba(36,24,4,0.14)"
                stroke="rgba(36,24,4,0.75)"
                strokeWidth="1.4"
              />
              <path
                d="M20 26c-2 5 0 11 4 14M44 26c2 5 0 11-4 14M26 20l2-5M38 20l-2-5M32 18v-6"
                fill="none"
                stroke="rgba(36,24,4,0.6)"
                strokeWidth="1.2"
                strokeLinecap="round"
              />
              <path d="M27 30l2-2 2 2-2 2-2-2ZM35 30l2-2 2 2-2 2-2-2Z" fill="rgba(36,24,4,0.82)" />
              <path d="M32 34l-2 2h4l-2-2Z" fill="rgba(36,24,4,0.82)" />
              <path d="M32 36v3M32 39c-2 1.4-4 1-5 0M32 39c2 1.4 4 1 5 0" fill="none" stroke="rgba(36,24,4,0.7)" strokeWidth="1.1" strokeLinecap="round" />
              <path d="M22 14l3-9 4 6 3-8 3 8 4-6 3 9Z" fill="rgba(36,24,4,0.18)" stroke="rgba(36,24,4,0.75)" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Chip */}
          <div className="flex items-end justify-between gap-4">
            <div className="flex items-center gap-3">
              <div
                aria-hidden
                className="h-7 w-9 rounded-[0.35rem] border border-[#7d5708]/60"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, #f3d47e 0 4px, #c39a2c 4px 7px), linear-gradient(180deg, #fff3b0, #b8860b)',
                  boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.5)',
                }}
              />
              <div>
                <p className="text-[0.46rem] font-bold tracking-[0.22em] uppercase opacity-70">
                  {copy.tier}
                </p>
                <p className="text-[0.82rem] font-extrabold uppercase tracking-[0.08em]">{tierName}</p>
              </div>
            </div>

            <div className="text-end">
              <p className="text-[0.46rem] font-bold tracking-[0.22em] uppercase opacity-70">
                {copy.multiplier}
              </p>
              <p className="mx-numeric text-[0.95rem] font-extrabold">{multiplier.toFixed(2)}×</p>
            </div>
          </div>

          <div className="grid grid-cols-[1.5fr_1fr_0.8fr] items-end gap-3">
            <div className="min-w-0">
              <p className="text-[0.44rem] font-bold tracking-[0.22em] uppercase opacity-70">
                {copy.memberCode}
              </p>
              <p className="mx-numeric truncate text-[0.82rem] font-extrabold tracking-[0.2em]">
                {code ?? 'MINEAI'}
              </p>
            </div>
            <div>
              <p className="text-[0.44rem] font-bold tracking-[0.22em] uppercase opacity-70">
                {copy.staked}
              </p>
              <p className="mx-numeric text-[0.78rem] font-bold">{number.format(staked)}</p>
            </div>
            <div className="text-end">
              <p className="text-[0.44rem] font-bold tracking-[0.22em] uppercase opacity-70">
                {copy.memberSince}
              </p>
              <p className="mx-numeric text-[0.78rem] font-bold">{memberSince}</p>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-[#241804]/25 pt-3">
            <p className="text-[0.46rem] font-semibold tracking-[0.18em] uppercase opacity-70">
              {copy.member}
            </p>
            <p className="text-[0.46rem] font-semibold tracking-[0.18em] uppercase opacity-60">
              $MINEAI
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
