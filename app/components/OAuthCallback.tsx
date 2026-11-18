'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';
import { sound } from '@/lib/sound-engine';

/**
 * The OAuth landing pad.
 *
 * Supabase redirects here with the session in the URL fragment. The fragment is
 * read once, exchanged for an HttpOnly cookie, and then wiped from the address
 * bar with `history.replaceState` so it never lands in a referrer or a
 * screenshot. Every failure explains itself in the visitor's language.
 */

const COPY: Record<string, { working: string; done: string; failed: string; retry: string; home: string }> = {
  en: { working: 'Completing secure sign-in…', done: 'Signed in. Opening your console…', failed: 'That sign-in could not be completed.', retry: 'Try again', home: 'Back to home' },
  ar: { working: 'جارٍ إتمام تسجيل الدخول الآمن…', done: 'تم تسجيل الدخول. نفتح لوحتك…', failed: 'تعذّر إتمام تسجيل الدخول.', retry: 'حاول مرة أخرى', home: 'العودة للرئيسية' },
  fr: { working: 'Connexion sécurisée en cours…', done: 'Connecté. Ouverture de votre console…', failed: 'Cette connexion n’a pas pu aboutir.', retry: 'Réessayer', home: 'Retour à l’accueil' },
  es: { working: 'Completando el inicio de sesión seguro…', done: 'Sesión iniciada. Abriendo tu consola…', failed: 'No se pudo completar ese inicio de sesión.', retry: 'Intentar de nuevo', home: 'Volver al inicio' },
  zh: { working: '正在完成安全登录…', done: '已登录，正在打开控制台…', failed: '无法完成该登录。', retry: '重试', home: '返回首页' },
  hi: { working: 'सुरक्षित साइन-इन पूरा हो रहा है…', done: 'साइन इन हो गया। कंसोल खुल रहा है…', failed: 'वह साइन-इन पूरा नहीं हो सका।', retry: 'फिर कोशिश करें', home: 'होम पर लौटें' },
};

type Phase = 'working' | 'done' | 'failed';

export default function OAuthCallback() {
  const { lang, href } = useI18n();
  const copy = COPY[lang] ?? COPY.en;
  const [phase, setPhase] = useState<Phase>('working');
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function finish() {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''));

      const providerError = params.get('error_description') ?? hash.get('error_description') ?? params.get('error');
      if (providerError) {
        if (cancelled) return;
        setDetail(providerError.replace(/_/g, ' '));
        setPhase('failed');
        sound.error();
        return;
      }

      const accessToken = hash.get('access_token');
      const refreshToken = hash.get('refresh_token');
      window.history.replaceState(null, '', window.location.pathname);

      if (!accessToken || !refreshToken) {
        if (cancelled) return;
        setPhase('failed');
        sound.error();
        return;
      }

      try {
        const response = await fetch('/api/auth/oauth/session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ accessToken, refreshToken }),
        });
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        if (cancelled) return;
        if (!response.ok) {
          setDetail(payload.error ?? null);
          setPhase('failed');
          sound.error();
          return;
        }
        setPhase('done');
        sound.chime();
        window.setTimeout(() => {
          window.location.replace(href('/mining'));
        }, 650);
      } catch {
        if (cancelled) return;
        setPhase('failed');
        sound.error();
      }
    }

    void finish();
    return () => {
      cancelled = true;
    };
  }, [href]);

  return (
    <div className="mx-auto flex min-h-[52vh] max-w-lg items-center justify-center py-16">
      <section className="w-full rounded-[1.5rem] border border-white/10 bg-[#080d18] p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-amber/30 bg-amber/[0.08]">
          {phase === 'failed' ? (
            <span aria-hidden className="text-2xl text-rose-300">×</span>
          ) : (
            <span
              aria-hidden
              className={`h-7 w-7 rounded-full border-2 border-amber/25 ${
                phase === 'done' ? 'border-t-mint' : 'animate-spin border-t-amber'
              }`}
            />
          )}
        </div>
        <h1 className="mt-6 text-lg font-semibold text-ink">
          {phase === 'failed' ? copy.failed : phase === 'done' ? copy.done : copy.working}
        </h1>
        {detail ? <p className="mt-3 text-[0.78rem] leading-relaxed text-ink-faint">{detail}</p> : null}
        {phase === 'failed' ? (
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={href('/login')} className="mx-btn">
              {copy.retry}
            </Link>
            <Link href={href('/')} className="mx-btn-quiet">
              {copy.home}
            </Link>
          </div>
        ) : null}
      </section>
    </div>
  );
}
