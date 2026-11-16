/**
 * In-process token buckets.
 *
 * Serverless instances are ephemeral, so this is a best-effort shield rather
 * than a global quota: it stops a single client from hammering an expensive
 * route within one warm instance. The proxy applies it to every `/api/*` call
 * and the payment routes use a tighter bucket on top.
 */

interface Bucket {
  tokens: number;
  updatedAt: number;
}

const globalRef = globalThis as unknown as { __mineaiBuckets?: Map<string, Bucket> };

function buckets(): Map<string, Bucket> {
  if (!globalRef.__mineaiBuckets) globalRef.__mineaiBuckets = new Map();
  return globalRef.__mineaiBuckets;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetSeconds: number;
  limit: number;
}

/**
 * @param key      Stable identity for the caller and route.
 * @param limit    Requests allowed in the window.
 * @param windowMs Window length in milliseconds.
 */
export function checkRateLimit(key: string, limit = 60, windowMs = 60_000): RateLimitResult {
  const now = Date.now();
  const store = buckets();
  const bucket = store.get(key) ?? { tokens: limit, updatedAt: now };

  const refill = ((now - bucket.updatedAt) / windowMs) * limit;
  bucket.tokens = Math.min(limit, bucket.tokens + Math.max(0, refill));
  bucket.updatedAt = now;

  const allowed = bucket.tokens >= 1;
  if (allowed) bucket.tokens -= 1;
  store.set(key, bucket);

  if (store.size > 5_000) {
    for (const [candidate, value] of store) {
      if (now - value.updatedAt > windowMs * 4) store.delete(candidate);
    }
  }

  return {
    allowed,
    remaining: Math.max(0, Math.floor(bucket.tokens)),
    resetSeconds: Math.ceil(windowMs / 1000),
    limit,
  };
}

/** Client identity for rate limiting: forwarded IP first, then a stable hash. */
export function clientKey(request: Request, scope: string): string {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  const real = request.headers.get('x-real-ip')?.trim();
  const agent = request.headers.get('user-agent')?.slice(0, 40) ?? 'unknown';
  return `${scope}:${forwarded || real || agent}`;
}
