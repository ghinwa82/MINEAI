import type { Metadata } from 'next';

import OAuthCallback from '../../components/OAuthCallback';
import PageShell from '../../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

const base = buildMetadata({
  title: 'Finishing sign-in',
  description: 'Completing a secure social sign-in to MineAI.',
  path: '/auth/callback',
});

export const metadata: Metadata = { ...base, robots: { index: false, follow: false } };

export default function AuthCallbackPage() {
  return (
    <PageShell width="reading">
      <OAuthCallback />
    </PageShell>
  );
}
