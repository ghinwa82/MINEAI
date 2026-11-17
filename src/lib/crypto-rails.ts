import QRCode from 'qrcode';

import { creditTreasury } from '@/lib/treasury';

/**
 * Direct multi-chain deposit rail.
 *
 * Seven networks are exposed. The deposit address always comes from the
 * deployment environment — never from this file — and every transaction hash
 * is checked against a public RPC endpoint before the treasury is credited.
 * When an RPC is unreachable the deposit stays pending rather than being
 * optimistically accepted.
 */

export type CryptoNetworkId =
  | 'usdt-bep20'
  | 'usdt-arbitrum'
  | 'usdt-erc20'
  | 'usdt-trc20'
  | 'sol'
  | 'ton'
  | 'btc'
  | 'ltc';

export type ChainFamily =
  | 'evm'
  | 'tron'
  | 'solana'
  | 'ton'
  | 'bitcoin'
  | 'dogecoin'
  | 'litecoin';

export interface CryptoNetwork {
  id: CryptoNetworkId;
  family: ChainFamily;
  label: string;
  chain: string;
  asset: string;
  decimals: number;
  minAmount: number;
  envKey: string;
  explorer: string;
  address: string;
  configured: boolean;
  demo: boolean;
  payUri: (address: string, amount: number) => string;
}

const NETWORKS: Array<Omit<CryptoNetwork, 'address' | 'configured' | 'demo' | 'payUri'> & {
  payUri: (address: string, amount: number) => string;
}> = [
  {
    id: 'usdt-bep20',
    family: 'evm',
    label: 'USDT · BEP-20',
    chain: 'BNB Smart Chain',
    asset: 'USDT',
    decimals: 18,
    minAmount: 10,
    envKey: 'OWNER_EVM_WALLET',
    explorer: 'https://bscscan.com/tx/',
    payUri: (address) => address,
  },
  {
    id: 'usdt-arbitrum',
    family: 'evm',
    label: 'USDT · Arbitrum One',
    chain: 'Arbitrum One',
    asset: 'USDT',
    decimals: 6,
    minAmount: 10,
    envKey: 'OWNER_EVM_WALLET',
    explorer: 'https://arbiscan.io/tx/',
    payUri: (address) => address,
  },
  {
    id: 'usdt-erc20',
    family: 'evm',
    label: 'USDT · ERC-20',
    chain: 'Ethereum',
    asset: 'USDT',
    decimals: 6,
    minAmount: 20,
    envKey: 'OWNER_EVM_WALLET',
    explorer: 'https://etherscan.io/tx/',
    payUri: (address) => address,
  },
  {
    id: 'usdt-trc20',
    family: 'tron',
    label: 'USDT · TRC-20',
    chain: 'TRON',
    asset: 'USDT',
    decimals: 6,
    minAmount: 10,
    envKey: 'OWNER_TRON_WALLET',
    explorer: 'https://tronscan.org/#/transaction/',
    payUri: (address) => address,
  },
  {
    id: 'sol',
    family: 'solana',
    label: 'USDT · Solana',
    chain: 'Solana',
    asset: 'USDT',
    decimals: 6,
    minAmount: 10,
    envKey: 'OWNER_SOL_WALLET',
    explorer: 'https://solscan.io/tx/',
    payUri: (address) => address,
  },
  {
    id: 'ton',
    family: 'ton',
    label: 'TON',
    chain: 'TON',
    asset: 'TON',
    decimals: 9,
    minAmount: 5,
    envKey: 'OWNER_TON_WALLET',
    explorer: 'https://tonviewer.com/transaction/',
    payUri: (address, amount) =>
      `ton://transfer/${address}?amount=${Math.round(amount * 1_000_000_000)}&text=MINEAI`,
  },
  {
    id: 'btc',
    family: 'bitcoin',
    label: 'Bitcoin',
    chain: 'Bitcoin',
    asset: 'BTC',
    decimals: 8,
    minAmount: 0.0002,
    envKey: 'OWNER_BTC_WALLET',
    explorer: 'https://mempool.space/tx/',
    payUri: (address, amount) => `bitcoin:${address}?amount=${amount}`,
  },
  {
    id: 'ltc',
    family: 'litecoin',
    label: 'Litecoin',
    chain: 'Litecoin',
    asset: 'LTC',
    decimals: 8,
    minAmount: 2,
    envKey: 'OWNER_LTC_WALLET',
    explorer: 'https://blockchair.com/litecoin/transaction/',
    payUri: (address, amount) => `litecoin:${address}?amount=${amount}`,
  },
];

