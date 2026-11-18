import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import OAuthCallback from '../../../components/OAuthCallback';
import PageShell from '../../../components/PageShell';
import { getAuthCopy } from '@/lib/auth-i18n';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';
import { buildMetadata } from '@/lib/metadata';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  const copy = getAuthCopy(lang);
  return {
    ...buildMetadata({ title: copy.signIn, description: copy.loginLead, path: '/auth/callback', lang }),
    robots: { index: false, follow: false },
  };
}

export default async function LocaleAuthCallbackPage({ params }: Props) {
  const { locale } = await params;
  if (!(LANGUAGE_CODES as readonly string[]).includes(normalizeLanguage(locale))) notFound();
  return (
    <PageShell width="reading">
      <OAuthCallback />
    </PageShell>
  );
}
