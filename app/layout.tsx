import type { Metadata, Viewport } from 'next';

import './globals.css';

import CinematicBackdrop from './components/CinematicBackdrop';
import JsonLd from './components/JsonLd';
import { I18nProvider } from '@/lib/i18n-provider';
import { LANGUAGES, LANGUAGE_CODES } from '@/lib/languages';
import {
  ORGANIZATION,
  absoluteUrl,
  siteUrl,
  softwareApplicationSchema,
  webSiteSchema,
} from '@/lib/schema';

const TITLE = 'MineAI Node — Autonomous DePIN compute with a resident agent workforce';
const DESCRIPTION =
  'MineAI Node runs a decentralised compute mesh whose agent workforce scouts winning products, fulfils orders across every connected store and settles earnings to a wallet or bank account — in six languages.';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: TITLE,
    template: '%s · MineAI Node',
  },
  description: DESCRIPTION,
  applicationName: 'MineAI Node',
  generator: 'Next.js',
  authors: [{ name: 'MineAI Node' }],
  creator: 'MineAI Node',
  publisher: 'MineAI Node',
  category: 'technology',
  alternates: {
    canonical: '/',
    languages: Object.fromEntries(
      LANGUAGE_CODES.map((code) => [LANGUAGES[code].locale, absoluteUrl(`/${code === 'en' ? '' : code}`)]),
    ),
  },
  openGraph: {
    type: 'website',
    siteName: 'MineAI Node',
    title: TITLE,
    description: DESCRIPTION,
    url: siteUrl(),
    locale: LANGUAGES.en.ogLocale,
    alternateLocale: LANGUAGE_CODES.filter((code) => code !== 'en').map(
      (code) => LANGUAGES[code].ogLocale,
    ),
    images: [
      {
        url: absoluteUrl('/og.png'),
        width: 1200,
        height: 630,
        alt: 'MineAI Node — autonomous DePIN compute',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [absoluteUrl('/og.png')],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
    apple: [{ url: '/icon.svg' }],
  },
  formatDetection: { telephone: false, address: false, email: false },
};

export const viewport: Viewport = {
  themeColor: '#04060d',
  colorScheme: 'dark',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" dir="ltr" data-lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <CinematicBackdrop />
        <I18nProvider>
          <JsonLd data={[ORGANIZATION, webSiteSchema('en'), softwareApplicationSchema()]} />
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
