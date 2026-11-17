import type { Metadata } from 'next';

import InsightsBoard from '../components/InsightsBoard';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { getInsightsIndex } from '@/lib/growth-swarm';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = buildMetadata({
  title: 'Daily market briefs — live gold, crypto and stock insights',
  description: 'Short, plain-language market notes written every day from live prices. Bitcoin, gold, US stocks and USD/EGP in six languages.',
  path: '/insights',
  keywords: ['market brief', 'bitcoin analysis', 'gold price today', 'crypto insights'],
});

export default async function InsightsPage() {
  const briefs = await getInsightsIndex('en').catch(() => []);
  return (
    <PageShell>
      <InsightsBoard briefs={briefs} />
    </PageShell>
  );
}
