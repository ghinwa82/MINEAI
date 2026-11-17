const fs = require('node:fs');
const path = require('node:path');

// The toolchain is isolated under `hardhat/node_modules`; a plain
// `require('hardhat')` from this directory would walk up to the app's
// node_modules and miss it.
const hre = (() => {
  try {
    return require('hardhat');
  } catch {
    return require(path.join(__dirname, '..', 'hardhat', 'node_modules', 'hardhat'));
  }
})();

/**
 * Deploys $MINEAI and seeds the four staking pools.
 *
 * The treasury receives the entire fixed supply. When `TREASURY_ADDRESS` is
 * absent the deployer wallet is used, which is fine on a testnet and is logged
 * loudly so a mainnet run cannot do it by accident.
 *
 *   npm --prefix contracts run deploy:testnet
 *
 * The resulting address and pool table are written to
 * `contracts/deployments/<network>.json` for the app's environment.
 */

const POOLS = [
  { name: 'Observer', aprBps: 840, lockDays: 0 },
  { name: 'Navigator', aprBps: 1_260, lockDays: 30 },
  { name: 'Whale', aprBps: 1_820, lockDays: 90 },
  { name: 'Leviathan', aprBps: 2_450, lockDays: 180 },
];

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  if (!deployer) {
    throw new Error('No signer available. Set DEPLOYER_PRIVATE_KEY in .env.local.');
  }

  const network = hre.network.name;
  const treasury = process.env.TREASURY_ADDRESS || deployer.address;

  console.log(`Network   : ${network} (chain ${hre.network.config.chainId ?? 'local'})`);
  console.log(`Deployer  : ${deployer.address}`);
  console.log(`Treasury  : ${treasury}${process.env.TREASURY_ADDRESS ? '' : ' (deployer fallback)'}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Balance   : ${hre.ethers.formatEther(balance)} native\n`);

  const Token = await hre.ethers.getContractFactory('MineAIToken');
  const token = await Token.deploy(treasury);
  await token.waitForDeployment();

  const address = await token.getAddress();
  console.log(`MineAIToken deployed: ${address}`);

  const supply = await token.totalSupply();
  console.log(`Total supply       : ${hre.ethers.formatEther(supply)} $MINEAI`);

  const pools = [];
  for (const pool of POOLS) {
    const tx = await token.createPool(pool.name, pool.aprBps, pool.lockDays);
    const receipt = await tx.wait();
    pools.push({ ...pool, poolId: pools.length, txHash: receipt?.hash ?? null });
    console.log(`Pool ${pools.length - 1}            : ${pool.name} · ${pool.aprBps / 100}% APR · ${pool.lockDays}d lock`);
  }

  const directory = path.join(__dirname, '..', 'contracts', 'deployments');
  fs.mkdirSync(directory, { recursive: true });

  const record = {
    network,
    chainId: hre.network.config.chainId ?? null,
    contract: 'MineAIToken',
    address,
    treasury,
    deployer: deployer.address,
    totalSupply: hre.ethers.formatEther(supply),
    decimals: Number(await token.decimals()),
    pools,
    deployedAt: new Date().toISOString(),
  };

  const file = path.join(directory, `${network}.json`);
  fs.writeFileSync(file, `${JSON.stringify(record, null, 2)}\n`);

  console.log(`\nWritten to ${file}`);
  console.log('\nAdd these to the app environment:');
  const ENV_KEYS = {
    bscTestnet: 'NEXT_PUBLIC_MINEAI_BSC_TESTNET_CONTRACT',
    bsc: 'NEXT_PUBLIC_MINEAI_BSC_CONTRACT',
    sepolia: 'NEXT_PUBLIC_MINEAI_SEPOLIA_CONTRACT',
    ethereum: 'NEXT_PUBLIC_MINEAI_ETH_CONTRACT',
    arbitrum: 'NEXT_PUBLIC_MINEAI_ARB_CONTRACT',
  };
  const envKey = ENV_KEYS[network] ?? `NEXT_PUBLIC_MINEAI_CONTRACT_${network.toUpperCase()}`;
  console.log(`  ${envKey}=${address}`);
  console.log(`  MINEAI_TOKEN_ADDRESS=${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
