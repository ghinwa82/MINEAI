'use client';

import React, { useState, useEffect } from 'react';

interface CatalogNode {
  tier: string;
  name: string;
  price: number;
  hashrate: string;
  dailyYield: string;
  roiDays: number;
  features: string[];
  specs: { cpu: string; ram: string; bandwidth: string };
  isPopular?: boolean;
}

const CATALOG_NODES: CatalogNode[] = [
  {
    tier: 'Edge Starter',
    name: 'CyberCore Alpha-1 Node',
    price: 49.00,
    hashrate: '65.0 MH/s',
    dailyYield: '$2.45 / day',
    roiDays: 20,
    features: ['Instant Auto-Handshake', 'Shared DePIN Pool Access', 'Real-Time Edge Ping'],
    specs: { cpu: '4 vCPU Edge', ram: '8 GB DDR5', bandwidth: '1 Gbps Unmetered' },
  },
  {
    tier: 'Quantum Pro',
    name: 'TensorMatrix Q-9 Node',
    price: 129.00,
    hashrate: '160.0 MH/s',
    dailyYield: '$6.80 / day',
    roiDays: 19,
    features: ['Dedicated L3 Tunnel', 'Zero Packet Drop Guarantee', 'Priority AI Sentiment Pipeline'],
    specs: { cpu: '8 vCPU AI Core', ram: '16 GB ECC', bandwidth: '2.5 Gbps Low Latency' },
    isPopular: true,
  },
  {
    tier: 'Nebula Enterprise',
    name: 'Nebula Ultra DePIN Grid',
    price: 249.00,
    hashrate: '420.0 MH/s',
    dailyYield: '$18.50 / day',
    roiDays: 14,
    features: ['Direct CoinGecko Arbitrage Bot', 'Hardware Auto-Healing Agent', 'Dedicated IP Whitelist'],
    specs: { cpu: '16 vCPU Baremetal', ram: '32 GB ECC', bandwidth: '10 Gbps Redundant' },
  },
  {
    tier: 'Titan DePIN Rack',
    name: 'Titan Megacluster Supernode',
    price: 450.00,
    hashrate: '1,150.0 MH/s',
    dailyYield: '$48.00 / day',
    roiDays: 10,
    features: ['Full Tier-4 Datacenter SLA', 'High-Yield Dropshipping Auto-Sync', 'VIP Multi-Agent Orchestrator'],
    specs: { cpu: '32 Core Tensor Mesh', ram: '64 GB High Bandwidth', bandwidth: '40 Gbps Fiber' },
  },
];

