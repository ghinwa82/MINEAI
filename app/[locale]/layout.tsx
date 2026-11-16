import { notFound } from 'next/navigation';

import JsonLd from '../components/JsonLd';
import { LANGUAGES, LANGUAGE_CODES } from '@/lib/languages';
import { webSiteSchema } from '@/lib/schema';
import type { SupportedLanguage } from '@/types';

/**
 * Nested locale layout.
 *
 * The root layout already owns `<html>` and `<body>`, so this layout only
 * has to (a) validate the locale and (b) write the correct `lang` and `dir`
 * onto the document element before the first paint, so RTL pages never flash
 * an LTR layout. `suppressHydrationWarning` on the root html keeps React from
 * complaining about that pre-paint mutation.
 */
export function generateStaticParams() {
  return LANGUAGE_CODES.filter((code) => code !== 'en').map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const meta = LANGUAGES[locale as SupportedLanguage];

  if (!meta || locale === 'en') {
    notFound();
  }

  const bootstrap = `document.documentElement.lang=${JSON.stringify(locale)};document.documentElement.dir=${JSON.stringify(
    meta.dir,
  )};document.documentElement.dataset.lang=${JSON.stringify(locale)};`;

  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: bootstrap }} />
      <JsonLd data={[webSiteSchema(locale as SupportedLanguage)]} />
      {children}
    </>
  );
}
