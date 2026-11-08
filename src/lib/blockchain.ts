import { ethers } from "ethers";

// Define the chains we support
export const CHAINS = {
  ethereum: {
    chainId: 1,
    name: "Ethereum",
    rpcUrl: process.env.ETHEREUM_RPC_URL || "",
  },
  bsc: {
    chainId: 56,
    name: "Binance Smart Chain",
    rpcUrl: process.env.BSC_RPC_URL || "",
  },
  polygon: {
    chainId: 137,
    name: "Polygon",
    rpcUrl: process.env.POLYGON_RPC_URL || "",
  },
};

// Initialize providers for each chain
export const providers: Record<string, ethers.JsonRpcProvider> = {};

Object.keys(CHAINS).forEach((key) => {
  const chain = CHAINS[key as keyof typeof CHAINS];
  if (chain.rpcUrl) {
    providers[key] = new ethers.JsonRpcProvider(chain.rpcUrl);
  }
});

/**
 * Get provider for a specific chain
 */
export function getProvider(chain: keyof typeof CHAINS): ethers.JsonRpcProvider {
  const provider = providers[chain];
  if (!provider) {
    throw new Error(`Provider not configured for chain: ${chain}`);
  }
  return provider;
}

/**
 * Get signer from private key for a specific chain
 */
export function getSigner(
  chain: keyof typeof CHAINS,
  privateKey: string = process.env.WALLET_PRIVATE_KEY || ""
): ethers.Wallet {
  if (!privateKey) {
    throw new Error("Private key not provided");
  }
  const provider = getProvider(chain);
  return new ethers.Wallet(privateKey, provider);
}