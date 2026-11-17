'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';
import { getNewsCopy } from '@/lib/news-i18n';
import type { NewsPayload } from '@/lib/news';

/**
 * Breaking-news marquee.
 *
 * Pinned under the site chrome on every page. It shares the `/api/news`
 * payload with the news desk (one server cache, one upstream sweep) and
 * refreshes on the same five-minute cadence. The track is duplicated so the
 * loop has no seam, and it pauses on hover so a headline can be read without
 * chasing it.
 */
export default function BreakingNewsTicker({ limit = 14 }: { limit?: number }) {
  const { lang, href } = useI18n();
  const copy = getNewsCopy(lang);
  const [payload, setPayload] = useState<NewsPayload | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch(`/api/news?lang=${encodeURIComponent(lang)}`, {
          cache: 'no-store',
        });
        if (!response.ok) return;
        const data = (await response.json()) as NewsPayload & { ok?: boolean };
        if (!cancelled && data.ok) setPayload(data);
      } catch {
        // The ticker is decorative; the last batch stays on screen.
      }
    };

    void load();
    const timer = window.setInterval(load, 5 * 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [lang]);

  const headlines = useMemo(
    () => (payload?.items ?? []).slice(0, limit),
    [payload, limit],
  );

  if (headlines.length === 0) {
    return (
      <div className="border-t border-amber/15 bg-[#050810]">
        <div className="mx-auto flex h-9 w-full max-w-[84rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
          <span className="text-[0.6rem] font-bold tracking-[0.22em] text-amber/80 uppercase">
            {copy.tickerLabel}
          </span>
          <span className="h-3 w-px bg-white/10" />
          <span className="text-[0.72rem] text-ink-faint">{copy.refreshNote}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="group/ticker relative overflow-hidden border-t border-amber/15 bg-[#050810]">
      <div className="pointer-events-none absolute inset-y-0 start-0 z-10 w-16 bg-gradient-to-r from-[#050810] to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 end-0 z-10 w-16 bg-gradient-to-l from-[#050810] to-transparent" />

      <div className="mx-auto flex h-9 w-full max-w-[84rem] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <Link
          href={href('/news')}
          className="shrink-0 text-[0.6rem] font-bold tracking-[0.22em] text-amber uppercase transition hover:text-amber/80"
        >
          {copy.tickerLabel}
        </Link>
        <span className="h-3 w-px shrink-0 bg-amber/25" />

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="mx-marquee-track group-hover/ticker:[animation-play-state:paused]">
            {[0, 1].map((pass) => (
              <div key={pass} className="flex shrink-0 items-center" aria-hidden={pass === 1}>
                {headlines.map((item) => (
                  <a
                    key={`${pass}-${item.id}`}
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex shrink-0 items-center gap-2 px-5 text-[0.74rem] whitespace-nowrap text-ink-soft transition hover:text-amber"
                    tabIndex={pass === 1 ? -1 : undefined}
                  >
                    <span aria-hidden className="text-[0.5rem] text-amber/70">
                      ◆
                    </span>
                    <span className="max-w-[46ch] truncate">{item.title}</span>
                    <span className="text-[0.6rem] tracking-[0.1em] text-ink-faint uppercase">
                      {item.source}
                    </span>
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
