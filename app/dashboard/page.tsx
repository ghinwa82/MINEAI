import type { Metadata } from 'next';

import MemberConsole from '../components/MemberConsole';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

const base = buildMetadata({
  title: 'Operator console',
  description: 'Your MINEAI session, security posture and direct route into the mining terminal.',
  path: '/dashboard',
});

export const metadata: Metadata = { ...base, robots: { index: false, follow: false } };

export default function DashboardPage() {
  return (
    <PageShell>
      <MemberConsole />
    </PageShell>
  );
}
