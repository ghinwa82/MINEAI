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
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
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
