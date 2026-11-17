'use client';

import { usePathname } from 'next/navigation';
import React, { useEffect, useMemo, useState } from 'react';

import SupportChat from './SupportChat';
import { useI18n } from '@/lib/i18n-provider';
import { supportCopy } from '@/lib/support-i18n';

/**
 * The 24/7 assistant, available from every page.
 *
 * A small launcher opens the same knowledge-base chat used at /support and
 * /contact, so a visitor mid-checkout or mid-withdrawal never has to leave the
 * page to ask a question. It closes on Escape and on a second click.
 */
export default function AiSupportWidget() {
  const { lang } = useI18n();
  const pathname = usePathname();
  const copy = useMemo(() => supportCopy(lang), [lang]);
  const [open, setOpen] = useState(false);

  // The help centre and the contact page already show the full chat inline.
  const inline = /\/(support|contact)\/?$/.test(pathname ?? '');

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  if (inline) return null;

  return (
    <div className="fixed bottom-4 end-4 z-50 flex flex-col items-end gap-2 print:hidden">
      {open ? (
        <div
          role="dialog"
          aria-label={copy.widget.title}
          className="w-[min(23rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-amber/25 bg-[#080d18] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]"
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/8 px-4 py-2.5">
            <p className="text-[0.78rem] font-bold text-ink">{copy.widget.title}</p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg border border-white/10 px-2 py-1 text-[0.68rem] text-ink-mute transition hover:border-amber/40 hover:text-amber"
            >
              {copy.widget.close}
            </button>
          </div>
          <SupportChat dense />
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="inline-flex items-center gap-2 rounded-full bg-[linear-gradient(100deg,#d4af37,#fff3b0)] px-4 py-2.5 text-[0.78rem] font-bold text-[#120d02] shadow-[0_16px_40px_-16px_rgba(212,175,55,0.9)] transition hover:brightness-110"
      >
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#120d02] opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#120d02]" />
        </span>
        {copy.widget.open}
      </button>
    </div>
  );
}
