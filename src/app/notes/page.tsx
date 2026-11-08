'use client';

import React, { useState, useEffect } from 'react';
import { StrategyEntry } from '@/lib/types';

export default function StrategyHubPage() {
  const [strategies, setStrategies] = useState<StrategyEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Form input state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<StrategyEntry['category']>('Dropshipping Funnel');
  const [targetMargin, setTargetMargin] = useState('38.5%');
  const [estimatedRoi, setEstimatedRoi] = useState('220');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('TikTok Ads, Fast-Fulfillment, Stripe');
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const fetchStrategies = async () => {
    try {
      const res = await fetch('/api/strategies');
      if (res.ok) {
        const data = await res.json();
        setStrategies(data.strategies || []);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStrategies();
  }, []);

  const handleSaveStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSaving(true);
    setStatusMessage(null);

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      const res = await fetch('/api/strategies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          targetMargin,
          estimatedRoi: Number(estimatedRoi),
          description,
          tags,
          author: 'Command Architect',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        // Real-time append to layout list immediately
        setStrategies((prev) => [data.strategy, ...prev]);
        setStatusMessage('✓ Strategy Entry successfully compiled & committed to live hub.');
        // Reset form
        setTitle('');
        setDescription('');
      } else {
        setStatusMessage(`Error: ${data.error || 'Failed to save strategy'}`);
      }
    } catch (err) {
      setStatusMessage('Network communication failure with strategy backend.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Hero */}
      <div className="border border-cyan-900/50 bg-[#0b111a] p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono uppercase tracking-widest text-cyan-400">
            Real-Time Strategy Hub & E-Com Intelligence
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Autonomous Playbooks & <span className="text-cyan-400">Fulfillment Frameworks</span>
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-3xl">
          Craft, document, and deploy high-margin dropshipping matrices and DePIN token liquid routing setups. Entries appended below are automatically synchronized across the agent execution network.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Creation Form */}
        <div className="lg:col-span-1 bg-[#0b111a] border border-zinc-800 rounded-2xl p-6 h-fit sticky top-24">
          <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
            <span>➕</span> Save Strategy Entry
          </h2>
          <p className="text-xs text-zinc-400 mb-4">
            Directly append dropshipping or mining arbitrage playbooks live.
          </p>

          {statusMessage && (
            <div className="mb-4 p-3 bg-cyan-950/50 border border-cyan-500/40 rounded-lg text-xs text-cyan-300">
              {statusMessage}
            </div>
          )}

          <form onSubmit={handleSaveStrategy} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Strategy Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Micro-Warehouse AI Fulfillment"
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-2.5 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400"
                >
                  <option value="Dropshipping Funnel">Dropshipping Funnel</option>
                  <option value="DePIN Liquidity">DePIN Liquidity</option>
                  <option value="Arbitrage">Arbitrage</option>
                  <option value="AI Automation">AI Automation</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">Target Margin</label>
                <input
                  type="text"
                  value={targetMargin}
                  onChange={(e) => setTargetMargin(e.target.value)}
                  placeholder="e.g. 45.0%"
                  className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Estimated ROI (%)</label>
              <input
                type="number"
                value={estimatedRoi}
                onChange={(e) => setEstimatedRoi(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs font-mono focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">Playbook Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Detail the supplier routing mechanics, customer response automations, and ad spend thresholds..."
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white text-xs focus:outline-none focus:border-cyan-400 resize-none"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-md shadow-cyan-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSaving ? (
                <>
                  <span className="w-3 h-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Committing Entry...</span>
                </>
              ) : (
                <span>Save Strategy Entry</span>
              )}
            </button>
          </form>
        </div>

        {/* Live Strategies List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white tracking-wide">
              Active Strategy Ledger ({strategies.length})
            </h2>
            <span className="text-xs text-cyan-400 font-mono">Real-Time Sync Active</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-zinc-500 text-xs font-mono">
              Fetching distributed strategies from nodes...
            </div>
          ) : strategies.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-xs font-mono border border-dashed border-zinc-800 rounded-xl">
              No strategy entries currently found. Use the left form to deploy one live.
            </div>
          ) : (
            strategies.map((strat) => (
              <div
                key={strat.id}
                className="p-5 bg-[#0b111a] border border-zinc-800 hover:border-cyan-800/80 rounded-2xl transition-all space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase rounded bg-cyan-950 border border-cyan-800/60 text-cyan-300">
                      {strat.category}
                    </span>
                    <h3 className="text-sm font-bold text-white">{strat.title}</h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-zinc-400">Margin: <strong className="text-emerald-400">{strat.targetMargin}</strong></span>
                    <span className="text-zinc-400">Est. ROI: <strong className="text-cyan-300">+{strat.estimatedRoi}%</strong></span>
                  </div>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {strat.description}
                </p>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-zinc-900 text-[11px] text-zinc-500">
                  <div className="flex flex-wrap gap-1.5">
                    {strat.tags.map((tag, idx) => (
                      <span key={idx} className="px-2 py-0.5 rounded bg-zinc-950 text-zinc-400 font-mono text-[10px]">
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <span className="font-mono text-[10px]">
                    Added by {strat.author} • {new Date(strat.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}