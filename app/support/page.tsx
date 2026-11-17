import type { Metadata } from 'next';

import SupportView from '../_views/support';
import PageShell from '../components/PageShell';
import JsonLd from '../components/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { supportCopy } from '@/lib/support-i18n';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';

const COPY = supportCopy('en').page;

export const metadata: Metadata = buildMetadata({
  title: `Support — ${COPY.title} | MineAI Node`,
  description: COPY.lead,
  path: '/support',
  keywords: ['MineAI support', '24/7 help', 'mining help', 'withdrawal help', 'account security'],
});

const FAQ = [
  {
    question: 'Is help available outside business hours?',
    answer:
      'Yes. The on-page assistant answers immediately, 24 hours a day, in English, Arabic, French, Spanish, Chinese and Hindi. A person replies to email Sunday to Thursday, 09:00–18:00 Gulf Standard Time.',
  },
  {
    question: 'Can the assistant withdraw funds for me?',
    answer:
      'No. The assistant explains how withdrawals work, but every payout is authorised inside your own dashboard and sent to the wallet address you enter.',
  },
  {
    question: 'What will support never ask for?',
    answer:
      'We never ask for your password, a seed phrase, a private key, a card number or a national id. Anyone who asks is not us.',
  },
];

export default function SupportPage() {
  return (
    <PageShell width="full">
      <JsonLd
        data={[
          faqSchema(FAQ),
          breadcrumbSchema([
            { name: 'MineAI Node', path: '/' },
            { name: 'Support', path: '/support' },
          ]),
        ]}
      />
      <SupportView />
    </PageShell>
  );
}
