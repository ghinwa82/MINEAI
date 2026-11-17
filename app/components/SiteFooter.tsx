'use client';

import React from 'react';
import Link from 'next/link';

import Logo from './Logo';
import { useI18n } from '@/lib/i18n-provider';
import { getLegalCopy } from '@/lib/legal-i18n';
import { LANGUAGE_CODES, LANGUAGES } from '@/lib/languages';

export default function SiteFooter() {
  const { t, lang, eco, href: to, setLang } = useI18n();
  const legal = getLegalCopy(lang);

  const links = [
    { href: '/', label: t.nav.home },
    { href: '/store', label: eco.nav.plans },
    { href: '/mining', label: eco.nav.mining },
    { href: '/markets', label: eco.nav.markets },
    { href: '/news', label: eco.nav.news },
    { href: '/insights', label: eco.nav.insights },
    { href: '/rewards', label: eco.nav.rewards },
    { href: '/contact', label: eco.nav.support },
    { href: '/notes', label: t.nav.notes },
  ];

  const legalLinks = [
    { href: '/terms', label: legal.nav.terms },
    { href: '/privacy', label: legal.nav.privacy },
    { href: '/refund-policy', label: legal.nav.refund },
    { href: '/contact', label: legal.nav.contact },
  ];

  return (
    <footer className="relative mt-24 border-t border-white/8 bg-[#04060d]/80">
      <div className="mx-auto w-full max-w-[84rem] px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
          <div className="max-w-md">
            <Logo showTagline={false} />
            <p className="mt-5 text-sm leading-relaxed text-ink-mute">{t.footer.tagline}</p>
            <p className="mt-5 inline-flex items-center gap-2 text-xs text-ink-faint">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              {t.footer.status}
            </p>
          </div>

          <div>
            <h2 className="mx-eyebrow">{t.footer.navTitle}</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={to(link.href)}
                    className="text-sm text-ink-mute transition hover:text-cyan"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="mx-eyebrow">{t.footer.legalTitle}</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {legalLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={to(link.href)}
                    className="text-sm text-ink-mute transition hover:text-amber"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <a
                  href={`mailto:${legal.common.supportEmail}`}
                  className="text-sm text-ink-faint transition hover:text-amber"
                >
                  {legal.common.supportEmail}
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h2 className="mx-eyebrow">{t.language.label}</h2>
            <ul className="mt-5 grid grid-cols-2 gap-2">
              {LANGUAGE_CODES.map((code) => (
                <li key={code}>
                  <button
                    type="button"
                    onClick={() => setLang(code)}
                    aria-current={code === lang ? 'true' : undefined}
                    className={`w-full rounded-lg border px-3 py-1.5 text-start text-[0.78rem] transition ${
                      code === lang
                        ? 'border-cyan-400/45 bg-cyan-400/10 text-cyan'
                        : 'border-white/8 text-ink-mute hover:border-white/20 hover:text-ink'
                    }`}
                    dir={LANGUAGES[code].dir}
                  >
                    {LANGUAGES[code].native}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mx-rule my-10" />

        <div className="flex flex-col items-start justify-between gap-3 text-xs text-ink-faint sm:flex-row sm:items-center">
          <p>
            © {new Date().getFullYear()} {t.brand.name} {t.brand.product}. {t.footer.rights}
          </p>
          <p className="mx-font-mono tracking-[0.12em] uppercase">{t.brand.network}</p>
        </div>
      </div>
    </footer>
  );
}
