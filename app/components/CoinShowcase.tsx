'use client';

import React, { useEffect, useMemo, useState } from 'react';

import Link from 'next/link';

import { useI18n } from '@/lib/i18n-provider';

/**
 * The mined-asset showcase.
 *
 * Eight assets share one dashboard. Selecting a coin shows its live print,
 * 24-hour move and a short sparkline. $MINEAI is labelled as an internal utility
 * index because it is not listed on a DEX yet; the other seven carry the real
 * source the market feed reported. Copy is plain language in all six locales.
 */

interface Quote {
  symbol: string;
  name: string;
  category: string;
  price: number;
  changePercent: number;
  currency: string;
  spark: number[];
  source: string;
}

const COINS: Array<{ symbol: string; label: string }> = [
  { symbol: 'MINEAI', label: '$MINEAI' },
  { symbol: 'BTC-USD', label: 'Bitcoin' },
  { symbol: 'ETH-USD', label: 'Ethereum' },
  { symbol: 'SOL-USD', label: 'Solana' },
  { symbol: 'BNB-USD', label: 'BNB' },
  { symbol: 'TON11419-USD', label: 'Toncoin' },
  { symbol: 'DOGE-USD', label: 'Dogecoin' },
  { symbol: 'LTC-USD', label: 'Litecoin' },
];

const COPY: Record<
  string,
  {
    eyebrow: string;
    title: string;
    lead: string;
    change: string;
    mine: string;
    cta: string;
    note: string;
    live: string;
    cached: string;
    internal: string;
    loading: string;
  }
> = {
  en: {
    eyebrow: 'One dashboard',
    title: 'Mine eight assets from one place',
    lead: 'Pick a coin to see its live price. Every plan pays in $MINEAI, and you decide where the value goes.',
    change: '24h change',
    mine: 'Select a coin',
    cta: 'Start free mining',
    note: 'Prices come from the live market feed with a short cache. $MINEAI is an internal utility index, not a listed market price.',
    live: 'Live',
    cached: 'Cached',
    internal: 'Internal index',
    loading: 'Loading live prices',
  },
  ar: {
    eyebrow: 'لوحة واحدة',
    title: 'عدّن ثمانية أصول من مكان واحد',
    lead: 'اختر عملة لترى سعرها المباشر. كل خطة تدفع بـ $MINEAI، وأنت تقرر أين تذهب القيمة.',
    change: 'تغير 24 ساعة',
    mine: 'اختر عملة',
    cta: 'ابدأ التعدين المجاني',
    note: 'الأسعار من تغذية السوق المباشرة مع تخزين قصير. $MINEAI مؤشر داخلي وليس سعر سوق مدرج.',
    live: 'مباشر',
    cached: 'مخزّن',
    internal: 'مؤشر داخلي',
    loading: 'جارٍ تحميل الأسعار',
  },
  fr: {
    eyebrow: 'Un seul tableau de bord',
    title: 'Minez huit actifs au même endroit',
    lead: 'Choisissez une pièce pour voir son prix en direct. Chaque offre paie en $MINEAI et vous décidez où va la valeur.',
    change: 'Variation 24 h',
    mine: 'Choisir une pièce',
    cta: 'Commencer le minage gratuit',
    note: 'Les prix viennent du flux de marché en direct avec un court cache. $MINEAI est un indice interne, pas un prix coté.',
    live: 'En direct',
    cached: 'En cache',
    internal: 'Indice interne',
    loading: 'Chargement des prix',
  },
  es: {
    eyebrow: 'Un solo panel',
    title: 'Mina ocho activos desde un mismo lugar',
    lead: 'Elige una moneda para ver su precio en vivo. Cada plan paga en $MINEAI y tú decides a dónde va el valor.',
    change: 'Cambio 24 h',
    mine: 'Elige una moneda',
    cta: 'Empezar minería gratis',
    note: 'Los precios vienen del flujo de mercado en vivo con un caché corto. $MINEAI es un índice interno, no un precio cotizado.',
    live: 'En vivo',
    cached: 'En caché',
    internal: 'Índice interno',
    loading: 'Cargando precios',
  },
  zh: {
    eyebrow: '一个面板',
    title: '在一个地方挖八种资产',
    lead: '选择一种币查看实时价格。每个套餐都用 $MINEAI 支付，价值去向由你决定。',
    change: '24 小时变化',
    mine: '选择币种',
    cta: '开始免费挖矿',
    note: '价格来自实时市场数据并有短暂缓存。$MINEAI 是内部效用指数，不是交易所挂牌价格。',
    live: '实时',
    cached: '缓存',
    internal: '内部指数',
    loading: '正在加载价格',
  },
  hi: {
    eyebrow: 'एक डैशबोर्ड',
    title: 'एक जगह से आठ संपत्तियाँ माइन करें',
    lead: 'किसी भी सिक्के को चुनें और उसकी लाइव कीमत देखें। हर प्लान $MINEAI में भुगतान करता है, और मूल्य कहाँ जाएगा यह आप तय करते हैं।',
    change: '24 घंटे बदलाव',
    mine: 'सिक्का चुनें',
    cta: 'मुफ़्त माइनिंग शुरू करें',
    note: 'कीमतें लाइव मार्केट फ़ीड से आती हैं और थोड़ी देर कैश रहती हैं। $MINEAI एक आंतरिक इंडेक्स है, लिस्टेड बाज़ार कीमत नहीं।',
    live: 'लाइव',
    cached: 'कैश',
    internal: 'आंतरिक इंडेक्स',
    loading: 'कीमतें लोड हो रही हैं',
  },
};

