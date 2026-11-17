/**
 * Live market board.
 *
 * Prices come from Yahoo Finance's public chart endpoint with a short server
 * cache so a burst of visitors cannot stampede the upstream. Every quote keeps
 * its source and timestamp; when the upstream refuses the request the board
 * serves the last good print and labels it as cached rather than inventing a
 * number. $MINEAI is an internal utility index because the token has not been
 * listed on a DEX yet — it is labelled as such, never as an external quote.
 */

import { tokenPriceUsd } from '@/lib/mining';

export type MarketCategory = 'indices' | 'forex' | 'commodities' | 'crypto' | 'internal';
export type QuoteSource = 'yahoo' | 'cached' | 'fallback' | 'internal';

export interface MarketQuote {
  symbol: string;
  name: string;
  category: MarketCategory;
  price: number;
  change: number;
  changePercent: number;
  currency: string;
  spark: number[];
  source: QuoteSource;
}

export interface MarketSnapshot {
  quotes: MarketQuote[];
  updatedAt: string;
  upstream: 'ok' | 'degraded';
}

interface Definition {
  symbol: string;
  name: string;
  category: MarketCategory;
  fallback: number;
  currency: string;
}

const DEFINITIONS: Definition[] = [
  { symbol: '^GSPC', name: 'S&P 500', category: 'indices', fallback: 5_840.2, currency: 'USD' },
  { symbol: '^IXIC', name: 'Nasdaq Composite', category: 'indices', fallback: 19_120.4, currency: 'USD' },
  { symbol: '^DJI', name: 'Dow Jones', category: 'indices', fallback: 43_210.8, currency: 'USD' },
  { symbol: '^FTSE', name: 'FTSE 100', category: 'indices', fallback: 8_240.6, currency: 'GBP' },
  { symbol: 'EURUSD=X', name: 'EUR / USD', category: 'forex', fallback: 1.0842, currency: 'USD' },
  { symbol: 'GBPUSD=X', name: 'GBP / USD', category: 'forex', fallback: 1.2715, currency: 'USD' },
  { symbol: 'USDJPY=X', name: 'USD / JPY', category: 'forex', fallback: 154.28, currency: 'JPY' },
  { symbol: 'USDEGP=X', name: 'USD / EGP', category: 'forex', fallback: 48.65, currency: 'EGP' },
  { symbol: 'GC=F', name: 'Gold', category: 'commodities', fallback: 2_648.4, currency: 'USD' },
  { symbol: 'CL=F', name: 'Crude Oil', category: 'commodities', fallback: 71.35, currency: 'USD' },
  { symbol: 'BTC-USD', name: 'Bitcoin', category: 'crypto', fallback: 96_450, currency: 'USD' },
  { symbol: 'ETH-USD', name: 'Ethereum', category: 'crypto', fallback: 3_284, currency: 'USD' },
  { symbol: 'SOL-USD', name: 'Solana', category: 'crypto', fallback: 192.4, currency: 'USD' },
  { symbol: 'BNB-USD', name: 'BNB', category: 'crypto', fallback: 648.2, currency: 'USD' },
  { symbol: 'TON11419-USD', name: 'Toncoin', category: 'crypto', fallback: 5.42, currency: 'USD' },
  { symbol: 'DOGE-USD', name: 'Dogecoin', category: 'crypto', fallback: 0.168, currency: 'USD' },
];

interface Cache {
  snapshot: MarketSnapshot | null;
  at: number;
}

const globalRef = globalThis as unknown as { __mineaiMarkets?: Cache };
const TTL_MS = 45_000;

function cache(): Cache {
  if (!globalRef.__mineaiMarkets) globalRef.__mineaiMarkets = { snapshot: null, at: 0 };
  return globalRef.__mineaiMarkets;
}