export default function StorePage() {
  const [treasury, setTreasury] = useState<number>(482.65);
  const [activeDeploying, setActiveDeploying] = useState<string | null>(null);
  const [alertNotice, setAlertNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchBalance = async () => {
    try {
      const res = await fetch('/api/wallet/withdraw');
      if (res.ok) {
        const d = await res.json();
        setTreasury(d.treasuryBalance);
      }
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const handleActivateNode = async (node: CatalogNode) => {
    setAlertNotice(null);

    if (treasury < node.price) {
      setAlertNotice({
        type: 'error',
        text: `Insufficient Treasury Balance ($${treasury.toFixed(2)}). You need $${node.price.toFixed(2)} to activate this node tier.`,
      });
      return;
    }

    setActiveDeploying(node.name);

    try {
      const res = await fetch('/api/nodes/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tier: node.tier,
          name: node.name,
          price: node.price,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setAlertNotice({ type: 'error', text: data.error || 'Activation protocol rejected.' });
      } else {
        setTreasury(data.updatedTreasuryBalance);
        window.dispatchEvent(new CustomEvent('treasury-updated', { detail: { balance: data.updatedTreasuryBalance } }));
        setAlertNotice({
          type: 'success',
          text: `Success! ${node.name} provisioned! Deducted $${node.price.toFixed(2)} from treasury. New balance: $${data.updatedTreasuryBalance.toFixed(2)}.`,
        });
      }
    } catch (err) {
      setAlertNotice({ type: 'error', text: err instanceof Error ? err.message : 'Telemetry sync failed' });
    } finally {
      setActiveDeploying(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-gradient-to-r from-[#0b111a] via-[#0d1624] to-[#0b111a] border border-cyan-500/30 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">MineAI Autonomous Provisioning</span>
            <span className="px-2 py-0.5 text-[10px] bg-emerald-500/20 text-emerald-400 rounded-full font-mono">Self-Deploy Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            DePIN Hardware <span className="text-cyan-400">Node Store</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
            Acquire computing compute slots directly from your available treasury balance. Deployments are provisioned instantly into the multi-agent mesh without manual configuration.
          </p>
        </div>

        <div className="flex flex-col items-end px-5 py-3 bg-black/60 border border-cyan-800/60 rounded-xl">
          <span className="text-[11px] font-mono text-cyan-400">Available Treasury Balance</span>
          <span className="text-2xl font-black font-mono text-cyan-300 neon-text-glow">
            ${treasury.toFixed(2)}
          </span>
        </div>
      </div>

      {alertNotice && (
        <div
          className={`p-4 rounded-xl border text-xs sm:text-sm flex items-center justify-between ${
            alertNotice.type === 'success'
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
              : 'bg-rose-950/40 border-rose-500 text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2">
            <span>{alertNotice.type === 'success' ? '✓' : '⚠'}</span>
            <span>{alertNotice.text}</span>
          </div>
          <button onClick={() => setAlertNotice(null)} className="text-xs hover:underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Grid of Nodes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {CATALOG_NODES.map((node) => {
          const isDeploying = activeDeploying === node.name;
          const canAfford = treasury >= node.price;

          return (
            <div
              key={node.name}
              className={`relative flex flex-col justify-between p-5 bg-[#0b111a] border rounded-2xl transition-all ${
                node.isPopular
                  ? 'border-cyan-400/80 shadow-lg shadow-cyan-500/10'
                  : 'border-zinc-800 hover:border-cyan-800'
              }`}
            >
              {node.isPopular && (
                <span className="absolute -top-3 right-4 px-2.5 py-0.5 text-[10px] font-bold uppercase font-mono tracking-wider bg-cyan-400 text-black rounded-full shadow-md">
                  Most Optimized
                </span>
              )}

              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">{node.tier}</span>
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">{node.dailyYield}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2">{node.name}</h3>

                <div className="my-3 pb-3 border-b border-zinc-800">
                  <span className="text-3xl font-black font-mono text-cyan-300">${node.price.toFixed(2)}</span>
                  <span className="text-xs text-zinc-500 font-mono"> / one-time cost</span>
                  <p className="text-[11px] text-zinc-400 mt-1">Est. full break-even in ~{node.roiDays} days</p>
                </div>

                {/* Specs Box */}
                <div className="space-y-1.5 p-2.5 bg-zinc-950/70 rounded-lg border border-zinc-900 text-[11px] font-mono text-zinc-300 mb-4">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Hashrate:</span>
                    <span className="text-cyan-400 font-bold">{node.hashrate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Compute:</span>
                    <span>{node.specs.cpu}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Memory:</span>
                    <span>{node.specs.ram}</span>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5 text-xs text-zinc-400 mb-6">
                  {node.features.map((feat, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <span className="text-cyan-400">▹</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <button
                onClick={() => handleActivateNode(node)}
                disabled={isDeploying || !canAfford}
                className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  canAfford
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black shadow-md shadow-cyan-500/20 active:scale-98'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
                }`}
              >
                {isDeploying ? (
                  <>
                    <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Allocating DePIN Cluster...</span>
                  </>
                ) : canAfford ? (
                  <span>Activate Node Now</span>
                ) : (
                  <span>Needs ${(node.price - treasury).toFixed(2)} More</span>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}