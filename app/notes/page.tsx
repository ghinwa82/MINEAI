'use client';

import React, { useState } from 'react';

type SupportedLang = 'en' | 'ar' | 'fr' | 'es' | 'zh' | 'hi';

interface NoteItem {
  id: string;
  title: string;
  category: 'Supplier' | 'Arbitrage' | 'Stripe' | 'Telemetry';
  timestamp: string;
  content: string;
}

export default function NotesPage() {
  const [lang, setLang] = useState<SupportedLang>('en');
  const isRtl = lang === 'ar';

  const [notes, setNotes] = useState<NoteItem[]>([
    {
      id: 'note-1',
      title: 'High-Margin Winning Trend: Portable Hydro-Mist Fan',
      category: 'Arbitrage',
      timestamp: 'Today, 14:22 UTC',
      content: 'Scraped 42 high-growth TikTok ad campaigns with 8.4M views. Supplier cost is $3.20 on CJ Dropshipping; currently retailing for $24.99 on Shopify. Net profit margin: 68%.',
    },
    {
      id: 'note-2',
      title: 'Stripe Instant Cashout & Off-Ramp Webhook Rules',
      category: 'Stripe',
      timestamp: 'Yesterday, 19:10 UTC',
      content: 'Payout routes connected to Stripe Connect payout ledger. Auto-settlement triggered daily at 00:00 UTC with anti-fraud zero-leak Strix encryption.',
    },
    {
      id: 'note-3',
      title: 'DePIN Compute Telemetry & Thermal Modulations',
      category: 'Telemetry',
      timestamp: '2 days ago',
      content: 'Node clusters operating at 99.98% hardware efficiency. Thermal metrics stabilized at 62°C under full multi-supplier order batch dispatch.',
    },
  ]);

  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState<'Supplier' | 'Arbitrage' | 'Stripe' | 'Telemetry'>('Arbitrage');

  const addNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const item: NoteItem = {
      id: `note-${Date.now()}`,
      title: newTitle,
      category: newCategory,
      timestamp: 'Just now',
      content: newContent,
    };

    setNotes([item, ...notes]);
    setNewTitle('');
    setNewContent('');
  };

  return (
    <div
      dir={isRtl ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: '#060913',
        minHeight: '100vh',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Top Header */}
      <header
        style={{
          borderBottom: '1px solid #1e293b',
          backgroundColor: '#0a0f1d',
          padding: '16px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 50,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#0284c7',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}
          >
            📓
          </div>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, color: '#ffffff' }}>
              Autonomous AI Strategy & Execution Notes
            </h2>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
              DePIN Dropshipping Intelligence Logs & Supplier Blueprints
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <a
            href="/store"
            style={{
              color: '#00ff88',
              backgroundColor: '#042f1a',
              border: '1px solid #00ff88',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '700',
              textDecoration: 'none',
            }}
          >
            ⚡ DePIN Store →
          </a>

          <select
            value={lang}
            onChange={(e) => {
              const selected = e.target.value as SupportedLang;
              setLang(selected);
              if (typeof document !== 'undefined') {
                document.documentElement.dir = selected === 'ar' ? 'rtl' : 'ltr';
                document.documentElement.lang = selected;
              }
            }}
            style={{
              backgroundColor: '#0f172a',
              color: '#00ff88',
              border: '1.5px solid #00ff88',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '700',
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="en">English (Default)</option>
            <option value="ar">العربية (RTL)</option>
            <option value="fr">Français</option>
            <option value="es">Español</option>
            <option value="zh">中文</option>
            <option value="hi">हिन्दी</option>
          </select>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: '1100px', margin: '0 auto', padding: '36px 20px 80px 20px' }}>
        {/* New Note Form */}
        <form
          onSubmit={addNote}
          style={{
            backgroundColor: '#0b101e',
            border: '1px solid #1e293b',
            borderRadius: '16px',
            padding: '24px',
            marginBottom: '36px',
          }}
        >
          <h3 style={{ fontSize: '16px', fontWeight: '800', color: '#00ff88', margin: '0 0 16px 0' }}>
            + Create New Strategy or Supplier Entry
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '12px' }}>
            <input
              type="text"
              placeholder="Strategy / Product Title..."
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              style={{
                backgroundColor: '#060a14',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#ffffff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <select
              value={newCategory}
              onChange={(e: any) => setNewCategory(e.target.value)}
              style={{
                backgroundColor: '#060a14',
                border: '1px solid #334155',
                borderRadius: '8px',
                padding: '10px 14px',
                color: '#38bdf8',
                fontSize: '13px',
                outline: 'none',
              }}
            >
              <option value="Arbitrage">Arbitrage & Ad Spy</option>
              <option value="Supplier">Supplier & Logistics</option>
              <option value="Stripe">Stripe & Fiat Payouts</option>
              <option value="Telemetry">Telemetry & Hashrate</option>
            </select>
          </div>
          <textarea
            placeholder="Document detailed margins, supplier links, or agent observation parameters..."
            rows={3}
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            style={{
              width: '100%',
              backgroundColor: '#060a14',
              border: '1px solid #334155',
              borderRadius: '8px',
              padding: '10px 14px',
              color: '#e2e8f0',
              fontSize: '13px',
              outline: 'none',
              marginBottom: '16px',
            }}
          />
          <button
            type="submit"
            style={{
              backgroundColor: '#00ff88',
              color: '#000000',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '13px',
              cursor: 'pointer',
            }}
          >
            Save Strategy Entry
          </button>
        </form>

        {/* Existing Notes Stream */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {notes.map((note) => (
            <div
              key={note.id}
              style={{
                backgroundColor: '#0c1222',
                border: '1px solid #1e293b',
                borderRadius: '14px',
                padding: '20px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span
                  style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    color: '#00e5ff',
                    backgroundColor: 'rgba(0, 229, 255, 0.1)',
                    border: '1px solid #00e5ff',
                    padding: '2px 8px',
                    borderRadius: '4px',
                  }}
                >
                  {note.category}
                </span>
                <span style={{ fontSize: '11px', color: '#64748b' }}>{note.timestamp}</span>
              </div>
              <h4 style={{ fontSize: '16px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0' }}>
                {note.title}
              </h4>
              <p style={{ fontSize: '13px', color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>
                {note.content}
              </p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}