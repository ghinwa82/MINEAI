'use client';

import React, { useState } from 'react';
import { SupportedLanguage } from '@/types';
import { translations } from '@/lib/i18n';

interface AIChatSupportProps {
  currentLang: SupportedLanguage;
}

export default function AIChatSupport({ currentLang }: AIChatSupportProps) {
  const t = translations[currentLang];
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<{ sender: 'user' | 'agent'; text: string }[]>([
    {
      sender: 'agent',
      text: translations[currentLang].brandTagline + ' — Autonomous Support Agent online.'
    }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    const userText = query;
    setMessages((prev) => [...prev, { sender: 'user', text: userText }]);
    setQuery('');
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/agents/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userText, language: currentLang })
      });
      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: data.reply || 'System acknowledged query.' }
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'agent', text: 'Agent currently rebalancing. Try again shortly.' }
      ]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xl">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
        <h3 className="font-bold text-white text-sm">Multilingual Context Support Agent</h3>
      </div>

      <div className="space-y-3 h-48 overflow-y-auto mb-4 pr-2 font-mono text-xs">
        {messages.map((m, idx) => (
          <div
            key={idx}
            className={`p-3 rounded-2xl max-w-[85%] leading-relaxed ${
              m.sender === 'user'
                ? 'ml-auto bg-cyan-600 text-white'
                : 'mr-auto bg-slate-950 text-slate-300 border border-slate-800'
            }`}
          >
            {m.text}
          </div>
        ))}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.chatPlaceholder}
          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-xs text-white focus:border-cyan-400 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-colors disabled:opacity-50"
        >
          {t.chatSend}
        </button>
      </form>
    </div>
  );
}