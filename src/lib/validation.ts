import { z } from 'zod';

/**
 * Boundary schemas.
 *
 * Every new API route parses its body through one of these before touching a
 * service. The schemas are strict about shape and permissive about formatting
 * (amounts arrive as numbers or numeric strings, addresses are trimmed) so a
 * legitimate client is never rejected for a cosmetic difference.
 */

const amount = z.coerce.number().finite().positive().max(100_000);

export const fiatCheckoutSchema = z.object({
  rail: z.enum(['kashier', 'paymob', 'stripe']),
  amountUsd: amount,
  currency: z.enum(['USD', 'EGP']).default('USD'),
  tier: z.string().trim().min(1).max(80),
  nodeId: z.string().trim().min(1).max(40),
  locale: z.enum(['en', 'ar', 'fr', 'es', 'zh', 'hi']).default('en'),
  email: z.string().trim().email().max(160).optional(),
});

export const cryptoIntentSchema = z.object({
  network: z.enum([
    'usdt-bep20',
    'usdt-arbitrum',
    'usdt-erc20',
    'usdt-trc20',
    'sol',
    'ton',
    'btc',
  ]),
  amountUsd: amount,
});

export const cryptoVerifySchema = z.object({
  intentId: z.string().trim().min(6).max(80),
  txHash: z.string().trim().min(32).max(140),
});

export const uidSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9_-]{8,48}$/, 'A session id must be 8–48 url-safe characters');

const miningCoin = z.enum(['mineai', 'btc', 'eth', 'sol', 'bnb', 'ton', 'doge', 'ltc']);

/** Allocation shares are percentages; they are normalised server-side. */
const allocationShare = z.coerce.number().finite().min(0).max(100);

export const miningActionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('claim-streak'), uid: uidSchema }),
  z.object({ action: z.literal('stake'), uid: uidSchema, amount }),
  z.object({ action: z.literal('unstake'), uid: uidSchema, amount }),
  z.object({
    action: z.literal('allocate'),
    uid: uidSchema,
    allocation: z
      .object({
        mineai: allocationShare.optional(),
        btc: allocationShare.optional(),
        eth: allocationShare.optional(),
        sol: allocationShare.optional(),
        bnb: allocationShare.optional(),
        ton: allocationShare.optional(),
        doge: allocationShare.optional(),
        ltc: allocationShare.optional(),
      })
      .refine((value) => Object.values(value).some((share) => (share ?? 0) > 0), {
        message: 'Allocate at least one share to a coin',
      }),
  }),
  z.object({
    action: z.literal('withdraw'),
    uid: uidSchema,
    coin: miningCoin,
    amount,
    wallet: z.string().trim().min(20).max(120),
    /** Required only once the operator has enrolled TOTP. */
    code: z.string().trim().min(6).max(12).optional(),
  }),
  z.object({ action: z.literal('apply-referral'), uid: uidSchema, code: z.string().trim().min(4).max(24) }),
  z.object({ action: z.literal('share-boost'), uid: uidSchema }),
]);

export const twoFactorSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('enroll'), uid: uidSchema }),
  z.object({ action: z.literal('verify'), uid: uidSchema, code: z.string().trim().min(6).max(12) }),
  z.object({ action: z.literal('recover'), uid: uidSchema, code: z.string().trim().min(8).max(20) }),
]);

export const withdrawalSchema = z.object({
  fiatAmount: z.coerce.number().finite().min(10).max(50_000),
  currency: z.enum(['USD', 'EUR', 'SAR', 'AED', 'INR', 'CNY']).default('USD'),
  accountHolder: z.string().trim().min(2).max(120),
  bankName: z.string().trim().min(2).max(120),
  ibanOrAccountNumber: z.string().trim().min(8).max(40),
  swiftBic: z.string().trim().min(8).max(16),
});

export type FiatCheckoutInput = z.infer<typeof fiatCheckoutSchema>;
export type CryptoIntentInput = z.infer<typeof cryptoIntentSchema>;
export type CryptoVerifyInput = z.infer<typeof cryptoVerifySchema>;
export type MiningActionInput = z.infer<typeof miningActionSchema>;
export type TwoFactorInput = z.infer<typeof twoFactorSchema>;

/** Flattens a Zod error into one human-readable sentence. */
export function describeIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join('.') || 'body'}: ${issue.message}`)
    .join('; ');
}
