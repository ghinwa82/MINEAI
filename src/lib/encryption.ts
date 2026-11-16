import {
  createCipheriv,
  createDecipheriv,
  createHash,
  createHmac,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';

/**
 * Field-level encryption.
 *
 * Sensitive values (bank identifiers, TOTP secrets, wallet labels) are sealed
 * with AES-256-GCM before they are written anywhere. The payload carries its
 * own version, IV and auth tag so a key rotation can be rolled out without
 * guessing at the shape of old records.
 *
 * `ENCRYPTION_KEY` should be 32 random bytes, hex or base64 encoded. If it is
 * absent the module derives a key from the service-role secret (or the cron
 * secret) so local development still works; `encryptionKeySource()` reports
 * which path was taken so a deployment can assert on it.
 */

const VERSION = 'v1';
const SALT = 'mineai-node-field-encryption-v1';

interface KeyMaterial {
  key: Buffer;
  source: 'env' | 'derived' | 'development';
}

let cached: KeyMaterial | null = null;

function decodeKey(raw: string): Buffer | null {
  const trimmed = raw.trim();
  if (/^[a-fA-F0-9]{64}$/.test(trimmed)) return Buffer.from(trimmed, 'hex');
  try {
    const buffer = Buffer.from(trimmed, 'base64');
    if (buffer.length === 32) return buffer;
  } catch {
    // fall through
  }
  return null;
}

function keyMaterial(): KeyMaterial {
  if (cached) return cached;

  const explicit = process.env.ENCRYPTION_KEY?.trim();
  if (explicit) {
    const decoded = decodeKey(explicit);
    if (decoded) {
      cached = { key: decoded, source: 'env' };
      return cached;
    }
    cached = { key: scryptSync(explicit, SALT, 32), source: 'env' };
    return cached;
  }

  const derivedFrom =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.STRIPE_WEBHOOK_SECRET?.trim() ||
    process.env.CRON_SECRET?.trim();

  if (derivedFrom) {
    cached = { key: scryptSync(derivedFrom, SALT, 32), source: 'derived' };
    return cached;
  }

  cached = { key: scryptSync('mineai-development-only-key', SALT, 32), source: 'development' };
  return cached;
}

export function encryptionKeySource(): KeyMaterial['source'] {
  return keyMaterial().source;
}

export function encryptionReady(): boolean {
  return keyMaterial().source !== 'development';
}

/** Encrypts a UTF-8 string into `v1.<iv>.<tag>.<cipher>` (base64url). */
export function encryptField(plaintext: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', keyMaterial().key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [
    VERSION,
    iv.toString('base64url'),
    tag.toString('base64url'),
    encrypted.toString('base64url'),
  ].join('.');
}

export function decryptField(payload: string): string | null {
  const parts = payload.split('.');
  if (parts.length !== 4 || parts[0] !== VERSION) return null;

  try {
    const iv = Buffer.from(parts[1], 'base64url');
    const tag = Buffer.from(parts[2], 'base64url');
    const encrypted = Buffer.from(parts[3], 'base64url');
    const decipher = createDecipheriv('aes-256-gcm', keyMaterial().key, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString('utf8');
  } catch {
    return null;
  }
}

/** Deterministic blind index for equality lookups on encrypted columns. */
export function hashLookup(value: string): string {
  return createHmac('sha256', keyMaterial().key).update(value.trim().toLowerCase()).digest('hex');
}

export function maskIban(iban: string): string {
  const clean = iban.replace(/\s+/g, '');
  if (clean.length <= 8) return '••••';
  return `${clean.slice(0, 4)} •••• ${clean.slice(-4)}`;
}

export function maskWallet(address: string): string {
  if (address.length <= 12) return '••••';
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
}

/** Constant-time comparison for recovery codes and other short secrets. */
export function safeCompare(a: string, b: string): boolean {
  const left = createHash('sha256').update(a).digest();
  const right = createHash('sha256').update(b).digest();
  return timingSafeEqual(left, right);
}