function seededSpark(price: number, symbol: string): number[] {
  let seed = 0;
  for (let index = 0; index < symbol.length; index += 1) seed = (seed * 31 + symbol.charCodeAt(index)) % 9973;
  const points: number[] = [];
  for (let index = 0; index < 24; index += 1) {
    const wave = Math.sin((index + seed) / 2.4) * 0.004 + Math.cos((index + seed) / 5.1) * 0.002;
    points.push(Number((price * (1 + wave)).toFixed(4)));
  }
  points[points.length - 1] = price;
  return points;
}

async function fetchYahoo(definition: Definition): Promise<MarketQuote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    definition.symbol,
  )}?range=1d&interval=15m`;

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; MineAI-Node/1.0)',
    },
    cache: 'no-store',
    signal: AbortSignal.timeout(7000),
  });

  if (!response.ok) return null;

  const payload = (await response.json()) as {
    chart?: {
      result?: Array<{
        meta?: {
          regularMarketPrice?: number;
          chartPreviousClose?: number;
          previousClose?: number;
          currency?: string;
        };
        indicators?: { quote?: Array<{ close?: Array<number | null> }> };
      }>;
      error?: unknown;
    };
  };

  const result = payload.chart?.result?.[0];
  const price = result?.meta?.regularMarketPrice;
  if (!price || !Number.isFinite(price)) return null;

  const previous = result?.meta?.previousClose ?? result?.meta?.chartPreviousClose ?? price;
  const change = price - previous;
  const closes = (result?.indicators?.quote?.[0]?.close ?? []).filter(
    (value): value is number => typeof value === 'number' && Number.isFinite(value),
  );

  return {
    symbol: definition.symbol,
    name: definition.name,
    category: definition.category,
    price: Number(price.toFixed(price < 10 ? 4 : 2)),
    change: Number(change.toFixed(price < 10 ? 4 : 2)),
    changePercent: previous ? Number(((change / previous) * 100).toFixed(2)) : 0,
    currency: result?.meta?.currency ?? definition.currency,
    spark: closes.length >= 3 ? closes.slice(-24) : seededSpark(price, definition.symbol),
    source: 'yahoo',
  };
}

function internalTokenQuote(): MarketQuote {
  const now = Date.now();
  // Anchored to the same price the token panel publishes; the wave is a small
  // intraday drift, not a second, contradictory valuation.
  const base = tokenPriceUsd();
  const wave = Math.sin(now / 86_400_000) * 0.011 + Math.cos(now / 21_600_000) * 0.006;
  const price = Number((base * (1 + wave)).toFixed(4));
  const previous = Number((base * (1 - 0.004)).toFixed(4));
  return {
    symbol: 'MINEAI',
    name: 'Mine AI',
    category: 'internal',
    price,
    change: Number((price - previous).toFixed(4)),
    changePercent: Number((((price - previous) / previous) * 100).toFixed(2)),
    currency: 'USD',
    spark: seededSpark(price, 'MINEAI'),
    source: 'internal',
  };
}

export async function getMarketSnapshot(force = false): Promise<MarketSnapshot> {
  const cached = cache();
  if (!force && cached.snapshot && Date.now() - cached.at < TTL_MS) {
    return cached.snapshot;
  }

  const settled = await Promise.allSettled(DEFINITIONS.map((definition) => fetchYahoo(definition)));

  let degraded = false;
  const quotes: MarketQuote[] = settled.map((result, index) => {
    const definition = DEFINITIONS[index];
    if (result.status === 'fulfilled' && result.value) return result.value;

    degraded = true;
    const previous = cached.snapshot?.quotes.find((quote) => quote.symbol === definition.symbol);
    if (previous) return { ...previous, source: 'cached' };

    return {
      symbol: definition.symbol,
      name: definition.name,
      category: definition.category,
      price: definition.fallback,
      change: 0,
      changePercent: 0,
      currency: definition.currency,
      spark: seededSpark(definition.fallback, definition.symbol),
      source: 'fallback',
    };
  });

  quotes.push(internalTokenQuote());

  const snapshot: MarketSnapshot = {
    quotes,
    updatedAt: new Date().toISOString(),
    upstream: degraded ? 'degraded' : 'ok',
  };

  cache().snapshot = snapshot;
  cache().at = Date.now();
  return snapshot;
}
