import type { Metadata } from 'next';

import AuthScreen from '../components/AuthScreen';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

const base = buildMetadata({
  title: 'Sign in to your account',
  description: 'Sign in to see your mining balance, rewards and withdrawals.',
  path: '/login',
});

export const metadata: Metadata = { ...base, robots: { index: false, follow: true } };

export default function LoginPage() {
  return (
    <PageShell>
      <AuthScreen mode="login" />
    </PageShell>
  );
}
