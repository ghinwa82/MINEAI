import type { SupportedLanguage } from '@/types';
import { LANGUAGE_CODES, LANGUAGES, normalizeLanguage } from '@/lib/languages';

/**
 * Locale-aware routing.
 *
 * English lives at the root of every route (`/store`); the other five
 * languages live under a locale segment (`/fr/store`). That gives each
 * language a distinct, crawlable URL and lets the sitemap and hreflang
 * alternates point at real pages instead of duplicates.
 */

const LOCALE_SEGMENTS = new Set<string>(LANGUAGE_CODES.filter((code) => code !== 'en'));

/** Returns the locale encoded in a pathname, or null when there is none. */
export function localeFromPath(pathname: string): SupportedLanguage | null {
  const segment = pathname.split('/').filter(Boolean)[0];
  if (!segment) return null;
  const candidate = segment.toLowerCase();
  if (!LOCALE_SEGMENTS.has(candidate)) return null;
  return normalizeLanguage(candidate);
}

/** Builds the canonical path for a locale. English stays at the root. */
export function localizedPath(lang: SupportedLanguage, path = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (lang === 'en') return clean === '/' ? '/' : clean;
  return clean === '/' ? `/${lang}` : `/${lang}${clean}`;
}

/** Strips the locale segment from a pathname. */
export function stripLocale(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length > 0 && LOCALE_SEGMENTS.has(parts[0].toLowerCase())) {
    parts.shift();
  }
  const rest = parts.join('/');
  return rest ? `/${rest}` : '/';
}

/**
 * The hreflang map for a route. Keys follow the BCP-47 tags search engines
 * expect, including the `x-default` fallback that points at English.
 */
export function alternatesFor(path: string): Record<string, string> {
  const map: Record<string, string> = {};
  for (const code of LANGUAGE_CODES) {
    map[LANGUAGES[code].locale] = localizedPath(code, path);
  }
  map['x-default'] = localizedPath('en', path);
  return map;
}

/** Every localisable route in the site, used by the sitemap generator. */
export const LOCALISABLE_ROUTES = ['/', '/store', '/notes'] as const;
