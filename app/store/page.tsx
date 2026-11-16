import type { Metadata } from 'next';

import StoreView from '../_views/store';
import JsonLd from '../components/JsonLd';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { itemListSchema, productSchema } from '@/lib/schema';
import { getCanonicalCatalogue } from '@/lib/catalog';

const TITLE = 'Node store — deploy an autonomous compute shard';
const DESCRIPTION =
  'Three tiers of DePIN compute with the same four resident agents behind them. Activate a shard, watch the agent feed, and settle earnings to a wallet or bank account.';

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/store',
  keywords: ['buy DePIN node', 'AI compute node', 'autonomous agent plan', 'node pricing'],
});

export default function StorePage() {
  const catalogue = getCanonicalCatalogue();

  return (
    <PageShell>
      <JsonLd
        data={[
          itemListSchema(catalogue),
          ...catalogue.map((plan) => productSchema(plan)),
        ]}
      />
      <StoreView />
    </PageShell>
  );
}
