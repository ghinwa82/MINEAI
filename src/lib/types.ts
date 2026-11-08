export interface MiningNode {
  id: string;
  name: string;
  tier: 'Free Edge' | 'Quantum Pro' | 'Nebula Enterprise' | 'Titan Megacluster';
  price: number;
  dailyYieldUsd: number;
  hashrate: string;
  status: 'active' | 'provisioning' | 'offline';
  earnedSoFar: number;
  deployedAt: string;
}

export interface EarningTask {
  id: string;
  title: string;
  rewardUsd: number;
  type: 'daily_streak' | 'ai_training' | 'referral' | 'ecom_arbitrage';
  completed: boolean;
  cooldownHours?: number;
}

export interface ArbitrageDeal {
  id: string;
  productName: string;
  supplierPrice: number;
  retailPrice: number;
  marginPercent: string;
  netProfit: number;
  platform: 'TikTok Shop' | 'Shopify Global' | 'Amazon FBA';
  demandScore: string;
}

export interface WithdrawalTransaction {
  id: string;
  amount: number;
  method: 'paypal' | 'stripe_bank' | 'crypto_usdt' | 'binance_pay';
  destination: string;
  status: 'completed' | 'processing';
  txHash: string;
  date: string;
}