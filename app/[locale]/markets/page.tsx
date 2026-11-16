import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import MarketsView from '../../_views/markets';
import JsonLd from '../../components/JsonLd';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { tokenSchema } from '@/lib/schema';
import { getEcosystemCopy } from '@/lib/ecosystem-i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

interface LocaleMarketsProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleMarketsProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const eco = getEcosystemCopy(lang);

  return buildMetadata({
    title: `${eco.markets.title} · ${eco.markets.eyebrow}`,
    description: eco.markets.lead,
    path: '/markets',
    lang,
    keywords: ['live markets', 'crypto prices', 'MINEAI token', 'gold price', 'forex rates'],
  });
}

export default async function LocaleMarketsPage({ params }: LocaleMarketsProps) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) {
    notFound();
  }

  return (
    <PageShell>
      <JsonLd data={[tokenSchema()]} />
      <MarketsView />
    </PageShell>
  );
}
