import type { Metadata } from 'next';

import LegalView from '../_views/legal';
import PageShell from '../components/PageShell';
import JsonLd from '../components/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { getLegalCopy } from '@/lib/legal-i18n';
import { breadcrumbSchema } from '@/lib/schema';

const COPY = getLegalCopy('en').docs.privacy;

export const metadata: Metadata = buildMetadata({
  title: `${COPY.title} — MineAI Node`,
  description: COPY.intro,
  path: '/privacy',
  keywords: ['privacy policy', 'data protection', 'MineAI Node privacy', 'AES-256-GCM'],
});

export default function PrivacyPage() {
  return (
    <PageShell width="full">
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: 'MineAI Node', path: '/' },
            { name: COPY.title, path: '/privacy' },
          ]),
        ]}
      />
      <LegalView slug="privacy" />
    </PageShell>
  );
}
