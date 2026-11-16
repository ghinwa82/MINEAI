import type { SupportedLanguage } from '@/types';

/**
 * The universal language matrix.
 *
 * Six locales are hard-coded: English is the absolute default and the fallback
 * for every missing key, Arabic drives the RTL layout, and the remaining
 * locales share the LTR grid with locale-specific typography.
 */
export const LANGUAGE_CODES = ['en', 'ar', 'fr', 'es', 'zh', 'hi'] as const;

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

export type TextDirection = 'ltr' | 'rtl';

export interface LanguageMeta {
  code: SupportedLanguage;
  /** Name in the language itself — always shown first in the switcher. */
  native: string;
  /** English name — shown as the secondary label. */
  english: string;
  dir: TextDirection;
  /** BCP-47 tag used for `Intl`, `hreflang` and Open Graph. */
  locale: string;
  /** `og:locale` value expected by social crawlers. */
  ogLocale: string;
  /** Font stack applied to `html[data-lang="…"]` — keeps scripts legible. */
  fontStack: string;
}

export const LANGUAGES: Record<SupportedLanguage, LanguageMeta> = {
  en: {
    code: 'en',
    native: 'English',
    english: 'English',
    dir: 'ltr',
    locale: 'en-US',
    ogLocale: 'en_US',
    fontStack:
      '"Inter var", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  ar: {
    code: 'ar',
    native: 'العربية',
    english: 'Arabic',
    dir: 'rtl',
    locale: 'ar',
    ogLocale: 'ar_AR',
    fontStack:
      '"IBM Plex Sans Arabic", "Noto Sans Arabic", "Segoe UI", Tahoma, "Geeza Pro", sans-serif',
  },
  fr: {
    code: 'fr',
    native: 'Français',
    english: 'French',
    dir: 'ltr',
    locale: 'fr-FR',
    ogLocale: 'fr_FR',
    fontStack:
      '"Inter var", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  es: {
    code: 'es',
    native: 'Español',
    english: 'Spanish',
    dir: 'ltr',
    locale: 'es-ES',
    ogLocale: 'es_ES',
    fontStack:
      '"Inter var", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  },
  zh: {
    code: 'zh',
    native: '中文',
    english: 'Chinese',
    dir: 'ltr',
    locale: 'zh-CN',
    ogLocale: 'zh_CN',
    fontStack:
      '"Noto Sans SC", "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", "Heiti SC", sans-serif',
  },
  hi: {
    code: 'hi',
    native: 'हिन्दी',
    english: 'Hindi',
    dir: 'ltr',
    locale: 'hi-IN',
    ogLocale: 'hi_IN',
    fontStack:
      '"Noto Sans Devanagari", "Nirmala UI", "Mangal", -apple-system, BlinkMacSystemFont, sans-serif',
  },
};

export const RTL_LANGUAGES: SupportedLanguage[] = ['ar'];

export function isRTL(lang: SupportedLanguage): boolean {
  return RTL_LANGUAGES.includes(lang);
}

/**
 * Coerces any untrusted value (URL param, localStorage, header) into a
 * supported language code. Anything unknown collapses to English.
 */
export function normalizeLanguage(value: unknown): SupportedLanguage {
  if (typeof value !== 'string') return DEFAULT_LANGUAGE;
  const candidate = value.trim().toLowerCase().split(/[-_]/)[0] as SupportedLanguage;
  return (LANGUAGE_CODES as readonly string[]).includes(candidate)
    ? candidate
    : DEFAULT_LANGUAGE;
}

export function languageMeta(lang: SupportedLanguage): LanguageMeta {
  return LANGUAGES[lang];
}

/** Ordered locale list used for `alternates.languages` and the sitemap. */
export const LOCALES = LANGUAGE_CODES.map((code) => LANGUAGES[code].locale);
