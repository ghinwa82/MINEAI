'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';

import PageShell from '../../components/PageShell';

/**
 * The owner's deployment console.
 *
 * The contract is deployed by the browser wallet itself: this page builds the
 * creation transaction, the wallet signs it, and the private key never exists
 * anywhere except inside the wallet. There is no server-side signer and no key
 * in `.env` — the only credential is the owner sitting at the keyboard.
 *
 * After confirmation the address is verified against `eth_getCode` by
 * `/api/admin/contract`, registered for `/api/token` to serve, and cached in
 * this browser so the console can show the deployment even when the registry
 * write is unavailable.
 */

type Eip1193 = {
  request: (args: { method: string; params?: unknown }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
};

type Artifact = {
  name: string;
  compiler: string;
  abi: unknown[];
  bytecode: string;
};

type Deployment = {
  chainId: number;
  network: string;
  address: string;
  explorer: string;
  txHash?: string | null;
};

type Step = { at: string; tone: 'info' | 'ok' | 'error'; text: string };

type GrowthState = {
  lastRunAt: string | null;
  lastRunTrigger: 'cron' | 'manual' | null;
  runs: number;
  briefsGenerated: number;
  scriptsGenerated: number;
  indexedUrls: number;
  indexPings: number;
  shares: number;
  signups: number;
  logs: Array<{ id: string; at: string; agent: string; action: string; status: string }>;
  campaigns: Array<{
    id: string;
    slug: string;
    lang: string;
    network: string;
    script: string;
    createdAt: string;
  }>;
};

const CHAINS: Record<
  number,
  {
    label: string;
    hex: string;
    currency: { name: string; symbol: string; decimals: number };
    rpc: string[];
    explorer: string;
    faucet?: string;
  }
> = {
  97: {
    label: 'BNB Smart Chain Testnet',
    hex: '0x61',
    currency: { name: 'tBNB', symbol: 'tBNB', decimals: 18 },
    rpc: ['https://data-seed-prebsc-1-s1.bnbchain.org:8545', 'https://bsc-testnet-rpc.publicnode.com'],
    explorer: 'https://testnet.bscscan.com',
    faucet: 'https://testnet.bnbchain.org/faucet-smart',
  },
  56: {
    label: 'BNB Smart Chain Mainnet',
    hex: '0x38',
    currency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpc: ['https://bsc-dataseed.bnbchain.org', 'https://bsc-rpc.publicnode.com'],
    explorer: 'https://bscscan.com',
  },
  11155111: {
    label: 'Ethereum Sepolia',
    hex: '0xaa36a7',
    currency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpc: ['https://ethereum-sepolia-rpc.publicnode.com', 'https://rpc.sepolia.org'],
    explorer: 'https://sepolia.etherscan.io',
    faucet: 'https://sepoliafaucet.com',
  },
};

function getProvider(): Eip1193 | null {
  if (typeof window === 'undefined') return null;
  const scope = window as unknown as { ethereum?: Eip1193; trustwallet?: Eip1193 };
  return scope.ethereum ?? scope.trustwallet ?? null;
}

function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

export default function PayoutSetupPage() {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [artifact, setArtifact] = useState<Artifact | null>(null);
  const [registry, setRegistry] = useState<Deployment[]>([]);
  const [owner, setOwner] = useState<string | null>(null);
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [persisted, setPersisted] = useState<boolean | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [growth, setGrowth] = useState<GrowthState | null>(null);

  const note = useCallback((tone: Step['tone'], text: string) => {
    setSteps((previous) => [
      { at: new Date().toLocaleTimeString('en-GB', { hour12: false }), tone, text },
      ...previous,
    ].slice(0, 14));
  }, []);

  const refreshRegistry = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/contract', { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as {
        owner?: string | null;
        deployments?: Deployment[];
      };
      setOwner(payload.owner ?? null);
      setRegistry(payload.deployments ?? []);
    } catch {
      // The registry is optional for the deploy itself.
    }
  }, []);

  const refreshGrowth = useCallback(async () => {
    try {
      const response = await fetch('/api/agents/growth', { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as { state?: GrowthState };
      setGrowth(payload.state ?? null);
    } catch {
      // The monitor is read-only; a failed poll leaves the last snapshot.
    }
  }, []);

  useEffect(() => {
    refreshGrowth();
    const timer = window.setInterval(refreshGrowth, 30_000);
    return () => window.clearInterval(timer);
  }, [refreshGrowth]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/mineai-token.json', { cache: 'force-cache' });
        if (response.ok) {
          const payload = (await response.json()) as Artifact;
          if (!cancelled) setArtifact(payload);
        }
      } catch {
        if (!cancelled) setError('Could not load public/mineai-token.json. Run npm run contract:artifact.');
      }

      try {
        const cached =
          window.localStorage.getItem('mineai.contract.56') ??
          window.localStorage.getItem('mineai.contract.97') ??
          window.localStorage.getItem('mineai.contract.11155111');
        if (cached && !cancelled) {
          const parsed = JSON.parse(cached) as Deployment;
          setDeployment(parsed);
        }
      } catch {
        // A malformed cache entry is not fatal.
      }
    };

    load();
    refreshRegistry();

    return () => {
      cancelled = true;
    };
  }, [refreshRegistry]);

  useEffect(() => {
    const provider = getProvider();
    if (!provider) return;

    const syncAccounts = async () => {
      try {
        const accounts = (await provider.request({ method: 'eth_accounts' })) as string[];
        if (accounts?.[0]) setAccount(accounts[0]);
      } catch {
        // Wallet locked; the connect button handles it.
      }
    };

    const syncChain = async () => {
      try {
        const hex = (await provider.request({ method: 'eth_chainId' })) as string;
        setChainId(Number.parseInt(hex, 16));
      } catch {
        // Chain stays unknown until connect.
      }
    };

    syncAccounts();
    syncChain();

    const onAccounts = (...args: unknown[]) => {
      const accounts = args[0] as string[] | undefined;
      setAccount(accounts?.[0] ?? null);
    };
    const onChain = (...args: unknown[]) => {
      const hex = args[0] as string | undefined;
      if (hex) setChainId(Number.parseInt(hex, 16));
    };

    provider.on?.('accountsChanged', onAccounts);
    provider.on?.('chainChanged', onChain);

    return () => {
      provider.removeListener?.('accountsChanged', onAccounts);
      provider.removeListener?.('chainChanged', onChain);
    };
  }, []);

  const connect = useCallback(async () => {
    setError(null);
    const provider = getProvider();
    if (!provider) {
      setError('No browser wallet found. Install MetaMask or Trust Wallet, then reload.');
      return;
    }
    setBusy('connect');
    try {
      const accounts = (await provider.request({ method: 'eth_requestAccounts' })) as string[];
      if (!accounts?.[0]) throw new Error('The wallet returned no account.');
      setAccount(accounts[0]);
      const hex = (await provider.request({ method: 'eth_chainId' })) as string;
      setChainId(Number.parseInt(hex, 16));
      note('ok', `Wallet connected: ${shortAddress(accounts[0])}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Wallet connection was refused.');
    } finally {
      setBusy(null);
    }
  }, [note]);

  const switchChain = useCallback(
    async (target: number) => {
      setError(null);
      const provider = getProvider();
      if (!provider) {
        setError('No browser wallet found.');
        return;
      }
      const chain = CHAINS[target];
      setBusy(`chain-${target}`);
      try {
        await provider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: chain.hex }],
        });
        setChainId(target);
        note('ok', `Switched to ${chain.label}.`);
      } catch (caught) {
        const code = (caught as { code?: number }).code;
        if (code === 4902) {
          try {
            await provider.request({
              method: 'wallet_addEthereumChain',
              params: [
                {
                  chainId: chain.hex,
                  chainName: chain.label,
                  nativeCurrency: chain.currency,
                  rpcUrls: chain.rpc,
                  blockExplorerUrls: [chain.explorer],
                },
              ],
            });
            setChainId(target);
            note('ok', `Added and switched to ${chain.label}.`);
          } catch (addError) {
            setError(addError instanceof Error ? addError.message : 'Could not add the network.');
          }
        } else {
          setError(caught instanceof Error ? caught.message : 'Network switch was refused.');
        }
      } finally {
        setBusy(null);
      }
    },
    [note],
  );

  const deploy = useCallback(async () => {
    setError(null);
    const provider = getProvider();
    if (!provider) {
      setError('No browser wallet found.');
      return;
    }
    if (!account) {
      setError('Connect the owner wallet first.');
      return;
    }
    if (!artifact) {
      setError('The contract artifact is missing. Run npm run contract:artifact and redeploy.');
      return;
    }
    if (!chainId || !CHAINS[chainId]) {
      setError('Switch to BNB Smart Chain Testnet, Mainnet or Ethereum Sepolia first.');
      return;
    }

    setBusy('deploy');
    setDeployment(null);
    setPersisted(null);

    try {
      // Constructor argument: the treasury receives the entire fixed supply.
      const constructorArg = account.toLowerCase().replace(/^0x/, '').padStart(64, '0');
      const data = `${artifact.bytecode}${constructorArg}`;

      note('info', `Building creation transaction on ${CHAINS[chainId].label}…`);

      let gas = '0x0';
      try {
        const estimate = (await provider.request({
          method: 'eth_estimateGas',
          params: [{ from: account, data }],
        })) as string;
        gas = `0x${((BigInt(estimate) * 12n) / 10n).toString(16)}`;
      } catch {
        gas = '0x5b8d80'; // 6,000,000 — a ceiling, not a target.
      }

      note('info', 'Waiting for the wallet signature…');
      const txHash = (await provider.request({
        method: 'eth_sendTransaction',
        params: [{ from: account, data, gas }],
      })) as string;

      note('info', `Broadcast ${txHash}. Waiting for confirmation…`);

      let receipt: { status?: string; contractAddress?: string } | null = null;
      for (let attempt = 0; attempt < 60; attempt += 1) {
        receipt = (await provider.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        })) as { status?: string; contractAddress?: string } | null;
        if (receipt) break;
        await new Promise((resolve) => setTimeout(resolve, 3000));
      }

      if (!receipt) {
        throw new Error('Timed out waiting for confirmation. Check the explorer before retrying.');
      }
      if (receipt.status === '0x0') {
        throw new Error('The deployment transaction reverted on-chain.');
      }
      if (!receipt.contractAddress) {
        throw new Error('The receipt carries no contract address.');
      }

      const address = receipt.contractAddress;
      note('ok', `Contract deployed at ${address}.`);

      const record: Deployment = {
        chainId,
        network: CHAINS[chainId].label,
        address,
        explorer: `${CHAINS[chainId].explorer}/address/${address}`,
        txHash,
      };
      setDeployment(record);

      try {
        window.localStorage.setItem(`mineai.contract.${chainId}`, JSON.stringify(record));
      } catch {
        // Private mode; the registry below is the durable path.
      }

      const response = await fetch('/api/admin/contract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chainId,
          address,
          deployer: account,
          txHash,
          compiler: artifact.compiler,
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        persisted?: boolean;
        error?: string;
        note?: string;
      };

      if (payload.ok) {
        setPersisted(Boolean(payload.persisted));
        note('ok', payload.note ?? 'Registry updated.');
        refreshRegistry();
      } else {
        setPersisted(false);
        note('error', payload.error ?? 'On-chain, but the registry rejected the write.');
      }
    } catch (caught) {
      const message =
        caught instanceof Error
          ? caught.message
          : typeof caught === 'object' && caught && 'message' in caught
            ? String((caught as { message: unknown }).message)
            : 'Deployment failed.';
      setError(message);
      note('error', message);
    } finally {
      setBusy(null);
    }
  }, [account, artifact, chainId, note, refreshRegistry]);

  const copy = useCallback(async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      // Clipboard refused.
    }
  }, []);

  const activeChain = chainId ? CHAINS[chainId] : null;
  const ready = Boolean(account && artifact && activeChain);

  const envSnippet = useMemo(() => {
    if (!deployment) return '';
    const names: Record<number, string> = {
      56: 'NEXT_PUBLIC_MINEAI_BSC_CONTRACT',
      97: 'NEXT_PUBLIC_MINEAI_BSC_TESTNET_CONTRACT',
      11155111: 'NEXT_PUBLIC_MINEAI_SEPOLIA_CONTRACT',
    };
    const name = names[deployment.chainId] ?? `NEXT_PUBLIC_MINEAI_CONTRACT_${deployment.chainId}`;
    return `${name}="${deployment.address}"`;
  }, [deployment]);

  return (
    <PageShell>
      <section className="grid gap-10 pb-10 pt-14 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
        <div>
          <p className="mx-eyebrow">Owner console</p>
          <h1 className="mx-display mt-6">Deploy $MINEAI from your wallet</h1>
          <p className="mx-lede mt-6 max-w-2xl">
            The contract is signed in the browser by MetaMask or Trust Wallet. No private key
            exists in this project, in Vercel, or on the server. The deployed address is verified
            on-chain before it is registered.
          </p>
        </div>

        <div className="grid gap-2 text-[0.72rem]">
          <span className="mx-chip !border-mint/40 !text-mint">No key in .env</span>
          <span className="mx-chip !border-amber/40 !text-amber">BSC Testnet 97 · BSC 56 · Sepolia 11155111</span>
          <span className="mx-chip">Fixed supply · 1,000,000,000 $MINEAI</span>
        </div>
      </section>

      {error ? (
        <div role="alert" className="mb-6 rounded-xl border border-rose/40 bg-rose/8 px-4 py-3 text-[0.82rem] font-medium text-rose">
          {error}
        </div>
      ) : null}

      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="grid gap-6">
          {/* ---------------------------------------------------- Wallet */}
          <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[0.58rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
                  Step 1
                </p>
                <h2 className="mt-1.5 text-lg font-bold text-ink">Connect the owner wallet</h2>
              </div>
              <span className={`mx-chip ${account ? '!border-mint/45 !text-mint' : '!border-amber/40 !text-amber'}`}>
                {account ? 'Connected' : 'Disconnected'}
              </span>
            </div>

            <div className="mt-5 rounded-xl border border-white/8 bg-[#050810] px-4 py-3">
              <p className="text-[0.56rem] tracking-[0.16em] text-ink-faint uppercase">Account</p>
              <p className="mx-numeric mt-1 break-all text-[0.8rem] text-ink">
                {account ?? '—'}
              </p>
              <p className="mt-2 text-[0.6rem] tracking-[0.16em] text-ink-faint uppercase">Network</p>
              <p className="mt-1 text-[0.8rem] text-ink">
                {activeChain ? activeChain.label : chainId ? `Chain ${chainId}` : '—'}
              </p>
              {owner && account && owner.toLowerCase() !== account.toLowerCase() ? (
                <p className="mt-2 text-[0.68rem] leading-relaxed text-rose">
                  This wallet is not the configured owner. The registry will reject the deployment.
                </p>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button type="button" onClick={connect} disabled={busy === 'connect'} className="mx-btn !py-2.5 !text-[0.78rem]">
                {account ? 'Reconnect wallet' : 'Connect wallet'}
              </button>
              <button
                type="button"
                onClick={() => switchChain(97)}
                disabled={busy === 'chain-97'}
                className="mx-btn-quiet !py-2.5 !text-[0.78rem]"
              >
                Testnet
              </button>
              <button
                type="button"
                onClick={() => switchChain(56)}
                disabled={busy === 'chain-56'}
                className="mx-btn-quiet !py-2.5 !text-[0.78rem]"
              >
                Mainnet
              </button>
              <button
                type="button"
                onClick={() => switchChain(11155111)}
                disabled={busy === 'chain-11155111'}
                className="mx-btn-quiet !py-2.5 !text-[0.78rem]"
              >
                Sepolia
              </button>
            </div>

            {CHAINS[97].faucet ? (
              <p className="mt-3 text-[0.66rem] leading-relaxed text-ink-faint">
                Testnet needs free tBNB:{' '}
                <a href={CHAINS[97].faucet} target="_blank" rel="noreferrer" className="text-cyan hover:underline">
                  BNB Chain faucet
                </a>
                {' · '}
                Sepolia needs free ETH:{' '}
                <a
                  href={CHAINS[11155111].faucet}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan hover:underline"
                >
                  Sepolia faucet
                </a>
                .
              </p>
            ) : null}
          </article>

          {/* -------------------------------------------------- Contract */}
          <article className="rounded-2xl border border-amber/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.06),rgba(8,13,24,0.97)_46%)] p-6 sm:p-7">
            <p className="text-[0.58rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
              Step 2
            </p>
            <h2 className="mt-1.5 text-lg font-bold text-ink">Deploy MineAIToken.sol</h2>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">
              The constructor takes one argument: the treasury that receives the fixed supply.
              It defaults to the connected wallet, so the owner holds the float and the owner
              role at genesis.
            </p>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-white/8 bg-[#050810] px-4 py-3">
                <dt className="text-[0.56rem] tracking-[0.16em] text-ink-faint uppercase">Artifact</dt>
                <dd className="mt-1 text-[0.78rem] text-ink">
                  {artifact ? `${artifact.name} · ${artifact.abi.length} ABI entries` : 'Loading…'}
                </dd>
              </div>
              <div className="rounded-xl border border-white/8 bg-[#050810] px-4 py-3">
                <dt className="text-[0.56rem] tracking-[0.16em] text-ink-faint uppercase">Treasury</dt>
                <dd className="mx-numeric mt-1 truncate text-[0.78rem] text-amber">
                  {account ? shortAddress(account) : 'Connect wallet'}
                </dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={deploy}
              disabled={!ready || busy === 'deploy'}
              className="mx-btn mt-5 w-full !py-3.5 !text-[0.9rem]"
            >
              {busy === 'deploy' ? 'Deploying — confirm in wallet…' : 'Deploy $MINEAI'}
            </button>
            <p className="mt-3 text-[0.66rem] leading-relaxed text-ink-faint">
              Deploying costs gas only. The wallet shows the fee before you sign; nothing is sent
              until you approve it.
            </p>
          </article>

          {/* -------------------------------------------------- Registry */}
          <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[0.58rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
                  Step 3
                </p>
                <h2 className="mt-1.5 text-lg font-bold text-ink">Saved contract address</h2>
              </div>
              <span
                className={`mx-chip ${
                  persisted === true ? '!border-mint/45 !text-mint' : persisted === false ? '!border-amber/40 !text-amber' : ''
                }`}
              >
                {persisted === true ? 'Cloud registry' : persisted === false ? 'Local only' : 'Awaiting deploy'}
              </span>
            </div>

            {deployment ? (
              <div className="mt-5 grid gap-3">
                <div className="rounded-xl border border-mint/25 bg-mint/[0.05] px-4 py-3">
                  <p className="text-[0.56rem] tracking-[0.16em] text-ink-faint uppercase">Contract</p>
                  <p className="mx-numeric mt-1 break-all text-[0.8rem] font-semibold text-mint">
                    {deployment.address}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copy('address', deployment.address)}
                      className="rounded-lg border border-white/12 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-ink-mute hover:border-amber/40 hover:text-amber"
                    >
                      {copied === 'address' ? 'Copied' : 'Copy address'}
                    </button>
                    <a
                      href={deployment.explorer}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-lg border border-white/12 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-ink-mute hover:border-cyan/40 hover:text-cyan"
                    >
                      Explorer ↗
                    </a>
                  </div>
                </div>

                <div className="rounded-xl border border-white/8 bg-[#050810] px-4 py-3">
                  <p className="text-[0.56rem] tracking-[0.16em] text-ink-faint uppercase">Environment</p>
                  <p className="mx-numeric mt-1 break-all text-[0.72rem] text-ink-soft">{envSnippet}</p>
                  <button
                    type="button"
                    onClick={() => copy('env', envSnippet)}
                    className="mt-2 rounded-lg border border-white/12 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-ink-mute hover:border-amber/40 hover:text-amber"
                  >
                    {copied === 'env' ? 'Copied' : 'Copy line'}
                  </button>
                </div>

                <p className="text-[0.66rem] leading-relaxed text-ink-faint">
                  The token endpoint serves this address immediately when the registry write
                  succeeded. Pinning the environment line makes it survive a registry reset.
                </p>
              </div>
            ) : (
              <p className="mt-5 text-[0.78rem] leading-relaxed text-ink-mute">
                No deployment recorded in this browser yet. Complete step 2 and the address will
                appear here, with the environment line ready to paste into Vercel.
              </p>
            )}
          </article>
        </div>

        {/* ------------------------------------------------------- Log */}
        <div className="grid gap-6 content-start">
          <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
            <h2 className="text-[0.95rem] font-bold text-ink">Deployment log</h2>
            <ol className="mt-4 space-y-2.5">
              {steps.length === 0 ? (
                <li className="text-[0.76rem] text-ink-faint">Nothing yet. Connect a wallet to begin.</li>
              ) : (
                steps.map((step, index) => (
                  <li key={`${step.at}-${index}`} className="flex gap-3">
                    <span className="mx-numeric shrink-0 pt-0.5 text-[0.62rem] text-ink-faint">{step.at}</span>
                    <span
                      className={`text-[0.74rem] leading-relaxed ${
                        step.tone === 'ok' ? 'text-mint' : step.tone === 'error' ? 'text-rose' : 'text-ink-soft'
                      }`}
                    >
                      {step.text}
                    </span>
                  </li>
                ))
              )}
            </ol>
          </article>

          <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
            <h2 className="text-[0.95rem] font-bold text-ink">Registry</h2>
            <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-mute">
              Read by <span className="mx-numeric text-ink-soft">/api/token</span> on every request.
              Mainnet wins over testnet in the public token identity.
            </p>

            <ul className="mt-4 divide-y divide-white/6">
              {registry.length === 0 ? (
                <li className="py-3 text-[0.74rem] text-ink-faint">No cloud rows yet.</li>
              ) : (
                registry.map((row) => (
                  <li key={row.chainId} className="py-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[0.72rem] font-semibold text-ink">{row.network}</span>
                      <span className="mx-numeric text-[0.6rem] text-ink-faint">#{row.chainId}</span>
                    </div>
                    <p className="mx-numeric mt-1 break-all text-[0.68rem] text-cyan">{row.address}</p>
                  </li>
                ))
              )}
            </ul>

            <button
              type="button"
              onClick={refreshRegistry}
              className="mt-3 rounded-lg border border-white/12 bg-white/[0.03] px-2.5 py-1 text-[0.68rem] text-ink-mute hover:border-cyan/40 hover:text-cyan"
            >
              Refresh registry
            </button>
          </article>

          <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
            <h2 className="text-[0.95rem] font-bold text-ink">Hardhat path</h2>
            <p className="mt-2 text-[0.72rem] leading-relaxed text-ink-mute">
              The same bytecode deploys from the CLI and seeds the four staking pools:
            </p>
            <pre className="mt-3 overflow-x-auto rounded-lg border border-white/8 bg-[#04060d] px-3 py-2.5 text-[0.66rem] leading-relaxed text-ink-soft">
{`npm run contract:compile
npm run contract:artifact
npm --prefix hardhat run deploy:testnet`}
            </pre>
            <p className="mt-3 text-[0.64rem] leading-relaxed text-ink-faint">
              The CLI route needs DEPLOYER_PRIVATE_KEY in the local environment. The browser route
              above does not.
            </p>
          </article>
        </div>
      </section>

      {/* ------------------------------------------- Growth Agents Monitor */}
      <section className="mt-10 rounded-2xl border border-cyan/20 bg-[linear-gradient(140deg,rgba(34,224,255,0.06),rgba(8,13,24,0.97)_55%)] p-6 sm:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.58rem] font-semibold tracking-[0.18em] text-ink-faint uppercase">
              Autonomous growth
            </p>
            <h2 className="mt-1.5 text-lg font-bold text-ink">Growth Agents Monitor</h2>
            <p className="mt-1.5 text-[0.74rem] leading-relaxed text-ink-mute">
              Trend, distribution, viral-loop and retention agents. The daily cron writes six-language
              market briefs and social scripts, refreshes the sitemap and pings IndexNow.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshGrowth}
            className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-1.5 text-[0.7rem] text-ink-mute transition hover:border-cyan/40 hover:text-cyan"
          >
            Refresh monitor
          </button>
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4 lg:grid-cols-8">
          {[
            { label: 'Runs', value: growth?.runs ?? 0 },
            { label: 'Briefs', value: growth?.briefsGenerated ?? 0 },
            { label: 'Scripts', value: growth?.scriptsGenerated ?? 0 },
            { label: 'URLs', value: growth?.indexedUrls ?? 0 },
            { label: 'Index pings', value: growth?.indexPings ?? 0 },
            { label: 'Shares', value: growth?.shares ?? 0 },
            { label: 'Signups', value: growth?.signups ?? 0 },
            { label: 'Campaigns', value: growth?.campaigns.length ?? 0 },
          ].map((stat) => (
            <div key={stat.label} className="rounded-xl border border-white/8 bg-[#04060d]/70 px-3 py-2.5">
              <dt className="text-[0.54rem] tracking-[0.12em] text-ink-faint uppercase">{stat.label}</dt>
              <dd className="mx-numeric mt-1 text-lg font-bold text-cyan">{stat.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mx-numeric mt-4 text-[0.66rem] text-ink-faint">
          Last run:{' '}
          {growth?.lastRunAt
            ? `${new Date(growth.lastRunAt).toLocaleString('en-GB')} · ${growth.lastRunTrigger ?? 'cron'}`
            : 'not yet in this instance'}
        </p>

        <div className="mt-5 grid gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-white/8 bg-[#050810] p-4">
            <h3 className="text-[0.72rem] font-semibold tracking-[0.1em] text-amber uppercase">
              Agent log
            </h3>
            <ol className="mt-3 space-y-2.5">
              {(growth?.logs ?? []).length === 0 ? (
                <li className="text-[0.74rem] text-ink-faint">
                  No cycles on this instance yet. The next cron run or a manual trigger fills this feed.
                </li>
              ) : (
                growth!.logs.slice(0, 8).map((entry) => (
                  <li key={entry.id} className="flex gap-2.5">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                        entry.status === 'success'
                          ? 'bg-mint'
                          : entry.status === 'warning'
                            ? 'bg-amber'
                            : 'bg-cyan'
                      }`}
                      aria-hidden
                    />
                    <div>
                      <p className="text-[0.6rem] tracking-[0.1em] text-ink-faint uppercase">{entry.agent}</p>
                      <p className="mt-0.5 text-[0.73rem] leading-relaxed text-ink-soft">{entry.action}</p>
                    </div>
                  </li>
                ))
              )}
            </ol>
          </div>

          <div className="rounded-xl border border-white/8 bg-[#050810] p-4">
            <h3 className="text-[0.72rem] font-semibold tracking-[0.1em] text-cyan uppercase">
              Prepared campaigns
            </h3>
            <ul className="mt-3 space-y-2">
              {(growth?.campaigns ?? []).length === 0 ? (
                <li className="text-[0.74rem] text-ink-faint">No campaigns prepared on this instance.</li>
              ) : (
                growth!.campaigns.slice(0, 5).map((campaign) => (
                  <li key={campaign.id} className="rounded-lg border border-white/8 px-3 py-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[0.66rem] font-semibold text-ink">
                        {campaign.network} · {campaign.lang.toUpperCase()}
                      </span>
                      <span className="mx-numeric text-[0.56rem] text-ink-faint">{campaign.slug}</span>
                    </div>
                    <p className="mt-1 line-clamp-2 text-[0.68rem] leading-relaxed text-ink-mute">
                      {campaign.script}
                    </p>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
