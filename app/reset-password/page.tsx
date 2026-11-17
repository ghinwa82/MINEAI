import type { Metadata } from 'next';

import AuthScreen from '../components/AuthScreen';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

const base = buildMetadata({
  title: 'Choose a new password',
  description: 'Set a new password for your MineAI account.',
  path: '/reset-password',
});

export const metadata: Metadata = { ...base, robots: { index: false, follow: true } };

export default function ResetPasswordPage() {
  return (
    <PageShell>
      <AuthScreen mode="reset" />
    </PageShell>
  );
}
