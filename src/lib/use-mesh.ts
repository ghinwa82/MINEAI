'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface MeshAgentLog {
  id: string;
  timestamp: string;
  agentName: string;
  action: string;
  status: string;
  details: Record<string, unknown>;
}

export interface MeshNode {
  id: string;
  status: 'idle' | 'provisioning' | 'active' | 'paused';
  activatedAt: string | null;
  provisionedAt: string | null;
  earnedUsd: number;
  lastCycleAt: string | null;
}

export interface MeshConnect {
  state: 'verified' | 'pending' | 'sandbox' | 'unavailable';
  mode: 'live' | 'test' | 'sandbox';
  accountId: string | null;
  chargesEnabled: boolean;
  payoutsEnabled: boolean;
  detailsSubmitted: boolean;
  detail: string;
}

export interface MeshState {
  cycle: {
    running: boolean;
    lastCycleAt: string | null;
    lastDurationMs: number | null;
    cycleCount: number;
    nextCycleAt: string | null;
    lastObservations: string[];
  };
  treasury: {
    balanceUsd: number;
    lifetimeMinedUsd: number;
    lifetimeSettledUsd: number;
    ceilingUsd: number;
    ledger: Array<{
      id: string;
      kind: 'credit' | 'debit';
      amountUsd: number;
      label: string;
      reference: string;
      createdAt: string;
    }>;
  };
  nodes: Record<string, MeshNode>;
  agents: MeshAgentLog[];
  connect: MeshConnect;
  stats: {
    activeNodes: number;
    totalNodes: number;
    balanceUsd: number;
    lifetimeMinedUsd: number;
    cycleCount: number;
    lastCycleAt: string | null;
    uptimeHours: number;
    languages: number;
    settlementRail: string;
  };
  updatedAt: string;
}

export interface MeshActionResult {
  ok: boolean;
  error?: string;
  state?: MeshState;
}

const EMPTY_STATE: MeshState | null = null;

/**
 * Live view of the mesh.
 *
 * The storefront never invents its numbers: every balance, node status and
 * agent entry comes from the autonomous endpoint, refreshed on a timer and
 * immediately after any action the visitor takes.
 */
export function useMesh(pollIntervalMs = 15_000) {
  const [state, setState] = useState<MeshState | null>(EMPTY_STATE);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mounted = useRef(true);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch('/api/autonomous', { cache: 'no-store' });
      if (!response.ok) throw new Error(`mesh responded ${response.status}`);
      const payload = (await response.json()) as MeshState & { ok: boolean };
      if (!mounted.current) return;
      setState(payload);
      setError(null);
    } catch (cause) {
      if (!mounted.current) return;
      setError(cause instanceof Error ? cause.message : 'mesh unreachable');
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    void refresh();
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') void refresh();
    }, pollIntervalMs);
    return () => {
      mounted.current = false;
      window.clearInterval(timer);
    };
  }, [refresh, pollIntervalMs]);

  const dispatch = useCallback(
    async (action: 'activate' | 'pause' | 'cycle', nodeId?: string): Promise<MeshActionResult> => {
      try {
        const response = await fetch('/api/autonomous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, nodeId }),
        });
        const payload = (await response.json()) as MeshState & { ok: boolean; error?: string };
        if (!mounted.current) return { ok: payload.ok, error: payload.error };
        if (payload.ok) setState(payload);
        return { ok: payload.ok, error: payload.error, state: payload };
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : 'dispatch failed';
        if (mounted.current) setError(message);
        return { ok: false, error: message };
      }
    },
    [],
  );

  /**
   * Keeps the autonomous cycle alive.
   *
   * If no cycle has been recorded in the last minute the mesh is asked to run
   * one. The deployment cron performs the same call on the server; this
   * client-side heartbeat keeps the loop genuinely alive on a platform where
   * scheduled jobs are throttled.
   */
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (!mounted.current) return;
      if (document.visibilityState !== 'visible') return;

      const last = state?.cycle.lastCycleAt
        ? new Date(state.cycle.lastCycleAt).getTime()
        : 0;
      if (Date.now() - last < 60_000) return;

      void dispatch('cycle');
    }, 20_000);

    return () => window.clearInterval(timer);
  }, [dispatch, state?.cycle.lastCycleAt]);

  return { state, loading, error, refresh, dispatch };
}
