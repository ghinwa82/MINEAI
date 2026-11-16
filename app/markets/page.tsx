import type { Metadata } from 'next';

import MarketsView from '../_views/markets';
import JsonLd from '../components/JsonLd';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { tokenSchema } from '@/lib/schema';

export const metadata: Metadata = buildMetadata({
  title: 'Markets — indices, commodities, currencies and $MINEAI',
  description:
    'A single terminal for global indices, commodities, currencies and the top digital assets, refreshed continuously. $MINEAI trades on its own utility index alongside them.',
  path: '/markets',
  keywords: ['live markets', 'market terminal', 'crypto prices', 'MINEAI token', 'gold price', 'forex rates'],
});

export default function MarketsPage() {
  return (
    <PageShell>
      <JsonLd data={[tokenSchema()]} />
      <MarketsView />
    </PageShell>
  );
}
