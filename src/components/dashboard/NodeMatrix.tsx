'use client';

import React from 'react';
import { useMineStore } from '@/lib/store/use-mine-store';
import { translations } from '@/lib/i18n/translations';
import { Server, RefreshCw, AlertTriangle, CheckCircle2 } from 'lucide-react';

export const NodeMatrix: React.FC = () => {
  const { nodes, locale, runTelemetryAudit } = useMineStore();
  const t = translations[locale];

  return (
    <div className="rounded-2xl bg-surfaceCard border border-borderDark p-5 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-neonCyan/10 text-neonCyan">
            <Server className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">{t.telemetryHub}</h3>
            <p className="text-xs text-gray-400">{t.autoHealActive}</p>
          </div>
        </div>

        <button
          onClick={runTelemetryAudit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface border border-borderDark hover:border-neonCyan text-gray-300 hover:text-neonCyan text-xs font-mono transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>{t.triggerAudit}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {nodes.map((node) => {
          const isHealthy = node.status === 'ONLINE';
          const isHealing = node.status === 'HEALING';

          return (
            <div
              key={node.id}
              className={`p-4 rounded-xl border transition-all ${
                isHealthy
                  ? 'bg-surface/50 border-borderDark'
                  : isHealing
                  ? 'bg-neonAmber/5 border-neonAmber/40 animate-pulse'
                  : 'bg-red-950/20 border-red-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-white truncate max-w-[130px] font-mono">
                  {node.name}
                </span>
                <span
                  className={`text-[10px] font-mono px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    isHealthy
                      ? 'bg-neonGreen/10 text-neonGreen border border-neonGreen/30'
                      : isHealing
                      ? 'bg-neonAmber/10 text-neonAmber border border-neonAmber/30'
                      : 'bg-red-500/10 text-red-400 border border-red-500/30'
                  }`}
                >
                  {isHealthy ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                  {node.status}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-gray-400 font-mono mb-3">
                <div className="flex justify-between">
                  <span>{t.nodeLoad}:</span>
                  <span className="text-gray-200">CPU {node.cpuLoad}% | GPU {node.gpuLoad}%</span>
                </div>
                <div className="flex justify-between">
                  <span>{t.nodeHashrate}:</span>
                  <span className="text-neonCyan font-bold">{node.hashrateMhs} MH/s</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>IP: {node.ip}</span>
                  <span>{node.temperatureC}°C</span>
                </div>
              </div>

              <button
                onClick={runTelemetryAudit}
                className="w-full py-1.5 rounded-lg bg-surfaceCard hover:bg-surface border border-borderDark hover:border-gray-600 text-gray-300 text-[11px] font-medium transition-colors"
              >
                {t.forceHeal}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};