import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import LegalScreen, { legalMetadata } from '../../components/LegalScreen';
import PageShell from '../../components/PageShell';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

interface LocalePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: LocalePageProps): Promise<Metadata> {
  const { locale } = await params;
  return legalMetadata('terms', normalizeLanguage(locale));
}

export default async function LocaleTermsPage({ params }: LocalePageProps) {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);

  if (!(LANGUAGE_CODES as readonly string[]).includes(lang)) {
    notFound();
  }

  return (
    <PageShell width="full">
      <LegalScreen slug="terms" lang={lang} />
    </PageShell>
  );
}