const ADDRESS_PATTERNS: Record<ChainFamily, RegExp> = {
  evm: /^0x[a-fA-F0-9]{40}$/,
  tron: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
  solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  ton: /^(?:[EU]Q[A-Za-z0-9_-]{46}|-?[0-9]:[a-fA-F0-9]{64})$/,
  bitcoin: /^(?:bc1[a-z0-9]{25,62}|[13][a-km-zA-HJ-NP-Z1-9]{25,34})$/,
  dogecoin: /^(?:D[5-9A-HJ-NP-Za-km-z]{33}|[9A][1-9A-HJ-NP-Za-km-z]{33})$/,
  litecoin: /^(?:ltc1[a-z0-9]{25,62}|[LM3][1-9A-HJ-NP-Za-km-z]{25,33})$/,
};

export function isValidAddress(family: ChainFamily, address: string): boolean {
  return ADDRESS_PATTERNS[family].test(address.trim());
}

export function isValidTxHash(family: ChainFamily, hash: string): boolean {
  const clean = hash.trim();
  if (family === 'solana') return /^[1-9A-HJ-NP-Za-km-z]{64,88}$/.test(clean);
  if (family === 'ton') return /^(?:[a-fA-F0-9]{64}|[A-Za-z0-9_-]{43,44})$/.test(clean);
  return /^(?:0x)?[a-fA-F0-9]{64}$/.test(clean);
}

function walletMode(): 'live' | 'demo' {
  return process.env.OWNER_WALLET_MODE?.trim().toLowerCase() === 'live' ? 'live' : 'demo';
}

export function cryptoNetworks(): CryptoNetwork[] {
  const mode = walletMode();
  return NETWORKS.map((network) => {
    const address = process.env[network.envKey]?.trim() ?? '';
    const configured = isValidAddress(network.family, address);
    return {
      ...network,
      address: configured ? address : '',
      configured,
      demo: configured && mode !== 'live',
    };
  });
}

export function findNetwork(id: string): CryptoNetwork | undefined {
  return cryptoNetworks().find((network) => network.id === id);
}

/* ------------------------------------------------------------------ *
 * Deposit intents
 * ------------------------------------------------------------------ */

export interface DepositIntent {
  id: string;
  network: CryptoNetworkId;
  amountUsd: number;
  assetAmount: number;
  address: string;
  payUri: string;
  qrDataUrl: string;
  expiresAt: string;
  createdAt: string;
  status: 'awaiting' | 'verified' | 'failed';
  txHash: string | null;
  demo: boolean;
}

interface DepositStore {
  intents: Map<string, DepositIntent>;
}

const globalRef = globalThis as unknown as { __mineaiDeposits?: DepositStore };

function depositStore(): DepositStore {
  if (!globalRef.__mineaiDeposits) {
    globalRef.__mineaiDeposits = { intents: new Map() };
  }
  return globalRef.__mineaiDeposits;
}

/** Stablecoin legs are 1:1; TON and BTC are quoted at a conservative fixed rate. */
function assetAmountFor(network: CryptoNetwork, amountUsd: number): number {
  if (network.asset === 'USDT') return Number(amountUsd.toFixed(2));
  if (network.asset === 'TON') return Number((amountUsd / 5.2).toFixed(4));
  if (network.asset === 'BTC') return Number((amountUsd / 96_500).toFixed(8));
  if (network.asset === 'LTC') return Number((amountUsd / 88.4).toFixed(8));
  return Number(amountUsd.toFixed(6));
}

export async function createDepositIntent(
  networkId: string,
  amountUsd: number,
): Promise<{ ok: boolean; intent?: DepositIntent; error?: string }> {
  const network = findNetwork(networkId);
  if (!network) return { ok: false, error: 'Unknown network' };
  if (!network.configured) {
    return { ok: false, error: `${network.envKey} is not configured with a valid owner address` };
  }
  if (!Number.isFinite(amountUsd) || amountUsd < network.minAmount) {
    return { ok: false, error: `Minimum deposit on ${network.label} is ${network.minAmount} USD` };
  }

  const assetAmount = assetAmountFor(network, amountUsd);
  const payUri = network.payUri(network.address, assetAmount);
  const qrDataUrl = await QRCode.toDataURL(payUri, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 420,
    color: { dark: '#04060d', light: '#f2f7ff' },
  });

  const id = `DEP-${Date.now().toString(36).toUpperCase()}-${Math.random()
    .toString(36)
    .slice(2, 7)
    .toUpperCase()}`;
  const now = new Date();

  const intent: DepositIntent = {
    id,
    network: network.id,
    amountUsd: Number(amountUsd.toFixed(2)),
    assetAmount,
    address: network.address,
    payUri,
    qrDataUrl,
    expiresAt: new Date(now.getTime() + 30 * 60 * 1000).toISOString(),
    createdAt: now.toISOString(),
    status: 'awaiting',
    txHash: null,
    demo: network.demo,
  };

  depositStore().intents.set(id, intent);
  return { ok: true, intent };
}

