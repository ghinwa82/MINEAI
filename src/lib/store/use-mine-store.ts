import { create } from 'zustand';
import { NodeMetrics, AgentLog, GamificationState, Language, Currency } from '../types';
import { TelemetryAuditorAgent } from '../agents/telemetry-agent';
import { GrowthHackingAgent } from '../agents/growth-agent';

interface MineStore {
  locale: Language;
  currency: Currency;
  tickingBalance: number;
  dailyYieldEst: number;
  nodes: NodeMetrics[];
  agentLogs: AgentLog[];
  gamification: GamificationState;
  isPayoutModalOpen: boolean;
  isDropshipModalOpen: boolean;
  setLocale: (lang: Language) => void;
  setCurrency: (cur: Currency) => void;
  incrementBalanceTick: () => void;
  runTelemetryAudit: () => void;
  claimDailyCheckIn: () => void;
  addAgentLog: (log: AgentLog) => void;
  setPayoutModalOpen: (open: boolean) => void;
  setDropshipModalOpen: (open: boolean) => void;
  deductTokens: (amount: number) => void;
}

const INITIAL_NODES: NodeMetrics[] = [
  {
    id: 'node-riyadh-01',
    name: 'Riyadh-Neural-Primary',
    ip: '178.62.201.44',
    cpuLoad: 42,
    gpuLoad: 88,
    hashrateMhs: 148.5,
    uptimeSeconds: 842100,
    status: 'ONLINE',
    temperatureC: 56.4,
    country: 'SA'
  },
  {
    id: 'node-dubai-02',
    name: 'Dubai-Edge-Node-02',
    ip: '185.112.45.19',
    cpuLoad: 96,
    gpuLoad: 99,
    hashrateMhs: 64.2,
    uptimeSeconds: 124500,
    status: 'THROTTLED',
    temperatureC: 78.1,
    country: 'AE'
  },
  {
    id: 'node-cairo-03',
    name: 'Cairo-Compute-Worker-03',
    ip: '197.34.88.102',
    cpuLoad: 21,
    gpuLoad: 12,
    hashrateMhs: 0.0,
    uptimeSeconds: 0,
    status: 'OFFLINE',
    temperatureC: 38.0,
    country: 'EG'
  }
];

export const useMineStore = create<MineStore>((set, get) => ({
  locale: 'ar',
  currency: 'SAR',
  tickingBalance: 2451.89041284,
  dailyYieldEst: 42.15,
  nodes: INITIAL_NODES,
  agentLogs: [
    {
      id: 'init-1',
      agentName: 'TELEMETRY',
      timestamp: new Date().toISOString(),
      type: 'INFO',
      messageEn: 'Telemetry Auditor worker attached to Edge Node stream.',
      messageAr: 'تم ربط وكيل تدقيق العتاد والقياس المباشر بمصفوفة العقد اللامركزية.'
    }
  ],
  gamification: {
    xp: 3450,
    level: 7,
    streakDays: 6,
    lastCheckInDate: '2025-01-01',
    referralCode: 'MINE-AI-AR-882',
    referralCount: 14,
    rank: 184
  },
  isPayoutModalOpen: false,
  isDropshipModalOpen: false,

  setLocale: (lang) => set({ locale: lang }),
  setCurrency: (cur) => set({ currency: cur }),

  incrementBalanceTick: () => {
    set((state) => ({
      tickingBalance: state.tickingBalance + 0.00000418
    }));
  },

  runTelemetryAudit: () => {
    const { nodes } = get();
    const { updatedNodes, logs } = TelemetryAuditorAgent.auditAndHeal(nodes);
    set((state) => ({
      nodes: updatedNodes,
      agentLogs: [...logs, ...state.agentLogs].slice(0, 30)
    }));
  },

  claimDailyCheckIn: () => {
    const { gamification } = get();
    const { updatedState, log } = GrowthHackingAgent.evaluateCheckIn(gamification);
    set((state) => ({
      gamification: updatedState,
      agentLogs: [log, ...state.agentLogs].slice(0, 30)
    }));
  },

  addAgentLog: (log) => set((state) => ({
    agentLogs: [log, ...state.agentLogs].slice(0, 30)
  })),

  setPayoutModalOpen: (open) => set({ isPayoutModalOpen: open }),
  setDropshipModalOpen: (open) => set({ isDropshipModalOpen: open }),

  deductTokens: (amount) => set((state) => ({
    tickingBalance: Math.max(0, state.tickingBalance - amount)
  }))
}));