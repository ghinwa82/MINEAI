'use client';

import React, { useState, useEffect } from 'react';
import { AgentLogEntry, SupportedLanguage } from '@/types';
import { translations } from '@/lib/i18n';
import { getAgentLogs } from '@/lib/agents';

interface AgentSwarmVisualizerProps {
  currentLang: SupportedLanguage;
}

export default function AgentSwarmVisualizer({ currentLang }: AgentSwarmVisualizerProps) {
  const t = translations[currentLang];
  const [logs, setLogs] = useState<AgentLogEntry[]>([]);

  useEffect(() => {
    setLogs(getAgentLogs());
    const interval = setInterval(() => {
      setLogs(getAgentLogs());
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const agents = [
    { name: 'Telemetry Auditor', desc: t.agentTelemetryDesc, icon: '⚡', color: 'from-cyan-500 to-blue-600' },
    { name: 'Sentiment & Support', desc: t.agentSupportDesc, icon: '🧠', color: 'from-purple-500 to-indigo-600' },
    { name: 'Financial & Fiat', desc: t.agentFinanceDesc, icon: '💳', color: 'from-emerald-500 to-teal-600' },
    { name: 'Growth & Retention', desc: t.agentGrowthDesc, icon: '🚀', color: 'from-amber-500 to-orange-600' }
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-6 md:p-8 backdrop-blur-xl">
      <div className="mb-6">
        <h2 className="text-2xl font-black text-white">{t.agentSwarmTitle}</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Autonomous Multi-Agent AI Swarm executing continuous decentralized tasks.
        </p>
      </div>

      {/* 4 Agent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {agents.map((ag) => (
          <div
            key={ag.name}
            className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-cyan-500/40 transition-all duration-300 group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${ag.color} flex items-center justify-center text-lg mb-3 shadow-md`}>
              {ag.icon}
            </div>
            <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
              {ag.name}
            </h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              {ag.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Live Agent Terminal Audit Stream */}
      <div className="rounded-2xl bg-black/80 border border-slate-800 p-4 font-mono text-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-slate-400">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Autonomous Audit Stream (Supabase Edge Synced)
          </span>
          <span>Buffer: {logs.length} Operations</span>
        </div>

        <div className="space-y-2 max-h-56 overflow-y-auto pr-2">
          {logs.map((log) => (
            <div key={log.id} className="flex flex-wrap items-start gap-2 text-slate-300">
              <span className="text-slate-500">[{log.timestamp.substring(11, 19)}]</span>
              <span className="text-cyan-400 font-bold">@{log.agentName}:</span>
              <span className="flex-1">{log.action}</span>
              <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                log.status === 'success' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400'
              }`}>
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}