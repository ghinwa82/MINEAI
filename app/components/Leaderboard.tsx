'use client';

import React from 'react';
import { SupportedLanguage } from '@/types';
import { translations } from '@/lib/i18n';

interface LeaderboardProps {
  currentLang: SupportedLanguage;
}

export default function Leaderboard({ currentLang }: LeaderboardProps) {
  const t = translations[currentLang];

  const topMiners = [
    { rank: 1, name: 'Satoshi_Node_X', hash: '420.8 MH/s', streak: '18 Days', tier: 'Diamond', payout: '$2,840.10' },
    { rank: 2, name: 'Dubai_Edge_01', hash: '380.2 MH/s', streak: '14 Days', tier: 'Diamond', payout: '$2,190.50' },
    { rank: 3, name: 'QuantumWorker_FR', hash: '290.4 MH/s', streak: '9 Days', tier: 'Gold', payout: '$1,840.00' },
    { rank: 4, name: 'Shenzhen_AI_Core', hash: '240.1 MH/s', streak: '7 Days', tier: 'Gold', payout: '$1,320.40' },
    { rank: 5, name: 'Mumbai_Hash_Depin', hash: '184.6 MH/s', streak: '5 Days', tier: 'Silver', payout: '$890.20' }
  ];

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-white">{t.leaderboardTitle}</h2>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Top global decentralized nodes ranked by compute output & consecutive uptime streaks.
          </p>
        </div>

        {/* 7-Day Streak Badge */}
        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
          <span className="text-xl">🔥</span>
          <div>
            <div className="text-xs font-bold font-mono">{t.streakTitle}</div>
            <div className="text-sm font-black font-mono">7 / 7 {t.daysStreak} (2.0x Boost)</div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left font-mono text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400">
              <th className="pb-3 px-3">#</th>
              <th className="pb-3 px-3">Node Worker</th>
              <th className="pb-3 px-3">{t.hashrate}</th>
              <th className="pb-3 px-3">Streak</th>
              <th className="pb-3 px-3">{t.rankTier}</th>
              <th className="pb-3 px-3 text-right">Settled Payout</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {topMiners.map((m) => (
              <tr key={m.rank} className="hover:bg-slate-800/30 transition-colors">
                <td className="py-3.5 px-3 font-bold text-cyan-400">#{m.rank}</td>
                <td className="py-3.5 px-3 font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  {m.name}
                </td>
                <td className="py-3.5 px-3 text-slate-300">{m.hash}</td>
                <td className="py-3.5 px-3 text-amber-300">{m.streak}</td>
                <td className="py-3.5 px-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    m.tier === 'Diamond'
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                      : m.tier === 'Gold'
                      ? 'bg-amber-950 text-amber-300 border border-amber-500/50'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {m.tier}
                  </span>
                </td>
                <td className="py-3.5 px-3 text-right font-bold text-emerald-400">{m.payout}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}