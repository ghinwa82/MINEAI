import type { Metadata } from 'next';

import LegalView from '../_views/legal';
import PageShell from '../components/PageShell';
import JsonLd from '../components/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { getLegalCopy } from '@/lib/legal-i18n';
import { breadcrumbSchema } from '@/lib/schema';

const COPY = getLegalCopy('en').docs.terms;

export const metadata: Metadata = buildMetadata({
  title: `${COPY.title} — MineAI Node`,
  description: COPY.intro,
  path: '/terms',
  keywords: ['terms of service', 'MineAI Node terms', 'card payment terms', 'mining terms'],
});

export default function TermsPage() {
  return (
    <PageShell width="full">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'MineAI Node', path: '/' },
            { name: COPY.title, path: '/terms' },
          ]),
        ]}
      />
      <LegalView slug="terms" />
    </PageShell>
  );
}
