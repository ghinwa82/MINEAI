'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import MiningConsole from '@/components/MiningConsole';
import AgentSwarmVisualizer from '@/components/AgentSwarmVisualizer';
import ProfitVault from '@/components/ProfitVault';
import Leaderboard from '@/components/Leaderboard';
import AIChatSupport from '@/components/AIChatSupport';
import { SupportedLanguage } from '@/types';
import { translations, isRTL } from '@/lib/i18n';

export default function Home() {
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [activeTab, setActiveTab] = useState('dashboard');
  const t = translations[currentLang];
  const rtl = isRTL(currentLang);

  return (
    <div
      dir={rtl ? 'rtl' : 'ltr'}
      className="min-h-screen text-slate-100 flex flex-col font-sans transition-all duration-300"
    >
      {/* Dynamic Navigation */}
      <Navbar
        currentLang={currentLang}
        onLanguageChange={setCurrentLang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            MineAI Node v2.5 Enterprise Auto-Pilot
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            {t.brandTagline}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Harness decentralized edge computing power. Real-time telemetry, autonomous AI agents,
            gamified retention tiers, and direct international bank payout routes.
          </p>
        </div>

        {/* View Switcher Matrix */}
        {activeTab === 'dashboard' && (
          <div className="space-y-10">
            <MiningConsole currentLang={currentLang} />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AgentSwarmVisualizer currentLang={currentLang} />
              </div>
              <div>
                <AIChatSupport currentLang={currentLang} />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'swarm' && (
          <div className="space-y-8">
            <AgentSwarmVisualizer currentLang={currentLang} />
            <AIChatSupport currentLang={currentLang} />
          </div>
        )}

        {activeTab === 'leaderboard' && (
          <div className="space-y-8">
            <Leaderboard currentLang={currentLang} />
          </div>
        )}

        {activeTab === 'vault' && (
          <div className="space-y-8">
            <ProfitVault currentLang={currentLang} />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-8 text-center text-xs font-mono text-slate-500">
        <p>© 2025 MineAI Node Network. DePIN Core & Multi-Agent Autonomous Swarm Architecture.</p>
      </footer>
    </div>
  );
}