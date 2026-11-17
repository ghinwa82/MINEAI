import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import InsightsBoard from '../../components/InsightsBoard';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { getInsightsCopy } from '@/lib/insights-i18n';
import { getInsightsIndex } from '@/lib/growth-swarm';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const copy = getInsightsCopy(lang);
  return buildMetadata({
    title: copy.title,
    description: copy.lead,
    path: '/insights',
    lang,
    keywords: ['market brief', 'bitcoin', 'gold', 'crypto', 'MineAI'],
  });
}

export default async function LocaleInsightsPage({ params }: Props) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) notFound();
  const briefs = await getInsightsIndex(lang).catch(() => []);
  return (
    <PageShell>
      <InsightsBoard briefs={briefs} />
    </PageShell>
  );
}
