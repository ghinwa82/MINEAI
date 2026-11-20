import type { MetadataRoute } from 'next';

import { siteUrl } from '@/lib/schema';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MineAI Node — Autonomous DePIN Compute',
    short_name: 'MineAI Node',
    description:
      'A decentralised compute mesh whose resident agent workforce handles product intelligence, fulfilment and cross-border settlement.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#050507',
    theme_color: '#E2C275',
    categories: ['business', 'productivity', 'finance'],
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    shortcuts: [
      { name: 'Node store', url: '/store' },
      { name: 'Field notes', url: '/notes' },
    ],
  };
}

export { siteUrl };
