'use client';

import React from 'react';
import { useMineStore } from '@/lib/store/use-mine-store';
import { translations } from '@/lib/i18n/translations';
import { Terminal, Shield, Cpu, Sparkles, CircleDollarSign } from 'lucide-react';

export const AgentTerminal: React.FC = () => {
  const { agentLogs, locale } = useMineStore();
  const t = translations[locale];

  const getAgentBadge = (agent: string) => {
    switch (agent) {
      case 'TELEMETRY':
        return <span className="text-neonCyan flex items-center gap-1"><Cpu className="w-3 h-3" /> TELEMETRY</span>;
      case 'SENTIMENT':
        return <span className="text-neonPurple flex items-center gap-1"><Sparkles className="w-3 h-3" /> SENTIMENT</span>;
      case 'FINANCIAL':
        return <span className="text-neonGreen flex items-center gap-1"><CircleDollarSign className="w-3 h-3" /> FINANCIAL</span>;
      case 'GROWTH':
        return <span className="text-neonAmber flex items-center gap-1"><Shield className="w-3 h-3" /> GROWTH</span>;
      default:
        return <span>AGENT</span>;
    }
  };

  return (
    <div className="rounded-2xl bg-surfaceCard border border-borderDark p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-3">
        <Terminal className="w-4 h-4 text-neonGreen" />
        <h3 className="text-sm font-bold text-white">{t.agentFeed}</h3>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neonGreen/10 text-neonGreen border border-neonGreen/20">
          Auto-Pilot Active
        </span>
      </div>

      <div className="h-44 overflow-y-auto space-y-2 font-mono text-xs pr-1 scrollbar-thin">
        {agentLogs.map((log) => (
          <div
            key={log.id}
            className="p-2.5 rounded-lg bg-surface/80 border border-borderDark flex flex-col gap-1 transition-all"
          >
            <div className="flex items-center justify-between text-[10px] text-gray-500">
              <div className="font-semibold">{getAgentBadge(log.agentName)}</div>
              <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
            </div>
            <p className="text-gray-300 text-[11px] leading-relaxed">
              {locale === 'ar' ? log.messageAr : log.messageEn}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};