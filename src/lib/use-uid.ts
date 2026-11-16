'use client';

import { useEffect, useState } from 'react';

/**
 * The operator id.
 *
 * There is no account system in this build: the browser mints a random,
 * URL-safe id once and keeps it in local storage. The mining, rewards and
 * two-factor routes all key their state on it. It is deliberately not derived
 * from anything personal.
 */
const STORAGE_KEY = 'mineai.uid';
const PATTERN = /^[A-Za-z0-9_-]{8,48}$/;

function mint(): string {
  const bytes = new Uint8Array(12);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) {
    crypto.getRandomValues(bytes);
  } else {
    for (let index = 0; index < bytes.length; index += 1) {
      bytes[index] = Math.floor(Math.random() * 256);
    }
  }
  const body = Array.from(bytes, (byte) => byte.toString(36).padStart(2, '0')).join('');
  return `op${body}`.slice(0, 26);
}

export function useUid(): string | null {
  const [uid, setUid] = useState<string | null>(null);

  useEffect(() => {
    let stored = '';
    try {
      stored = window.localStorage.getItem(STORAGE_KEY) ?? '';
    } catch {
      // Private browsing: the id lives for this tab only.
    }

    if (!PATTERN.test(stored)) {
      stored = mint();
      try {
        window.localStorage.setItem(STORAGE_KEY, stored);
      } catch {
        // Ignored — the in-memory id still works for this visit.
      }
    }

    setUid(stored);
  }, []);

  return uid;
}
