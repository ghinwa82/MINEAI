import type { Metadata } from 'next';

import type { SupportedLanguage } from '@/types';
import { LANGUAGES } from '@/lib/languages';
import { alternatesFor, localizedPath } from '@/lib/routes';
import { absoluteUrl, siteUrl } from '@/lib/schema';

/**
 * Metadata factory shared by every route.
 *
 * Each page declares its own title and description, and the factory takes
 * care of the canonical URL, the six-language hreflang map, the Open Graph
 * payload and the social card so no route can drift out of the index.
 */
export function buildMetadata({
  title,
  description,
  path,
  lang = 'en',
  keywords = [],
  type = 'website',
  image,
}: {
  title: string;
  description: string;
  path: string;
  lang?: SupportedLanguage;
  keywords?: string[];
  type?: 'website' | 'article' | 'product';
  /** Absolute or root-relative social card; `null` lets a route's own opengraph-image file win. */
  image?: string | null;
}): Metadata {
  const canonical = absoluteUrl(localizedPath(lang, path));
  const alternates = Object.fromEntries(
    Object.entries(alternatesFor(path)).map(([locale, target]) => [locale, absoluteUrl(target)]),
  );
  const openGraphType = type === 'product' ? 'website' : type;
  const ogImage = image === null ? undefined : absoluteUrl(image ?? '/og.png');

  return {
    title,
    description,
    keywords,
    metadataBase: new URL(siteUrl()),
    alternates: {
      canonical,
      languages: alternates,
    },
    openGraph: {
      type: openGraphType,
      title,
      description,
      url: canonical,
      siteName: 'MineAI Node',
      locale: LANGUAGES[lang].ogLocale,
      alternateLocale: Object.values(LANGUAGES)
        .filter((meta) => meta.code !== lang)
        .map((meta) => meta.ogLocale),
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: 1200,
                height: 630,
                alt: `${title} — MineAI Node`,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
    other: {
      'x-default-url': absoluteUrl(localizedPath('en', path)),
    },
  };
}

export { siteUrl };
