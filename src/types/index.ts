export type SupportedLanguage = 'en' | 'ar' | 'fr' | 'es' | 'zh' | 'hi';

export type NodeTier = 'Bronze' | 'Silver' | 'Gold' | 'Diamond';

export interface MiningTelemetry {
  nodeId: string;
  uptimeSeconds: number;
  cpuUsagePercent: number;
  gpuUsagePercent: number;
  hashrateMhs: number;
  powerConsumptionWatts: number;
  totalMinedTokens: number;
  status: 'active' | 'healing' | 'offline';
  temperatureCelsius: number;
  lastPing: string;
}

export interface AgentLogEntry {
  id: string;
  timestamp: string;
  agentName: 'TelemetryAuditor' | 'SentimentSupport' | 'FinancialPayout' | 'GrowthHacker';
  action: string;
  status: 'success' | 'warning' | 'info';
  details: Record<string, unknown>;
}

export interface UserRetentionState {
  currentStreakDays: number;
  lastLoginDate: string;
  xpPoints: number;
  tier: NodeTier;
  referralCode: string;
  referralCount: number;
  multiplier: number;
}

export interface CryptoRates {
  bitcoin: number;
  ethereum: number;
  solana: number;
  tether: number;
  mineAiToken: number;
}

export interface BankPayoutPayload {
  accountHolder: string;
  ibanOrAccountNumber: string;
  swiftBic: string;
  bankName: string;
  country: string;
  fiatAmount: number;
  currency: 'USD' | 'EUR' | 'SAR' | 'AED' | 'INR' | 'CNY';
  cryptoDeducted: number;
}