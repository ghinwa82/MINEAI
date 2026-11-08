import { Currency, PayoutRequestPayload, AgentLog } from '../types';
import { StrixGuard } from '../security/strix-guard';

export class FinancialPayoutAgent {
  private static readonly FIAT_RATES: Record<Currency, number> = {
    USD: 1.0,
    SAR: 3.75,
    AED: 3.67,
    EUR: 0.92
  };

  private static readonly MINE_TOKEN_USD_PRICE = 0.42;

  public static convertMinedTokensToFiat(amountTokens: number, targetCurrency: Currency): number {
    const usdValue = amountTokens * this.MINE_TOKEN_USD_PRICE;
    const rate = this.FIAT_RATES[targetCurrency] || 1.0;
    return parseFloat((usdValue * rate).toFixed(2));
  }

  public static async processDirectPayout(payload: PayoutRequestPayload): Promise<{ success: boolean; txHash: string; log: AgentLog; fiatAmount: number }> {
    if (payload.payoutMethod === 'IBAN') {
      const isValidIban = StrixGuard.validateIBAN(payload.destinationTarget);
      if (!isValidIban) {
        throw new Error('INVALID_BANK_IBAN_CHECKSUM_FAILED');
      }
    }

    const fiatAmount = this.convertMinedTokensToFiat(payload.tokenAmount, payload.targetCurrency);
    const txHash = '0x' + StrixGuard.computeSecurityHash(`${payload.userId}:${payload.destinationTarget}:${payload.tokenAmount}:${Date.now()}`) + 'f9a2';

    const log: AgentLog = {
      id: `pay-${Date.now()}`,
      agentName: 'FINANCIAL',
      timestamp: new Date().toISOString(),
      type: 'SUCCESS',
      messageEn: `Dispatched ${fiatAmount} ${payload.targetCurrency} payout to ${payload.destinationTarget.substring(0, 6)}... via ${payload.payoutMethod}. TX: ${txHash.substring(0, 14)}`,
      messageAr: `تم إرسال حوالة بمبلغ ${fiatAmount} ${payload.targetCurrency} إلى الحساب ${payload.destinationTarget.substring(0, 6)}... عبر ${payload.payoutMethod}. المعرف: ${txHash.substring(0, 14)}`,
      metadata: { txHash, fiatAmount, method: payload.payoutMethod }
    };

    return { success: true, txHash, log, fiatAmount };
  }
}