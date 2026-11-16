import type { Metadata } from 'next';

import MiningView from '../_views/mining';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Cloud mining — zero electricity, paid to your own wallet',
  description:
    'Rent external edge capacity and accrue $MINEAI every second. No hardware, no power draw, no noise. Daily streaks compound the yield and rewards withdraw straight to your own wallet.',
  path: '/mining',
  keywords: [
    'cloud mining',
    'zero electricity mining',
    'DePIN mining',
    'stake MINEAI',
    'crypto mining without hardware',
  ],
});

export default function MiningPage() {
  return (
    <PageShell>
      <MiningView />
    </PageShell>
  );
}
