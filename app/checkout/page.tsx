import type { Metadata } from 'next';

import CheckoutFlow from '../components/CheckoutFlow';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

const base = buildMetadata({
  title: 'Checkout — provision your cloud mining plan',
  description: 'Choose a cloud mining plan, pay in crypto or by card, and start mining the moment the payment clears.',
  path: '/checkout',
});

export const metadata: Metadata = { ...base, robots: { index: false, follow: true } };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const raw = params.plan;
  const plan = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined;

  return (
    <PageShell>
      <CheckoutFlow initialPlan={plan} />
    </PageShell>
  );
}
