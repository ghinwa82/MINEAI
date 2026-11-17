import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import NewsView from '../../_views/news';
import PageShell from '../../components/PageShell';
import JsonLd from '../../components/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { getNewsFeed } from '@/lib/news';
import { getNewsCopy } from '@/lib/news-i18n';
import { absoluteUrl, breadcrumbSchema, faqSchema } from '@/lib/schema';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30;

interface LocaleNewsProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleNewsProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const copy = getNewsCopy(lang);

  return buildMetadata({
    title: copy.title,
    description: copy.lead,
    path: '/news',
    lang,
    keywords: [
      'breaking world news',
      'gold price',
      'stock market news',
      'global economy',
      'crypto news',
    ],
    image: null,
  });
}

export default async function LocaleNewsPage({ params }: LocaleNewsProps) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) {
    notFound();
  }

  const copy = getNewsCopy(lang);
  const feed = await getNewsFeed(lang).catch(() => null);
  const articles = (feed?.items ?? []).slice(0, 12).map((item) => ({
    '@type': 'NewsArticle',
    headline: item.title,
    url: item.link,
    datePublished: item.publishedAt,
    articleSection: item.category,
    inLanguage: lang,
    publisher: { '@type': 'Organization', name: item.source },
    isPartOf: { '@id': `${absoluteUrl(`/${lang}/news`)}#collection` },
  }));

  return (
    <PageShell width="full">
      <JsonLd
        data={[
          {
            '@type': 'CollectionPage',
            '@id': `${absoluteUrl(`/${lang}/news`)}#collection`,
            url: absoluteUrl(`/${lang}/news`),
            name: copy.title,
            description: copy.lead,
            inLanguage: lang,
            isPartOf: { '@id': `${absoluteUrl('/')}#website` },
          },
          ...articles,
          faqSchema([
            { question: copy.marketsTitle, answer: copy.marketsLead },
            { question: copy.filterLabel, answer: copy.sourcesNote },
          ]),
          breadcrumbSchema([
            { name: 'MineAI Node', path: '/' },
            { name: copy.title, path: '/news' },
          ]),
        ]}
      />
      <NewsView initial={feed} />
    </PageShell>
  );
}
