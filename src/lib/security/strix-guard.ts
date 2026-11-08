/**
 * Strix AI Defensive Security Guard
 * Shields enterprise DePIN APIs from injection, malformed banking inputs, and malicious payloads.
 */

export class StrixGuard {
  /**
   * Validates International Bank Account Number (IBAN) format
   */
  public static validateIBAN(iban: string): boolean {
    if (!iban || typeof iban !== 'string') return false;
    const clean = iban.replace(/\s+/g, '').toUpperCase();
    const ibanRegex = /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/;
    return ibanRegex.test(clean);
  }

  /**
   * Validates SWIFT/BIC banking identifier
   */
  public static validateSWIFT(swift: string): boolean {
    if (!swift || typeof swift !== 'string') return false;
    const clean = swift.replace(/\s+/g, '').toUpperCase();
    const swiftRegex = /^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/;
    return swiftRegex.test(clean);
  }

  /**
   * Sanitizes generic string inputs against XSS, script injection, and SQLi
   */
  public static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    return input
      .replace(/[<>'"`;()]/g, '')
      .replace(/javascript:/gi, '')
      .trim();
  }

  /**
   * Validates EVM (Ethereum) or Solana blockchain public keys
   */
  public static validateCryptoAddress(address: string, chain: 'EVM' | 'SOL'): boolean {
    if (!address || typeof address !== 'string') return false;
    const clean = this.sanitizeInput(address);
    if (chain === 'EVM') {
      return /^0x[a-fA-F0-9]{40}$/.test(clean);
    }
    if (chain === 'SOL') {
      return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(clean);
    }
    return false;
  }

  /**
   * Validates fiat withdrawal amounts against safety bounds
   */
  public static validatePayoutAmount(amount: number, min = 10, max = 50000): boolean {
    return typeof amount === 'number' && !isNaN(amount) && amount >= min && amount <= max;
  }
}

// Standalone exports to ensure backward compatibility across all imports
export const validateIBAN = StrixGuard.validateIBAN;
export const validateSWIFT = StrixGuard.validateSWIFT;
export const sanitizeInput = StrixGuard.sanitizeInput;
export const validateCryptoAddress = StrixGuard.validateCryptoAddress;
export const validatePayoutAmount = StrixGuard.validatePayoutAmount;

export default StrixGuard;