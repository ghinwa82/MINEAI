'use client';

import React from 'react';

import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';
import AiSupportWidget from './AiSupportWidget';
import { useI18n } from '@/lib/i18n-provider';

/**
 * Shared page frame: skip link, chrome, content well and footer.
 */
export default function PageShell({
  children,
  width = 'wide',
}: {
  children: React.ReactNode;
  width?: 'wide' | 'reading' | 'full';
}) {
  const { t } = useI18n();

  const maxWidth =
    width === 'reading' ? 'max-w-3xl' : width === 'full' ? 'max-w-[84rem]' : 'max-w-[84rem]';

  return (
    <div className="relative flex min-h-dvh flex-col">
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:start-4 focus:z-50 focus:rounded-lg focus:bg-cyan-400 focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-[#04060d]"
      >
        {t.common.skipToContent}
      </a>
      <SiteHeader />
      <main id="content" className={`mx-auto w-full ${maxWidth} flex-1 px-4 pb-20 sm:px-6 lg:px-8`}>
        {children}
      </main>
      <SiteFooter />
      <AiSupportWidget />
    </div>
  );
}
