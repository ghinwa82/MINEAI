'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'framer-motion';

import { useI18n } from '@/lib/i18n-provider';
import { sound } from '@/lib/sound-engine';
import MineAICoinLogo from './MineAICoinLogo';

/**
 * The member console.
 *
 * The single place a signed-in operator lands. It reads the live session from
 * `/api/auth/session` — never from local storage — so a spent or revoked cookie
 * bounces straight back to the sign-in screen instead of showing a stale name.
 */

interface Member {
  uid: string;
  email: string;
  verified: boolean;
  totpEnabled: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

interface Copy {
  eyebrow: string;
  title: string;
  lead: string;
  operator: string;
  since: string;
  lastSeen: string;
  security: string;
  verified: string;
  pending: string;
  enabled: string;
  disabled: string;
  mining: string;
  plans: string;
  securityCta: string;
  signOut: string;
  signingOut: string;
  loading: string;
  expired: string;
  integrity: string;
  integrityBody: string;
  source: string;
  sourceSupabase: string;
  sourceLocal: string;
}

const COPY: Record<string, Copy> = {
  en: {
    eyebrow: 'Operator console', title: 'Your mesh, in one place', lead: 'Everything tied to this session: identity, security posture and a straight route back into the reactor.',
    operator: 'Operator ID', since: 'Member since', lastSeen: 'Last sign-in', security: 'Security',
    verified: 'Email verified', pending: 'Email unconfirmed', enabled: 'Two-factor on', disabled: 'Two-factor off',
    mining: 'Open the mining terminal', plans: 'Compare compute plans', securityCta: 'Account security', signOut: 'Sign out', signingOut: 'Signing out…',
    loading: 'Reading your session…', expired: 'That session has expired. Sign in again.',
    integrity: 'Session integrity', integrityBody: 'The session lives in an HttpOnly cookie, is renewed on every read and cannot be read by page scripts. Signing out spends it immediately.',
    source: 'Identity source', sourceSupabase: 'Managed identity provider', sourceLocal: 'Sealed local account',
  },
  ar: {
    eyebrow: 'لوحة المشغّل', title: 'شبكتك في مكان واحد', lead: 'كل ما يتصل بهذه الجلسة: الهوية، والوضع الأمني، وطريق مباشر إلى المفاعل.',
    operator: 'معرّف المشغّل', since: 'عضو منذ', lastSeen: 'آخر دخول', security: 'الأمان',
    verified: 'البريد موثّق', pending: 'البريد غير مؤكّد', enabled: 'التحقق بخطوتين مفعّل', disabled: 'التحقق بخطوتين متوقف',
    mining: 'افتح محطة التعدين', plans: 'قارن خطط الحوسبة', securityCta: 'أمان الحساب', signOut: 'تسجيل الخروج', signingOut: 'جارٍ الخروج…',
    loading: 'جارٍ قراءة جلستك…', expired: 'انتهت صلاحية الجلسة. سجّل الدخول مرة أخرى.',
    integrity: 'سلامة الجلسة', integrityBody: 'تعيش الجلسة في كوكي HttpOnly، وتُجدَّد عند كل قراءة، ولا تستطيع سكربتات الصفحة قراءتها. تسجيل الخروج يستهلكها فورًا.',
    source: 'مصدر الهوية', sourceSupabase: 'مزوّد هوية مُدار', sourceLocal: 'حساب محلي مختوم',
  },
  fr: {
    eyebrow: 'Console opérateur', title: 'Votre maillage, au même endroit', lead: 'Tout ce qui dépend de cette session : identité, posture de sécurité et retour direct vers le réacteur.',
    operator: 'Identifiant opérateur', since: 'Membre depuis', lastSeen: 'Dernière connexion', security: 'Sécurité',
    verified: 'E-mail vérifié', pending: 'E-mail non confirmé', enabled: 'Double facteur actif', disabled: 'Double facteur inactif',
    mining: 'Ouvrir le terminal de minage', plans: 'Comparer les offres de calcul', securityCta: 'Sécurité du compte', signOut: 'Se déconnecter', signingOut: 'Déconnexion…',
    loading: 'Lecture de votre session…', expired: 'Cette session a expiré. Reconnectez-vous.',
    integrity: 'Intégrité de session', integrityBody: 'La session vit dans un cookie HttpOnly, est renouvelée à chaque lecture et reste illisible pour les scripts de page. La déconnexion la consomme immédiatement.',
    source: 'Source d’identité', sourceSupabase: 'Fournisseur d’identité géré', sourceLocal: 'Compte local scellé',
  },
  es: {
    eyebrow: 'Consola de operador', title: 'Tu malla, en un solo lugar', lead: 'Todo lo que depende de esta sesión: identidad, postura de seguridad y una ruta directa al reactor.',
    operator: 'ID de operador', since: 'Miembro desde', lastSeen: 'Último acceso', security: 'Seguridad',
    verified: 'Correo verificado', pending: 'Correo sin confirmar', enabled: 'Doble factor activo', disabled: 'Doble factor inactivo',
    mining: 'Abrir la terminal de minería', plans: 'Comparar planes de cómputo', securityCta: 'Seguridad de la cuenta', signOut: 'Cerrar sesión', signingOut: 'Cerrando sesión…',
    loading: 'Leyendo tu sesión…', expired: 'Esa sesión ha caducado. Inicia sesión de nuevo.',
    integrity: 'Integridad de la sesión', integrityBody: 'La sesión vive en una cookie HttpOnly, se renueva en cada lectura y los scripts de la página no pueden leerla. Cerrar sesión la consume al instante.',
    source: 'Origen de identidad', sourceSupabase: 'Proveedor de identidad gestionado', sourceLocal: 'Cuenta local sellada',
  },
  zh: {
    eyebrow: '运营控制台', title: '你的算力网格，一处掌握', lead: '与此会话相关的一切：身份、安全状态，以及直达反应堆的入口。',
    operator: '运营者编号', since: '注册时间', lastSeen: '上次登录', security: '安全',
    verified: '邮箱已验证', pending: '邮箱未确认', enabled: '两步验证已开启', disabled: '两步验证已关闭',
    mining: '打开挖矿终端', plans: '对比算力方案', securityCta: '账户安全', signOut: '退出登录', signingOut: '正在退出…',
    loading: '正在读取会话…', expired: '该会话已过期，请重新登录。',
    integrity: '会话完整性', integrityBody: '会话保存在 HttpOnly Cookie 中，每次读取都会续期，页面脚本无法读取。退出登录会立即作废该会话。',
    source: '身份来源', sourceSupabase: '托管身份提供方', sourceLocal: '本地密封账户',
  },
  hi: {
    eyebrow: 'ऑपरेटर कंसोल', title: 'आपका मेश, एक ही जगह', lead: 'इस सत्र से जुड़ी हर चीज़: पहचान, सुरक्षा स्थिति और रिएक्टर तक सीधा रास्ता।',
    operator: 'ऑपरेटर आईडी', since: 'सदस्यता आरंभ', lastSeen: 'पिछला साइन-इन', security: 'सुरक्षा',
    verified: 'ईमेल सत्यापित', pending: 'ईमेल अपुष्ट', enabled: 'दो-चरण सत्यापन चालू', disabled: 'दो-चरण सत्यापन बंद',
    mining: 'माइनिंग टर्मिनल खोलें', plans: 'कंप्यूट प्लान की तुलना करें', securityCta: 'खाता सुरक्षा', signOut: 'साइन आउट', signingOut: 'साइन आउट हो रहा है…',
    loading: 'आपका सत्र पढ़ा जा रहा है…', expired: 'यह सत्र समाप्त हो गया। फिर से साइन इन करें।',
    integrity: 'सत्र की अखंडता', integrityBody: 'सत्र HttpOnly कुकी में रहता है, हर बार पढ़े जाने पर नवीनीकृत होता है और पेज स्क्रिप्ट उसे पढ़ नहीं सकती। साइन आउट उसे तुरंत समाप्त कर देता है।',
    source: 'पहचान स्रोत', sourceSupabase: 'प्रबंधित पहचान प्रदाता', sourceLocal: 'सीलबंद स्थानीय खाता',
  },
};

function stamp(value: string | null, lang: string): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch {
    return date.toISOString().slice(0, 16).replace('T', ' ');
  }
}

