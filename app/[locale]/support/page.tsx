import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import SupportView from '../../_views/support';
import PageShell from '../../components/PageShell';
import JsonLd from '../../components/JsonLd';
import { buildMetadata } from '@/lib/metadata';
import { supportCopy } from '@/lib/support-i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';
import { breadcrumbSchema } from '@/lib/schema';

interface LocaleSupportProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocaleSupportProps): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const copy = supportCopy(lang).page;

  return buildMetadata({
    title: `Support — ${copy.title} | MineAI Node`,
    description: copy.lead,
    path: '/support',
    lang,
    keywords: ['MineAI support', '24/7 help', 'mining help', 'withdrawal help', 'account security'],
  });
}

export default async function LocaleSupportPage({ params }: LocaleSupportProps) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) {
    notFound();
  }

  const copy = supportCopy(lang).page;

  return (
    <PageShell width="full">
      <JsonLd
        data={breadcrumbSchema([
          { name: 'MineAI Node', path: '/' },
          { name: copy.title, path: '/support' },
        ])}
      />
      <SupportView />
    </PageShell>
  );
}