export function getDepositIntent(id: string): DepositIntent | undefined {
  return depositStore().intents.get(id);
}

export interface ChainVerdict {
  state: 'verified' | 'pending' | 'failed' | 'unavailable';
  confirmations: number;
  detail: string;
}

async function rpc(url: string, body: unknown, timeoutMs = 9000): Promise<unknown> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error(`RPC ${response.status}`);
  return response.json();
}

async function verifyEvm(network: CryptoNetwork, hash: string): Promise<ChainVerdict> {
  const endpoints: Record<string, string> = {
    'usdt-bep20': 'https://bsc-dataseed.binance.org',
    'usdt-arbitrum': 'https://arb1.arbitrum.io/rpc',
    'usdt-erc20': 'https://ethereum-rpc.publicnode.com',
  };
  const endpoint = endpoints[network.id];
  if (!endpoint) return { state: 'unavailable', confirmations: 0, detail: 'No RPC mapped for this network.' };

  const tx = (await rpc(endpoint, {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getTransactionByHash',
    params: [hash.startsWith('0x') ? hash : `0x${hash}`],
  })) as { result?: { blockNumber?: string | null } | null };

  if (!tx.result) return { state: 'pending', confirmations: 0, detail: 'The RPC has not seen this transaction yet.' };
  if (!tx.result.blockNumber) return { state: 'pending', confirmations: 0, detail: 'Transaction is in the mempool.' };

  const receipt = (await rpc(endpoint, {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_getTransactionReceipt',
    params: [hash.startsWith('0x') ? hash : `0x${hash}`],
  })) as { result?: { status?: string; blockNumber?: string } | null };

  if (!receipt.result) return { state: 'pending', confirmations: 0, detail: 'Receipt not available yet.' };
  if (receipt.result.status !== '0x1') {
    return { state: 'failed', confirmations: 0, detail: 'The transaction reverted on-chain.' };
  }

  const head = (await rpc(endpoint, {
    jsonrpc: '2.0',
    id: 1,
    method: 'eth_blockNumber',
    params: [],
  })) as { result?: string };

  const mined = Number.parseInt(receipt.result.blockNumber ?? '0x0', 16);
  const current = Number.parseInt(head.result ?? '0x0', 16);
  const confirmations = Number.isFinite(current - mined) ? Math.max(0, current - mined) : 0;

  return {
    state: confirmations >= 2 ? 'verified' : 'pending',
    confirmations,
    detail:
      confirmations >= 2
        ? `Included on-chain with ${confirmations} confirmations.`
        : `Included, waiting for finality (${confirmations}/2).`,
  };
}

