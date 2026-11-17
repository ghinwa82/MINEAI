import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import AuthScreen from '../../components/AuthScreen';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { getAuthCopy } from '@/lib/auth-i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

interface Props { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const copy = getAuthCopy(lang);
  return {
    ...buildMetadata({ title: copy.loginTitle, description: copy.loginLead, path: '/login', lang }),
    robots: { index: false, follow: true },
  };
}

export default async function LocaleLoginPage({ params }: Props) {
  const { locale } = await params;
  if (!(LANGUAGE_CODES as readonly string[]).includes(normalizeLanguage(locale))) notFound();
  return (
    <PageShell>
      <AuthScreen mode="login" />
    </PageShell>
  );
}
