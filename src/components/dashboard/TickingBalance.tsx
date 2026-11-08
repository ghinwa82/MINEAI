'use client';

import React, { useEffect } from 'react';
import { useMineStore } from '@/lib/store/use-mine-store';
import { translations } from '@/lib/i18n/translations';
import { motion } from 'framer-motion';
import { Zap, ArrowUpRight, ShieldCheck } from 'lucide-react';
import { FinancialPayoutAgent } from '@/lib/agents/payout-agent';

export const TickingBalance: React.FC = () => {
  const { tickingBalance, incrementBalanceTick, locale, currency, setPayoutModalOpen } = useMineStore();
  const t = translations[locale];

  useEffect(() => {
    const interval = setInterval(() => {
      incrementBalanceTick();
    }, 75);
    return () => clearInterval(interval);
  }, [incrementBalanceTick]);

  const fiatValue = FinancialPayoutAgent.convertMinedTokensToFiat(tickingBalance, currency);

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-surfaceCard to-[#0c1427] border border-borderDark p-6 shadow-2xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-neonGreen/5 rounded-full blur-3xl pointer-events-none" />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-neonGreen animate-ping" />
            <h2 className="text-xs uppercase font-mono tracking-wider text-neonGreen font-semibold">
              {t.liveLedger}
            </h2>
          </div>
          <div className="flex items-baseline gap-1 font-mono">
            <motion.span
              key={Math.floor(tickingBalance)}
              initial={{ opacity: 0.8 }}
              animate={{ opacity: 1 }}
              className="text-4xl md:text-5xl font-black text-white tracking-tight"
            >
              {tickingBalance.toFixed(6)}
            </motion.span>
            <span className="text-sm font-semibold text-neonCyan ml-1">MINE</span>
          </div>

          <div className="mt-2 flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1 text-gray-300 font-medium">
              <Zap className="w-3.5 h-3.5 text-neonAmber" />
              {t.fiatConversion}: <strong className="text-white font-mono">{fiatValue.toLocaleString()} {currency}</strong>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              Strix Secured
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setPayoutModalOpen(true)}
            className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-neonGreen hover:bg-emerald-600 text-gray-950 font-bold text-xs shadow-[0_0_20px_rgba(16,185,129,0.3)] transition-all hover:scale-105 active:scale-95"
          >
            <span>{t.payoutAction}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};