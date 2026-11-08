import React from 'react';

export default function Logo() {
  return (
    <div className="flex items-center gap-3 cursor-pointer select-none group">
      {/* Bespoke Geometric DePIN Hexagon Core */}
      <div className="relative w-11 h-11 flex items-center justify-center">
        {/* Animated Glow Halo */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-emerald-400 opacity-60 blur-md group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 animate-pulse" />
        
        {/* Core Shield Vector */}
        <div className="relative w-10 h-10 rounded-xl bg-slate-950/90 border border-cyan-400/50 backdrop-blur-md flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <svg
            className="w-6 h-6 text-cyan-400 transition-transform duration-500 group-hover:rotate-180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
          {/* Micro Orbit Pulse */}
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
        </div>
      </div>

      {/* Brand Typography */}
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5">
          <span className="text-xl font-black tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-white via-cyan-100 to-cyan-400">
            MineAI
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full font-mono font-bold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            NODE
          </span>
        </div>
        <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 group-hover:text-cyan-300 transition-colors">
          DePIN AI Agent Network
        </span>
      </div>
    </div>
  );
}