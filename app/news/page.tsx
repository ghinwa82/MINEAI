import type { Metadata } from 'next';

import NewsView from '../_views/news';
import PageShell from '../components/PageShell';
import JsonLd from '../components/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { getNewsFeed } from '@/lib/news';
import { absoluteUrl, breadcrumbSchema, faqSchema } from '@/lib/schema';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const maxDuration = 30;

const TITLE = 'Live world news, gold, markets and crypto — MineAI Node';
const DESCRIPTION =
  'Breaking world news, the global economy, gold and precious metals, stock indices, forex and crypto headlines, refreshed every five minutes beside live gold, BTC, ETH, SOL and USD/EGP prices.';

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/news',
  keywords: [
    'breaking world news',
    'gold price XAU',
    'stock market news',
    'global economy news',
    'bitcoin news',
    'USD EGP rate',
  ],
  image: null,
});

const FAQ = [
  {
    question: 'How often does the MineAI Node news desk refresh?',
    answer:
      'Headlines are fetched from public RSS feeds and cached for five minutes, then the page refreshes itself. A breaking story therefore appears within one refresh cycle without hammering the publishers.',
  },
  {
    question: 'Which desks are covered?',
    answer:
      'Five: breaking world news, gold and commodities, stock markets, the global economy, and crypto including bitcoin, ether, solana and $MINEAI.',
  },
  {
    question: 'Where do the prices come from?',
    answer:
      'Gold, bitcoin, ether, solana and the USD/EGP rate come from the same public market feed that powers the MineAI market terminal. $MINEAI is an internal utility index until the token is listed on a DEX.',
  },
  {
    question: 'Does MineAI Node rewrite the headlines?',
    answer:
      'No. Every card links to the original publisher. MineAI Node aggregates and orders the feed; it does not rewrite or republish the article.',
  },
];

export default async function NewsPage() {
  const feed = await getNewsFeed('en').catch(() => null);
  const articles = (feed?.items ?? []).slice(0, 12).map((item) => ({
    '@type': 'NewsArticle',
    headline: item.title,
    url: item.link,
    datePublished: item.publishedAt,
    articleSection: item.category,
    publisher: { '@type': 'Organization', name: item.source },
    isPartOf: { '@id': `${absoluteUrl('/news')}#collection` },
  }));

  return (
    <PageShell width="full">
      <JsonLd
        data={[
          {
            '@type': 'CollectionPage',
            '@id': `${absoluteUrl('/news')}#collection`,
            url: absoluteUrl('/news'),
            name: TITLE,
            description: DESCRIPTION,
            inLanguage: 'en',
            isPartOf: { '@id': `${absoluteUrl('/')}#website` },
            about: ['World news', 'Gold', 'Stock market', 'Global economy', 'Cryptocurrency'],
          },
          ...articles,
          faqSchema(FAQ),
          breadcrumbSchema([
            { name: 'MineAI Node', path: '/' },
            { name: 'News', path: '/news' },
          ]),
        ]}
      />
      <NewsView initial={feed} />
    </PageShell>
  );
}
