import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import CheckoutFlow from '../../components/CheckoutFlow';
import PageShell from '../../components/PageShell';
import { LANGUAGE_CODES, normalizeLanguage } from '@/lib/languages';
import { buildMetadata } from '@/lib/metadata';

interface Props {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const lang = normalizeLanguage(locale);
  return {
    ...buildMetadata({
      title: 'Checkout',
      description: 'Choose a cloud mining plan and activate it in three steps.',
      path: '/checkout',
      lang,
    }),
    robots: { index: false, follow: true },
  };
}

export default async function LocaleCheckoutPage({ params, searchParams }: Props) {
  const { locale } = await params;
  if (!(LANGUAGE_CODES as readonly string[]).includes(normalizeLanguage(locale))) notFound();
  const query = await searchParams;
  const raw = query.plan;
  const plan = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;

  return (
    <PageShell>
      <CheckoutFlow initialPlan={plan} />
    </PageShell>
  );
}
