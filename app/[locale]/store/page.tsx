import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import StoreView from '../../_views/store';
import JsonLd from '../../components/JsonLd';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { itemListSchema, productSchema } from '@/lib/schema';
import { getCanonicalCatalogue } from '@/lib/catalog';
import { getDictionary } from '@/lib/i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

interface LocaleStoreProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleStoreProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const dictionary = getDictionary(lang);

  return buildMetadata({
    title: dictionary.meta.storeTitle,
    description: dictionary.meta.storeDescription,
    path: '/store',
    lang,
    keywords: ['buy DePIN node', 'AI compute node', 'autonomous agent plan', 'node pricing'],
  });
}

export default async function LocaleStorePage({ params }: LocaleStoreProps) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) {
    notFound();
  }

  const catalogue = getCanonicalCatalogue();

  return (
    <PageShell>
      <JsonLd data={[itemListSchema(catalogue), ...catalogue.map((plan) => productSchema(plan))]} />
      <StoreView />
    </PageShell>
  );
}