function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) return '—';
  const digits = value >= 1000 ? 0 : value >= 10 ? 2 : value >= 1 ? 3 : 5;
  return `$${value.toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits,
  })}`;
}

function sparkPath(points: number[]): string {
  if (points.length < 2) return '';
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  return points
    .map((point, index) => {
      const x = (index / (points.length - 1)) * 120;
      const y = 34 - ((point - min) / span) * 30;
      return `${index === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

export default function CoinShowcase() {
  const { lang } = useI18n();
  const copy = COPY[lang] ?? COPY.en;
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selected, setSelected] = useState('MINEAI');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const response = await fetch('/api/markets', { cache: 'no-store' });
        if (!response.ok) return;
        const payload = (await response.json()) as { quotes?: Quote[] };
        if (!cancelled) setQuotes(payload.quotes ?? []);
      } catch {
        // A failed poll leaves the last good print on screen.
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const timer = window.setInterval(load, 60_000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  const bySymbol = useMemo(() => new Map(quotes.map((quote) => [quote.symbol, quote])), [quotes]);
  const active = bySymbol.get(selected) ?? null;
  const prefix = lang === 'en' ? '' : `/${lang}`;
  const up = (active?.changePercent ?? 0) >= 0;

  return (
    <section className="border-t border-white/8 py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mx-eyebrow">{copy.eyebrow}</p>
          <h2 className="mx-section-title mt-4">{copy.title}</h2>
          <p className="mt-4 max-w-xl text-[0.9rem] leading-relaxed text-ink-mute">{copy.lead}</p>
        </div>
        <Link href={`${prefix}/mining`} className="mx-btn-quiet !py-2.5 !text-[0.78rem]">
          {copy.cta}
        </Link>
      </div>

      <div className="mt-9 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
          {COINS.map((coin) => {
            const quote = bySymbol.get(coin.symbol);
            const isActive = coin.symbol === selected;
            const coinUp = (quote?.changePercent ?? 0) >= 0;
            return (
              <button
                key={coin.symbol}
                type="button"
                onClick={() => setSelected(coin.symbol)}
                aria-pressed={isActive}
                className={`rounded-xl border px-3 py-3 text-start transition ${
                  isActive
                    ? 'border-amber/45 bg-amber/[0.07]'
                    : 'border-white/8 bg-[#080d18]/70 hover:border-white/20'
                }`}
              >
                <span className="block text-[0.72rem] font-bold text-ink">{coin.label}</span>
                <span className="mx-numeric mt-1 block text-[0.72rem] text-ink-soft">
                  {quote ? formatPrice(quote.price) : '—'}
                </span>
                <span
                  className={`mx-numeric mt-0.5 block text-[0.6rem] ${coinUp ? 'text-mint' : 'text-rose'}`}
                >
                  {quote ? `${coinUp ? '+' : ''}${quote.changePercent.toFixed(2)}%` : ''}
                </span>
              </button>
            );
          })}
        </div>

        <div className="rounded-2xl border border-white/10 bg-[linear-gradient(150deg,rgba(255,197,92,0.06),rgba(8,13,24,0.97)_58%)] p-5 sm:p-6">
          {active ? (
            <>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.6rem] tracking-[0.16em] text-ink-faint uppercase">{copy.mine}</p>
                  <p className="mt-1 text-lg font-bold text-ink">
                    {COINS.find((coin) => coin.symbol === active.symbol)?.label ?? active.name}
                  </p>
                </div>
                <span className="mx-chip !py-1 !text-[0.58rem]">
                  {active.source === 'internal' ? copy.internal : active.source === 'cached' ? copy.cached : copy.live}
                </span>
              </div>

              <p className="mx-numeric mt-4 text-3xl font-bold text-ink sm:text-4xl">{formatPrice(active.price)}</p>
              <p className={`mx-numeric mt-1.5 text-[0.8rem] ${up ? 'text-mint' : 'text-rose'}`}>
                {up ? '+' : ''}
                {active.changePercent.toFixed(2)}% · {copy.change}
              </p>

              <svg viewBox="0 0 120 36" className="mt-4 h-10 w-full" role="img" aria-label={active.name}>
                <path
                  d={sparkPath(active.spark)}
                  fill="none"
                  stroke={up ? '#34D399' : '#fb7185'}
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>

              <p className="mt-4 text-[0.66rem] leading-relaxed text-ink-faint">{copy.note}</p>
            </>
          ) : (
            <p className="text-[0.8rem] text-ink-faint">{loading ? `${copy.loading}…` : copy.note}</p>
          )}
        </div>
      </div>
    </section>
  );
}
