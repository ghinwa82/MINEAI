'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { useI18n } from '@/lib/i18n-provider';
import type { SupportedLanguage } from '@/types';

/**
 * The explainer.
 *
 * There is no video file to download: the piece is staged in the DOM and
 * narrated by the browser's own speech engine in the reader's language, so it
 * weighs nothing, translates instantly and never ships a megabyte of MP4.
 *
 * Four scenes, twenty-two seconds each — ninety seconds end to end. Captions
 * are always visible, so the story survives muted playback, a missing voice or
 * a browser that refuses speech synthesis entirely.
 */

const SCENE_MS = 22_000;

const VOICE: Record<SupportedLanguage, string> = {
  en: 'en-US',
  ar: 'ar-SA',
  fr: 'fr-FR',
  es: 'es-ES',
  zh: 'zh-CN',
  hi: 'hi-IN',
};

const STAGE = [
  {
    accent: '#22e0ff',
    second: '#4ade9f',
    glyph: 'mesh',
  },
  {
    accent: '#4ade9f',
    second: '#ffbe4d',
    glyph: 'scout',
  },
  {
    accent: '#ffbe4d',
    second: '#22e0ff',
    glyph: 'settle',
  },
  {
    accent: '#a78bfa',
    second: '#22e0ff',
    glyph: 'proof',
  },
] as const;

