import { ImageResponse } from 'next/og';

export const alt = 'MineAI Node — autonomous DePIN compute';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Social card, rendered at build time from the same design language as the
 * site itself: the compute cell, the neon sweep and a single line of copy.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: 72,
          background:
            'radial-gradient(900px 600px at 12% -10%, rgba(34,224,255,0.30), transparent 62%), radial-gradient(800px 520px at 92% 110%, rgba(74,222,159,0.26), transparent 60%), #04060d',
          color: '#f2f7ff',
          fontFamily: 'sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 22 }}>
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 22,
              border: '2px solid #22e0ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(5,8,16,0.85)',
            }}
          >
            <div
              style={{
                width: 34,
                height: 30,
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                color: '#22e0ff',
                fontSize: 30,
                fontWeight: 800,
                letterSpacing: -2,
              }}
            >
              M
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: 6 }}>MINEAI</div>
            <div style={{ fontSize: 13, letterSpacing: 5, color: '#22e0ff' }}>NODE</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22, maxWidth: 940 }}>
          <div style={{ fontSize: 62, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1.5 }}>
            Autonomous compute that keeps working after you close the tab.
          </div>
          <div style={{ fontSize: 24, color: '#93a6c4', lineHeight: 1.45 }}>
            A decentralised mesh, a resident agent workforce, and settlement to a wallet or bank account in six languages.
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {['DEPIN', '6 LANGUAGES', 'STRIPE CONNECT', 'AGENT SWARM'].map((tag) => (
            <div
              key={tag}
              style={{
                fontSize: 14,
                letterSpacing: 3,
                color: '#c7d6ee',
                border: '1px solid rgba(34,224,255,0.35)',
                borderRadius: 999,
                padding: '9px 18px',
                background: 'rgba(34,224,255,0.07)',
              }}
            >
              {tag}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}
