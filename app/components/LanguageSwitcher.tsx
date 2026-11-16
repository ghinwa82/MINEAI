'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useI18n } from '@/lib/i18n-provider';
import { LANGUAGES, LANGUAGE_CODES } from '@/lib/languages';
import type { SupportedLanguage } from '@/types';

/**
 * Language control.
 *
 * A bespoke popover rather than a native select: it shows each language in
 * its own script, keeps the current choice visible, and behaves like a menu
 * for keyboard and pointer users alike.
 */
export default function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [focused, setFocused] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (open) {
      setFocused(Math.max(0, LANGUAGE_CODES.indexOf(lang)));
    }
  }, [open, lang]);

  const choose = (code: SupportedLanguage) => {
    setLang(code);
    setOpen(false);
  };

  const onKeyNavigation = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!open) return;
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setFocused((index) => (index + 1) % LANGUAGE_CODES.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setFocused((index) => (index - 1 + LANGUAGE_CODES.length) % LANGUAGE_CODES.length);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      choose(LANGUAGE_CODES[focused]);
    }
  };

  const meta = LANGUAGES[lang];

  return (
    <div ref={containerRef} className="relative" onKeyDown={onKeyNavigation}>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t.language.switch}
        onClick={() => setOpen((value) => !value)}
        className="group/lang flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs font-semibold text-ink-soft transition hover:border-cyan-400/50 hover:bg-cyan-400/8 hover:text-cyan"
      >
        <span className="mx-font-mono text-[0.65rem] tracking-[0.18em] uppercase text-cyan">
          {meta.code}
        </span>
        {!compact ? (
          <span className="hidden sm:inline" dir={meta.dir}>
            {meta.native}
          </span>
        ) : null}
        <svg
          width="9"
          height="6"
          viewBox="0 0 9 6"
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          aria-hidden
        >
          <path d="M0.5 1L4.5 5L8.5 1" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinecap="round" />
        </svg>
      </button>

      {open ? (
        <div
          role="listbox"
          aria-label={t.language.label}
          className="absolute end-0 z-50 mt-2 w-52 overflow-hidden rounded-2xl border border-white/10 bg-[#080d18]/95 p-1.5 shadow-[0_28px_70px_-24px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
        >
          {LANGUAGE_CODES.map((code, index) => {
            const item = LANGUAGES[code];
            const active = code === lang;
            return (
              <button
                key={code}
                role="option"
                aria-selected={active}
                type="button"
                onMouseEnter={() => setFocused(index)}
                onClick={() => choose(code)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2 text-start transition ${
                  active ? 'bg-cyan-400/12 text-cyan' : 'text-ink-soft hover:bg-white/5 hover:text-ink'
                } ${index === focused ? 'ring-1 ring-cyan-400/30' : ''}`}
              >
                <span className="flex flex-col gap-0.5" dir={item.dir}>
                  <span className="text-sm font-semibold">{item.native}</span>
                  <span className="text-[0.65rem] text-ink-faint">{item.english}</span>
                </span>
                <span className="mx-font-mono text-[0.6rem] tracking-[0.16em] uppercase text-ink-faint">
                  {item.code}
                </span>
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
