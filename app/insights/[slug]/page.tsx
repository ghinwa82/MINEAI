import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import BriefReader from '../../components/BriefReader';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { getBrief } from '@/lib/growth-swarm';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brief = await getBrief(slug, 'en').catch(() => null);
  if (!brief) return buildMetadata({ title: 'Market brief', description: 'Daily market brief.', path: `/insights/${slug}` });
  return buildMetadata({
    title: brief.title,
    description: brief.description,
    path: `/insights/${brief.slug}`,
    type: 'article',
    keywords: brief.keywords,
  });
}

export default async function InsightBriefPage({ params }: Props) {
  const { slug } = await params;
  const brief = await getBrief(slug, 'en').catch(() => null);
  if (!brief) notFound();
  return (
    <PageShell>
      <BriefReader brief={brief} />
    </PageShell>
  );
}
