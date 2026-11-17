import type { Metadata } from 'next';

import AuthScreen from '../components/AuthScreen';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

const base = buildMetadata({
  title: 'Reset your password',
  description: 'Request a secure password reset link for your MineAI account.',
  path: '/forgot-password',
});

export const metadata: Metadata = { ...base, robots: { index: false, follow: true } };

export default function ForgotPasswordPage() {
  return (
    <PageShell>
      <AuthScreen mode="forgot" />
    </PageShell>
  );
}
