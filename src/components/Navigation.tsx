'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Navigation() {
  const pathname = usePathname();
  const [balance, setBalance] = useState<number>(15.50);
  const [isMining, setIsMining] = useState<boolean>(true);

  // Live passive income accumulation
  useEffect(() => {
    const fetchTick = async () => {
      try {
        const res = await fetch('/api/mining/tick');
        if (res.ok) {
          const data = await res.json();
          if (typeof data.walletBalance === 'number') {
            setBalance(data.walletBalance);
          }
        }
      } catch {
        // Fallback local accumulation
        setBalance((prev) => Number((prev + 0.0003).toFixed(4)));
      }
    };

    fetchTick();
    const interval = setInterval(fetchTick, 4000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Mining Terminal', href: '/' },
    { label: 'Earn Cash ($)', href: '/earn', highlight: true },
    { label: 'Hardware Store', href: '/store' },
    { label: 'Wallet & Payouts', href: '/wallet' },
    { label: 'Strategies Hub', href: '/notes' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cyan-900/50 bg-[#06090e]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 flex items-center justify-center font-black text-black shadow-lg shadow-cyan-500/20">
            M
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm tracking-wider text-white">
                MINE<span className="text-cyan-400">AI</span>
              </span>
              <span className="px-1.5 py-0.2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 text-[9px] font-mono rounded-full font-bold animate-pulse">
                LIVE
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 font-mono -mt-0.5">DePIN & E-Com Yield Engine</p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center space-x-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  item.highlight
                    ? 'text-amber-300 bg-amber-500/10 border border-amber-500/30 hover:bg-amber-500/20 shadow-sm shadow-amber-500/10'
                    : active
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60 shadow-sm shadow-cyan-500/10'
                    : 'text-zinc-300 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Live Earning Balance & Cashout Button */}
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end px-3 py-1 bg-zinc-950 border border-cyan-500/30 rounded-xl">
            <span className="text-[9px] uppercase font-mono tracking-wider text-cyan-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Live Earning Balance
            </span>
            <span className="text-sm font-black font-mono text-cyan-300">
              ${balance.toFixed(2)} <span className="text-[10px] text-zinc-500">USD</span>
            </span>
          </div>

          <Link
            href="/wallet"
            className="px-3.5 py-2 text-xs font-bold text-black bg-gradient-to-r from-cyan-400 to-blue-400 hover:from-cyan-300 hover:to-blue-300 rounded-xl shadow-md shadow-cyan-500/20 active:scale-95 transition-all flex items-center gap-1.5"
          >
            <span>Cash Out</span>
            <span>⚡</span>
          </Link>
        </div>
      </div>
    </header>
  );
}