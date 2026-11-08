'use client';

import React, { useState } from 'react';

interface WithdrawModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
  onSuccess: (newBalance: number) => void;
}

export function WithdrawModal({ isOpen, onClose, currentBalance, onSuccess }: WithdrawModalProps) {
  const [amount, setAmount] = useState<string>('100.00');
  const [method, setMethod] = useState<'stripe_connect' | 'crypto_ledger'>('stripe_connect');
  const [destination, setDestination] = useState<string>('acct_stripe_depin_vault');
  const [currency, setCurrency] = useState<'USD' | 'USDT' | 'SOL' | 'ETH'>('USD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successReceipt, setSuccessReceipt] = useState<{ txHash: string; netAmount: number } | null>(null);

  if (!isOpen) return null;

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessReceipt(null);
    setIsSubmitting(true);

    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setErrorMsg('Please specify a positive withdrawal amount.');
      setIsSubmitting(false);
      return;
    }

    if (numericAmount > currentBalance) {
      setErrorMsg(`Amount exceeds your available treasury ($${currentBalance.toFixed(2)}).`);
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numericAmount,
          method,
          destination,
          currency,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'Withdrawal route declined.');
      } else {
        setSuccessReceipt({
          txHash: data.transaction.txHash,
          netAmount: data.transaction.netAmount,
        });
        onSuccess(data.updatedTreasuryBalance);
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network communication error with gateway.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-[#0b111a] border border-cyan-500/40 rounded-2xl p-6 shadow-2xl shadow-cyan-500/10">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <h3 className="text-lg font-bold text-white tracking-wide">
              Production Payout Gateway
            </h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Zero-delay fiat & crypto ledger settlement via Strix-verified smart routers.
          </p>
        </div>

        {successReceipt ? (
          <div className="p-4 bg-emerald-950/40 border border-emerald-500/50 rounded-xl text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-2xl">
              ✓
            </div>
            <h4 className="text-sm font-bold text-emerald-300">Transfer Successful</h4>
            <p className="text-xs text-zinc-300">
              Net Amount of <span className="font-mono font-bold text-white">${successReceipt.netAmount.toFixed(2)} {currency}</span> has been routed immediately.
            </p>
            <div className="p-2 bg-black/60 rounded text-[10px] font-mono text-zinc-400 break-all border border-emerald-900/40">
              TX Hash: {successReceipt.txHash}
            </div>
            <button
              onClick={() => {
                setSuccessReceipt(null);
                onClose();
              }}
              className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-bold rounded-lg transition-colors cursor-pointer"
            >
              Done & Return to Terminal
            </button>
          </div>
        ) : (
          <form onSubmit={handleWithdraw} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-950/50 border border-rose-500/40 rounded-lg text-xs text-rose-300 flex items-center gap-2">
                <span>⚠</span>
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Treasury Balance Banner */}
            <div className="flex items-center justify-between p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl">
              <span className="text-xs text-zinc-400">Available in Treasury</span>
              <span className="text-sm font-mono font-bold text-cyan-300">${currentBalance.toFixed(2)} USD</span>
            </div>

            {/* Amount Input */}
            <div>
              <div className="flex justify-between text-xs text-zinc-400 mb-1">
                <span>Withdraw Amount (USD)</span>
                <button
                  type="button"
                  onClick={() => setAmount(currentBalance.toFixed(2))}
                  className="text-cyan-400 hover:underline text-[11px]"
                >
                  Max All (${currentBalance.toFixed(2)})
                </button>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-sm">$</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max={currentBalance}
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full pl-7 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                  required
                />
              </div>
            </div>

            {/* Method Choice */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Settlement Route</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setMethod('stripe_connect');
                    setCurrency('USD');
                    setDestination('acct_stripe_depin_vault');
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                    method === 'stripe_connect'
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span>Stripe Connect Bank</span>
                  <span className="text-[10px] text-zinc-400 font-mono">1.5% Fiat Wire Fee</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMethod('crypto_ledger');
                    setCurrency('USDT');
                    setDestination('0x742d35Cc6634C0532925a3b844Bc454e4438f44e');
                  }}
                  className={`py-2 px-3 text-xs font-semibold rounded-lg border flex flex-col items-center justify-center gap-1 transition-all ${
                    method === 'crypto_ledger'
                      ? 'bg-cyan-950/70 border-cyan-400 text-cyan-200'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <span>Crypto Ledger Vault</span>
                  <span className="text-[10px] text-zinc-400 font-mono">0.8% Gas Route Fee</span>
                </button>
              </div>
            </div>

            {/* Destination Address */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1">
                {method === 'stripe_connect' ? 'Stripe Account / Direct IBAN' : 'Web3 Ledger Wallet Address'}
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
                required
              />
            </div>

            {/* Execute Button */}
            <button
              type="submit"
              disabled={isSubmitting || currentBalance <= 0}
              className="w-full py-2.5 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-black font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/20 active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Sanitizing & Transmitting Funds...</span>
                </>
              ) : (
                <span>Execute Immediate Transfer</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}