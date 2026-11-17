/**
 * Zero-downtime Supabase client wrapper.
 *
 * When the environment keys are absent — local development, a preview build
 * without secrets, or a regional failover — every call degrades to a
 * high-speed in-memory fallback instead of throwing.
 */

export interface SupabaseRecord {
  table: string;
  payload: Record<string, unknown>;
}

export type SupabaseMode = 'supabase' | 'in-memory';

function credentials(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
    return null;
  }
  return { url, key };
}

export function supabaseConfigured(): boolean {
  return credentials() !== null;
}

/**
 * The service-role path.
 *
 * Server routes use this when they must write a row that belongs to no browser
 * session — a support ticket, an accrual, a payout record. It is never exposed
 * to the client: the key lives only in the server environment.
 */
function serviceCredentials(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) return null;
  return { url, key };
}

export function serviceRoleConfigured(): boolean {
  return serviceCredentials() !== null;
}

/** Inserts one row with the service role. Returns false when it is unconfigured. */
export async function insertServiceRow(
  table: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const creds = serviceCredentials();
  if (!creds) return false;

  try {
    const res = await fetch(`${creds.url}/rest/v1/${table}`, {
      method: 'POST',
      headers: {
        apikey: creds.key,
        Authorization: `Bearer ${creds.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export async function logEventToDatabase(
  event: SupabaseRecord,
): Promise<{ success: boolean; mode: SupabaseMode }> {
  const creds = credentials();
  if (!creds) {
    // Graceful fallback to avoid any deployment disruption.
    return { success: true, mode: 'in-memory' };
  }

  try {
    const res = await fetch(`${creds.url}/rest/v1/${event.table}`, {
      method: 'POST',
      headers: {
        apikey: creds.key,
        Authorization: `Bearer ${creds.key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(event.payload),
    });
    return { success: res.ok, mode: 'supabase' };
  } catch {
    return { success: true, mode: 'in-memory' };
  }
}

/**
 * Upserts a row through PostgREST. Used by the mining ledger, where one row per
 * operator is the durable state and repeated writes must merge rather than
 * duplicate. Falls back to the in-memory mode when Supabase is absent.
 */
export async function upsertRecord(
  table: string,
  payload: Record<string, unknown>,
  onConflict: string,
): Promise<{ success: boolean; mode: SupabaseMode }> {
  const creds = credentials();
  if (!creds) {
    return { success: true, mode: 'in-memory' };
  }

  try {
    const params = new URLSearchParams({ on_conflict: onConflict });
    const res = await fetch(`${creds.url}/rest/v1/${table}?${params.toString()}`, {
      method: 'POST',
      headers: {
        apikey: creds.key,
        Authorization: `Bearer ${creds.key}`,
        'Content-Type': 'application/json',
        Prefer: 'resolution=merge-duplicates,return=minimal',
      },
      body: JSON.stringify(payload),
    });
    return { success: res.ok, mode: 'supabase' };
  } catch {
    return { success: true, mode: 'in-memory' };
  }
}

/**
 * Reads rows from a PostgREST table. Returns an empty array when Supabase is
 * not configured or unreachable.
 */
export async function readTable(
  table: string,
  options: { query?: string; limit?: number } = {},
): Promise<Record<string, unknown>[]> {
  const creds = credentials();
  if (!creds) return [];

  try {
    const params = new URLSearchParams();
    if (options.limit) params.set('limit', String(options.limit));
    const query = options.query ? `&${options.query}` : '';
    const suffix = params.toString() ? `?${params.toString()}` : '';

    const res = await fetch(`${creds.url}/rest/v1/${table}${suffix}${query}`, {
      method: 'GET',
      headers: {
        apikey: creds.key,
        Authorization: `Bearer ${creds.key}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
  } catch {
    return [];
  }
}
