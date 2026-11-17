import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BriefReader from '../../../components/BriefReader';
import PageShell from '../../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { getBrief } from '@/lib/growth-swarm';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;
  const lang = normalizeLanguage(locale);
  const brief = await getBrief(slug, lang).catch(() => null);
  if (!brief) {
    return buildMetadata({
      title: 'Market brief',
      description: 'Daily market brief.',
      path: `/insights/${slug}`,
      lang,
    });
  }
  return buildMetadata({
    title: brief.title,
    description: brief.description,
    path: `/insights/${brief.slug}`,
    lang,
    type: 'article',
    keywords: brief.keywords,
  });
}

export default async function LocaleInsightBriefPage({ params }: Props) {
  const { locale, slug } = await params;
  const lang = normalizeLanguage(locale);
  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) notFound();
  const brief = await getBrief(slug, lang).catch(() => null);
  if (!brief) notFound();
  return (
    <PageShell>
      <BriefReader brief={brief} />
    </PageShell>
  );
}
