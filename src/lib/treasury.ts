import type { SupportedLanguage } from '@/types';

/**
 * Treasury and node state for the live storefront.
 *
 * The mesh keeps its own bookkeeping: which shards are running, what the
 * treasury can settle, and what the last autonomous cycle observed. State is
 * held on `globalThis` so it survives hot reloads in development and is
 * re-seeded deterministically whenever a fresh serverless instance boots.
 */

export type NodeStatus = 'idle' | 'provisioning' | 'active' | 'paused';

export interface NodeState {
  id: string;
  status: NodeStatus;
  activatedAt: string | null;
  provisionedAt: string | null;
  /** Rolling yield attributed to this shard since activation, in USD. */
  earnedUsd: number;
  lastCycleAt: string | null;
}

export interface LedgerEntry {
  id: string;
  kind: 'credit' | 'debit';
  amountUsd: number;
  label: string;
  reference: string;
  createdAt: string;
}

export interface CycleState {
  running: boolean;
  lastCycleAt: string | null;
  lastDurationMs: number | null;
  cycleCount: number;
  nextCycleAt: string | null;
  lastObservations: string[];
}

export interface TreasurySnapshot {
  balanceUsd: number;
  lifetimeMinedUsd: number;
  lifetimeSettledUsd: number;
  ceilingUsd: number;
  nodes: NodeState[];
  ledger: LedgerEntry[];
  cycle: CycleState;
  updatedAt: string;
}

const SEED_BALANCE = 482.65;
const CEILING = 25_000;
const CYCLE_INTERVAL_MS = 60_000;

interface TreasuryStore {
  balanceUsd: number;
  lifetimeMinedUsd: number;
  lifetimeSettledUsd: number;
  nodes: Map<string, NodeState>;
  ledger: LedgerEntry[];
  cycle: CycleState;
  updatedAt: string;
}

function createStore(): TreasuryStore {
  const now = new Date().toISOString();
  return {
    balanceUsd: SEED_BALANCE,
    lifetimeMinedUsd: SEED_BALANCE,
    lifetimeSettledUsd: 0,
    nodes: new Map(),
    ledger: [
      {
        id: 'ledger-seed',
        kind: 'credit',
        amountUsd: SEED_BALANCE,
        label: 'Opening treasury position',
        reference: 'MINE-OPENING',
        createdAt: now,
      },
    ],
    cycle: {
      running: false,
      lastCycleAt: null,
      lastDurationMs: null,
      cycleCount: 0,
      nextCycleAt: null,
      lastObservations: [],
    },
    updatedAt: now,
  };
}

const globalRef = globalThis as unknown as { __mineaiTreasury?: TreasuryStore };

function store(): TreasuryStore {
  if (!globalRef.__mineaiTreasury) {
    globalRef.__mineaiTreasury = createStore();
  }
  return globalRef.__mineaiTreasury;
}

function nextReference(prefix: string): string {
  const stamp = Date.now().toString(36).toUpperCase();
  const noise = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `${prefix}-${stamp}${noise}`;
}

export function getNodeState(id: string): NodeState {
  const current = store().nodes.get(id);
  if (current) return current;
  return {
    id,
    status: 'idle',
    activatedAt: null,
    provisionedAt: null,
    earnedUsd: 0,
    lastCycleAt: null,
  };
}

export function listNodeStates(ids: string[]): NodeState[] {
  return ids.map((id) => getNodeState(id));
}

export function activateNode(id: string): NodeState {
  const current = store();
  const existing = current.nodes.get(id);
  const now = new Date().toISOString();
  const next: NodeState = {
    id,
    status: 'active',
    activatedAt: existing?.activatedAt ?? now,
    provisionedAt: now,
    earnedUsd: existing?.earnedUsd ?? 0,
    lastCycleAt: existing?.lastCycleAt ?? null,
  };
  current.nodes.set(id, next);
  current.updatedAt = now;
  return next;
}

export function pauseNode(id: string): NodeState {
  const current = store();
  const existing = current.nodes.get(id);
  const now = new Date().toISOString();
  const next: NodeState = {
    id,
    status: 'paused',
    activatedAt: existing?.activatedAt ?? null,
    provisionedAt: existing?.provisionedAt ?? null,
    earnedUsd: existing?.earnedUsd ?? 0,
    lastCycleAt: existing?.lastCycleAt ?? null,
  };
  current.nodes.set(id, next);
  current.updatedAt = now;
  return next;
}

