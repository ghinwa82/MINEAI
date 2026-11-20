'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useI18n } from '@/lib/i18n-provider';
import { sound } from '@/lib/sound-engine';
import { supportCopy, type SupportIntent } from '@/lib/support-i18n';
import { useUid } from '@/lib/use-uid';

/**
 * The 24/7 support chat.
 *
 * Messages go to `/api/ai/support`, which answers with a live model when a key
 * exists and with the deterministic multilingual knowledge base otherwise. The
 * browser never learns which path ran; it only renders the reply. Quick topics
 * stay one tap away for visitors who do not know what to type.
 */

const SHARE: Record<
  string,
  { title: string; body: string; links: [string, string][]; boost: string }
> = {
  en: {
    title: 'Share and get +15% speed',
    body: 'Post your mining link on any channel. Your cloud power runs 15% faster for 24 hours — once per day.',
    links: [['WhatsApp', 'whatsapp'], ['Telegram', 'telegram'], ['X', 'x'], ['Facebook', 'facebook'], ['LinkedIn', 'linkedin'], ['Copy link', 'copy']],
    boost: 'Boost armed: +15% hashrate',
  },
  ar: {
    title: 'شارك واحصل على سرعة +15%',
    body: 'انشر رابط التعدين على أي قناة. تزيد سرعة السحابة 15% لمدة 24 ساعة — مرة واحدة يوميًا.',
    links: [['واتساب', 'whatsapp'], ['تيليجرام', 'telegram'], ['إكس', 'x'], ['فيسبوك', 'facebook'], ['لينكدإن', 'linkedin'], ['نسخ الرابط', 'copy']],
    boost: 'المضاعف نشط: +15% قوة',
  },
  fr: {
    title: 'Partagez et gagnez +15 % de vitesse',
    body: 'Publiez votre lien de minage sur n’importe quel canal. Votre puissance cloud est 15 % plus rapide pendant 24 h — une fois par jour.',
    links: [['WhatsApp', 'whatsapp'], ['Telegram', 'telegram'], ['X', 'x'], ['Facebook', 'facebook'], ['LinkedIn', 'linkedin'], ['Copier le lien', 'copy']],
    boost: 'Bonus actif : +15 % de hashrate',
  },
  es: {
    title: 'Comparte y gana +15% de velocidad',
    body: 'Publica tu enlace de minería en cualquier canal. Tu potencia en la nube va 15% más rápido durante 24 horas, una vez al día.',
    links: [['WhatsApp', 'whatsapp'], ['Telegram', 'telegram'], ['X', 'x'], ['Facebook', 'facebook'], ['LinkedIn', 'linkedin'], ['Copiar enlace', 'copy']],
    boost: 'Bono activo: +15% de hashrate',
  },
  zh: {
    title: '分享即可获得 +15% 速度',
    body: '把挖矿链接分享到任意渠道，云算力速度提升 15%，持续 24 小时——每天一次。',
    links: [['WhatsApp', 'whatsapp'], ['Telegram', 'telegram'], ['X', 'x'], ['Facebook', 'facebook'], ['LinkedIn', 'linkedin'], ['复制链接', 'copy']],
    boost: '加成已生效：+15% 算力',
  },
  hi: {
    title: 'शेयर करें और +15% गति पाएँ',
    body: 'अपना माइनिंग लिंक किसी भी चैनल पर पोस्ट करें। 24 घंटे तक क्लाउड पावर 15% तेज़ चलती है — दिन में एक बार।',
    links: [['WhatsApp', 'whatsapp'], ['Telegram', 'telegram'], ['X', 'x'], ['Facebook', 'facebook'], ['LinkedIn', 'linkedin'], ['लिंक कॉपी करें', 'copy']],
    boost: 'बोनस सक्रिय: +15% हैशरेट',
  },
};

interface Message {
  id: number;
  role: 'user' | 'bot';
  text: string;
}

const TOPICS: Array<Extract<SupportIntent, 'register' | 'mining' | 'plans' | 'payment' | 'withdraw' | 'security'>> = [
  'register',
  'mining',
  'plans',
  'payment',
  'withdraw',
  'security',
];