async function verifyTron(hash: string): Promise<ChainVerdict> {
  const clean = hash.replace(/^0x/, '');
  const response = await fetch(`https://api.trongrid.io/v1/transactions/${clean}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(9000),
  });
  if (!response.ok) return { state: 'pending', confirmations: 0, detail: 'TronGrid has not indexed it yet.' };
  const payload = (await response.json()) as {
    data?: Array<{ ret?: Array<{ contractRet?: string }>; confirmed?: boolean; blockNumber?: number }>;
  };
  const tx = payload.data?.[0];
  if (!tx) return { state: 'pending', confirmations: 0, detail: 'TronGrid has not indexed it yet.' };
  if (tx.ret?.[0]?.contractRet !== 'SUCCESS') {
    return { state: 'failed', confirmations: 0, detail: 'TRON rejected the contract call.' };
  }
  return tx.confirmed
    ? { state: 'verified', confirmations: 19, detail: 'Confirmed by a solid TRON block.' }
    : { state: 'pending', confirmations: 0, detail: 'Included but not yet solidified.' };
}

async function verifySolana(hash: string): Promise<ChainVerdict> {
  const payload = (await rpc('https://api.mainnet-beta.solana.com', {
    jsonrpc: '2.0',
    id: 1,
    method: 'getTransaction',
    params: [hash, { encoding: 'jsonParsed', maxSupportedTransactionVersion: 0 }],
  })) as { result?: { meta?: { err?: unknown } | null; slot?: number } | null };

  if (!payload.result) return { state: 'pending', confirmations: 0, detail: 'Solana has not confirmed it yet.' };
  if (payload.result.meta?.err) return { state: 'failed', confirmations: 0, detail: 'The Solana transaction failed.' };
  return { state: 'verified', confirmations: 32, detail: 'Finalised on Solana mainnet.' };
}

async function verifyTon(hash: string): Promise<ChainVerdict> {
  const response = await fetch(`https://tonapi.io/v2/blockchain/transactions/${encodeURIComponent(hash)}`, {
    headers: { Accept: 'application/json' },
    cache: 'no-store',
    signal: AbortSignal.timeout(9000),
  });
  if (response.status === 404) return { state: 'pending', confirmations: 0, detail: 'TON has not indexed it yet.' };
  if (!response.ok) return { state: 'pending', confirmations: 0, detail: 'TON API is busy; try again shortly.' };
  const payload = (await response.json()) as { success?: boolean; description?: { aborted?: boolean } };
  if (payload.description?.aborted) return { state: 'failed', confirmations: 0, detail: 'The TON transaction aborted.' };
  return { state: 'verified', confirmations: 1, detail: 'Accepted by a TON masterchain block.' };
}

async function verifyBitcoin(hash: string): Promise<ChainVerdict> {
  const response = await fetch(`https://blockstream.info/api/tx/${hash}/status`, {
    cache: 'no-store',
    signal: AbortSignal.timeout(9000),
  });
  if (response.status === 404) return { state: 'pending', confirmations: 0, detail: 'Bitcoin has not seen it yet.' };
  if (!response.ok) return { state: 'pending', confirmations: 0, detail: 'Blockstream is busy; try again shortly.' };
  const payload = (await response.json()) as { confirmed?: boolean; block_height?: number };
  if (!payload.confirmed) return { state: 'pending', confirmations: 0, detail: 'Waiting in the mempool.' };
  const tip = (await fetch('https://blockstream.info/api/blocks/tip/height', {
    cache: 'no-store',
    signal: AbortSignal.timeout(9000),
  }).then((res) => (res.ok ? res.text() : '0'))) as string;
  const confirmations = Math.max(0, Number(tip) - Number(payload.block_height ?? 0) + 1);
  return confirmations >= 2
    ? { state: 'verified', confirmations, detail: `Included with ${confirmations} confirmations.` }
    : { state: 'pending', confirmations, detail: 'Included, waiting for a second block.' };
}

export async function verifyOnChain(networkId: string, hash: string): Promise<ChainVerdict> {
  const network = findNetwork(networkId);
  if (!network) return { state: 'failed', confirmations: 0, detail: 'Unknown network.' };
  if (!isValidTxHash(network.family, hash)) {
    return { state: 'failed', confirmations: 0, detail: 'That transaction hash is malformed for this network.' };
  }

  try {
    if (network.family === 'evm') return await verifyEvm(network, hash);
    if (network.family === 'tron') return await verifyTron(hash);
    if (network.family === 'solana') return await verifySolana(hash);
    if (network.family === 'ton') return await verifyTon(hash);
    return await verifyBitcoin(hash);
  } catch {
    return {
      state: 'unavailable',
      confirmations: 0,
      detail: 'The public RPC could not be reached. The deposit stays pending; nothing was credited.',
    };
  }
}

/**
 * Verifies a deposit intent and credits the treasury exactly once.
 */
export async function settleDeposit(
  id: string,
  txHash: string,
): Promise<{ ok: boolean; verdict?: ChainVerdict; intent?: DepositIntent; credited?: number; error?: string }> {
  const intent = getDepositIntent(id);
  if (!intent) return { ok: false, error: 'Deposit intent not found or expired' };

  const verdict = await verifyOnChain(intent.network, txHash);
  intent.txHash = txHash;

  if (verdict.state === 'verified' && intent.status !== 'verified') {
    intent.status = 'verified';
    creditTreasury(intent.amountUsd, `On-chain deposit ${intent.network}`, `DEP-${id}`);
    return { ok: true, verdict, intent, credited: intent.amountUsd };
  }

  if (verdict.state === 'failed') intent.status = 'failed';
  return { ok: verdict.state === 'verified', verdict, intent, error: verdict.detail };
}
