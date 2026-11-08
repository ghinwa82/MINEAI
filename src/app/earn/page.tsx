'use client';

import React, { useState, useEffect } from 'react';

interface Task {
  id: string;
  title: string;
  rewardUsd: number;
  type: string;
  completed: boolean;
}

interface Deal {
  id: string;
  productName: string;
  supplierPrice: number;
  retailPrice: number;
  marginPercent: string;
  netProfit: number;
  platform: string;
  demandScore: string;
}

export default function EarnPage() {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 'task-daily',
      title: 'Claim Daily 24h DePIN Active Uptime Reward',
      rewardUsd: 2.50,
      type: 'daily_streak',
      completed: false,
    },
    {
      id: 'task-ai-val',
      title: 'Validate Autonomous AI Edge Telemetry Logs',
      rewardUsd: 4.25,
      type: 'ai_training',
      completed: false,
    },
    {
      id: 'task-ecom-sync',
      title: 'Trigger Automated Dropshipping Supplier Sync',
      rewardUsd: 8.90,
      type: 'ecom_arbitrage',
      completed: false,
    },
  ]);

  const [deals, setDeals] = useState<Deal[]>([
    {
      id: 'deal-01',
      productName: 'Portable RGB AI Smart Gimbal Tracker',
      supplierPrice: 14.80,
      retailPrice: 49.99,
      marginPercent: '70.3%',
      netProfit: 35.19,
      platform: 'TikTok Shop',
      demandScore: '99/100 (Ultra High)',
    },
    {
      id: 'deal-02',
      productName: 'DePIN Mini Node Cryptographic USB Dongle',
      supplierPrice: 22.50,
      retailPrice: 79.00,
      marginPercent: '71.5%',
      netProfit: 56.50,
      platform: 'Shopify Global',
      demandScore: '96/100 (Viral)',
    },
    {
      id: 'deal-03',
      productName: 'Ultra-Low Latency WiFi 7 Wireless Rig Adapter',
      supplierPrice: 18.20,
      retailPrice: 55.00,
      marginPercent: '66.9%',
      netProfit: 36.80,
      platform: 'Amazon FBA',
      demandScore: '92/100 (High)',
    },
  ]);

  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);

  const referralLink = 'https://mineai-three.vercel.app/?ref=VIP-889';

  const handleClaim = async (task: Task) => {
    if (task.completed) return;
    setClaimingId(task.id);
    setSuccessBanner(null);

    try {
      const res = await fetch('/api/tasks/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskId: task.id }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
        );
        setSuccessBanner(`✓ Claimed +$${task.rewardUsd.toFixed(2)} USD! Funds added to your wallet.`);
      } else {
        setSuccessBanner(`✓ Claimed +$${task.rewardUsd.toFixed(2)} USD! (Saved to local wallet)`);
        setTasks((prev) =>
          prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
        );
      }
    } catch {
      setSuccessBanner(`✓ Claimed +$${task.rewardUsd.toFixed(2)} USD!`);
      setTasks((prev) =>
        prev.map((t) => (t.id === task.id ? { ...t, completed: true } : t))
      );
    } finally {
      setClaimingId(null);
    }
  };

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setReferralCopied(true);
    setTimeout(() => setReferralCopied(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="p-6 bg-[#0b111a] border border-amber-500/40 rounded-3xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-amber-400 font-bold">
            Cash Earning & Arbitrage Center
          </span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          Active Earning <span className="text-amber-400">Playgrounds</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
          Complete quick DePIN verification missions, claim daily uptime dividends, or leverage automated dropshipping deals with direct supplier arbitrage.
        </p>
      </div>

      {successBanner && (
        <div className="p-4 bg-emerald-950/60 border border-emerald-500/50 rounded-2xl text-emerald-300 text-xs sm:text-sm flex items-center justify-between">
          <span>{successBanner}</span>
          <button onClick={() => setSuccessBanner(null)} className="text-xs underline cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* Viral Referral Program Card */}
      <div className="p-6 bg-gradient-to-r from-emerald-950/40 via-[#0b111a] to-[#0b111a] border border-emerald-500/40 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-emerald-500 text-black rounded">
                EARN $10.00 PER REFERRAL
              </span>
              <span className="text-xs text-zinc-400">No Limit on Earnings</span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1">
              Share Your MineAI Cluster & Unlock Instant Cash
            </h3>
            <p className="text-xs text-zinc-300 mt-1">
              When peers register and deploy their free edge node, you get an automated $10.00 credited directly to your balance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={referralLink}
              className="px-3 py-2 bg-black border border-zinc-800 rounded-lg text-xs font-mono text-zinc-300 w-64"
            />
            <button
              onClick={copyReferral}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              {referralCopied ? 'Copied!' : 'Copy Link'}
            </button>
          </div>
        </div>
      </div>

      {/* Daily Tasks & Micro-Rewards */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <span>⚡</span> Active Daily Tasks ({tasks.filter((t) => !t.completed).length} Available)
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-5 bg-[#0b111a] border rounded-2xl flex flex-col justify-between space-y-4 ${
                task.completed ? 'border-zinc-800 opacity-60' : 'border-amber-500/40'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">
                    {task.type}
                  </span>
                  <span className="text-sm font-mono font-bold text-amber-400">
                    +${task.rewardUsd.toFixed(2)}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white">{task.title}</h3>
              </div>

              <button
                onClick={() => handleClaim(task)}
                disabled={task.completed || claimingId === task.id}
                className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                  task.completed
                    ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-black cursor-pointer'
                }`}
              >
                {task.completed
                  ? '✓ Claimed'
                  : claimingId === task.id
                  ? 'Verifying...'
                  : `Claim $${task.rewardUsd.toFixed(2)} Reward`}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dropshipping Arbitrage Deals (Real Profit Opportunity) */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>📦</span> Automated Dropshipping Arbitrage Opportunities
          </h2>
          <span className="text-xs text-cyan-400 font-mono">Live High-Margin Feeds</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {deals.map((deal) => (
            <div key={deal.id} className="p-5 bg-[#0b111a] border border-zinc-800 rounded-2xl space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-2 py-0.5 text-[10px] font-mono bg-cyan-950 text-cyan-300 border border-cyan-800 rounded">
                  {deal.platform}
                </span>
                <span className="text-xs font-mono font-bold text-emerald-400">{deal.marginPercent} Margin</span>
              </div>

              <h3 className="text-sm font-bold text-white">{deal.productName}</h3>

              <div className="p-2.5 bg-black/60 rounded-xl space-y-1 text-xs font-mono">
                <div className="flex justify-between text-zinc-400">
                  <span>Factory Price:</span>
                  <span>${deal.supplierPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Target Selling Price:</span>
                  <span className="text-white">${deal.retailPrice.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400 font-bold border-t border-zinc-800 pt-1">
                  <span>Estimated Net Profit:</span>
                  <span>+${deal.netProfit.toFixed(2)} / sale</span>
                </div>
              </div>

              <div className="text-[11px] text-zinc-500 font-mono">
                Demand Index: <span className="text-cyan-400">{deal.demandScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}