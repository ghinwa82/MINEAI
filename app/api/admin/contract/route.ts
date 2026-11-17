import { NextResponse } from 'next/server';
import { z } from 'zod';

import {
  BSC_CHAINS,
  EVM_ADDRESS,
  persistDeployment,
  readDeployments,
  verifyContractCode,
} from '@/lib/deployments';
import { checkRateLimit, clientKey } from '@/lib/rate-limit';
import { describeIssues } from '@/lib/validation';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

/**
 * The owner's contract registry.
 *
 * Deploying happens entirely in the browser, so this route never touches a
 * private key. It accepts a claim only when all three checks pass:
 *
 *   1. the deployer address equals `OWNER_EVM_WALLET`;
 *   2. `eth_getCode` on the target chain returns non-empty bytecode;
 *   3. the body matches the schema.
 *
 * The first check is the authorisation: only the holder of the owner wallet can
 * produce a deployment whose `from` field is that address, because the wallet
 * signs the transaction. The second stops typos and wallet addresses from being
 * registered as contracts.
 */

const bodySchema = z.object({
  chainId: z.union([z.literal(56), z.literal(97)]),
  address: z.string().trim().regex(EVM_ADDRESS, 'That is not an EVM contract address'),
  deployer: z.string().trim().regex(EVM_ADDRESS, 'That is not an EVM wallet address'),
  txHash: z
    .string()
    .trim()
    .regex(/^0x[a-fA-F0-9]{64}$/, 'A transaction hash is 0x followed by 64 hex characters')
    .optional(),
  compiler: z.string().trim().max(40).optional(),
});

export async function GET() {
  const deployments = await readDeployments();
  const owner = process.env.OWNER_EVM_WALLET?.trim() ?? null;

  return NextResponse.json({
    ok: true,
    owner,
    deployments,
    chains: Object.entries(BSC_CHAINS).map(([chainId, chain]) => ({
      chainId: Number(chainId),
      name: chain.name,
      explorer: chain.explorer,
    })),
  });
}

export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'admin-contract'), 6, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many registry attempts. Wait a minute and retry.' },
      { status: 429 },
    );
  }

  const owner = process.env.OWNER_EVM_WALLET?.trim() ?? '';
  if (!EVM_ADDRESS.test(owner)) {
    return NextResponse.json(
      { ok: false, error: 'OWNER_EVM_WALLET is not configured on this deployment.' },
      { status: 503 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'Body must be JSON.' }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: describeIssues(parsed.error) }, { status: 400 });
  }

  const { chainId, address, deployer, txHash, compiler } = parsed.data;

  if (deployer.toLowerCase() !== owner.toLowerCase()) {
    return NextResponse.json(
      { ok: false, error: 'Only the owner wallet can register a deployment.' },
      { status: 403 },
    );
  }

  const hasCode = await verifyContractCode(chainId, address);
  if (!hasCode) {
    return NextResponse.json(
      {
        ok: false,
        error: `No contract bytecode at ${address} on ${BSC_CHAINS[chainId].name}. Wait for the transaction to confirm, then retry.`,
      },
      { status: 400 },
    );
  }

  const network = BSC_CHAINS[chainId].name;
  const persisted = await persistDeployment({ chainId, network, address, deployer, txHash, compiler });

  const envName = chainId === 56 ? 'NEXT_PUBLIC_MINEAI_BSC_CONTRACT' : 'NEXT_PUBLIC_MINEAI_BSC_TESTNET_CONTRACT';

  return NextResponse.json({
    ok: true,
    persisted,
    deployment: {
      chainId,
      network,
      address,
      explorer: `${BSC_CHAINS[chainId].explorer}/address/${address}`,
      txHash: txHash ?? null,
    },
    env: { name: envName, value: address },
    note: persisted
      ? 'Registered. The token endpoint now serves this address on every instance.'
      : 'Verified on-chain. Saved in this browser; add SUPABASE_SERVICE_ROLE_KEY to sync the registry across instances.',
  });
}
