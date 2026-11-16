import type { Metadata } from 'next';

import HomeView from './_views/home';
import JsonLd from './components/JsonLd';
import PageShell from './components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { faqSchema, itemListSchema, webSiteSchema } from '@/lib/schema';
import { getCanonicalCatalogue } from '@/lib/catalog';
import { getDictionary } from '@/lib/i18n';

const TITLE = 'MineAI Node — Autonomous DePIN compute with a resident agent workforce';
const DESCRIPTION =
  'A decentralised compute mesh whose resident agent workforce scouts winning products, fulfils orders across every connected store and settles earnings to a wallet or bank account.';

export const metadata: Metadata = buildMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/',
  keywords: [
    'DePIN node',
    'AI agent workforce',
    'autonomous commerce',
    'distributed compute marketplace',
    'international payouts',
  ],
});

export default function HomePage() {
  const dictionary = getDictionary('en');
  const catalogue = getCanonicalCatalogue();

  return (
    <PageShell>
      <JsonLd
        data={[
          webSiteSchema('en'),
          faqSchema(dictionary.home.faq),
          itemListSchema(catalogue),
        ]}
      />
      <HomeView />
    </PageShell>
  );
}
