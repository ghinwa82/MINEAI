/**
 * Defensive input handling for every API boundary.
 *
 * The helpers here are deliberately conservative: they strip characters that
 * have no business in a banking identifier, validate the structural shape of
 * the value, and never throw.
 */

export function sanitizeInput(input: unknown): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>'"`;()]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function sanitizeMultiline(input: unknown, maxLength = 2000): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .trim()
    .slice(0, maxLength);
}

export function validateCryptoAddress(address: string, chain: 'EVM' | 'SOL'): boolean {
  if (!address || typeof address !== 'string') return false;
  const clean = sanitizeInput(address);
  if (chain === 'EVM') {
    return /^0x[a-fA-F0-9]{40}$/.test(clean);
  }
  if (chain === 'SOL') {
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean);
  }
  return false;
}

export function validateIban(iban: string): boolean {
  if (!iban) return false;
  const clean = iban.replace(/\s+/g, '').toUpperCase();
  const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;
  return ibanRegex.test(clean);
}

export function validateSwiftBic(bic: string): boolean {
  if (!bic) return false;
  const clean = bic.replace(/\s+/g, '').toUpperCase();
  const bicRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
  return bicRegex.test(clean);
}

/** Bounds a payout amount and rejects NaN, Infinity and fractional cents. */
export function validatePayoutAmount(amount: number, min = 10, max = 50_000): boolean {
  return (
    typeof amount === 'number' &&
    Number.isFinite(amount) &&
    amount >= min &&
    amount <= max &&
    Math.round(amount * 100) === Math.round(amount * 100)
  );
}

/** Accepts only the currencies the settlement rail supports. */
export const SUPPORTED_CURRENCIES = ['USD', 'EUR', 'SAR', 'AED', 'INR', 'CNY'] as const;
export type PayoutCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export function normalizeCurrency(value: unknown): PayoutCurrency {
  const candidate = sanitizeInput(value).toUpperCase();
  return (SUPPORTED_CURRENCIES as readonly string[]).includes(candidate)
    ? (candidate as PayoutCurrency)
    : 'USD';
}

/** Constant-time-ish comparison for shared secrets. */
export function secretsMatch(provided: string | null, expected: string): boolean {
  if (!provided || !expected) return false;
  if (provided.length !== expected.length) return false;
  let mismatch = 0;
  for (let i = 0; i < provided.length; i += 1) {
    mismatch |= provided.charCodeAt(i) ^ expected.charCodeAt(i);
  }
  return mismatch === 0;
}
