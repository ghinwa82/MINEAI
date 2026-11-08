'use client';

import React, { useState } from 'react';
import { useMineStore } from '@/lib/store/use-mine-store';
import { translations } from '@/lib/i18n/translations';
import { Award, Flame, Copy, Check } from 'lucide-react';

export const GamificationHub: React.FC = () => {
  const { gamification, locale, claimDailyCheckIn } = useMineStore();
  const t = translations[locale];
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://mineai.network/join?ref=${gamification.referralCode}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl bg-surfaceCard border border-borderDark p-5 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-neonPurple/10 text-neonPurple">
            <Award className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t.growthHub}</h3>
            <p className="text-xs text-gray-400">Level {gamification.level} Node Master</p>
          </div>
        </div>

        <button
          onClick={claimDailyCheckIn}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-neonAmber/20 to-orange-500/20 border border-neonAmber/40 text-neonAmber hover:scale-105 text-xs font-bold transition-all"
        >
          <Flame className="w-3.5 h-3.5" />
          <span>{gamification.streakDays} {t.daysCount}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="p-3 rounded-xl bg-surface/50 border border-borderDark flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">{t.xpLevel}</span>
            <span className="text-base font-bold font-mono text-neonCyan">{gamification.xp.toLocaleString()} XP</span>
          </div>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-surfaceCard text-gray-300 border border-borderDark">
            Rank #{gamification.rank}
          </span>
        </div>

        <div className="p-3 rounded-xl bg-surface/50 border border-borderDark flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-400 block">{t.referralTitle}</span>
            <span className="text-base font-bold font-mono text-neonGreen">{gamification.referralCount} Verified</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="flex items-center gap-1 text-[11px] px-2.5 py-1.5 rounded-lg bg-neonGreen/10 border border-neonGreen/30 text-neonGreen hover:bg-neonGreen/20 transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            <span>{copied ? t.linkCopied : t.copyInviteLink}</span>
          </button>
        </div>
      </div>
    </div>
  );
};