export default function ExplainerVideoPlayer() {
  const { eco, lang } = useI18n();
  const reduce = useReducedMotion();
  const scenes = eco.video.captions;

  const [index, setIndex] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [started, setStarted] = useState(false);
  const [muted, setMuted] = useState(false);

  // Advance the clock only while playing.
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setElapsed((previous) => previous + 120);
    }, 120);
    return () => window.clearInterval(timer);
  }, [playing]);

  // Roll into the next scene once the current one has run its course.
  useEffect(() => {
    if (elapsed < SCENE_MS) return;
    setElapsed(0);
    setIndex((previous) => (previous + 1) % scenes.length);
  }, [elapsed, scenes.length]);

  // Narration follows the scene. Cancelled on pause, mute or unmount.
  useEffect(() => {
    if (!playing || muted || !started) return;
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    const synth = window.speechSynthesis;
    const scene = scenes[index];
    const utterance = new SpeechSynthesisUtterance(`${scene.title}. ${scene.line}`);
    utterance.lang = VOICE[lang];
    utterance.rate = 0.97;
    utterance.pitch = 1.02;

    const voices = synth.getVoices();
    const match =
      voices.find((voice) => voice.lang.replace('_', '-') === VOICE[lang]) ??
      voices.find((voice) => voice.lang.toLowerCase().startsWith(lang));
    if (match) utterance.voice = match;

    synth.cancel();
    synth.speak(utterance);

    return () => {
      synth.cancel();
    };
  }, [index, playing, muted, started, lang, scenes]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stage = STAGE[index % STAGE.length];
  const scene = scenes[index];
  const total = scenes.length * SCENE_MS;
  const overall = Math.min(1, (index * SCENE_MS + elapsed) / total);
  const sceneProgress = Math.min(1, elapsed / SCENE_MS);

  const clock = useMemo(() => {
    const seconds = Math.round(overall * (total / 1000));
    const minutes = Math.floor(seconds / 60);
    const rest = String(seconds % 60).padStart(2, '0');
    return `${minutes}:${rest}`;
  }, [overall, total]);

  const play = () => {
    if (!started) {
      setStarted(true);
      setPlaying(true);
      return;
    }
    setPlaying((previous) => !previous);
  };

  const restart = () => {
    setIndex(0);
    setElapsed(0);
    setStarted(true);
    setPlaying(true);
  };

  const jumpTo = (target: number) => {
    setIndex(target);
    setElapsed(0);
    setStarted(true);
  };

  return (
    <section className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-[#060a14]">
      <div className="grid lg:grid-cols-[1.55fr_1fr]">
        {/* ------------------------------------------------------- Stage */}
        <div className="relative min-h-[19rem] overflow-hidden border-b border-white/8 lg:min-h-[26rem] lg:border-b-0 lg:border-e">
          <div
            className="absolute inset-0 transition-colors duration-700"
            style={{
              background: `radial-gradient(circle at 28% 18%, ${stage.accent}2e, transparent 58%), radial-gradient(circle at 78% 82%, ${stage.second}24, transparent 62%), #04060d`,
            }}
            aria-hidden
          />

          {/* Drifting contour rings */}
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            {[0, 1, 2].map((ring) => (
              <motion.div
                key={`${index}-${ring}`}
                className="absolute rounded-full border"
                style={{
                  borderColor: `${stage.accent}30`,
                  width: `${16 + ring * 11}rem`,
                  height: `${16 + ring * 11}rem`,
                  left: '50%',
                  top: '48%',
                  x: '-50%',
                  y: '-50%',
                }}
                initial={{ opacity: 0, scale: reduce ? 1 : 0.86 }}
                animate={{ opacity: [0.18, 0.5, 0.18], scale: reduce ? 1 : 1 }}
                transition={{ duration: 7 + ring, repeat: reduce ? 0 : Infinity, ease: 'easeInOut' }}
              />
            ))}
          </div>

          {/* Scene glyph */}
          <div className="relative flex h-full flex-col justify-between p-6 sm:p-8">
            <div className="flex items-center justify-between gap-4">
              <span className="mx-chip !border-white/12 !bg-black/30 !text-ink-soft">
                {eco.video.sceneOf} {index + 1}/{scenes.length}
              </span>
              <span className="mx-numeric text-[0.7rem] text-ink-faint">
                {clock} / 1:28
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`glyph-${index}`}
                initial={{ opacity: 0, scale: reduce ? 1 : 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: reduce ? 1 : 0.96 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="pointer-events-none absolute inset-0 grid place-items-center"
                aria-hidden
              >
                <StageGlyph kind={stage.glyph} accent={stage.accent} second={stage.second} reduce={Boolean(reduce)} />
              </motion.div>
            </AnimatePresence>

            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.h3
                  key={`title-${index}`}
                  initial={{ opacity: 0, y: reduce ? 0 : 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -10 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="max-w-md text-[clamp(1.35rem,2.6vw,2rem)] font-bold leading-tight text-ink"
                >
                  {scene.title}
                </motion.h3>
              </AnimatePresence>
              <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full transition-[width] duration-150 ease-linear"
                  style={{ width: `${sceneProgress * 100}%`, background: `linear-gradient(90deg, ${stage.accent}, ${stage.second})` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* ---------------------------------------------------- Narration */}
        <div className="flex flex-col justify-between gap-6 p-6 sm:p-8">
          <div>
            <p className="mx-eyebrow">{eco.video.title}</p>
            <p className="mt-4 text-[0.85rem] leading-relaxed text-ink-mute">{eco.video.lead}</p>

            <div className="mt-7 min-h-[7.5rem]" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`line-${index}`}
                  initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: reduce ? 0 : -8 }}
                  transition={{ duration: 0.4 }}
                  className="text-[0.95rem] leading-relaxed text-ink-soft"
                >
                  {scene.line}
                </motion.p>
              </AnimatePresence>
            </div>

            <ol className="mt-2 flex gap-1.5">
              {scenes.map((item, position) => (
                <li key={item.title} className="flex-1">
                  <button
                    type="button"
                    onClick={() => jumpTo(position)}
                    aria-label={`${eco.video.sceneOf} ${position + 1}: ${item.title}`}
                    aria-current={position === index ? 'true' : undefined}
                    className={`h-1.5 w-full rounded-full transition-colors ${
                      position === index
                        ? 'bg-cyan'
                        : position < index
                          ? 'bg-cyan/45'
                          : 'bg-white/12 hover:bg-white/25'
                    }`}
                  />
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button type="button" onClick={play} className="mx-btn !px-4 !py-2.5 !text-[0.8rem]">
              {playing ? eco.video.pause : started ? eco.video.play : eco.video.play}
              <span aria-hidden>{playing ? '❚❚' : '▶'}</span>
            </button>

            <button type="button" onClick={restart} className="mx-btn-quiet !px-4 !py-2.5 !text-[0.8rem]">
              {eco.video.restart}
            </button>

            <button
              type="button"
              onClick={() => setMuted((previous) => !previous)}
              aria-pressed={muted}
              className="mx-btn-quiet !px-4 !py-2.5 !text-[0.8rem]"
            >
              {muted ? eco.video.unmute : eco.video.mute}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */

function StageGlyph({
  kind,
  accent,
  second,
  reduce,
}: {
  kind: 'mesh' | 'scout' | 'settle' | 'proof';
  accent: string;
  second: string;
  reduce: boolean;
}) {
  const nodes = [
    { x: 50, y: 24 },
    { x: 74, y: 40 },
    { x: 66, y: 70 },
    { x: 34, y: 74 },
    { x: 24, y: 44 },
    { x: 50, y: 52 },
  ];

  return (
    <svg viewBox="0 0 100 100" className="h-[72%] w-[72%] max-w-[19rem] opacity-90" role="presentation">
      <defs>
        <linearGradient id={`stage-${kind}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={accent} />
          <stop offset="100%" stopColor={second} />
        </linearGradient>
      </defs>

      {kind === 'mesh' ? (
        <g stroke={`url(#stage-${kind})`} fill="none">
          {nodes.map((from, i) =>
            nodes.slice(i + 1).map((to) => (
              <line key={`${i}-${to.x}-${to.y}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} strokeWidth="0.5" opacity="0.5" />
            )),
          )}
          {nodes.map((node, i) => (
            <circle key={i} cx={node.x} cy={node.y} r={i === 5 ? 3.4 : 1.9} fill={i === 5 ? accent : '#04060d'} strokeWidth="0.9">
              {!reduce && i === 5 ? <animate attributeName="r" values="3;4.4;3" dur="2.4s" repeatCount="indefinite" /> : null}
            </circle>
          ))}
        </g>
      ) : null}

      {kind === 'scout' ? (
        <g fill="none" stroke={`url(#stage-${kind})`} strokeWidth="1.1">
          <circle cx="50" cy="50" r="30" strokeDasharray="3 5" opacity="0.55">
            {!reduce ? <animateTransform attributeName="transform" type="rotate" from="0 50 50" to="360 50 50" dur="18s" repeatCount="indefinite" /> : null}
          </circle>
          <path d="M50 50 L70 34 L62 62 Z" strokeWidth="1.4" />
          <circle cx="50" cy="50" r="3" fill={accent} stroke="none" />
          {[
            [26, 30],
            [78, 26],
            [80, 72],
            [22, 68],
          ].map(([x, y], i) => (
            <rect key={i} x={x} y={y} width="7" height="5" rx="1" strokeWidth="0.9" opacity="0.7" />
          ))}
        </g>
      ) : null}

      {kind === 'settle' ? (
        <g fill="none" stroke={`url(#stage-${kind})`} strokeWidth="1.2">
          <rect x="20" y="36" width="60" height="34" rx="5" />
          <path d="M20 46h60" strokeWidth="0.9" opacity="0.6" />
          <path d="M28 58h18M28 63h11" strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="68" cy="60" r="6" />
          <path d="M65.5 60l2 2 3.6-4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M50 24v8M50 74v6" strokeWidth="0.8" strokeDasharray="2 3" opacity="0.7" />
        </g>
      ) : null}

      {kind === 'proof' ? (
        <g fill="none" stroke={`url(#stage-${kind})`} strokeWidth="1.2">
          {[0, 1, 2, 3].map((row) => (
            <g key={row} opacity={1 - row * 0.16}>
              <rect x="22" y={30 + row * 12} width="56" height="8" rx="2" />
              <path d={`M28 ${34 + row * 12}h${18 - row * 2}`} strokeWidth="1" opacity="0.65" />
              <circle cx="70" cy={34 + row * 12} r="1.6" fill={accent} stroke="none" />
            </g>
          ))}
          <path d="M30 22h40" strokeWidth="1.6" strokeLinecap="round" />
        </g>
      ) : null}
    </svg>
  );
}
