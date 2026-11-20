'use client';

import React, { useEffect, useRef } from 'react';

/**
 * The cinematic layer behind every page.
 *
 * Three aurora bodies drift on their own timers while a pointer-driven light
 * tracks the cursor. The result reacts to the visitor without ever catching
 * a click — the whole stack sits at a negative z-index with pointer events
 * disabled.
 */
export default function CinematicBackdrop() {
  const rootRef = useRef<HTMLDivElement>(null);
  const pointer = useRef({ x: 0.5, y: 0.4 });
  const eased = useRef({ x: 0.5, y: 0.4 });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let frame = 0;

    const onPointerMove = (event: PointerEvent) => {
      pointer.current = {
        x: event.clientX / Math.max(window.innerWidth, 1),
        y: event.clientY / Math.max(window.innerHeight, 1),
      };
    };

    const render = () => {
      // Critically-damped follow so the light trails the cursor instead of
      // snapping to it.
      eased.current.x += (pointer.current.x - eased.current.x) * 0.045;
      eased.current.y += (pointer.current.y - eased.current.y) * 0.045;

      root.style.setProperty('--mx-pointer-x', `${(eased.current.x * 100).toFixed(2)}%`);
      root.style.setProperty('--mx-pointer-y', `${(eased.current.y * 100).toFixed(2)}%`);

      frame = window.requestAnimationFrame(render);
    };

    if (!reduceMotion.matches) {
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      frame = window.requestAnimationFrame(render);
    } else {
      root.style.setProperty('--mx-pointer-x', '50%');
      root.style.setProperty('--mx-pointer-y', '35%');
    }

    return () => {
      window.removeEventListener('pointermove', onPointerMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={
        {
          '--mx-pointer-x': '50%',
          '--mx-pointer-y': '35%',
        } as React.CSSProperties
      }
    >
      {/* Base wash */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_-10%,#141118_0%,#0a0a0e_46%,#050507_100%)]" />

      {/* Drifting aurora bodies — one warm smoke, one imperial emerald */}
      <div className="absolute -top-[22%] left-[6%] h-[46vw] w-[46vw] rounded-full bg-[radial-gradient(circle,rgba(226,194,117,0.16),transparent_62%)] blur-[90px] animate-[mx-drift_26s_ease-in-out_infinite]" />
      <div className="absolute right-[2%] top-[28%] h-[40vw] w-[40vw] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.13),transparent_64%)] blur-[100px] animate-[mx-drift-alt_34s_ease-in-out_infinite]" />
      <div className="absolute bottom-[-18%] left-[26%] h-[38vw] w-[38vw] rounded-full bg-[radial-gradient(circle,rgba(20,17,24,0.95),transparent_66%)] blur-[110px] animate-[mx-drift_44s_ease-in-out_infinite_reverse]" />

      {/* Pointer-tracked light */}
      <div
        className="absolute h-[34vw] w-[34vw] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(255,241,193,0.10),transparent_66%)] blur-[80px]"
        style={{ left: 'var(--mx-pointer-x)', top: 'var(--mx-pointer-y)' }}
      />

      {/* Blueprint grid */}
      <div className="absolute inset-0 opacity-[0.55] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_25%,#000_20%,transparent_80%)] bg-[linear-gradient(to_right,rgba(226,194,117,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(226,194,117,0.05)_1px,transparent_1px)] bg-[size:72px_72px]" />

      {/* Horizon line */}
      <div className="absolute inset-x-0 top-[38%] h-px bg-gradient-to-r from-transparent via-[#e2c275]/14 to-transparent" />

      {/* Vignette + grain */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(5,5,7,0.78)_100%)]" />
      <div className="mx-grain absolute inset-0 opacity-[0.22] mix-blend-overlay" />
    </div>
  );
}
