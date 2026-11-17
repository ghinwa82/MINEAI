import { ImageResponse } from 'next/og';

/**
 * Social card for the market terminal.
 *
 * A shared market card should look like the terminal it came from: black
 * field, gold rule, live-symbol row. Rendered on demand so the card never
 * drifts from the brand while the numbers on the page keep moving.
 */

export const alt = 'MineAI Node — live gold, indices, forex and crypto terminal';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background:
            'radial-gradient(circle at 14% 8%, rgba(212,175,55,0.26), transparent 44%), radial-gradient(circle at 88% 88%, rgba(74,222,159,0.14), transparent 44%), #05070d',
          color: '#f2f7ff',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 999,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(140deg,#FFF3B0,#D4AF37 52%,#8a6a12)',
                color: '#241a02',
                fontSize: 34,
                fontWeight: 700,
              }}
            >
              M
            </div>
            <span style={{ fontSize: 22, letterSpacing: 8, color: '#D4AF37' }}>MINEAI NODE</span>
          </div>
          <span
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: 999,
              border: '1px solid rgba(74,222,159,0.5)',
              color: '#4ade9f',
              fontSize: 18,
              letterSpacing: 4,
            }}
          >
            ● LIVE TERMINAL
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <span style={{ fontSize: 64, lineHeight: 1.06, fontWeight: 700, letterSpacing: -1.5, maxWidth: 960 }}>
            Gold, indices, forex and crypto in one terminal
          </span>
          <span style={{ fontSize: 26, color: '#93a6c4', letterSpacing: 1 }}>
            $MINEAI · XAU/USD · BTC · ETH · SOL · USD/EGP
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {['GOLD', 'BTC', 'ETH', 'SOL', '$MINEAI', 'USD / EGP'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '12px 22px',
                borderRadius: 12,
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.04)',
                color: '#c7d6ee',
                fontSize: 20,
                letterSpacing: 2,
              }}
            >
              {label}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
