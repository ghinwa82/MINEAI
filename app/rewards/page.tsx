import type { Metadata } from 'next';

import RewardsView from '../_views/rewards';
import PageShell from '../components/PageShell';
import { buildMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildMetadata({
  title: 'Rewards — daily streaks, whale tiers and lifetime referrals',
  description:
    'Claim a daily streak for a compounding multiplier, climb the whale tiers with staked $MINEAI, and earn eight percent of every referred operator’s mining rewards for life.',
  path: '/rewards',
  keywords: ['mining rewards', 'daily streak bonus', 'referral programme', 'VIP tiers', 'two-factor security'],
});

export default function RewardsPage() {
  return (
    <PageShell>
      <RewardsView />
    </PageShell>
  );
}
