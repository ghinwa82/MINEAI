import { createHmac, randomBytes } from 'node:crypto';

/**
 * RFC 6238 time-based one-time passwords.
 *
 * Compatible with Google Authenticator, 1Password, Authy and any other TOTP
 * client. Recovery codes are generated once at enrolment and hashed before
 * they are stored; the plaintext is shown to the operator exactly once.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

export function base32Encode(buffer: Buffer): string {
  let bits = 0;
  let value = 0;
  let output = '';

  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(input: string): Buffer {
  const clean = input.replace(/=+$/g, '').toUpperCase().replace(/\s+/g, '');
  let bits = 0;
  let value = 0;
  const bytes: number[] = [];

  for (const char of clean) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export function generateTotpSecret(bytes = 20): string {
  return base32Encode(randomBytes(bytes));
}

export function totpCode(secret: string, timestamp = Date.now(), step = 30, digits = 6): string {
  const counter = Math.floor(timestamp / 1000 / step);
  const buffer = Buffer.alloc(8);
  buffer.writeBigUInt64BE(BigInt(counter));

  const digest = createHmac('sha1', base32Decode(secret)).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);

  return String(binary % 10 ** digits).padStart(digits, '0');
}

export function verifyTotp(secret: string, code: string, window = 1): boolean {
  const clean = code.replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean)) return false;
  const now = Date.now();
  for (let offset = -window; offset <= window; offset += 1) {
    if (totpCode(secret, now + offset * 30_000) === clean) return true;
  }
  return false;
}

export function otpauthUrl(secret: string, account: string, issuer = 'MineAI Node'): string {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: '30',
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function generateRecoveryCodes(count = 8): { plain: string[]; hashed: string[] } {
  const plain: string[] = [];
  for (let index = 0; index < count; index += 1) {
    const raw = randomBytes(5).toString('hex').toUpperCase();
    plain.push(`${raw.slice(0, 5)}-${raw.slice(5, 10)}`);
  }
  const hashed = plain.map((code) => hashRecoveryCode(code));
  return { plain, hashed };
}

export function hashRecoveryCode(code: string): string {
  return createHmac('sha256', 'mineai-recovery-codes-v1')
    .update(code.replace(/\s+/g, '').toUpperCase())
    .digest('hex');
}

export function consumeRecoveryCode(hashed: string[], code: string): { ok: boolean; remaining: string[] } {
  const target = hashRecoveryCode(code);
  const index = hashed.indexOf(target);
  if (index === -1) return { ok: false, remaining: hashed };
  return { ok: true, remaining: hashed.filter((_, position) => position !== index) };
}
