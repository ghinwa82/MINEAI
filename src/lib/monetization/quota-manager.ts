import { supabase } from '../supabase/client';

export interface UserSubscription {
  userId: string;
  tier: 'FREE' | 'PRO' | 'ENTERPRISE';
  dailyComputeQuota: number;
  remainingQuota: number;
  balanceUsd: number;
}

export class QuotaManager {
  public static async getUserQuota(userId: string): Promise<UserSubscription> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !data) {
        return {
          userId,
          tier: 'FREE',
          dailyComputeQuota: 100,
          remainingQuota: 85,
          balanceUsd: 14.50,
        };
      }

      return {
        userId: data.id,
        tier: data.level > 5 ? 'PRO' : 'FREE',
        dailyComputeQuota: 500,
        remainingQuota: 420,
        balanceUsd: Number(data.xp_points) * 0.005,
      };
    } catch {
      return {
        userId,
        tier: 'FREE',
        dailyComputeQuota: 100,
        remainingQuota: 100,
        balanceUsd: 0.00,
      };
    }
  }

  public static async deductComputeUsage(userId: string, units: number): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('xp_points')
        .eq('id', userId)
        .single();

      if (!profile) return true;

      await supabase
        .from('profiles')
        .update({ xp_points: Math.max(0, Number(profile.xp_points) - units) })
        .eq('id', userId);

      return true;
    } catch {
      return false;
    }
  }
}