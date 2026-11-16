import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import HomeView from '../_views/home';
import JsonLd from '../components/JsonLd';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { faqSchema, itemListSchema, webSiteSchema } from '@/lib/schema';
import { getCanonicalCatalogue } from '@/lib/catalog';
import { getDictionary } from '@/lib/i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';
import type { SupportedLanguage } from '@/types';

interface LocaleHomeProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleHomeProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const dictionary = getDictionary(lang);

  return buildMetadata({
    title: dictionary.meta.homeTitle,
    description: dictionary.meta.homeDescription,
    path: '/',
    lang,
    keywords: [
      'DePIN node',
      'AI agent workforce',
      'autonomous commerce',
      'distributed compute marketplace',
      'international payouts',
    ],
  });
}

export default async function LocaleHomePage({ params }: LocaleHomeProps) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) {
    notFound();
  }

  const dictionary = getDictionary(lang);
  const catalogue = getCanonicalCatalogue();

  return (
    <PageShell>
      <JsonLd
        data={[
          webSiteSchema(lang as SupportedLanguage),
          faqSchema(dictionary.home.faq),
          itemListSchema(catalogue),
        ]}
      />
      <HomeView />
    </PageShell>
  );
}
