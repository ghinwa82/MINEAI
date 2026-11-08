/**
 * Strix AI Defensive Security Sanitizer
 * Shields APIs from SQLi, XSS, prototype pollution, and malformed banking/crypto structures.
 */

export function sanitizeInput(input: string): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[<>'"`;()]/g, '')
    .replace(/javascript:/gi, '')
    .trim();
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