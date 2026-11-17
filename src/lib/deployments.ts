import { readTable } from '@/lib/supabase';

/**
 * Contract registry.
 *
 * The token contract is deployed from the owner's browser wallet, not from a
 * key in CI. The address therefore arrives after the build and has to be
 * readable at runtime, so it lives in two places: the environment (the fast,
 * always-there fallback) and the `contract_deployments` table (written by the
 * admin console). Reads merge both and prefer the newest database row.
 */

export interface Deployment {
  chainId: number;
  network: string;
  address: string;
  explorer: string;
  txHash?: string | null;
  deployedAt?: string | null;
}

/** One minute is enough: a deployment is a rare, deliberate event. */
const CACHE_MS = 60_000;
const cache: { at: number; value: Deployment[] | null } = { at: 0, value: null };

export const EVM_ADDRESS = /^0x[a-fA-F0-9]{40}$/;

export const BSC_CHAINS: Record<number, { name: string; explorer: string; rpc: string[] }> = {
  56: {
    name: 'BNB Smart Chain',
    explorer: 'https://bscscan.com',
    rpc: ['https://bsc-dataseed.bnbchain.org', 'https://bsc-rpc.publicnode.com'],
  },
  97: {
    name: 'BNB Smart Chain Testnet',
    explorer: 'https://testnet.bscscan.com',
    rpc: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545', 'https://bsc-testnet-rpc.publicnode.com'],
  },
};

/** Reads the deployment rows the admin console has written, if any. */
export async function readDeployments(options: { fresh?: boolean } = {}): Promise<Deployment[]> {
  const now = Date.now();
  if (!options.fresh && cache.value && now - cache.at < CACHE_MS) return cache.value;

  const rows = await readTable('contract_deployments', { limit: 10 });
  const seen = new Set<number>();
  const deployments: Deployment[] = [];

  for (const row of rows) {
    const chainId = Number(row.chain_id);
    const address = typeof row.address === 'string' ? row.address.trim() : '';
    if (!Number.isFinite(chainId) || !EVM_ADDRESS.test(address) || seen.has(chainId)) continue;
    seen.add(chainId);
    deployments.push({
      chainId,
      network: typeof row.network === 'string' ? row.network : (BSC_CHAINS[chainId]?.name ?? 'Unknown'),
      address,
      explorer: BSC_CHAINS[chainId]?.explorer ?? 'https://bscscan.com',
      txHash: typeof row.tx_hash === 'string' ? row.tx_hash : null,
      deployedAt: typeof row.deployed_at === 'string' ? row.deployed_at : null,
    });
  }

  cache.at = now;
  cache.value = deployments;
  return deployments;
}

/**
 * Confirms real bytecode exists at the address before it is allowed into the
 * registry. A wrong address, a wallet address or a typo all return `false`.
 */
export async function verifyContractCode(chainId: number, address: string): Promise<boolean> {
  const chain = BSC_CHAINS[chainId];
  if (!chain || !EVM_ADDRESS.test(address)) return false;

  for (const rpc of chain.rpc) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6500);
      const response = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_getCode',
          params: [address, 'latest'],
        }),
        cache: 'no-store',
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (!response.ok) continue;
      const payload = (await response.json()) as { result?: string };
      if (typeof payload.result === 'string' && payload.result !== '0x' && payload.result.length > 2) {
        return true;
      }
    } catch {
      // Try the next endpoint; a dead RPC is not a verdict on the address.
    }
  }

  return false;
}

/**
 * Writes a registry row with the service role when one is configured. RLS
 * intentionally blocks anon writes, so without the service key the console
 * reports "saved locally" instead of pretending the row exists in the cloud.
 */
export async function persistDeployment(deployment: {
  chainId: number;
  network: string;
  address: string;
  deployer: string;
  txHash?: string | null;
  compiler?: string | null;
}): Promise<boolean> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return false;

  try {
    const response = await fetch(`${url}/rest/v1/contract_deployments?on_conflict=chain_id`, {
      method: 'POST',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify({
        chain_id: deployment.chainId,
        network: deployment.network,
        address: deployment.address,
        deployer: deployment.deployer,
        tx_hash: deployment.txHash ?? null,
        compiler: deployment.compiler ?? null,
        updated_at: new Date().toISOString(),
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
