import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import RewardsView from '../../_views/rewards';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { getEcosystemCopy } from '@/lib/ecosystem-i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

interface LocaleRewardsProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleRewardsProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const eco = getEcosystemCopy(lang);

  return buildMetadata({
    title: `${eco.rewards.title} · ${eco.rewards.eyebrow}`,
    description: eco.rewards.lead,
    path: '/rewards',
    lang,
    keywords: ['mining rewards', 'daily streak bonus', 'referral programme', 'VIP tiers'],
  });
}

export default async function LocaleRewardsPage({ params }: LocaleRewardsProps) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) {
    notFound();
  }

  return (
    <PageShell>
      <RewardsView />
    </PageShell>
  );
}
