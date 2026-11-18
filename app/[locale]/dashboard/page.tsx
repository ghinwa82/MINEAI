import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import MemberConsole from '../../components/MemberConsole';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';

interface Props {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  return {
    ...buildMetadata({
      title: 'Operator console',
      description: 'Your MINEAI session, security posture and direct route into the mining terminal.',
      path: '/dashboard',
      lang,
    }),
    robots: { index: false, follow: false },
  };
}

export default async function LocaleDashboardPage({ params }: Props) {
  const { locale } = await params;
  if (!(LANGUAGE_CODES as readonly string[]).includes(normalizeLanguage(locale))) notFound();
  return (
    <PageShell>
      <MemberConsole />
    </PageShell>
  );
}
