'use client';

import { useEffect } from 'react';

/**
 * Referral link capture.
 *
 * A shared link lands on any page with `?ref=CODE`. The code is stashed in
 * localStorage here, at the edge of the app, so the visitor can read the news,
 * the markets and the store before ever opening the rewards console — and the
 * code is still waiting when they do. Nothing is applied automatically: the
 * rewards console offers it back to the visitor to confirm.
 */

export const REFERRAL_STORAGE_KEY = 'mineai.ref';

export default function ReferralCapture() {
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('ref')?.trim();
      if (!raw) return;
      const code = raw.toUpperCase().slice(0, 24);
      if (!/^[A-Z0-9_-]{4,24}$/.test(code)) return;
      window.localStorage.setItem(REFERRAL_STORAGE_KEY, code);
    } catch {
      // Private mode or a hostile storage policy — capture is best-effort.
    }
  }, []);

  return null;
}
