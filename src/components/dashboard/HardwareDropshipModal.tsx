'use client';

import React, { useState } from 'react';
import { useMineStore } from '@/lib/store/use-mine-store';
import { translations } from '@/lib/i18n/translations';
import { DropshipSupplyService } from '@/lib/dropship/dropship-service';
import { X, Box, Check } from 'lucide-react';

export const HardwareDropshipModal: React.FC = () => {
  const { isDropshipModalOpen, setDropshipModalOpen, locale, currency, addAgentLog } = useMineStore();
  const t = translations[locale];
  const products = DropshipSupplyService.CATALOG;

  const [selectedProduct, setSelectedProduct] = useState(products[0].id);
  const [shippingName, setShippingName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [isOrdering, setIsOrdering] = useState(false);
  const [orderComplete, setOrderComplete] = useState<string | null>(null);

  if (!isDropshipModalOpen) return null;

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsOrdering(true);

    try {
      const response = await fetch('/api/ecommerce/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'usr-node-owner-992',
          productId: selectedProduct,
          quantity: 1,
          shippingFullName: shippingName,
          shippingAddressLine: shippingAddress,
          shippingCity: shippingCity,
          shippingCountry: 'Saudi Arabia',
          shippingPhone: shippingPhone,
          currency,
          timestamp: Date.now()
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addAgentLog(data.log);
      setOrderComplete(data.orderTracking);
      setTimeout(() => {
        setOrderComplete(null);
        setDropshipModalOpen(false);
      }, 3500);
    } catch {
      alert('Failed to transmit order to factory endpoint.');
    } finally {
      setIsOrdering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl bg-surfaceCard border border-borderDark p-6 shadow-2xl overflow-y-auto max-h-[90vh]">
        <button
          onClick={() => setDropshipModalOpen(false)}
          className="absolute top-4 right-4 rtl:left-4 rtl:right-auto text-gray-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-2">
          <Box className="w-5 h-5 text-neonPurple" />
          <h3 className="text-base font-bold text-white">{t.dropshipTitle}</h3>
        </div>
        <p className="text-xs text-gray-400 mb-4">{t.dropshipSubtitle}</p>

        {orderComplete ? (
          <div className="p-4 rounded-xl bg-neonGreen/10 border border-neonGreen/30 text-neonGreen text-xs space-y-2 text-center">
            <Check className="w-6 h-6 mx-auto" />
            <p className="font-bold">Dropship Factory Order Placed!</p>
            <p className="font-mono text-gray-300">Tracking: {orderComplete}</p>
          </div>
        ) : (
          <form onSubmit={handleOrderSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs text-gray-300 font-medium block">Select Compute Rig</label>
              {products.map((p) => (
                <div
                  key={p.id}
                  onClick={() => setSelectedProduct(p.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedProduct === p.id
                      ? 'bg-neonPurple/10 border-neonPurple text-white'
                      : 'bg-surface/50 border-borderDark text-gray-400'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs font-bold mb-1">
                    <span>{locale === 'ar' ? p.nameAr : p.nameEn}</span>
                    <span className="text-neonCyan font-mono">${p.retailPriceUsd} USD</span>
                  </div>
                  <p className="text-[11px] text-gray-400">{locale === 'ar' ? p.descriptionAr : p.descriptionEn}</p>
                  <div className="flex gap-3 text-[10px] font-mono text-gray-500 mt-2">
                    <span>⚡ {p.powerWatts}W</span>
                    <span>⛏️ {p.hashrateCapacityMhs} MH/s</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="Abdullah Al-Saud"
                  value={shippingName}
                  onChange={(e) => setShippingName(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-borderDark text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="+966 50 123 4567"
                  value={shippingPhone}
                  onChange={(e) => setShippingPhone(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-borderDark text-xs text-white outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">City</label>
                <input
                  type="text"
                  required
                  placeholder="Riyadh"
                  value={shippingCity}
                  onChange={(e) => setShippingCity(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-borderDark text-xs text-white outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] text-gray-400 mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  placeholder="King Fahd Road, Dist 4"
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-surface border border-borderDark text-xs text-white outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isOrdering}
              className="w-full py-2.5 rounded-xl bg-neonPurple hover:bg-purple-600 text-white font-bold text-xs shadow-lg transition-all disabled:opacity-50"
            >
              {isOrdering ? 'Dispatching Order...' : t.orderHardwareAction}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};