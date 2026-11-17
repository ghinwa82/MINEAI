import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/schema';

/**
 * Crawl policy.
 *
 * Everything a visitor can read is open, in all six languages. The API surface
 * and the owner's deployment console stay out of the index. Search engines and
 * answer engines are named explicitly so a permissive default is never the only
 * thing standing between a new page and a crawler that respects a site-wide
 * allow list but skips unnamed agents.
 */

const SEARCH_ENGINES = [
  'Googlebot',
  'Googlebot-Image',
  'Bingbot',
  'YandexBot',
  'DuckDuckBot',
  'Applebot',
  'Baiduspider',
  'NaverBot',
  'SeznamBot',
];

const ANSWER_ENGINES = ['GPTBot', 'OAI-SearchBot', 'ChatGPT-User', 'ClaudeBot', 'PerplexityBot'];

export default function robots(): MetadataRoute.Robots {
  const base = siteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
      ...SEARCH_ENGINES.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/api/', '/admin/'],
      })),
      ...ANSWER_ENGINES.map((userAgent) => ({
        userAgent,
        allow: '/',
        disallow: ['/api/', '/admin/'],
      })),
    ],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
