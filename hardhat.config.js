const path = require('node:path');
const { createRequire } = require('node:module');

/**
 * Hardhat configuration for $MINEAI.
 *
 * The Solidity source lives in `./contracts` and the deploy entrypoint in
 * `./scripts`. The toolchain itself is a separate npm project under `hardhat/`
 * so the Next.js install never pulls a Solidity compiler; this file resolves
 * its plugins through that project with `createRequire`.
 *
 * OpenZeppelin is the one library Hardhat has to find in the project root's
 * `node_modules` (it resolves imports relative to the project, not the config
 * file), so it is a root devDependency. It is source-only — no build step.
 *
 *   npm install                                  # app + @openzeppelin/contracts
 *   npm --prefix hardhat install                 # solc, Hardhat, toolbox
 *   npm --prefix hardhat run compile
 *   npm --prefix hardhat run deploy:testnet
 */

const toolchain = createRequire(path.join(__dirname, 'hardhat', 'package.json'));

toolchain('@nomicfoundation/hardhat-toolbox');

const dotenv = toolchain('dotenv');
dotenv.config({ path: path.join(__dirname, '.env.local') });
dotenv.config({ path: path.join(__dirname, '.env') });

const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY ?? '';
const accounts = PRIVATE_KEY ? [PRIVATE_KEY] : [];

/** @type {import('hardhat/config').HardhatUserConfig} */
module.exports = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: { enabled: true, runs: 400 },
      evmVersion: 'paris',
    },
  },
  paths: {
    sources: './contracts',
    tests: './contracts/test',
    cache: './hardhat/cache',
    artifacts: './hardhat/artifacts',
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    bscTestnet: {
      url: process.env.BSC_TESTNET_RPC ?? 'https://data-seed-prebsc-1-s1.bnbchain.org:8545',
      chainId: 97,
      accounts,
    },
    bsc: {
      url: process.env.BSC_RPC ?? 'https://bsc-dataseed.bnbchain.org',
      chainId: 56,
      accounts,
    },
    ethereum: {
      url: process.env.ETH_RPC ?? 'https://ethereum-rpc.publicnode.com',
      chainId: 1,
      accounts,
    },
    sepolia: {
      url: process.env.SEPOLIA_RPC ?? 'https://ethereum-sepolia-rpc.publicnode.com',
      chainId: 11155111,
      accounts,
    },
    arbitrum: {
      url: process.env.ARB_RPC ?? 'https://arb1.arbitrum.io/rpc',
      chainId: 42161,
      accounts,
    },
  },
  etherscan: {
    apiKey: {
      bsc: process.env.BSCSCAN_API_KEY ?? '',
      bscTestnet: process.env.BSCSCAN_API_KEY ?? '',
      mainnet: process.env.ETHERSCAN_API_KEY ?? '',
      sepolia: process.env.ETHERSCAN_API_KEY ?? '',
      arbitrumOne: process.env.ARBISCAN_API_KEY ?? '',
    },
  },
  sourcify: { enabled: false },
};
