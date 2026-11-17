import { ImageResponse } from 'next/og';

/**
 * Social card for the news desk.
 *
 * Rendered at request time by Next's image runtime so every share of
 * /news — from X, Telegram, WhatsApp or Facebook — unfurls into a card that
 * matches the gold-on-black page rather than a generic screenshot.
 */

export const alt = 'MineAI Node — live world news, gold, markets and crypto';
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
            'radial-gradient(circle at 82% 12%, rgba(212,175,55,0.30), transparent 46%), radial-gradient(circle at 8% 92%, rgba(34,224,255,0.16), transparent 42%), #05070d',
          color: '#f2f7ff',
          fontFamily: 'Georgia, serif',
        }}
      >
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
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 22, letterSpacing: 8, color: '#D4AF37' }}>MINEAI NODE</span>
            <span style={{ fontSize: 15, letterSpacing: 4, color: '#93a6c4' }}>
              LIVE INTELLIGENCE DESK
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <span style={{ fontSize: 20, letterSpacing: 6, color: '#ff6b81' }}>
            ● BREAKING · REFRESHED EVERY 5 MIN
          </span>
          <span
            style={{
              fontSize: 66,
              lineHeight: 1.06,
              fontWeight: 700,
              letterSpacing: -1.5,
              maxWidth: 980,
            }}
          >
            World news, gold, markets and crypto — as it breaks
          </span>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          {['XAU / GOLD', 'BTC', 'ETH', 'SOL', 'USD / EGP', '$MINEAI'].map((label) => (
            <div
              key={label}
              style={{
                display: 'flex',
                padding: '10px 20px',
                borderRadius: 999,
                border: '1px solid rgba(212,175,55,0.45)',
                background: 'rgba(212,175,55,0.08)',
                color: '#FFF3B0',
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
