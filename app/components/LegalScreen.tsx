import React from 'react';
import type { Metadata } from 'next';

import LegalView from '../_views/legal';
import JsonLd from './JsonLd';
import { getLegalCopy, type LegalSlug } from '@/lib/legal-i18n';
import { buildMetadata } from '@/lib/metadata';
import { breadcrumbSchema, faqSchema } from '@/lib/schema';
import type { SupportedLanguage } from '@/types';

/**
 * Server half of a legal page.
 *
 * The four documents share one renderer, one breadcrumb trail and one
 * metadata factory. Keeping them here means the English route and the five
 * locale routes can never disagree about the document they show.
 */

const SLUG_PATH: Record<LegalSlug, string> = {
  terms: '/terms',
  privacy: '/privacy',
  'refund-policy': '/refund-policy',
  contact: '/contact',
};

const SLUG_KEYWORDS: Record<LegalSlug, string[]> = {
  terms: ['terms of service', 'MineAI Node terms', 'card payment terms', 'mining terms'],
  privacy: ['privacy policy', 'data protection', 'MineAI Node privacy', 'AES-256-GCM'],
  'refund-policy': ['refund policy', 'crypto refund', 'card refund', 'MineAI Node refunds'],
  contact: ['contact MineAI Node', 'customer support', 'billing support', 'security disclosure'],
};

export function legalMetadata(slug: LegalSlug, lang: SupportedLanguage = 'en'): Metadata {
  const copy = getLegalCopy(lang);
  const doc = copy.docs[slug];

  return buildMetadata({
    title: `${doc.title} — MineAI Node`,
    description: doc.intro,
    path: SLUG_PATH[slug],
    lang,
    keywords: SLUG_KEYWORDS[slug],
  });
}

export default function LegalScreen({
  slug,
  lang = 'en',
}: {
  slug: LegalSlug;
  lang?: SupportedLanguage;
}) {
  const doc = getLegalCopy(lang).docs[slug];
  const faq =
    slug === 'contact'
      ? [
          {
            question: doc.sections[0]?.heading ?? 'Support',
            answer: doc.sections[0]?.body.join(' ') ?? doc.intro,
          },
          {
            question: doc.sections[1]?.heading ?? 'Billing',
            answer: doc.sections[1]?.body.join(' ') ?? doc.intro,
          },
        ]
      : [];

  return (
    <>
      <JsonLd
        data={[
          ...(faq.length > 0 ? [faqSchema(faq)] : []),
          breadcrumbSchema([
            { name: 'MineAI Node', path: '/' },
            { name: doc.title, path: SLUG_PATH[slug] },
          ]),
        ]}
      />
      <LegalView slug={slug} />
    </>
  );
}
