import { notFound } from 'next/navigation';

import { LANGUAGES, LANGUAGE_CODES } from '@/lib/languages';
import type { SupportedLanguage } from '@/types';

export const dynamicParams = false;

/**
 * Localised route tree.
 *
 * English lives at the root of every path; the other five languages sit
 * under a locale segment so each one has its own crawlable URL. The locale
 * is validated here and the document language and direction are written
 * before the first paint so RTL pages never flash an LTR layout.
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
      {children}
    </>
  );
}
