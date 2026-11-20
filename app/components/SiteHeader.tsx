'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Logo from './Logo';
import LanguageSwitcher from './LanguageSwitcher';
import SoundToggle from './SoundToggle';
import BreakingNewsTicker from './BreakingNewsTicker';
import ReferralCapture from './ReferralCapture';
import { useI18n } from '@/lib/i18n-provider';
import { getAuthCopy } from '@/lib/auth-i18n';
import { useMesh } from '@/lib/use-mesh';
import { stripLocale } from '@/lib/routes';

/**
 * Site chrome.
 *
 * A single sticky bar carrying the mark, the primary routes, the live
 * treasury position and the language control. Every route is built through the
 * locale helper, so a visitor reading French never gets thrown back to English
 * by a nav click.
 */
export default function SiteHeader() {
  const { t, lang, eco, href: to } = useI18n();
  const pathname = usePathname();
  const { state } = useMesh(20_000);
  const auth = getAuthCopy(lang);

  const routes = [
    { href: '/', label: t.nav.home },
    { href: '/mining', label: eco.nav.mining },
    { href: '/store', label: eco.nav.plans },
    { href: '/markets', label: eco.nav.markets },
    { href: '/news', label: eco.nav.news },
    { href: '/insights', label: eco.nav.insights },
    { href: '/rewards', label: eco.nav.rewards },
    { href: '/support', label: eco.nav.support },
  ];

  const current = stripLocale(pathname);
  const balance = state?.treasury.balanceUsd ?? 0;
  const activeNodes = state?.stats.activeNodes ?? 0;

  const isActive = (href: string) =>
    href === '/' ? current === '/' : current.startsWith(href);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-[#050507]/72 backdrop-blur-2xl">
      <ReferralCapture />
      <div className="mx-auto flex h-16 w-full max-w-[84rem] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav aria-label="Primary" className="hidden items-center gap-0.5 lg:flex">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={to(route.href)}
              aria-current={isActive(route.href) ? 'page' : undefined}
              className={`relative rounded-xl px-3 py-2 text-[0.82rem] font-medium transition ${
                isActive(route.href)
                  ? 'bg-gold/10 text-cyan'
                  : 'text-ink-mute hover:bg-white/5 hover:text-ink'
              }`}
            >
              {route.label}
              {isActive(route.href) ? (
                <span className="absolute inset-x-3 -bottom-px h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
              ) : null}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          <div className="hidden items-center gap-3 rounded-xl border border-white/8 bg-white/[0.03] px-3 py-1.5 sm:flex">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
            </span>
            <span className="mx-numeric text-[0.78rem] font-semibold text-ink">
              {new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(balance)}{' '}
              <span className="text-ink-faint">USD</span>
            </span>
            <span className="text-[0.65rem] text-ink-faint">
              {activeNodes}/{state?.stats.totalNodes ?? 3}
            </span>
          </div>

          <LanguageSwitcher />
          <SoundToggle />

          <Link
            href={to('/login')}
            className="hidden rounded-xl px-2.5 py-2 text-[0.78rem] font-medium text-ink-mute transition hover:text-ink lg:inline-flex"
          >
            {auth.signIn}
          </Link>

          <Link
            href={to('/register')}
            className="hidden items-center gap-1.5 rounded-xl bg-[linear-gradient(100deg,#E2C275,#FFF1C1)] px-4 py-2 text-[0.78rem] font-bold text-[#17120a] ring-1 ring-cyan-300/60 shadow-[0_10px_28px_-12px_rgba(212,175,55,0.8)] transition hover:brightness-110 sm:inline-flex"
          >
            {auth.createAccount}
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <BreakingNewsTicker />

      <nav
        aria-label="Primary mobile"
        className="flex items-center gap-1 overflow-x-auto border-t border-white/6 px-4 py-2 lg:hidden"
      >
        {routes.map((route) => (
          <Link
            key={route.href}
            href={to(route.href)}
            aria-current={isActive(route.href) ? 'page' : undefined}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-[0.78rem] font-medium transition ${
              isActive(route.href) ? 'bg-gold/12 text-cyan' : 'text-ink-mute hover:text-ink'
            }`}
          >
            {route.label}
          </Link>
        ))}
        <Link
          href={to('/login')}
          className="shrink-0 rounded-lg px-3 py-1.5 text-[0.78rem] font-medium text-ink-mute transition hover:text-ink"
        >
          {auth.signIn}
        </Link>
        <Link
          href={to('/register')}
          className="shrink-0 rounded-lg px-3 py-1.5 text-[0.78rem] font-semibold text-amber transition hover:text-[#f3d06b]"
        >
          {auth.createAccount}
        </Link>
      </nav>
    </header>
  );
}
