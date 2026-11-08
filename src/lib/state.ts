import { MiningNode, EarningTask, ArbitrageDeal, WithdrawalTransaction } from './types';

class PlatformEarningState {
  public walletBalance = 15.50; // Welcome Starter Balance for high retention
  public totalMinedUsd = 482.65;
  public totalWithdrawnUsd = 120.00;
  public referralCode = 'MINEAI-VIP-88';
  public referralsCount = 4;
  public referralEarnings = 40.00;
  public currentStreak = 7;

  public nodes: MiningNode[] = [
    {
      id: 'node-free-001',
      name: 'Free Edge Auto-Miner #1',
      tier: 'Free Edge',
      price: 0.00,
      dailyYieldUsd: 2.80,
      hashrate: '28.5 MH/s',
      status: 'active',
      earnedSoFar: 14.20,
      deployedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    }
  ];

  public tasks: EarningTask[] = [
    {
      id: 'task-daily',
      title: 'Claim 24h DePIN Active Uptime Reward',
      rewardUsd: 2.50,
      type: 'daily_streak',
      completed: false,
    },
    {
      id: 'task-ai-val',
      title: 'Validate Autonomous AI Edge Telemetry Logs',
      rewardUsd: 4.25,
      type: 'ai_training',
      completed: false,
    },
    {
      id: 'task-ecom-sync',
      title: 'Trigger Automated Dropshipping Supplier Sync',
      rewardUsd: 8.90,
      type: 'ecom_arbitrage',
      completed: false,
    }
  ];

  public deals: ArbitrageDeal[] = [
    {
      id: 'deal-01',
      productName: 'Portable RGB AI Smart Gimbal Tracker',
      supplierPrice: 14.80,
      retailPrice: 49.99,
      marginPercent: '70.3%',
      netProfit: 35.19,
      platform: 'TikTok Shop',
      demandScore: '99/100 (Ultra High)',
    },
    {
      id: 'deal-02',
      productName: 'DePIN Mini Node Cryptographic USB Dongle',
      supplierPrice: 22.50,
      retailPrice: 79.00,
      marginPercent: '71.5%',
      netProfit: 56.50,
      platform: 'Shopify Global',
      demandScore: '96/100 (Viral)',
    },
    {
      id: 'deal-03',
      productName: 'Ultra-Low Latency WiFi 7 Wireless Rig Adapter',
      supplierPrice: 18.20,
      retailPrice: 55.00,
      marginPercent: '66.9%',
      netProfit: 36.80,
      platform: 'Amazon FBA',
      demandScore: '92/100 (High)',
    }
  ];

  public withdrawals: WithdrawalTransaction[] = [
    {
      id: 'wd-2025-01',
      amount: 120.00,
      method: 'crypto_usdt',
      destination: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
      status: 'completed',
      txHash: '0x8f2a1b9c7d4e5f6a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a',
      date: '2025-03-01T14:22:00Z',
    }
  ];

  public addFunds(amount: number): number {
    this.walletBalance = Number((this.walletBalance + amount).toFixed(2));
    this.totalMinedUsd = Number((this.totalMinedUsd + amount).toFixed(2));
    return this.walletBalance;
  }

  public withdrawFunds(amount: number): boolean {
    if (this.walletBalance >= amount) {
      this.walletBalance = Number((this.walletBalance - amount).toFixed(2));
      this.totalWithdrawnUsd = Number((this.totalWithdrawnUsd + amount).toFixed(2));
      return true;
    }
    return false;
  }
}

const globalForPlatform = global as unknown as { platformState: PlatformEarningState };
export const platformState = globalForPlatform.platformState || new PlatformEarningState();
if (process.env.NODE_ENV !== 'production') globalForPlatform.platformState = platformState;