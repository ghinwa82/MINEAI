/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production';

/**
 * Content Security Policy.
 *
 * The app ships a handful of inline scripts (the locale bootstrap and the
 * JSON-LD payloads), so `'unsafe-inline'` is required for scripts and styles.
 * Everything else is locked to the origins the platform actually talks to:
 * the payment processors, the public chain RPCs and Supabase. Frames are
 * limited to the hosted checkout pages so a compromised component cannot
 * iframe an arbitrary origin.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  [
    "connect-src 'self'",
    'https://api.coingecko.com',
    'https://query1.finance.yahoo.com',
    'https://api.stripe.com',
    'https://accept.paymob.com',
    'https://payments.kashier.io',
    'https://checkout.kashier.io',
    'https://api.mainnet-beta.solana.com',
    'https://bsc-dataseed.binance.org',
    'https://arb1.arbitrum.io',
    'https://ethereum-rpc.publicnode.com',
    'https://api.trongrid.io',
    'https://tonapi.io',
    'https://blockstream.info',
    'https://*.supabase.co',
    'wss://*.supabase.co',
  ].join(' '),
  "frame-src 'self' https://accept.paymob.com https://*.kashier.io https://checkout.stripe.com https://js.stripe.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self' https://accept.paymob.com https://*.kashier.io https://checkout.stripe.com",
  "frame-ancestors 'none'",
  'upgrade-insecure-requests',
].join('; ');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // The repository lives inside a larger directory; pin the bundler root so
  // stray lockfiles above the project are never picked up.
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      { source: '/favicon.ico', destination: '/icon.svg' },
      { source: '/apple-touch-icon.png', destination: '/icon.svg' },
      { source: '/apple-touch-icon-precomposed.png', destination: '/icon.svg' },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-DNS-Prefetch-Control', value: 'off' },
          { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(self)' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/icon.svg',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
    ];
  },
};

export default nextConfig;
