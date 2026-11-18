import { NextResponse } from 'next/server';
import { z } from 'zod';

import { chatCompletion, llmConfigured, llmProviderNames } from '@/lib/llm';
import { normalizeLanguage } from '@/lib/languages';
import { resolveSession } from '@/lib/member-session';
import { isValidUid, snapshotFor } from '@/lib/mining';
import { clientKey, checkRateLimit } from '@/lib/rate-limit';
import { insertServiceRow, serviceRoleConfigured } from '@/lib/supabase';
import { answerFor } from '@/lib/support-i18n';
import type { SupportedLanguage } from '@/types';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const LANG_NAME: Record<SupportedLanguage, string> = {
  en: 'English',
  ar: 'Arabic',
  fr: 'French',
  es: 'Spanish',
  zh: 'Simplified Chinese',
  hi: 'Hindi',
};

const schema = z.object({
  message: z.string().trim().min(1).max(600),
  lang: z.string().trim().max(8).optional(),
  /** Browser operator id, used only to describe the caller's own position. */
  uid: z.string().trim().max(48).optional(),
  /** A transaction hash the visitor pasted; described, never verified here. */
  txHash: z.string().trim().max(140).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(['user', 'assistant']),
        content: z.string().trim().min(1).max(900),
      }),
    )
    .max(8)
    .optional(),
});

interface SupportContext {
  hasPosition: boolean;
  planName: string;
  hashrateMhs: number;
  pendingTokens: number;
  twoFactor: boolean;
  email: string | null;
  txHash: string | null;
}

function systemPrompt(lang: SupportedLanguage, context: SupportContext): string {
  const facts = [
    context.hasPosition
      ? `Plan: ${context.planName}. Cloud power: ${context.hashrateMhs.toLocaleString('en-US', { maximumFractionDigits: 0 })} MH/s. Pending $MINEAI balance: ${context.pendingTokens.toFixed(4)}.`
      : 'No mining position was supplied with this question, so do not state or guess the visitor\'s plan, hashrate or balance.',
    `Authenticator (TOTP) is ${context.twoFactor ? 'enabled' : 'not enabled'} on the signed-in account.`,
    context.email ? `Signed-in account: ${context.email}.` : 'The visitor is not signed in.',
    context.txHash
      ? `The visitor mentioned this transaction hash: ${context.txHash}. You cannot verify it; tell them activation is confirmed only after the chain sees it.`
      : '',
  ]
    .filter(Boolean)
    .join(' ');

  return [
    'You are the MineAI concierge: a calm, precise support agent for a zero-electricity cloud mining platform.',
    `Answer only in ${LANG_NAME[lang]}. Keep replies under 110 words, plain prose only — no markdown, no bold, no bullet lists, no tables and no emoji.`,
    'Known account context (do not repeat it back verbatim unless it answers the question):',
    facts,
    'Plan lineup, exactly: Genesis Free Cloud costs nothing, mines 120 MH/s immediately and never expires; Node v1 is 480 MH/s for $29.99; Pro v2 is 1,600 MH/s for $99.99; Elite v3 is 4,200 MH/s for $299.99; Sovereign v4 is 12,000 MH/s for $799.99. Every plan earns $MINEAI with a 3x allocation bonus and can be paused at any time.',
    'Where things live, exactly: /register creates an account, /login signs in, /dashboard/security turns two-step sign-in on or off, /store lists plans, /checkout?plan=<slug> activates one, /mining is the mining terminal, /support is this assistant and /contact reaches a human. Do not describe any other menu path.',
    'Payouts are requested from the mining terminal to a wallet address per chain, and support is reachable through the contact page.',
    'Hard rules: never ask for a password, seed phrase, private key, card number or one-time code. Never promise a profit, a fixed return or a listing date. Never state a payout processing time or a fee that is not in the facts above — say the exact timing depends on the chain instead. Never invent a wallet address or a policy. If the question needs an account decision, point to the contact page. If you do not know, say so and offer a human channel.',
  ].join('\n');
}

/**
 * The model-backed concierge.
 *
 * It knows only what this request can prove: the caller's own plan, hashrate,
 * pending balance and 2FA state, plus a hash they pasted. That context is
 * rendered into the system prompt, never into a database verbatim. If every
 * provider fails — or none is configured — the deterministic knowledge base
 * answers instead, and the response says which path was taken.
 */
export async function POST(request: Request) {
  const limit = checkRateLimit(clientKey(request, 'ai-support'), 24, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: 'Too many messages. Wait a minute.' },
      { status: 429, headers: { 'Retry-After': String(limit.resetSeconds) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: 'A JSON body is required' }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: 'Write a short question first' }, { status: 422 });
  }

  const lang = normalizeLanguage(parsed.data.lang ?? 'en') as SupportedLanguage;
  const session = await resolveSession(request).catch(() => null);

  let context: SupportContext = {
    hasPosition: false,
    planName: 'Genesis Free Cloud',
    hashrateMhs: 0,
    pendingTokens: 0,
    twoFactor: session?.member.totpEnabled ?? false,
    email: session?.member.email ?? null,
    txHash: parsed.data.txHash?.trim() || null,
  };

  if (parsed.data.uid && isValidUid(parsed.data.uid)) {
    try {
      const snapshot = snapshotFor(parsed.data.uid, lang);
      context = {
        ...context,
        hasPosition: true,
        planName: snapshot.planName,
        hashrateMhs: snapshot.hashrateMhs,
        pendingTokens: snapshot.claimableTokens,
        twoFactor: snapshot.twoFactorEnabled || context.twoFactor,
      };
    } catch {
      // A cold instance may not have the row yet; the defaults are accurate.
    }
  }

  const turns = [
    ...(parsed.data.history ?? []).map((turn) => ({ role: turn.role, content: turn.content })),
    { role: 'user' as const, content: parsed.data.message },
  ];

  if (llmConfigured()) {
    const result = await chatCompletion({ system: systemPrompt(lang, context), turns });
    if (result.ok && result.reply) {
      void recordTicket(lang, parsed.data.message, 'llm');
      return NextResponse.json({
        ok: true,
        source: 'llm',
        provider: result.provider,
        lang,
        reply: result.reply,
        suggestions: [],
      });
    }
    // A model outage must never take support down; log the reason once and use
    // the knowledge base so the visitor still gets a correct answer.
    console.warn('[ai-support] model fallback:', result.error ?? 'empty reply');
  }

  const answer = answerFor(parsed.data.message, lang);
  void recordTicket(lang, parsed.data.message, answer.intent);

  return NextResponse.json({
    ok: true,
    source: 'kb',
    lang,
    providers: llmProviderNames(),
    ...answer,
  });
}

async function recordTicket(lang: string, message: string, topic: string): Promise<void> {
  if (!serviceRoleConfigured()) return;
  await insertServiceRow('support_tickets', {
    lang,
    topic,
    message: message.slice(0, 2000),
    status: 'open',
  });
}
