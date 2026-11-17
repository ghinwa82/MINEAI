import type { Metadata } from 'next';

import LegalView from '../_views/legal';
import PageShell from '../components/PageShell';
import JsonLd from '../components/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { getLegalCopy } from '@/lib/legal-i18n';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';

const COPY = getLegalCopy('en').docs.contact;

export const metadata: Metadata = buildMetadata({
  title: `${COPY.title} — MineAI Node`,
  description: COPY.intro,
  path: '/contact',
  keywords: ['contact MineAI Node', 'customer support', 'billing support', 'security disclosure'],
});

const FAQ = [
  {
    question: 'How do I reach MineAI Node support?',
    answer:
      'Write to support@mineai.network with your anonymous operator id and the relevant transaction reference. Billing and refund requests go to billing@mineai.network, and privacy requests to legal@mineai.network.',
  },
  {
    question: 'How fast does MineAI Node answer?',
    answer:
      'Support is staffed Sunday to Thursday, 09:00–18:00 Gulf Standard Time. We acknowledge within two business days and answer privacy requests within 30 days.',
  },
  {
    question: 'Should I send my card number or seed phrase?',
    answer:
      'Never. MineAI Node never asks for a card number, a seed phrase, a private key, a national id or a bank IBAN. Card data stays with the payment processor.',
  },
];

export default function ContactPage() {
  return (
    <PageShell width="full">
      <JsonLd
        data={[
          faqSchema(FAQ),
          breadcrumbSchema([
            { name: 'MineAI Node', path: '/' },
            { name: COPY.title, path: '/contact' },
          ]),
        ]}
      />
      <LegalView slug="contact" />
    </PageShell>
  );
}
