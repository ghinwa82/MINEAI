'use client';

import React, { useState, useEffect } from 'react';
import { MiningTelemetry, SupportedLanguage } from '@/types';
import { translations } from '@/lib/i18n';
import { calculateEarningsPerSecond } from '@/lib/crypto';
import { auditAndHealNode } from '@/lib/agents';

interface MiningConsoleProps {
  currentLang: SupportedLanguage;
}

export default function MiningConsole({ currentLang }: MiningConsoleProps) {
  const t = translations[currentLang];
  const [isMining, setIsMining] = useState(true);
  const [accumulatedTokens, setAccumulatedTokens] = useState(48.2418);
  const [telemetry, setTelemetry] = useState<MiningTelemetry>({
    nodeId: 'NODE-EGY-0941',
    uptimeSeconds: 84920,
    cpuUsagePercent: 38,
    gpuUsagePercent: 88,
    hashrateMhs: 92.4,
    powerConsumptionWatts: 240,
    totalMinedTokens: 48.2418,
    status: 'active',
    temperatureCelsius: 67,
    lastPing: new Date().toISOString()
  });

  // Dopaminergic Millisecond Accumulator Tick
  useEffect(() => {
    if (!isMining) return;
    const interval = setInterval(() => {
      const increment = calculateEarningsPerSecond(telemetry.hashrateMhs, 4.85) * 0.1;
      setAccumulatedTokens((prev) => prev + increment);
    }, 100);
    return () => clearInterval(interval);
  }, [isMining, telemetry.hashrateMhs]);

  // Periodic Telemetry Fluctuation & Autonomous Healing Loop
  useEffect(() => {
    const cycle = setInterval(() => {
      if (!isMining) return;
      setTelemetry((prev) => {
        const jitter = (Math.random() - 0.48) * 3;
        const newTemp = Math.round(prev.temperatureCelsius + (Math.random() - 0.5) * 2);
        const updated: MiningTelemetry = {
          ...prev,
          hashrateMhs: Math.max(45, +(prev.hashrateMhs + jitter).toFixed(2)),
          temperatureCelsius: newTemp,
          uptimeSeconds: prev.uptimeSeconds + 3
        };
        return auditAndHealNode(updated);
      });
    }, 3000);
    return () => clearInterval(cycle);
  }, [isMining]);

  return (
    <div className="relative overflow-hidden rounded-3xl border border-cyan-500/30 bg-slate-900/60 p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)]">
      {/* Top Console Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h2 className="text-xl md:text-2xl font-black tracking-wide text-white flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
            {t.nodeMiningControls}
          </h2>
          <p className="text-xs font-mono text-slate-400 mt-1">
            Identity: {telemetry.nodeId} • Region: Global DePIN Shard #1
          </p>
        </div>

        <button
          onClick={() => setIsMining(!isMining)}
          className={`px-6 py-2.5 rounded-xl font-bold text-sm tracking-wider uppercase transition-all duration-300 shadow-lg ${
            isMining
              ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white hover:opacity-90 shadow-red-900/30'
              : 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:opacity-90 shadow-cyan-900/30'
          }`}
        >
          {isMining ? t.stopMining : t.startMining}
        </button>
      </div>

      {/* Main Dopaminergic Live Balance Counter */}
      <div className="my-8 text-center p-6 rounded-2xl bg-slate-950/70 border border-cyan-900/40 relative overflow-hidden">
        <div className="text-xs font-mono uppercase tracking-widest text-cyan-400 mb-2">
          {t.balanceLive} (MINE / USD)
        </div>
        <div className="text-4xl md:text-6xl font-black font-mono tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-emerald-400">
          ${(accumulatedTokens * 4.85).toFixed(4)}
        </div>
        <div className="text-sm font-mono text-slate-400 mt-2">
          ≈ {accumulatedTokens.toFixed(6)} MINE Tokens
        </div>
      </div>

      {/* Dynamic Telemetry Matrix */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">{t.hashrate}</div>
          <div className="text-xl font-black font-mono text-cyan-400 mt-1">
            {isMining ? telemetry.hashrateMhs : 0} MH/s
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Optimal DePIN Bandwidth</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">{t.uptime}</div>
          <div className="text-xl font-black font-mono text-white mt-1">
            {Math.floor(telemetry.uptimeSeconds / 3600)}h {Math.floor((telemetry.uptimeSeconds % 3600) / 60)}m
          </div>
          <div className="text-[10px] text-cyan-400 mt-1">99.98% Network Stability</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">{t.temp}</div>
          <div className="text-xl font-black font-mono text-amber-400 mt-1">
            {telemetry.temperatureCelsius}°C
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Fan Speed: 62% Dynamic</div>
        </div>

        <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800">
          <div className="text-xs text-slate-400 font-mono">GPU / Core Load</div>
          <div className="text-xl font-black font-mono text-emerald-400 mt-1">
            {isMining ? telemetry.gpuUsagePercent : 2}%
          </div>
          <div className="text-[10px] text-emerald-400 mt-1">Edge Compute Active</div>
        </div>
      </div>
    </div>
  );
}