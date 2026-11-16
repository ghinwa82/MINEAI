import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import MiningView from '../../_views/mining';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { getEcosystemCopy } from '@/lib/ecosystem-i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

interface LocaleMiningProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleMiningProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const eco = getEcosystemCopy(lang);

  return buildMetadata({
    title: `${eco.mining.title} · ${eco.mining.eyebrow}`,
    description: eco.mining.lead,
    path: '/mining',
    lang,
    keywords: ['cloud mining', 'zero electricity mining', 'DePIN mining', 'stake MINEAI'],
  });
}

export default async function LocaleMiningPage({ params }: LocaleMiningProps) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) {
    notFound();
  }

  return (
    <PageShell>
      <MiningView />
    </PageShell>
  );
}
