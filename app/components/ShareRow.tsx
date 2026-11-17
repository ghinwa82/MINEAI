'use client';

import React, { useState } from 'react';

import {
  SHARE_LABELS,
  SHARE_NETWORKS,
  shareTarget,
  shareUrl,
  type ShareNetwork,
} from '@/lib/share';

/**
 * Share row.
 *
 * Buttons rather than links because the origin is only known in the browser;
 * building the URL on click also keeps the server-rendered markup identical
 * for every visitor, so there is nothing for hydration to disagree about.
 * The referral code rides on every network and on the copy action, which is
 * what makes the share-to-earn loop measurable.
 */

const GLYPHS: Record<ShareNetwork, React.ReactNode> = {
  x: (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="currentColor">
      <path d="M18.9 2H22l-6.8 7.8L23 22h-6.3l-4.9-6.4L6.2 22H3l7.3-8.3L2.4 2h6.4l4.4 5.8L18.9 2Zm-1.1 18h1.7L8.3 3.9H6.5L17.8 20Z" />
    </svg>
  ),
  telegram: (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="currentColor">
      <path d="M21.9 4.3 18.6 20c-.2 1.1-.9 1.4-1.8.9l-5-3.7-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 9-8.1c.4-.3-.1-.5-.6-.2L6.1 13.4l-4.7-1.5c-1-.3-1-1 .2-1.5L20.6 2.9c.9-.3 1.6.2 1.3 1.4Z" />
    </svg>
  ),
  whatsapp: (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="currentColor">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.1-1.3A10 10 0 1 0 12 2Zm5.7 14.2c-.2.7-1.4 1.3-2 1.4-.5.1-1.2.1-1.9-.1-.4-.1-1-.3-1.7-.6-3-1.3-4.9-4.3-5-4.5-.2-.2-1.2-1.6-1.2-3s.7-2.1 1-2.4c.3-.3.6-.4.8-.4h.6c.2 0 .4 0 .7.5l.9 2.1c.1.2.1.4 0 .6l-.4.5c-.2.2-.4.4-.2.7.2.3.7 1.2 1.6 2 1.1 1 2 1.3 2.3 1.4.2.1.4.1.6-.1l.9-1c.2-.2.4-.2.6-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.4Z" />
    </svg>
  ),
  facebook: (
    <svg viewBox="0 0 24 24" aria-hidden className="h-3.5 w-3.5" fill="currentColor">
      <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.4h-1.2c-1.2 0-1.6.8-1.6 1.6V12h2.7l-.4 2.9h-2.3v7A10 10 0 0 0 22 12Z" />
    </svg>
  ),
};

export default function ShareRow({
  code,
  path,
  text,
  label,
  shareTitle,
}: {
  code?: string | null;
  path: string;
  text: string;
  label: string;
  shareTitle: string;
}) {
  const [copied, setCopied] = useState(false);

  const open = (network: ShareNetwork) => {
    const href = shareTarget(network, { origin: window.location.origin, path, text, code });
    window.open(href, '_blank', 'noopener,noreferrer,width=680,height=560');
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(
        shareUrl({ origin: window.location.origin, path, code }),
      );
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard refused — the network buttons still carry the link.
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-[0.62rem] font-semibold tracking-[0.16em] text-ink-faint uppercase">
        {label}
      </span>
      {SHARE_NETWORKS.map((network) => (
        <button
          key={network}
          type="button"
          onClick={() => open(network)}
          aria-label={`${shareTitle} — ${SHARE_LABELS[network]}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[0.72rem] text-ink-mute transition hover:border-amber/40 hover:text-amber"
        >
          {GLYPHS[network]}
          <span className="hidden sm:inline">{SHARE_LABELS[network]}</span>
        </button>
      ))}
      <button
        type="button"
        onClick={copy}
        className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1.5 text-[0.72rem] text-ink-mute transition hover:border-amber/40 hover:text-amber"
      >
        {copied ? '✓' : '⧉'}
      </button>
    </div>
  );
}
