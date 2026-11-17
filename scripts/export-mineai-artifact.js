const fs = require('node:fs');
const path = require('node:path');

/**
 * Exports the compiled $MINEAI artifact for browser-side deployment.
 *
 * The admin console deploys the contract straight from the owner's wallet, so
 * the browser needs the ABI and the creation bytecode. Hardhat writes both into
 * `hardhat/artifacts`, which is gitignored; this script lifts the two fields the
 * browser actually uses into `public/`, where Next serves them as a static file.
 *
 *   npm run contract:compile
 *   npm run contract:artifact
 *
 * The exported file is deliberately minimal: no source maps, no debug metadata,
 * no storage layout. Publishing the bytecode is the point — the contract is
 * public the moment it is deployed.
 */

const ROOT = path.join(__dirname, '..');
const ARTIFACT = path.join(
  ROOT,
  'hardhat',
  'artifacts',
  'contracts',
  'MineAIToken.sol',
  'MineAIToken.json',
);
const TARGET = path.join(ROOT, 'public', 'mineai-token.json');

if (!fs.existsSync(ARTIFACT)) {
  console.error(
    `Artifact missing: ${path.relative(ROOT, ARTIFACT)}\nRun "npm run contract:compile" first.`,
  );
  process.exit(1);
}

const artifact = JSON.parse(fs.readFileSync(ARTIFACT, 'utf8'));
const bytecode = artifact.bytecode ?? '';

if (!artifact.abi || !Array.isArray(artifact.abi)) {
  console.error('Artifact has no ABI.');
  process.exit(1);
}

if (!bytecode || bytecode === '0x') {
  console.error('Artifact has no creation bytecode. Did the contract compile?');
  process.exit(1);
}

const exported = {
  name: artifact.contractName ?? 'MineAIToken',
  compiler: artifact.metadata ? 'solc 0.8.24' : 'solc',
  abi: artifact.abi,
  bytecode,
  constructor: {
    name: 'treasury',
    type: 'address',
    note: 'The deploying wallet becomes owner; the treasury receives the fixed 1,000,000,000 supply.',
  },
  networks: {
    97: { name: 'BNB Smart Chain Testnet', explorer: 'https://testnet.bscscan.com' },
    56: { name: 'BNB Smart Chain Mainnet', explorer: 'https://bscscan.com' },
  },
};

fs.mkdirSync(path.dirname(TARGET), { recursive: true });
fs.writeFileSync(TARGET, `${JSON.stringify(exported)}\n`, 'utf8');

const kilobytes = (Buffer.byteLength(JSON.stringify(exported)) / 1024).toFixed(1);
console.log(`Wrote public/mineai-token.json (${kilobytes} KB, ${exported.abi.length} ABI entries).`);
