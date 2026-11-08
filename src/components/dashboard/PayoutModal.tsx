'use client';

import React, { useState } from 'react';
import { useMineStore } from '@/lib/store/use-mine-store';
import { translations } from '@/lib/i18n/translations';
import { X, Landmark, CreditCard, Wallet, CheckCircle } from 'lucide-react';
import { FinancialPayoutAgent } from '@/lib/agents/payout-agent';

export const PayoutModal: React.FC = () => {
  const { isPayoutModalOpen, setPayoutModalOpen, locale, currency, tickingBalance, deductTokens, addAgentLog } = useMineStore();
  const t = translations[locale];

  const [method, setMethod] = useState<'IBAN' | 'CARD_P2P' | 'CRYPTO_WALLET'>('IBAN');
  const [destination, setDestination] = useState('');
  const [tokenAmount, setTokenAmount] = useState('500');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  if (!isPayoutModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

    const numericAmount = parseFloat(tokenAmount);

    try {
      const response = await fetch('/api/agents/payout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr-node-owner-992',
          payoutMethod: method,
          destinationTarget: destination,
          tokenAmount: numericAmount,
          targetCurrency: currency,
          timestamp: Date.now()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Payout validation failed');
      }

      deductTokens(numericAmount);
      addAgentLog(data.log);
      setFeedback(t.successPayout);
      setTimeout(() => {
        setPayoutModalOpen(false);
        setFeedback(null);
      }, 2500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Payout Error';
      setFeedback(`Error: ${errorMsg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-md rounded-2xl bg-surfaceCard border border-borderDark p-6 shadow-2xl">
        <button
          onClick={() => setPayoutModalOpen(false)}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <h3 className="text-base font-bold text-white mb-1">{t.payoutModalTitle}</h3>
        <p className="text-xs text-gray-400 mb-4 font-mono">
          {t.tickingBalance}: {tickingBalance.toFixed(2)} MINE
        </p>

        {feedback && (
          <div className="mb-4 p-3 rounded-xl bg-neonGreen/10 border border-neonGreen/30 text-neonGreen text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 flex-shrink-0" />
            <span>{feedback}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod('IBAN')}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                method === 'IBAN' ? 'bg-neonGreen/10 border-neonGreen text-neonGreen' : 'border-borderDark text-gray-400'
              }`}
            >
              <Landmark className="w-4 h-4" />
              <span>IBAN Bank</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('CARD_P2P')}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                method === 'CARD_P2P' ? 'bg-neonCyan/10 border-neonCyan text-neonCyan' : 'border-borderDark text-gray-400'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Digital Card</span>
            </button>
            <button
              type="button"
              onClick={() => setMethod('CRYPTO_WALLET')}
              className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition-all ${
                method === 'CRYPTO_WALLET' ? 'bg-neonPurple/10 border-neonPurple text-neonPurple' : 'border-borderDark text-gray-400'
              }`}
            >
              <Wallet className="w-4 h-4" />
              <span>Crypto</span>
            </button>
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">
              {method === 'IBAN' ? t.ibanLabel : method === 'CARD_P2P' ? t.cardLabel : t.cryptoWalletLabel}
            </label>
            <input
              type="text"
              required
              placeholder={method === 'IBAN' ? 'SA4420000001234567890123' : '4532XXXXXXXX1092'}
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-borderDark focus:border-neonGreen text-white text-xs font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-xs text-gray-300 mb-1">Amount (MINE Tokens)</label>
            <input
              type="number"
              min="10"
              max={Math.floor(tickingBalance)}
              required
              value={tokenAmount}
              onChange={(e) => setTokenAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-surface border border-borderDark focus:border-neonGreen text-white text-xs font-mono outline-none"
            />
            <span className="text-[11px] text-gray-400 mt-1 block">
              Estimated: <strong>{FinancialPayoutAgent.convertMinedTokensToFiat(parseFloat(tokenAmount) || 0, currency)} {currency}</strong>
            </span>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 rounded-xl bg-neonGreen hover:bg-emerald-600 text-gray-950 font-bold text-xs shadow-lg transition-all disabled:opacity-50"
          >
            {isSubmitting ? t.processing : t.processPayout}
          </button>
        </form>
      </div>
    </div>
  );
};