export default function SupportChat({ dense = false }: { dense?: boolean }) {
  const { lang, href } = useI18n();
  const copy = useMemo(() => supportCopy(lang), [lang]);
  const share = SHARE[lang] ?? SHARE.en;
  const uid = useUid();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [boosted, setBoosted] = useState(false);
  const [copied, setCopied] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ id: Date.now(), role: 'bot', text: copy.answers.hello }]);
  }, [copy]);

  useEffect(() => {
    const node = listRef.current;
    if (node) node.scrollTop = node.scrollHeight;
  }, [messages, busy]);

  const send = async (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || busy) return;
    setInput('');
    const history = messages
      .filter((message) => message.text.length > 0)
      .slice(-6)
      .map((message) => ({
        role: message.role === 'user' ? ('user' as const) : ('assistant' as const),
        content: message.text.slice(0, 900),
      }));
    setMessages((previous) => [...previous, { id: Date.now(), role: 'user', text }]);
    setBusy(true);
    sound.click();
    try {
      const response = await fetch('/api/ai/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lang, uid: uid ?? undefined, history }),
      });
      const payload = (await response.json()) as { reply?: string };
      setMessages((previous) => [
        ...previous,
        { id: Date.now() + 1, role: 'bot', text: payload.reply ?? copy.answers.fallback },
      ]);
      sound.chime();
    } catch {
      setMessages((previous) => [
        ...previous,
        { id: Date.now() + 1, role: 'bot', text: copy.answers.human },
      ]);
      sound.error();
    } finally {
      setBusy(false);
    }
  };

  /**
   * Share-to-Boost from the support surface. Same six channels as the mining
   * console; the first successful share of the day arms the server-side 24h
   * window, and the panel only reports what the ledger says.
   */
  const shareTo = async (channel: string) => {
    const url = `${window.location.origin}${href('/mining')}?ref=${encodeURIComponent(uid ?? '')}`;
    const text = 'MineAI — zero-electricity cloud mining';
    const encodedUrl = encodeURIComponent(url);
    const encodedText = encodeURIComponent(text);
    try {
      if (channel === 'copy') {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        setCopied(true);
        window.setTimeout(() => setCopied(false), 2000);
      } else {
        const targets: Record<string, string> = {
          whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
          telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
          x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
          linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
        };
        window.open(targets[channel], '_blank', 'noopener,noreferrer');
      }
    } catch {
      // Popup blocked: the boost is still requested, server decides.
    }

    if (uid) {
      try {
        await fetch('/api/mining', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'share-boost', uid }),
        });
        setBoosted(true);
      } catch {
        setBoosted(false);
      }
    }
    sound.coin();
  };

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-amber/20 bg-[linear-gradient(150deg,rgba(212,175,55,0.08),rgba(8,13,24,0.97)_55%)] ${
        dense ? '' : 'mb-10'
      }`}
    >
      <div className={`border-b border-white/8 ${dense ? 'p-4' : 'p-6 sm:p-7'}`}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-ink">{copy.title}</h2>
            {dense ? null : (
              <p className="mt-2 max-w-2xl text-[0.82rem] leading-relaxed text-ink-mute">{copy.lead}</p>
            )}
          </div>
          <span className="mx-chip !border-mint/40 !text-mint">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
            </span>
            24/7
          </span>
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {TOPICS.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => send(copy.topics[topic])}
              disabled={busy}
              className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[0.7rem] text-ink-mute transition hover:border-amber/40 hover:text-amber disabled:opacity-50"
            >
              {copy.topics[topic]}
            </button>
          ))}
        </div>
      </div>

      <div
        ref={listRef}
        role="log"
        aria-live="polite"
        className={`space-y-3 overflow-y-auto ${dense ? 'max-h-64 p-4' : 'max-h-80 p-6 sm:p-7'}`}
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <p
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[0.82rem] leading-relaxed ${
                message.role === 'user'
                  ? 'bg-[linear-gradient(100deg,#E2C275,#fff3b0)] font-medium text-[#120d02]'
                  : 'border border-white/8 bg-[#050507]/80 text-ink-soft'
              }`}
            >
              {message.text}
            </p>
          </div>
        ))}
        {busy ? (
          <div className="flex justify-start">
            <p className="rounded-2xl border border-white/8 bg-[#050507]/80 px-4 py-2.5 text-[0.8rem] text-ink-faint">
              {copy.thinking}…
            </p>
          </div>
        ) : null}
      </div>

      <form
        onSubmit={(event) => {
          event.preventDefault();
          void send();
        }}
        className="flex flex-wrap items-center gap-2 border-t border-white/8 p-4 sm:p-5"
      >
        <label htmlFor="support-input" className="sr-only">
          {copy.placeholder}
        </label>
        <input
          id="support-input"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={copy.placeholder}
          maxLength={600}
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#050507]/80 px-4 py-2.5 text-[0.85rem] text-ink outline-none transition placeholder:text-ink-faint focus:border-amber/50"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length === 0}
          className="mx-btn !px-5 !py-2.5 !text-[0.8rem] disabled:opacity-50"
        >
          {copy.send}
        </button>
      </form>

      <div className={`border-t border-white/8 ${dense ? 'px-4 py-3' : 'px-6 py-4'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[0.78rem] font-semibold text-amber">{share.title}</p>
          {boosted ? <span className="mx-numeric text-[0.66rem] text-mint">{share.boost}</span> : null}
        </div>
        <p className="mt-1 max-w-2xl text-[0.68rem] leading-relaxed text-ink-faint">{share.body}</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {share.links.map(([label, channel]) => (
            <button
              key={channel}
              type="button"
              onClick={() => {
                void shareTo(channel);
              }}
              className="rounded-lg border border-white/12 bg-white/[0.03] px-2.5 py-1.5 text-[0.68rem] font-semibold text-ink-soft transition hover:border-amber/45 hover:text-amber"
            >
              {channel === 'copy' && copied ? '✓' : label}
            </button>
          ))}
        </div>
      </div>

      <p className={`border-t border-white/8 text-[0.66rem] leading-relaxed text-ink-faint ${dense ? 'px-4 py-2.5' : 'px-6 py-3'}`}>
        {copy.disclaimer}
      </p>
    </section>
  );
}
