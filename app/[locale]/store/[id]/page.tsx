import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import ProductView from '../../../_views/product';
import JsonLd from '../../../components/JsonLd';
import PageShell from '../../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { breadcrumbSchema, productSchema } from '@/lib/schema';
import { getCanonicalCatalogue, planSlug } from '@/lib/catalog';
import { getDictionary } from '@/lib/i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

interface LocaleProductProps {
  params: Promise<{ locale: string; id: string }>;
}

export async function generateStaticParams() {
  return getCanonicalCatalogue().map((plan) => ({ id: planSlug(plan) }));
}

export async function generateMetadata({ params }: LocaleProductProps): Promise<Metadata> {
  const { locale, id } = await params;
  const lang = normalizeLanguage(locale);
  const plan = getCanonicalCatalogue().find((candidate) => planSlug(candidate) === id);
  const dictionary = getDictionary(lang);

  if (!plan) {
    return buildMetadata({
      title: 'Node not found',
      description: 'That node tier is not part of the catalogue.',
      path: `/store/${id}`,
      lang,
    });
  }

  return buildMetadata({
    title: `${plan.canonicalName} — ${dictionary.store.eyebrow}`,
    description: plan.description,
    path: `/store/${planSlug(plan)}`,
    lang,
    keywords: [plan.canonicalName, plan.tierLabel, 'DePIN compute tier'],
    type: 'product',
  });
}

export default async function LocaleProductPage({ params }: LocaleProductProps) {
  const { locale, id } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) {
    notFound();
  }

  const plan = getCanonicalCatalogue().find((candidate) => planSlug(candidate) === id);
  if (!plan) notFound();

  return (
    <PageShell>
      <JsonLd
        data={[
          productSchema(plan),
          breadcrumbSchema([
            { name: 'MineAI Node', path: '/' },
            { name: 'Node store', path: '/store' },
            { name: plan.canonicalName, path: `/store/${planSlug(plan)}` },
          ]),
        ]}
      />
      <ProductView id={id} />
    </PageShell>
  );
}
