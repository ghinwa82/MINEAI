'use client';

import React from 'react';
import Logo from './Logo';
import { SupportedLanguage } from '@/types';
import { translations } from '@/lib/i18n';

interface NavbarProps {
  currentLang: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({
  currentLang,
  onLanguageChange,
  activeTab,
  setActiveTab
}: NavbarProps) {
  const t = translations[currentLang];

  const languages: { code: SupportedLanguage; label: string; flag: string }[] = [
    { code: 'en', label: 'English', flag: '🇺🇸' },
    { code: 'ar', label: 'العربية', flag: '🇸🇦' },
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'es', label: 'Español', flag: '🇪🇸' },
    { code: 'zh', label: '中文', flag: '🇨🇳' },
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' }
  ];

  const navItems = [
    { id: 'dashboard', label: t.navDashboard },
    { id: 'swarm', label: t.navSwarm },
    { id: 'leaderboard', label: t.navLeaderboard },
    { id: 'vault', label: t.navVault }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-900/30 bg-slate-950/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Bespoke Logo */}
        <Logo />

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-1.5 p-1 rounded-xl bg-slate-900/60 border border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                activeTab === item.id
                  ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Right Action Matrix: Language Switcher & Network Badge */}
        <div className="flex items-center gap-3">
          {/* 6-Core Language Switcher Dropdown */}
          <div className="relative group">
            <select
              value={currentLang}
              onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
              aria-label="Select platform language"
              className="appearance-none bg-slate-900/90 text-xs font-mono text-cyan-300 border border-cyan-800/50 rounded-xl px-3 py-2 pr-7 cursor-pointer hover:border-cyan-400 transition-colors focus:outline-none focus:ring-1 focus:ring-cyan-400"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code} className="bg-slate-950 text-white">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-cyan-400">
              ▼
            </div>
          </div>

          {/* Operational Pulse Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t.statusOnline}</span>
          </div>
        </div>
      </div>
    </header>
  );
}