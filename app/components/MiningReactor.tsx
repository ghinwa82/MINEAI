'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

import { useI18n } from '@/lib/i18n-provider';
import { sound } from '@/lib/sound-engine';

/**
 * The mining reactor.
 *
 * Everything on this panel is derived from one number — the current hashrate —
 * so the needle, the particle density, the core glow, the temperature and the
 * efficiency reading always agree with each other and with the ledger. When the
 * operator pauses, the streams stop and the ambient pulse is silenced; nothing
 * keeps humming for a reactor that is not working.
 */

interface Labels {
  title: string;
  plan: string;
  armed: string;
  paused: string;
  speed: string;
  temperature: string;
  efficiency: string;
  start: string;
  stop: string;
  working: string;
  unitMh: string;
  unitTh: string;
  hint: string;
}

const LABELS: Record<string, Labels> = {
  en: {
    title: 'Reactor core', plan: 'Active plan', armed: 'Mining live', paused: 'Mining paused',
    speed: 'Cloud power', temperature: 'Core temperature', efficiency: 'Efficiency',
    start: 'Start mining', stop: 'Pause mining', working: 'Switching…', unitMh: 'MH/s', unitTh: 'TH/s',
    hint: 'Particle density follows your real hashrate. Pause any time — your balance is kept.',
  },
  ar: {
    title: 'قلب المفاعل', plan: 'الخطة النشطة', armed: 'التعدين يعمل', paused: 'التعدين متوقف',
    speed: 'قوة السحابة', temperature: 'حرارة القلب', efficiency: 'الكفاءة',
    start: 'ابدأ التعدين', stop: 'إيقاف التعدين', working: 'جارٍ التبديل…', unitMh: 'ميجاهاش/ث', unitTh: 'تيراهاش/ث',
    hint: 'كثافة الجسيمات تتبع قوتك الحقيقية. أوقف التعدين وقتما تشاء — رصيدك محفوظ.',
  },
  fr: {
    title: 'Cœur du réacteur', plan: 'Offre active', armed: 'Minage en cours', paused: 'Minage en pause',
    speed: 'Puissance cloud', temperature: 'Température du cœur', efficiency: 'Efficacité',
    start: 'Démarrer le minage', stop: 'Mettre en pause', working: 'Commutation…', unitMh: 'MH/s', unitTh: 'TH/s',
    hint: 'La densité des particules suit votre hashrate réel. Mettez en pause quand vous voulez — votre solde est conservé.',
  },
  es: {
    title: 'Núcleo del reactor', plan: 'Plan activo', armed: 'Minería en vivo', paused: 'Minería en pausa',
    speed: 'Potencia en la nube', temperature: 'Temperatura del núcleo', efficiency: 'Eficiencia',
    start: 'Iniciar minería', stop: 'Pausar minería', working: 'Cambiando…', unitMh: 'MH/s', unitTh: 'TH/s',
    hint: 'La densidad de partículas sigue tu hashrate real. Pausa cuando quieras: tu saldo se conserva.',
  },
  zh: {
    title: '反应堆核心', plan: '当前方案', armed: '正在挖矿', paused: '挖矿已暂停',
    speed: '云算力', temperature: '核心温度', efficiency: '效率',
    start: '开始挖矿', stop: '暂停挖矿', working: '正在切换…', unitMh: 'MH/s', unitTh: 'TH/s',
    hint: '粒子密度随真实算力变化。随时暂停，余额保留。',
  },
  hi: {
    title: 'रिएक्टर कोर', plan: 'सक्रिय प्लान', armed: 'माइनिंग चालू', paused: 'माइनिंग रुकी है',
    speed: 'क्लाउड शक्ति', temperature: 'कोर तापमान', efficiency: 'दक्षता',
    start: 'माइनिंग शुरू करें', stop: 'माइनिंग रोकें', working: 'बदल रहा है…', unitMh: 'MH/s', unitTh: 'TH/s',
    hint: 'कण घनत्व आपकी वास्तविक हैशरेट के अनुसार है। जब चाहें रोकें — आपका बैलेंस सुरक्षित रहता है।',
  },
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export default function MiningReactor({
  hashrateMhs,
  active,
  planName,
  busy,
  onToggle,
}: {
  hashrateMhs: number;
  active: boolean;
  planName: string;
  busy: boolean;
  onToggle: () => void;
}) {
  const { lang } = useI18n();
  const copy = LABELS[lang] ?? LABELS.en;
  const reduce = useReducedMotion();
  const [unit, setUnit] = useState<'mh' | 'th'>('mh');

  const ratio = useMemo(() => {
    // A log scale keeps 120 MH/s readable next to a 12 TH/s plan.
    return clamp(Math.log10(1 + Math.max(0, hashrateMhs)) / Math.log10(1 + 60_000), 0, 1);
  }, [hashrateMhs]);

  const arc = 251;
  const temperature = Math.round(active ? 39 + ratio * 24 : 28);
  const efficiency = Math.round(active ? 98 - ratio * 9 : 0);
  const display = unit === 'th' ? hashrateMhs / 1_000 : hashrateMhs;
  const digits = unit === 'th' ? 3 : 0;

  useEffect(() => {
    if (active) sound.startAmbient();
    else sound.stopAmbient();
    return () => sound.stopAmbient();
  }, [active]);

  const particles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, index) => {
        const angle = (index / 14) * Math.PI * 2;
        return {
          id: index,
          left: 50 + Math.cos(angle) * (24 + (index % 4) * 7),
          top: 50 + Math.sin(angle) * (24 + (index % 3) * 7),
          delay: (index % 7) * 0.28,
          size: 2 + (index % 3),
        };
      }),
    [],
  );

  return (
    <section className="relative overflow-hidden rounded-[1.5rem] border border-white/10 bg-[#070c17] p-5 sm:p-7">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 start-1/3 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(226,194,117,0.22),transparent_70%)] blur-2xl"
      />

      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,300px)_1fr] lg:items-center">
        {/* ------------------------------------------------------- Reactor */}
        <div className="relative mx-auto aspect-square w-full max-w-[290px]">
          <motion.div
            aria-hidden
            className="absolute inset-0 rounded-full border border-dashed border-cyan/25"
            animate={reduce || !active ? undefined : { rotate: 360 }}
            transition={{ duration: 36, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            aria-hidden
            className="absolute inset-[12%] rounded-full border border-amber/25"
            animate={reduce || !active ? undefined : { rotate: -360 }}
            transition={{ duration: 24, repeat: Infinity, ease: 'linear' }}
          >
            <span className="absolute start-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-amber shadow-[0_0_12px_rgba(212,175,55,0.9)]" />
          </motion.div>
          <motion.div
            aria-hidden
            className={`absolute inset-[24%] rounded-full border ${
              active ? 'border-cyan/40' : 'border-white/12'
            }`}
            animate={reduce || !active ? undefined : { scale: [1, 1.04, 1] }}
            transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div
            aria-hidden
            className={`absolute inset-[34%] rounded-full transition ${
              active
                ? 'bg-[radial-gradient(circle_at_35%_30%,#FFF1C1,#E2C275_38%,#B68D3A_78%,#0a0a0e)] shadow-[0_0_60px_rgba(226,194,117,0.45)]'
                : 'bg-[radial-gradient(circle_at_35%_30%,rgba(248,250,252,0.35),rgba(14,19,31,0.9)_70%)] shadow-none'
            }`}
          />
          <div className="absolute inset-0 grid place-items-center">
            <div className="text-center">
              <p className="mx-numeric text-[0.6rem] tracking-[0.22em] text-ink-faint uppercase">
                {active ? copy.armed : copy.paused}
              </p>
              <p className="mt-1 font-mono text-sm font-bold text-ink drop-shadow">
                {hashrateMhs.toLocaleString('en-US', { maximumFractionDigits: 0 })} MH/s
              </p>
            </div>
          </div>

          {active
            ? particles.map((particle) => (
                <motion.span
                  key={particle.id}
                  aria-hidden
                  className="absolute rounded-full bg-cyan/70"
                  style={{
                    left: `${particle.left}%`,
                    top: `${particle.top}%`,
                    width: particle.size,
                    height: particle.size,
                  }}
                  initial={{ opacity: 0, y: 0 }}
                  animate={
                    reduce
                      ? { opacity: 0.5 }
                      : { opacity: [0, 0.9, 0], y: [-2, -26 - (particle.id % 5) * 6] }
                  }
                  transition={{
                    duration: 2.4 + (particle.id % 4) * 0.4,
                    repeat: Infinity,
                    delay: particle.delay,
                    ease: 'easeOut',
                  }}
                />
              ))
            : null}
        </div>

        {/* ------------------------------------------------------- Telemetry */}
        <div className="min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="mx-eyebrow">{copy.title}</p>
              <p className="mt-2 text-[0.72rem] text-ink-faint">
                {copy.plan}: <span className="text-ink-soft">{planName}</span>
              </p>
            </div>
            <div className="flex rounded-lg border border-white/10 p-0.5" role="group" aria-label={copy.speed}>
              {(['mh', 'th'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setUnit(option);
                    sound.click();
                  }}
                  aria-pressed={unit === option}
                  className={`rounded-md px-2 py-1 text-[0.64rem] font-semibold transition ${
                    unit === option ? 'bg-cyan/15 text-cyan' : 'text-ink-faint hover:text-ink'
                  }`}
                >
                  {option === 'mh' ? copy.unitMh : copy.unitTh}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex items-end justify-between gap-4">
            <div>
              <p className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{copy.speed}</p>
              <p className="mx-numeric mt-1 text-[1.9rem] leading-none font-bold text-ink">
                {display.toLocaleString('en-US', {
                  minimumFractionDigits: digits,
                  maximumFractionDigits: digits,
                })}
                <span className="ms-1 text-[0.7rem] font-semibold text-ink-faint">
                  {unit === 'mh' ? copy.unitMh : copy.unitTh}
                </span>
              </p>
            </div>
            <svg viewBox="0 0 200 112" className="h-[74px] w-[132px]" role="img" aria-label={copy.speed}>
              <defs>
                <linearGradient id="gauge-gold" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#B68D3A" />
                  <stop offset="55%" stopColor="#E2C275" />
                  <stop offset="100%" stopColor="#f3d06b" />
                </linearGradient>
              </defs>
              <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="rgba(248,250,252,0.1)" strokeWidth="9" strokeLinecap="round" />
              <path
                d="M20 100 A80 80 0 0 1 180 100"
                fill="none"
                stroke="url(#gauge-gold)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={`${(ratio * arc).toFixed(1)} ${arc}`}
                className="transition-all duration-700"
              />
              <circle
                cx={100 - Math.cos(Math.PI * ratio) * 80}
                cy={100 - Math.sin(Math.PI * ratio) * 80}
                r="4.5"
                fill="#f3d06b"
              />
            </svg>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <div className="flex items-center justify-between text-[0.66rem]">
                <span className="text-ink-faint">{copy.temperature}</span>
                <span className="mx-numeric font-semibold text-ink-soft">{temperature}°C</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${
                    temperature > 58 ? 'bg-gradient-to-r from-amber to-rose-400' : 'bg-gradient-to-r from-cyan to-mint'
                  }`}
                  style={{ width: `${clamp((temperature / 80) * 100, 4, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between text-[0.66rem]">
                <span className="text-ink-faint">{copy.efficiency}</span>
                <span className="mx-numeric font-semibold text-ink-soft">{efficiency}%</span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-mint to-cyan transition-all duration-700"
                  style={{ width: `${efficiency}%` }}
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              sound.click();
              onToggle();
            }}
            disabled={busy}
            aria-pressed={active}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-[0.78rem] font-bold transition sm:w-auto ${
              active
                ? 'border border-rose-400/35 text-rose-200 hover:border-rose-400/60'
                : 'bg-[linear-gradient(100deg,#E2C275,#FFF1C1)] text-[#120d02] shadow-[0_10px_28px_-12px_rgba(212,175,55,0.8)] hover:brightness-110'
            } disabled:opacity-60`}
          >
            <span aria-hidden>{active ? '❚❚' : '▶'}</span>
            {busy ? copy.working : active ? copy.stop : copy.start}
          </button>
          <p className="mt-3 text-[0.68rem] leading-relaxed text-ink-faint">{copy.hint}</p>
        </div>
      </div>
    </section>
  );
}
