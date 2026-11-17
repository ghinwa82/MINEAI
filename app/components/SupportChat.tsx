'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { useI18n } from '@/lib/i18n-provider';
import { supportCopy, type SupportIntent } from '@/lib/support-i18n';

/**
 * The 24/7 support chat.
 *
 * The assistant answers from the multilingual knowledge base through
 * `/api/support`. It runs at any hour, needs no model key, and points every
 * account-specific question at a human channel. Quick topics are one tap away
 * for visitors who do not know what to type.
 */

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
  const { lang } = useI18n();
  const copy = useMemo(() => supportCopy(lang), [lang]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
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
    setMessages((previous) => [...previous, { id: Date.now(), role: 'user', text }]);
    setBusy(true);
    try {
      const response = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, lang }),
      });
      const payload = (await response.json()) as { reply?: string };
      setMessages((previous) => [
        ...previous,
        { id: Date.now() + 1, role: 'bot', text: payload.reply ?? copy.answers.fallback },
      ]);
    } catch {
      setMessages((previous) => [
        ...previous,
        { id: Date.now() + 1, role: 'bot', text: copy.answers.human },
      ]);
    } finally {
      setBusy(false);
    }
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
                  ? 'bg-[linear-gradient(100deg,#d4af37,#fff3b0)] font-medium text-[#120d02]'
                  : 'border border-white/8 bg-[#04060d]/80 text-ink-soft'
              }`}
            >
              {message.text}
            </p>
          </div>
        ))}
        {busy ? (
          <div className="flex justify-start">
            <p className="rounded-2xl border border-white/8 bg-[#04060d]/80 px-4 py-2.5 text-[0.8rem] text-ink-faint">
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
          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#04060d]/80 px-4 py-2.5 text-[0.85rem] text-ink outline-none transition placeholder:text-ink-faint focus:border-amber/50"
        />
        <button
          type="submit"
          disabled={busy || input.trim().length === 0}
          className="mx-btn !px-5 !py-2.5 !text-[0.8rem] disabled:opacity-50"
        >
          {copy.send}
        </button>
      </form>

      <p className={`border-t border-white/8 text-[0.66rem] leading-relaxed text-ink-faint ${dense ? 'px-4 py-2.5' : 'px-6 py-3'}`}>
        {copy.disclaimer}
      </p>
    </section>
  );
}
