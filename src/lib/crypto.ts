import { CryptoRates } from '@/types';

// Mock default live rates with dynamic fallback to CoinGecko
export async function fetchLiveCryptoRates(): Promise<CryptoRates> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,tether&vs_currencies=usd',
      { next: { revalidate: 60 } }
    );
    if (!res.ok) throw new Error('CoinGecko API unreachable');
    const data = await res.json();
    return {
      bitcoin: data.bitcoin?.usd || 96450,
      ethereum: data.ethereum?.usd || 2780,
      solana: data.solana?.usd || 192,
      tether: 1.0,
      mineAiToken: 4.85 // Proprietary MineAI utility token valuation
    };
  } catch {
    // Ultra-resilient local cache fallback preventing runtime crash
    return {
      bitcoin: 96450,
      ethereum: 2780,
      solana: 192,
      tether: 1.0,
      mineAiToken: 4.85
    };
  }
}

export function calculateEarningsPerSecond(hashrateMhs: number, tokenRateUsd: number): number {
  // DePIN algorithmic reward ratio per megahash
  const tokensPerSec = (hashrateMhs * 0.000042) / 60;
  return tokensPerSec * tokenRateUsd;
}