export default function MemberConsole() {
  const { lang, href } = useI18n();
  const copy = COPY[lang] ?? COPY.en;
  const reduce = useReducedMotion();
  const [member, setMember] = useState<Member | null>(null);
  const [source, setSource] = useState<'supabase' | 'local' | null>(null);
  const [phase, setPhase] = useState<'loading' | 'ready' | 'expired'>('loading');
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const response = await fetch('/api/auth/session', { cache: 'no-store' });
        const payload = (await response.json().catch(() => ({}))) as {
          member?: Member;
          source?: 'supabase' | 'local';
        };
        if (cancelled) return;
        if (!response.ok || !payload.member) {
          setPhase('expired');
          return;
        }
        setMember(payload.member);
        setSource(payload.source ?? null);
        setPhase('ready');
      } catch {
        if (!cancelled) setPhase('expired');
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = useCallback(async () => {
    setSigningOut(true);
    sound.click();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // The cookie is spent server-side; a network failure still leaves the tab
      // in a state where reloading asks for a password again.
    }
    window.location.replace(href('/login'));
  }, [href]);

  if (phase === 'loading') {
    return (
      <div className="py-24 text-center text-sm text-ink-mute">{copy.loading}</div>
    );
  }

  if (phase === 'expired' || !member) {
    return (
      <div className="mx-auto max-w-lg py-20 text-center">
        <p className="text-sm text-ink-mute">{copy.expired}</p>
        <Link href={href('/login')} className="mx-btn mt-6">
          {copy.securityCta}
        </Link>
      </div>
    );
  }

  const tiles = [
    { label: copy.operator, value: member.uid, mono: true },
    { label: copy.since, value: stamp(member.createdAt, lang) },
    { label: copy.lastSeen, value: stamp(member.lastLoginAt, lang) },
    { label: copy.source, value: source === 'supabase' ? copy.sourceSupabase : copy.sourceLocal },
  ];

  return (
    <div className="py-14">
      <div className="grid gap-12 lg:grid-cols-[1.25fr_0.75fr] lg:items-start lg:gap-16">
        <div>
          <p className="mx-eyebrow">{copy.eyebrow}</p>
          <h1 className="mx-display mt-4 text-3xl sm:text-4xl">{copy.title}</h1>
          <p className="mx-lede mt-4 max-w-xl">{copy.lead}</p>

          <div className="mt-6 flex flex-wrap items-center gap-2">
            <span className={`mx-chip ${member.verified ? 'text-mint' : 'text-amber'}`}>
              {member.verified ? copy.verified : copy.pending}
            </span>
            <span className={`mx-chip ${member.totpEnabled ? 'text-mint' : 'text-ink-mute'}`}>
              {member.totpEnabled ? copy.enabled : copy.disabled}
            </span>
            <span className="mx-chip text-ink-mute">{member.email}</span>
          </div>

          <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/8 sm:grid-cols-2">
            {tiles.map((tile, index) => (
              <motion.div
                key={tile.label}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="bg-[#070c17] p-5"
              >
                <p className="text-[0.62rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">{tile.label}</p>
                <p className={`mt-2 text-[0.86rem] text-ink ${tile.mono ? 'font-mono break-all' : ''}`}>{tile.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={href('/mining')} className="mx-btn">
              {copy.mining}
            </Link>
            <Link href={href('/store')} className="mx-btn-quiet">
              {copy.plans}
            </Link>
            <Link href={href('/dashboard/security')} className="mx-btn-quiet">
              {copy.securityCta}
            </Link>
            <button type="button" onClick={() => void signOut()} disabled={signingOut} className="mx-btn-quiet">
              {signingOut ? copy.signingOut : copy.signOut}
            </button>
          </div>
        </div>

        <aside className="rounded-[1.5rem] border border-white/10 bg-[#080d18] p-7">
          <div className="mx-auto w-fit">
            <MineAICoinLogo size={168} />
          </div>
          <h2 className="mt-6 text-sm font-semibold text-ink">{copy.integrity}</h2>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.integrityBody}</p>
        </aside>
      </div>
    </div>
  );
}
