import type { Metadata } from 'next';

import AuthScreen from '../components/AuthScreen';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

const base = buildMetadata({
  title: 'Create your free account',
  description: 'Create a free MineAI account and start cloud mining in one minute.',
  path: '/register',
});

export const metadata: Metadata = { ...base, robots: { index: false, follow: true } };

export default function RegisterPage() {
  return (
    <PageShell>
      <AuthScreen mode="register" />
    </PageShell>
  );
}
