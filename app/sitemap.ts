import type { MetadataRoute } from 'next';

import { getCanonicalCatalogue, planSlug } from '@/lib/catalog';
import { LANGUAGES, LANGUAGE_CODES } from '@/lib/languages';
import { localizedPath } from '@/lib/routes';
import { absoluteUrl, siteUrl } from '@/lib/schema';

/**
 * The sitemap.
 *
 * Every route is emitted once per language with the full hreflang set, so
 * search engines can discover all six locales of every page and treat them as
 * translations of one another instead of duplicates.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const catalogue = getCanonicalCatalogue();

  const entries: MetadataRoute.Sitemap = [];

  const push = (path: string, priority: number, changeFrequency: 'daily' | 'weekly' | 'monthly') => {
    for (const code of LANGUAGE_CODES) {
      entries.push({
        url: absoluteUrl(localizedPath(code, path)),
        lastModified: now,
        changeFrequency,
        priority,
        alternates: {
          languages: Object.fromEntries(
            LANGUAGE_CODES.map((locale) => [
              LANGUAGES[locale].locale,
              absoluteUrl(localizedPath(locale, path)),
            ]),
          ),
        },
      });
    }
  };

  push('/', 1, 'daily');
  push('/store', 0.9, 'daily');
  push('/notes', 0.7, 'daily');

  for (const plan of catalogue) {
    push(`/store/${planSlug(plan)}`, 0.8, 'weekly');
  }

  return entries;
}

export const dynamic = 'force-static';

export { siteUrl };
