import type { Metadata } from 'next';

import AuthScreen from '../../components/AuthScreen';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

const base = buildMetadata({
  title: 'Account security',
  description: 'Manage two-factor sign-in and your password.',
  path: '/dashboard/security',
});

export const metadata: Metadata = { ...base, robots: { index: false, follow: false } };

export default function SecurityPage() {
  return (
    <PageShell>
      <AuthScreen mode="security" />
    </PageShell>
  );
}
