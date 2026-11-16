import { NextResponse } from 'next/server';

import { getAgentLogs, pushAgentLog, runAutonomousCycle } from '@/lib/agents';
import { getCanonicalCatalogue } from '@/lib/catalog';
import { logEventToDatabase } from '@/lib/supabase';
import { getConnectStatus } from '@/lib/stripe';
import {
  accrueNodeYield,
  activateNode,
  listNodeStates,
  markCycleRunning,
  pauseNode,
  publicStats,
  recordCycle,
  snapshot,
  type NodeState,
} from '@/lib/treasury';
import { LANGUAGE_CODES } from '@/lib/languages';
import { sanitizeInput, secretsMatch } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const NODE_IDS = getCanonicalCatalogue().map((plan) => plan.id);

function cronSecret(): string {
  return process.env.CRON_SECRET?.trim() || '';
}

/** A request is authorised when it carries the deployment cron secret. */
function isCronRequest(request: Request, url: URL): boolean {
  const expected = cronSecret();
  if (!expected) return false;

  const header = request.headers.get('authorization');
  if (header && secretsMatch(header.replace(/^Bearer\s+/i, ''), expected)) return true;

  const query = url.searchParams.get('secret');
  return secretsMatch(query, expected);
}

async function buildState() {
  const treasury = snapshot();
  const connect = await getConnectStatus();
  const nodes = listNodeStates(NODE_IDS);
  const rail =
    connect.state === 'verified'
      ? 'Stripe Connect'
      : connect.state === 'pending'
        ? 'Stripe Connect (pending)'
        : 'Sandbox rail';

  return {
    cycle: treasury.cycle,
    treasury: {
      balanceUsd: treasury.balanceUsd,
      lifetimeMinedUsd: treasury.lifetimeMinedUsd,
      lifetimeSettledUsd: treasury.lifetimeSettledUsd,
      ceilingUsd: treasury.ceilingUsd,
      ledger: treasury.ledger,
    },
    nodes: Object.fromEntries(nodes.map((node: NodeState) => [node.id, node])),
    agents: getAgentLogs().slice(0, 12),
    connect,
    stats: publicStats(NODE_IDS, LANGUAGE_CODES.length, rail),
    updatedAt: treasury.updatedAt,
  };
}

/**
 * Runs one full agent cycle: telemetry, sentiment, finance and growth all
 * take a shift, the treasury accrues yield for every running shard, and the
 * observations are written to the audit trail.
 */
async function executeCycle(): Promise<{ observations: string[]; durationMs: number; cycleCount: number }> {
  markCycleRunning();
  const before = snapshot();

  const report = await runAutonomousCycle({
    activeNodeIds: before.nodes.filter((node) => node.status === 'active').map((node) => node.id),
    balanceUsd: before.balanceUsd,
    settlementRail: 'settlement',
  });

  accrueNodeYield(
    before.nodes.filter((node) => node.status === 'active').map((node) => node.id),
    0.42,
  );

  const cycle = recordCycle(report.observations, report.durationMs);

  await logEventToDatabase({
    table: 'agent_runs',
    payload: {
      cycle: cycle.cycleCount,
      observations: report.observations,
      startedAt: report.startedAt,
      finishedAt: report.finishedAt,
      durationMs: report.durationMs,
    },
  });

  return {
    observations: report.observations,
    durationMs: report.durationMs,
    cycleCount: cycle.cycleCount,
  };
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  try {
    if (isCronRequest(request, url)) {
      const result = await executeCycle();
      const state = await buildState();
      return NextResponse.json({
        ok: true,
        triggered: 'cron',
        ...result,
        ...state,
      });
    }

    const state = await buildState();
    return NextResponse.json({ ok: true, triggered: 'read', ...state });
  } catch {
    return NextResponse.json({ ok: false, error: 'Autonomous state unavailable' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  let body: { action?: string; nodeId?: string } = {};

  try {
    const raw = await request.json();
    body = {
      action: sanitizeInput(raw?.action) || 'cycle',
      nodeId: sanitizeInput(raw?.nodeId),
    };
  } catch {
    body = { action: 'cycle' };
  }

  const nodeId = body.nodeId && NODE_IDS.includes(body.nodeId) ? body.nodeId : NODE_IDS[0];

  try {
    if (body.action === 'activate') {
      const node = activateNode(nodeId);
      pushAgentLog({
        agentName: 'TelemetryAuditor',
        action: `Shard ${nodeId} claimed by the mesh and brought online.`,
        status: 'success',
        details: { nodeId, activatedAt: node.activatedAt },
      });
    } else if (body.action === 'pause') {
      const node = pauseNode(nodeId);
      pushAgentLog({
        agentName: 'TelemetryAuditor',
        action: `Shard ${nodeId} released back to the pool.`,
        status: 'info',
        details: { nodeId, pausedAt: node.activatedAt },
      });
    } else if (body.action === 'cycle') {
      await executeCycle();
    } else {
      return NextResponse.json(
        { ok: false, error: `Unsupported action "${body.action}"` },
        { status: 400 },
      );
    }

    const state = await buildState();
    return NextResponse.json({ ok: true, action: body.action, nodeId, ...state });
  } catch {
    return NextResponse.json({ ok: false, error: 'Autonomous action failed' }, { status: 500 });
  }
}
