/**
 * Model-backed support answers.
 *
 * Three OpenAI-compatible-or-near providers are tried in a fixed order and the
 * first key that exists wins: Groq, Gemini, then OpenRouter. Nothing is sent to
 * a provider that has no key, and a failure returns `ok: false` rather than an
 * invented answer — the route falls back to the deterministic knowledge base,
 * which is what makes the assistant safe to ship without a model.
 *
 * The caller supplies the system prompt. This module never reads the visitor's
 * message for anything except forwarding it, so it cannot be tricked into
 * changing its own instructions.
 */

export type LlmProvider = 'groq' | 'gemini' | 'openrouter';

export interface LlmTurn {
  role: 'user' | 'assistant';
  content: string;
}

export interface LlmResult {
  ok: boolean;
  reply?: string;
  provider?: LlmProvider;
  model?: string;
  error?: string;
}

interface Provider {
  id: LlmProvider;
  key: string;
  model: string;
}

const TIMEOUT_MS = 14_000;
const MAX_REPLY_CHARS = 1_400;

function providerChain(): Provider[] {
  const chain: Provider[] = [];
  const groq = process.env.GROQ_API_KEY?.trim();
  if (groq) {
    // Two Groq models: the flagship first, then a smaller one so a retired
    // model id degrades to a working answer instead of the knowledge base.
    chain.push({ id: 'groq', key: groq, model: 'openai/gpt-oss-120b' });
    chain.push({ id: 'groq', key: groq, model: 'qwen/qwen3.8-27b' });
  }

  const gemini = (process.env.GEMINI_API_KEY ?? process.env.GOOGLE_API_KEY)?.trim();
  if (gemini) chain.push({ id: 'gemini', key: gemini, model: 'gemini-2.0-flash' });

  const openrouter = process.env.OPENROUTER_API_KEY?.trim();
  if (openrouter) {
    chain.push({ id: 'openrouter', key: openrouter, model: 'meta-llama/llama-3.3-70b-instruct' });
  }

  return chain;
}

export function llmConfigured(): boolean {
  return providerChain().length > 0;
}

export function llmProviderNames(): LlmProvider[] {
  return [...new Set(providerChain().map((provider) => provider.id))];
}

function trimReply(value: string): string {
  const clean = value.trim();
  if (clean.length <= MAX_REPLY_CHARS) return clean;
  return `${clean.slice(0, MAX_REPLY_CHARS - 1).trimEnd()}…`;
}

async function callGroqStyle(
  provider: Provider,
  url: string,
  headers: Record<string, string>,
  system: string,
  turns: LlmTurn[],
): Promise<LlmResult> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: provider.model,
      temperature: 0.4,
      // Reasoning models spend tokens before they answer, so the budget is
      // generous; the reply itself is trimmed to MAX_REPLY_CHARS afterwards.
      max_tokens: 900,
      messages: [{ role: 'system', content: system }, ...turns],
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });

  if (!response.ok) {
    return { ok: false, provider: provider.id, error: `${provider.id} ${response.status}` };
  }

  const payload = (await response.json().catch(() => null)) as
    | { choices?: Array<{ message?: { content?: string } }> }
    | null;
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) {
    return { ok: false, provider: provider.id, error: `${provider.id} returned no text` };
  }
  return { ok: true, provider: provider.id, model: provider.model, reply: trimReply(content) };
}

async function callGemini(provider: Provider, system: string, turns: LlmTurn[]): Promise<LlmResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${provider.model}:generateContent`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-goog-api-key': provider.key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents: turns.map((turn) => ({
        role: turn.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: turn.content }],
      })),
      generationConfig: { temperature: 0.4, maxOutputTokens: 900 },
    }),
    signal: AbortSignal.timeout(TIMEOUT_MS),
    cache: 'no-store',
  });

  if (!response.ok) {
    return { ok: false, provider: provider.id, error: `${provider.id} ${response.status}` };
  }

  const payload = (await response.json().catch(() => null)) as
    | { candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }> }
    | null;
  const content = payload?.candidates?.[0]?.content?.parts?.map((part) => part.text ?? '').join('');
  if (!content) {
    return { ok: false, provider: provider.id, error: `${provider.id} returned no text` };
  }
  return { ok: true, provider: provider.id, model: provider.model, reply: trimReply(content) };
}

/**
 * Asks the first configured provider. A network failure moves to the next one;
 * a 4xx does too, because a revoked key should not take the concierge down.
 */
export async function chatCompletion(input: {
  system: string;
  turns: LlmTurn[];
}): Promise<LlmResult> {
  const chain = providerChain();
  if (chain.length === 0) return { ok: false, error: 'No model provider configured' };

  let lastError = 'No model provider answered';
  for (const provider of chain) {
    try {
      const result =
        provider.id === 'gemini'
          ? await callGemini(provider, input.system, input.turns)
          : await callGroqStyle(
              provider,
              provider.id === 'groq'
                ? 'https://api.groq.com/openai/v1/chat/completions'
                : 'https://openrouter.ai/api/v1/chat/completions',
              {
                Authorization: `Bearer ${provider.key}`,
                ...(provider.id === 'openrouter'
                  ? {
                      'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL?.trim() || 'https://mineai-three.vercel.app',
                      'X-Title': 'MineAI Support',
                    }
                  : {}),
              },
              input.system,
              input.turns,
            );
      if (result.ok) return result;
      lastError = result.error ?? lastError;
    } catch (error) {
      lastError = error instanceof Error ? error.message : `${provider.id} failed`;
    }
  }

  return { ok: false, error: lastError };
}
