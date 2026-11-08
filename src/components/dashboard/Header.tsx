'use client';

import React from 'react';
import { useMineStore } from '@/lib/store/use-mine-store';
import { translations } from '@/lib/i18n/translations';
import { Globe, DollarSign, ShoppingCart } from 'lucide-react';
import { Currency } from '@/lib/types';

export const Header: React.FC = () => {
  const { locale, setLocale, currency, setCurrency, setDropshipModalOpen } = useMineStore();
  const t = translations[locale];

  return (
    <header className="w-full bg-surface/90 border-b border-borderDark backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3 flex items-center justify-between">
      <div className="flex items-center space-x-3 rtl:space-x-reverse">
        <div className="w-10 h-10 rounded-xl bg-neonGreen/10 border border-neonGreen/30 flex items-center justify-center text-neonGreen font-mono font-bold text-xl shadow-[0_0_15px_rgba(16,185,129,0.25)]">
          M
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            {t.title}
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-neonCyan/10 text-neonCyan border border-neonCyan/30">
              v1.0 DePIN
            </span>
          </h1>
          <p className="text-xs text-gray-400 hidden sm:block">{t.subTitle}</p>
        </div>
      </div>

      <div className="flex items-center space-x-2 rtl:space-x-reverse">
        <button
          onClick={() => setDropshipModalOpen(true)}
          className="flex items-center space-x-1.5 rtl:space-x-reverse px-3 py-1.5 rounded-lg bg-surfaceCard border border-neonPurple/40 text-neonPurple hover:bg-neonPurple/10 text-xs font-medium transition-all"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>{t.dropshipTitle}</span>
        </button>

        <div className="flex items-center bg-surfaceCard border border-borderDark rounded-lg px-2 py-1">
          <DollarSign className="w-3.5 h-3.5 text-gray-400 mr-1 rtl:ml-1 rtl:mr-0" />
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="bg-transparent text-xs text-gray-200 outline-none cursor-pointer"
          >
            <option value="SAR" className="bg-surfaceCard">SAR (ر.س)</option>
            <option value="AED" className="bg-surfaceCard">AED (د.إ)</option>
            <option value="USD" className="bg-surfaceCard">USD ($)</option>
            <option value="EUR" className="bg-surfaceCard">EUR (€)</option>
          </select>
        </div>

        <button
          onClick={() => setLocale(locale === 'ar' ? 'en' : 'ar')}
          className="flex items-center space-x-1 rtl:space-x-reverse px-2.5 py-1.5 rounded-lg bg-surfaceCard border border-borderDark text-gray-300 hover:text-neonGreen text-xs font-mono transition-colors"
        >
          <Globe className="w-3.5 h-3.5" />
          <span>{t.languageToggle}</span>
        </button>
      </div>
    </header>
  );
};