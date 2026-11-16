'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { usePathname, useRouter } from 'next/navigation';

import type { SupportedLanguage } from '@/types';
import { getDictionary, type Dictionary } from '@/lib/i18n';
import { getEcosystemCopy, type EcosystemCopy } from '@/lib/ecosystem-i18n';
import {
  DEFAULT_LANGUAGE,
  LANGUAGES,
  isRTL,
  normalizeLanguage,
  type TextDirection,
} from '@/lib/languages';
import { localeFromPath, localizedPath, stripLocale } from '@/lib/routes';

const STORAGE_KEY = 'mineai.lang';

interface I18nContextValue {
  lang: SupportedLanguage;
  dir: TextDirection;
  dictionary: Dictionary;
  /** Convenience alias so call sites read `t.nav.store` rather than `dictionary.nav.store`. */
  t: Dictionary;
  /** Copy for the financial and Web3 modules. */
  eco: EcosystemCopy;
  /** Prefixes a canonical path with the active locale (`/fr/store`). */
  href: (path: string) => string;
  setLang: (lang: SupportedLanguage) => void;
}

const I18nContext = createContext<I18nContextValue | null>(null);

function readStoredLanguage(): SupportedLanguage | null {
  if (typeof window === 'undefined') return null;
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored ? normalizeLanguage(stored) : null;
  } catch {
    return null;
  }
}

/**
 * The single language authority for the whole site.
 *
 * The locale encoded in the URL always wins, because a URL is an explicit
 * instruction from the visitor or a crawler. When there is no locale segment
 * the stored preference is applied and the URL is rewritten to match, so the
 * canonical path and the rendered language never disagree. English is the
 * final fallback, and the provider owns the document direction so RTL is
 * never guessed at from the markup.
 */
export function I18nProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const routeLocale = localeFromPath(pathname);

  const [lang, setLangState] = useState<SupportedLanguage>(routeLocale ?? DEFAULT_LANGUAGE);
  const settled = useRef(false);

  useEffect(() => {
    // An explicit locale in the path is authoritative.
    if (routeLocale) {
      settled.current = true;
      setLangState(routeLocale);
      return;
    }

    if (settled.current) return;
    settled.current = true;

    const stored = readStoredLanguage();
    if (!stored || stored === DEFAULT_LANGUAGE) return;

    // Move the visitor onto their preferred locale so the canonical URL and
    // the rendered language stay in agreement.
    setLangState(stored);
    router.replace(localizedPath(stored, stripLocale(pathname)));
  }, [pathname, routeLocale, router]);

  useEffect(() => {
    const root = document.documentElement;
    const meta = LANGUAGES[lang];
    root.lang = lang;
    root.dir = meta.dir;
    root.dataset.lang = lang;
    root.style.setProperty('--font-ui', meta.fontStack);
  }, [lang]);

  const setLang = useCallback(
    (next: SupportedLanguage) => {
      const normalized = normalizeLanguage(next);
      setLangState(normalized);
      try {
        window.localStorage.setItem(STORAGE_KEY, normalized);
      } catch {
        // Private browsing — the choice simply will not persist.
      }

      // Keep the URL in step so the choice is shareable and indexable.
      const base = stripLocale(pathname);
      const target = localizedPath(normalized, base);
      if (target !== pathname) {
        router.push(target);
      }
    },
    [pathname, router],
  );

  const value = useMemo<I18nContextValue>(() => {
    const dictionary = getDictionary(lang);
    return {
      lang,
      dir: isRTL(lang) ? 'rtl' : 'ltr',
      dictionary,
      t: dictionary,
      eco: getEcosystemCopy(lang),
      href: (path: string) => localizedPath(lang, path),
      setLang,
    };
  }, [lang, setLang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used inside <I18nProvider>');
  }
  return context;
}

export { STORAGE_KEY as LANGUAGE_STORAGE_KEY };
