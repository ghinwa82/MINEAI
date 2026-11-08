'use client';

import React, { useState, useEffect } from 'react';

export default function WalletPage() {
  const [balance, setBalance] = useState<number>(15.50);
  const [totalWithdrawn, setTotalWithdrawn] = useState<number>(120.00);
  const [amount, setAmount] = useState<string>('15.00');
  const [method, setMethod] = useState<'paypal' | 'stripe_bank' | 'crypto_usdt' | 'binance_pay'>('crypto_usdt');
  const [destination, setDestination] = useState<string>('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchWallet = async () => {
    try {
      const res = await fetch('/api/wallet/withdraw');
      if (res.ok) {
        const data = await res.json();
        setBalance(data.walletBalance);
        setTotalWithdrawn(data.totalWithdrawnUsd);
      }
    } catch {
      // Keep state
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setIsSubmitting(true);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setMessage({ type: 'error', text: 'Please enter a valid withdrawal amount.' });
      setIsSubmitting(false);
      return;
    }

    if (numAmount > balance) {
      setMessage({
        type: 'error',
        text: `Requested amount ($${numAmount.toFixed(2)}) exceeds available wallet balance ($${balance.toFixed(2)}).`,
      });
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/wallet/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: numAmount,
          method,
          destination,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setMessage({ type: 'error', text: data.error || 'Withdrawal failed.' });
      } else {
        setBalance(data.updatedBalance);
        setTotalWithdrawn((prev) => prev + numAmount);
        setMessage({
          type: 'success',
          text: `Transfer Successful! $${numAmount.toFixed(2)} USD dispatched to ${destination}.`,
        });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Network communication failure.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#0b111a] border border-cyan-500/40 rounded-3xl">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider">Available Balance</span>
          <div className="text-4xl font-black font-mono text-white my-2">
            ${balance.toFixed(2)} <span className="text-xs text-zinc-500">USD</span>
          </div>
          <p className="text-xs text-zinc-400">Ready for instant payout with zero clearing delay.</p>
        </div>

        <div className="p-6 bg-[#0b111a] border border-zinc-800 rounded-3xl">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Total Paid Out to Date</span>
          <div className="text-4xl font-black font-mono text-emerald-400 my-2">
            ${totalWithdrawn.toFixed(2)} <span className="text-xs text-zinc-500">USD</span>
          </div>
          <p className="text-xs text-zinc-400">Processed across crypto and direct fiat banking.</p>
        </div>

        <div className="p-6 bg-[#0b111a] border border-zinc-800 rounded-3xl">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Payout Security Status</span>
          <div className="text-xl font-bold text-white my-2 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span>Strix Shield Active</span>
          </div>
          <p className="text-xs text-zinc-400">Protected by automated zero-leak cryptographic validation.</p>
        </div>
      </div>

      {/* Withdrawal Form */}
      <div className="p-6 sm:p-8 bg-[#0b111a] border border-zinc-800 rounded-3xl max-w-2xl mx-auto space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white">Execute Immediate Cashout</h2>
          <p className="text-xs text-zinc-400 mt-1">
            Choose your preferred payout route and transfer your earned profits directly.
          </p>
        </div>

        {message && (
          <div
            className={`p-4 rounded-xl text-xs sm:text-sm ${
              message.type === 'success'
                ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleWithdraw} className="space-y-4">
          <div>
            <div className="flex justify-between text-xs text-zinc-400 mb-1">
              <span>Withdraw Amount (USD)</span>
              <button
                type="button"
                onClick={() => setAmount(balance.toFixed(2))}
                className="text-cyan-400 hover:underline"
              >
                Withdraw Full Balance (${balance.toFixed(2)})
              </button>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-zinc-500 font-mono text-sm">$</span>
              <input
                type="number"
                step="0.01"
                min="1"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-7 pr-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1.5">Select Payout Gateway</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setMethod('crypto_usdt');
                  setDestination('TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  method === 'crypto_usdt'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="font-bold text-white">USDT (TRC-20)</div>
                <div className="text-[10px] text-zinc-500">Zero fee • 2 min delivery</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('paypal');
                  setDestination('user-payout@gmail.com');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  method === 'paypal'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="font-bold text-white">PayPal Instant</div>
                <div className="text-[10px] text-zinc-500">Direct to PayPal balance</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('stripe_bank');
                  setDestination('US89370400440532013000');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  method === 'stripe_bank'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="font-bold text-white">Bank Wire (IBAN/ACH)</div>
                <div className="text-[10px] text-zinc-500">Direct Fiat account transfer</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMethod('binance_pay');
                  setDestination('189283019');
                }}
                className={`p-3 rounded-xl border text-left text-xs transition-all ${
                  method === 'binance_pay'
                    ? 'bg-cyan-950 border-cyan-400 text-cyan-200'
                    : 'bg-zinc-950 border-zinc-800 text-zinc-400'
                }`}
              >
                <div className="font-bold text-white">Binance Pay ID</div>
                <div className="text-[10px] text-zinc-500">Instant internal transfer</div>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-400 mb-1">
              Destination Address / Account / Email
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono text-xs focus:outline-none focus:border-cyan-400"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || balance <= 0}
            className="w-full py-3 bg-gradient-to-r from-cyan-400 to-blue-500 hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 text-black font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/20 active:scale-98 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Verifying & Routing Funds...' : 'Execute Immediate Transfer'}
          </button>
        </form>
      </div>
    </div>
  );
}