/** Credits the treasury and records the movement on the ledger. */
export function creditTreasury(amountUsd: number, label: string, reference?: string): TreasurySnapshot {
  const current = store();
  const amount = Math.max(0, Number(amountUsd.toFixed(2)));
  current.balanceUsd = Number((current.balanceUsd + amount).toFixed(2));
  current.lifetimeMinedUsd = Number((current.lifetimeMinedUsd + amount).toFixed(2));
  current.ledger.unshift({
    id: nextReference('CR'),
    kind: 'credit',
    amountUsd: amount,
    label,
    reference: reference ?? nextReference('MINE'),
    createdAt: new Date().toISOString(),
  });
  current.updatedAt = new Date().toISOString();
  return snapshot();
}

/** Debits the treasury. Returns `null` when the balance cannot cover it. */
export function debitTreasury(amountUsd: number, label: string, reference?: string): TreasurySnapshot | null {
  const current = store();
  const amount = Number(amountUsd.toFixed(2));
  if (amount <= 0 || amount > current.balanceUsd) return null;
  current.balanceUsd = Number((current.balanceUsd - amount).toFixed(2));
  current.lifetimeSettledUsd = Number((current.lifetimeSettledUsd + amount).toFixed(2));
  current.ledger.unshift({
    id: nextReference('DR'),
    kind: 'debit',
    amountUsd: amount,
    label,
    reference: reference ?? nextReference('MINE'),
    createdAt: new Date().toISOString(),
  });
  current.updatedAt = new Date().toISOString();
  return snapshot();
}

export function recordCycle(observations: string[], durationMs: number): CycleState {
  const current = store();
  const now = new Date();
  current.cycle = {
    running: false,
    lastCycleAt: now.toISOString(),
    lastDurationMs: durationMs,
    cycleCount: current.cycle.cycleCount + 1,
    nextCycleAt: new Date(now.getTime() + CYCLE_INTERVAL_MS).toISOString(),
    lastObservations: observations.slice(0, 6),
  };
  current.updatedAt = now.toISOString();
  return current.cycle;
}

export function markCycleRunning(): void {
  const current = store();
  current.cycle.running = true;
  current.updatedAt = new Date().toISOString();
}

/** Attributes a slice of yield to every running shard. */
export function accrueNodeYield(nodeIds: string[], perNodeUsd: number): NodeState[] {
  const current = store();
  const now = new Date().toISOString();
  const updated: NodeState[] = [];
  for (const id of nodeIds) {
    const existing = current.nodes.get(id);
    if (!existing || existing.status !== 'active') continue;
    const next: NodeState = {
      ...existing,
      earnedUsd: Number((existing.earnedUsd + perNodeUsd).toFixed(4)),
      lastCycleAt: now,
    };
    current.nodes.set(id, next);
    updated.push(next);
  }
  if (updated.length > 0) {
    creditTreasury(
      Number((perNodeUsd * updated.length).toFixed(2)),
      `Cycle yield from ${updated.length} active shard${updated.length === 1 ? '' : 's'}`,
    );
  }
  return updated;
}

export function snapshot(): TreasurySnapshot {
  const current = store();
  return {
    balanceUsd: current.balanceUsd,
    lifetimeMinedUsd: current.lifetimeMinedUsd,
    lifetimeSettledUsd: current.lifetimeSettledUsd,
    ceilingUsd: CEILING,
    nodes: [...current.nodes.values()],
    ledger: current.ledger.slice(0, 20),
    cycle: current.cycle,
    updatedAt: current.updatedAt,
  };
}

export interface PublicStats {
  activeNodes: number;
  totalNodes: number;
  balanceUsd: number;
  lifetimeMinedUsd: number;
  cycleCount: number;
  lastCycleAt: string | null;
  uptimeHours: number;
  languages: number;
  settlementRail: string;
}

export function publicStats(nodeIds: string[], languages: number, settlementRail: string): PublicStats {
  const current = store();
  const states = nodeIds.map((id) => getNodeState(id));
  const active = states.filter((state) => state.status === 'active').length;
  const bootedAt = Date.now() - current.cycle.cycleCount * CYCLE_INTERVAL_MS;
  return {
    activeNodes: active,
    totalNodes: nodeIds.length,
    balanceUsd: current.balanceUsd,
    lifetimeMinedUsd: current.lifetimeMinedUsd,
    cycleCount: current.cycle.cycleCount,
    lastCycleAt: current.cycle.lastCycleAt,
    uptimeHours: Math.max(1, Math.round((Date.now() - bootedAt) / 3_600_000)),
    languages,
    settlementRail,
  };
}

/** Locale-aware display helper for monetary values. */
export function formatUsd(amountUsd: number, lang: SupportedLanguage): string {
  const locale =
    lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : lang === 'fr' ? 'fr-FR' : lang === 'es' ? 'es-ES' : lang === 'hi' ? 'hi-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'code',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amountUsd);
}
