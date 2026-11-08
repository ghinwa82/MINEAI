'use client';

import React, { useState } from 'react';
import { SupportedLanguage } from '@/types';
import { translations } from '@/lib/i18n';

interface ProfitVaultProps {
  currentLang: SupportedLanguage;
}

export default function ProfitVault({ currentLang }: ProfitVaultProps) {
  const t = translations[currentLang];
  const [fiatAmount, setFiatAmount] = useState('250.00');
  const [accountHolder, setAccountHolder] = useState('Dr. Alex Wright');
  const [iban, setIban] = useState('GB29NWBK60161331926819');
  const [swift, setSwift] = useState('NWBKGB2L');
  const [bankName, setBankName] = useState('Barclays International Clearing');
  const [currency, setCurrency] = useState<'USD' | 'EUR' | 'SAR' | 'AED' | 'INR' | 'CNY'>('USD');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const handleBankPayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMessage(t.payoutProcessing);

    try {
      const res = await fetch('/api/payout/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accountHolder,
          ibanOrAccountNumber: iban,
          swiftBic: swift,
          bankName,
          fiatAmount,
          currency
        })
      });

      const data = await res.json();
      if (res.ok) {
        setStatusMessage(`${t.payoutSuccess} • Reference: ${data.transactionId}`);
      } else {
        setStatusMessage(`Validation Error: ${data.error}`);
      }
    } catch {
      setStatusMessage('Network failure contacting payout gateway');
    } finally {
      setLoading(false);
    }
  };

  const handleStripePurchase = async () => {
    try {
      const res = await fetch('/api/checkout/stripe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier: 'Enterprise Node Hashpower 100MH/s', amountUsd: 149.00 })
      });
      const data = await res.json();
      if (data.checkoutUrl) {
        window.open(data.checkoutUrl, '_blank');
      }
    } catch {
      alert('Stripe Gateway connection issue');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Column: Stripe & Crypto Deposit Options */}
      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl">
          <h3 className="text-xl font-black text-white mb-2">{t.vaultDepositCard}</h3>
          <p className="text-xs text-slate-400 mb-6 font-mono">
            Directly scale your mining node compute hashrate with international credit/debit cards.
          </p>
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between mb-4">
            <div>
              <div className="font-bold text-white text-sm">Enterprise Node Hashpower Boost</div>
              <div className="text-xs font-mono text-cyan-400 mt-1">+100.0 MH/s Tier • 30 Days</div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-white font-mono">$149.00</div>
              <button
                onClick={handleStripePurchase}
                className="mt-2 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition-colors"
              >
                Pay with Stripe
              </button>
            </div>
          </div>
        </div>

        {/* Web3 Settlement Terminal */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl">
          <h3 className="text-xl font-black text-white mb-2">{t.vaultCryptoReceiver}</h3>
          <p className="text-xs text-slate-400 mb-4 font-mono">
            Direct Cryptographic settlement to multi-chain treasury wallets.
          </p>
          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">SOL Treasury: </span>
              <span className="text-cyan-300 break-all select-all">
                MineAi7kX4hUeP98wYQvE1zR8sL7mM5nP6qD3fB2aC1
              </span>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400">EVM (ETH/USDT): </span>
              <span className="text-emerald-300 break-all select-all">
                0x71C94b6e5fD8C618bF72088820B88c3a9f0B3e12
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column: International Bank Payout Terminal */}
      <div className="rounded-3xl border border-cyan-500/30 bg-slate-900/60 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <h3 className="text-xl font-black text-white mb-2 flex items-center gap-2">
          <span>🏦</span> {t.vaultBankPayout}
        </h3>
        <p className="text-xs text-slate-400 mb-6 font-mono">
          Withdraw accumulated mining profits straight into your local or international bank account.
        </p>

        <form onSubmit={handleBankPayout} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Account Holder Full Name</label>
            <input
              type="text"
              required
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">IBAN / Account Number</label>
              <input
                type="text"
                required
                value={iban}
                onChange={(e) => setIban(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">SWIFT / BIC Code</label>
              <input
                type="text"
                required
                value={swift}
                onChange={(e) => setSwift(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-slate-400 mb-1">Bank Name & Branch</label>
            <input
              type="text"
              required
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Payout Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as typeof currency)}
                aria-label="Payout Currency"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-cyan-300 font-mono focus:border-cyan-400 focus:outline-none"
              >
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="SAR">SAR (ر.س)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="INR">INR (₹)</option>
                <option value="CNY">CNY (¥)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Transfer Amount</label>
              <input
                type="number"
                step="0.01"
                required
                value={fiatAmount}
                onChange={(e) => setFiatAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:border-cyan-400 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black tracking-wider uppercase text-sm transition-all duration-300 shadow-lg shadow-emerald-900/30 disabled:opacity-50"
          >
            {loading ? t.payoutProcessing : t.executePayout}
          </button>
        </form>

        {statusMessage && (
          <div className="mt-4 p-4 rounded-xl bg-slate-950 border border-cyan-500/40 text-xs font-mono text-cyan-300 text-center animate-fade-in">
            {statusMessage}
          </div>
        )}
      </div>
    </div>
  );
}