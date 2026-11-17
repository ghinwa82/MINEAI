import type { Metadata } from 'next';

import LegalView from '../_views/legal';
import PageShell from '../components/PageShell';
import JsonLd from '../components/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { getLegalCopy } from '@/lib/legal-i18n';
import { breadcrumbSchema } from '@/lib/schema';

const COPY = getLegalCopy('en').docs['refund-policy'];

export const metadata: Metadata = buildMetadata({
  title: `${COPY.title} — MineAI Node`,
  description: COPY.intro,
  path: '/refund-policy',
  keywords: ['refund policy', 'crypto refund', 'card refund', 'MineAI Node refunds'],
});

export default function RefundPolicyPage() {
  return (
    <PageShell width="full">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'MineAI Node', path: '/' },
            { name: COPY.title, path: '/refund-policy' },
          ]),
        ]}
      />
      <LegalView slug="refund-policy" />
    </PageShell>
  );
}
