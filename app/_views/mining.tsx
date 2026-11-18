'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from 'next/link';

import MineAICoinLogo from '../components/MineAICoinLogo';
import MiningReactor from '../components/MiningReactor';
import PayoutTicker from '../components/PayoutTicker';
import { useI18n } from '@/lib/i18n-provider';
import { useUid } from '@/lib/use-uid';

/**
 * The mining console.
 *
 * A position accrues every second against rented edge capacity — no hardware
 * and no power draw. Emission is a fixed dollar budget split across seven coin
 * rails; $MINEAI carries a 3× bonus. The console reads its snapshot from
 * `/api/mining`, and every action (streak, stake, allocate, withdraw) posts to
 * the same route and replaces the snapshot with the server's answer rather
 * than guessing.
 */

interface CoinRow {
  id: string;
  symbol: string;
  label: string;
  chain: string;
  family: string;
  bonus: number;
  priceUsd: number;
  minWithdraw: number;
  decimals: number;
  amount: number;
  lifetime: number;
  withdrawn: number;
  usdValue: number;
  sharePct: number;
  share: number;
}

interface Snapshot {
  uid: string;
  referralCode: string;
  hashrateMhs: number;
  minedTokens: number;
  lifetimeMinedTokens: number;
  stakedTokens: number;
  claimableTokens: number;
  withdrawnTokens: number;
  streakDays: number;
  streakMultiplier: number;
  vipTier: string;
  vipMultiplier: number;
  effectiveMultiplier: number;
  claimedToday: boolean;
  nextClaimAt: string;
  twoFactorEnabled: boolean;
  referralEarnings: number;
  referralCount: number;
  tokenPriceUsd: number;
  coins: CoinRow[];
  allocations: Record<string, number>;
  totalUsdValue: number;
  emissionUsdPerDay: number;
  networkStats: {
    activeMiners: number;
    totalHashrateMhs: number;
    tokensMined: number;
    stakedTokens: number;
    burnedTokens: number;
    lastAccrualAt: string;
    cron: string;
    emissionUsdPerDay: number;
  };
  payouts: Array<{
    id: string;
    wallet: string;
    network: string;
    coin: string;
    symbol: string;
    tokens: number;
    usd: number;
    at: string;
    status: 'pending' | 'processing' | 'sent';
    txHash?: string;
    settledAt?: string;
  }>;
  leaderboard: Array<{ rank: number; operator: string; minedTokens: number; tier: string; you: boolean }>;
  shareBoostActive?: boolean;
  shareBoostUntil?: string | null;
  shareBoostMultiplier?: number;
  sharedLinks?: number;
  /** Active cloud plan and reactor switch. */
  planId?: string;
  planName?: string;
  planHashrateMhs?: number;
  planMultiplier?: number;
  miningActive?: boolean;
  constants?: { minWithdraw: number; genesisGrant: number; tokenPriceUsd: number };
}

type Tone = 'ok' | 'error' | 'info';

const COIN_TONE: Record<string, string> = {
  mineai: 'from-[#FFF3B0] via-[#D4AF37] to-[#8a6a12] text-[#241a02]',
  btc: 'from-[#f7931a] via-[#e07b12] to-[#7a3f05] text-[#1a0d00]',
  eth: 'from-[#c3cbe6] via-[#8b96c9] to-[#3c477a] text-[#0b1024]',
  sol: 'from-[#a6f5d6] via-[#4ade9f] to-[#0f9d63] text-[#04231a]',
  bnb: 'from-[#ffe082] via-[#f3ba2f] to-[#8a6300] text-[#1f1500]',
  ton: 'from-[#bfe6ff] via-[#3aa7e0] to-[#0b5c86] text-[#03141f]',
  doge: 'from-[#f6e3a1] via-[#c9a94a] to-[#6d5a12] text-[#1a1602]',
  ltc: 'from-[#e6f0ff] via-[#a6b8d4] to-[#4a5a74] text-[#0a1220]',
};

const WALLET_PLACEHOLDER: Record<string, string> = {
  evm: '0x…',
  bitcoin: 'bc1…',
  dogecoin: 'D…',
  solana: '5…',
  ton: 'UQ…',
  tron: 'T…',
  litecoin: 'ltc1…',
};

function coinTone(id: string): string {
  return COIN_TONE[id] ?? 'from-white/30 via-white/15 to-white/5 text-ink';
}

const BOOST_COPY: Record<
  string,
  { title: string; body: string; cta: string; active: string; until: string }
> = {
  en: {
    title: 'Share and get +15% speed',
    body: 'Share your mining card once a day. Your cloud power runs 15% faster for 24 hours.',
    cta: 'Share now',
    active: 'Boost active: +15% hashrate',
    until: 'Until',
  },
  ar: {
    title: 'شارك واحصل على سرعة +15%',
    body: 'شارك بطاقة التعدين مرة كل يوم. تزيد سرعة السحابة 15% لمدة 24 ساعة.',
    cta: 'شارك الآن',
    active: 'المضاعف نشط: +15% قوة',
    until: 'حتى',
  },
  fr: {
    title: 'Partagez et gagnez +15 % de vitesse',
    body: 'Partagez votre carte de minage une fois par jour. Votre puissance cloud est 15 % plus rapide pendant 24 h.',
    cta: 'Partager',
    active: 'Bonus actif : +15 % de hashrate',
    until: 'Jusqu’au',
  },
  es: {
    title: 'Comparte y gana +15% de velocidad',
    body: 'Comparte tu tarjeta de minería una vez al día. Tu potencia en la nube va 15% más rápido durante 24 horas.',
    cta: 'Compartir ahora',
    active: 'Bono activo: +15% de hashrate',
    until: 'Hasta',
  },
  zh: {
    title: '分享即可获得 +15% 速度',
    body: '每天分享一次挖矿卡片，云算力速度提升 15%，持续 24 小时。',
    cta: '立即分享',
    active: '加成已生效：+15% 算力',
    until: '有效期至',
  },
  hi: {
    title: 'शेयर करें और +15% गति पाएँ',
    body: 'दिन में एक बार अपना माइनिंग कार्ड शेयर करें। 24 घंटे तक क्लाउड पावर 15% तेज़ चलती है।',
    cta: 'अभी शेयर करें',
    active: 'बोनस सक्रिय: +15% हैशरेट',
    until: 'तक',
  },
};

const SHARE_COPY: Record<
  string,
  {
    label: string;
    whatsapp: string;
    telegram: string;
    x: string;
    facebook: string;
    linkedin: string;
    copy: string;
    copied: string;
    note: string;
  }
> = {
  en: {
    label: 'Share to',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    x: 'X',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    copy: 'Copy link',
    copied: 'Link copied',
    note: 'Each channel counts as one share. The +15% boost starts on the first share of the day.',
  },
  ar: {
    label: 'شارك على',
    whatsapp: 'واتساب',
    telegram: 'تيليجرام',
    x: 'إكس',
    facebook: 'فيسبوك',
    linkedin: 'لينكدإن',
    copy: 'نسخ الرابط',
    copied: 'تم نسخ الرابط',
    note: 'كل قناة تُحسب مشاركة واحدة. يبدأ مضاعف +15% من أول مشاركة في اليوم.',
  },
  fr: {
    label: 'Partager sur',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    x: 'X',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    copy: 'Copier le lien',
    copied: 'Lien copié',
    note: 'Chaque canal compte pour un partage. Le bonus de +15 % démarre au premier partage du jour.',
  },
  es: {
    label: 'Compartir en',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    x: 'X',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    copy: 'Copiar enlace',
    copied: 'Enlace copiado',
    note: 'Cada canal cuenta como un uso compartido. El bono de +15% empieza con el primer uso del día.',
  },
  zh: {
    label: '分享到',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    x: 'X',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    copy: '复制链接',
    copied: '链接已复制',
    note: '每个渠道计为一次分享。+15% 加成从当天第一次分享开始计算。',
  },
  hi: {
    label: 'यहाँ शेयर करें',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    x: 'X',
    facebook: 'Facebook',
    linkedin: 'LinkedIn',
    copy: 'लिंक कॉपी करें',
    copied: 'लिंक कॉपी हो गया',
    note: 'हर चैनल एक शेयर माना जाता है। +15% बोनस दिन के पहले शेयर से शुरू होता है।',
  },
};

const TELEMETRY_COPY: Record<
  string,
  {
    title: string;
    lead: string;
    gauge: string;
    nodes: string;
    yieldTitle: string;
    yieldBody: string;
    projected: string;
    active: string;
    standby: string;
    mhs: string;
    ths: string;
    portfolio: string;
  }
> = {
  en: {
    title: 'Live mining telemetry',
    lead: 'A simple view of your cloud power and what it pays at today’s rate.',
    gauge: 'Cloud power',
    nodes: 'Node status',
    yieldTitle: '7-day earnings at today’s rate',
    yieldBody: 'This is what your current plan would pay over the next seven days if nothing changes.',
    projected: 'Projected total',
    active: 'Online',
    standby: 'Waiting for data',
    mhs: 'MH/s',
    ths: 'TH/s',
    portfolio: 'Power split',
  },
  ar: {
    title: 'قياس التعدين المباشر',
    lead: 'نظرة بسيطة على قوة السحابة وما تدفعه بسعر اليوم.',
    gauge: 'قوة السحابة',
    nodes: 'حالة العقد',
    yieldTitle: 'أرباح 7 أيام بسعر اليوم',
    yieldBody: 'هذا ما ستدفعه خطتك الحالية خلال الأيام السبعة القادمة إن لم يتغير شيء.',
    projected: 'الإجمالي المتوقع',
    active: 'متصل',
    standby: 'بانتظار البيانات',
    mhs: 'ميغاهاش/ث',
    ths: 'تيراهاش/ث',
    portfolio: 'توزيع القوة',
  },
  fr: {
    title: 'Télémétrie de minage en direct',
    lead: 'Une vue simple de votre puissance cloud et de ce qu’elle rapporte au taux du jour.',
    gauge: 'Puissance cloud',
    nodes: 'État des nœuds',
    yieldTitle: 'Gains sur 7 jours au taux du jour',
    yieldBody: 'Voici ce que votre offre actuelle rapporterait sur les sept prochains jours sans changement.',
    projected: 'Total prévu',
    active: 'En ligne',
    standby: 'En attente de données',
    mhs: 'MH/s',
    ths: 'TH/s',
    portfolio: 'Répartition de la puissance',
  },
  es: {
    title: 'Telemetría de minería en vivo',
    lead: 'Una vista simple de tu potencia en la nube y lo que paga al ritmo de hoy.',
    gauge: 'Potencia en la nube',
    nodes: 'Estado de los nodos',
    yieldTitle: 'Ganancias de 7 días al ritmo de hoy',
    yieldBody: 'Esto es lo que pagaría tu plan actual en los próximos siete días si nada cambia.',
    projected: 'Total previsto',
    active: 'En línea',
    standby: 'Esperando datos',
    mhs: 'MH/s',
    ths: 'TH/s',
    portfolio: 'Reparto de potencia',
  },
  zh: {
    title: '实时挖矿遥测',
    lead: '简单查看你的云算力和按今日速率获得的收益。',
    gauge: '云算力',
    nodes: '节点状态',
    yieldTitle: '按今日速率的 7 天收益',
    yieldBody: '如果一切不变，这是你当前套餐未来七天大致可获得的收益。',
    projected: '预计总额',
    active: '在线',
    standby: '等待数据',
    mhs: 'MH/s',
    ths: 'TH/s',
    portfolio: '算力分配',
  },
  hi: {
    title: 'लाइव माइनिंग टेलीमेट्री',
    lead: 'आपकी क्लाउड पावर और आज की दर पर उसकी कमाई की सरल जानकारी।',
    gauge: 'क्लाउड पावर',
    nodes: 'नोड स्थिति',
    yieldTitle: 'आज की दर पर 7 दिन की कमाई',
    yieldBody: 'अगर कुछ न बदले तो आपका मौजूदा प्लान अगले सात दिनों में इतना भुगतान करेगा।',
    projected: 'अनुमानित कुल',
    active: 'ऑनलाइन',
    standby: 'डेटा की प्रतीक्षा',
    mhs: 'MH/s',
    ths: 'TH/s',
    portfolio: 'पावर विभाजन',
  },
};

type TelemetryCopy = (typeof TELEMETRY_COPY)['en'];

function TelemetryPanel({
  snapshot,
  allocation,
  copy,
}: {
  snapshot: Snapshot | null;
  allocation: Record<string, number> | null;
  copy: TelemetryCopy;
}) {
  const hashrate = snapshot?.hashrateMhs ?? 0;
  const useTera = hashrate >= 1000;
  const shown = useTera ? hashrate / 1000 : hashrate;
  const unit = useTera ? copy.ths : copy.mhs;

  const ceiling = Math.max(useTera ? 2 : 100, Math.ceil((shown * 1.5) / (useTera ? 1 : 50)) * (useTera ? 1 : 50));
  const ratio = ceiling > 0 ? Math.min(1, shown / ceiling) : 0;
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - ratio);

  const daily = snapshot?.emissionUsdPerDay ?? 0;
  const liveRef = useRef<number[]>([]);
  const [drift, setDrift] = useState(0);

  // Seed the buffer with a synthetic backfill so the first paint already shows a
  // trend, then append the real ledger total on every poll.
  useEffect(() => {
    if (!snapshot) return;
    const total = snapshot.totalUsdValue ?? 0;
    const buffer = liveRef.current;
    if (buffer.length === 0) {
      for (let step = 32; step >= 1; step -= 1) {
        buffer.push(Math.max(0, total - (daily * step) / 96));
      }
    }
    buffer.push(total);
    if (buffer.length > 32) buffer.shift();
  }, [snapshot, daily]);

  // Between polls the accrued total still creeps forward, so the chart reads as
  // live rather than a snapshot redrawn every fifteen seconds.
  useEffect(() => {
    const timer = window.setInterval(() => setDrift((value) => (value + 1) % 900), 4_000);
    return () => window.clearInterval(timer);
  }, []);

  const projected = (snapshot?.totalUsdValue ?? 0) + (daily * drift * 4) / 86_400;
  const series = [...liveRef.current, projected];
  const peak = Math.max(...series, 1);
  const floor = Math.min(...series);
  const span = Math.max(peak - floor, peak * 0.04);
  const stepX = 264 / Math.max(series.length - 1, 1);
  const points = series.map((value, index) => ({
    x: 8 + index * stepX,
    y: 84 - ((value - floor) / span) * 66,
  }));
  const line = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'}${point.x.toFixed(1)},${point.y.toFixed(1)}`)
    .join(' ');
  const area = points.length > 1 ? `${line} L${points[points.length - 1].x.toFixed(1)},90 L8,90 Z` : '';
  const lastPoint = points[points.length - 1] ?? { x: 272, y: 60 };

  const usd = (value: number) =>
    value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 });
  const nodes = ['edge-01', 'edge-02', 'edge-03'];

  const PALETTE = ['#ffd27a', '#22e0ff', '#4ade9f', '#a78bfa', '#fb923c', '#facc15', '#60a5fa', '#f472b6'];
  const shares = Object.entries(allocation ?? {})
    .filter(([, value]) => Number.isFinite(value) && value > 0)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  let cursor = 0;
  const sliceTotal = shares.reduce((sum, [, value]) => sum + value, 0) || 1;
  const slices = shares.map(([coin, raw], index) => {
    const value = (raw / sliceTotal) * 100;
    const from = cursor;
    cursor += value;
    return {
      coin: coin === 'mineai' ? '$MINEAI' : coin.toUpperCase(),
      value,
      color: PALETTE[index % PALETTE.length],
      from,
      to: cursor,
    };
  });

  const donutBackground = slices.length
    ? `conic-gradient(${slices.map((slice) => `${slice.color} ${slice.from * 3.6}deg ${slice.to * 3.6}deg`).join(', ')})`
    : 'conic-gradient(#1a2233 0deg 360deg)';
  const leadShare = slices[0]?.value ?? 0;

  const hub = { x: 140, y: 42 };
  const satellites = [
    { x: 46, y: 58 },
    { x: 140, y: 18 },
    { x: 234, y: 58 },
  ];

  return (
    <section className="mt-6 grid gap-6 rounded-2xl border border-white/8 bg-[#080d18] p-6 sm:p-7 lg:grid-cols-[0.78fr_1.22fr] lg:items-center">
      <div>
        <h2 className="text-[0.95rem] font-bold text-ink">{copy.title}</h2>
        <p className="mt-2 max-w-sm text-[0.76rem] leading-relaxed text-ink-mute">{copy.lead}</p>

        <div className="mt-5 flex items-center gap-5">
          <svg viewBox="0 0 160 160" className="h-36 w-36 shrink-0" role="img" aria-label={copy.gauge}>
            <circle cx="80" cy="80" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="11" />
            <circle
              cx="80"
              cy="80"
              r={radius}
              fill="none"
              stroke="url(#telemetry-gauge)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              transform="rotate(-90 80 80)"
              style={{ transition: 'stroke-dashoffset 800ms ease' }}
            />
            <defs>
              <linearGradient id="telemetry-gauge" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffd27a" />
                <stop offset="100%" stopColor="#22e0ff" />
              </linearGradient>
            </defs>
            <text x="80" y="76" textAnchor="middle" fill="#f5f7fb" style={{ fontSize: 22, fontWeight: 700 }}>
              {shown.toFixed(useTera ? 2 : 1)}
            </text>
            <text x="80" y="95" textAnchor="middle" fill="#8b93a7" style={{ fontSize: 10 }}>
              {unit}
            </text>
            {snapshot ? (
              <g aria-hidden>
                <circle r="2.4" fill="#ffd27a">
                  <animateMotion dur="6s" repeatCount="indefinite" path="M80 22 a58 58 0 1 1 -0.1 0" />
                </circle>
                <circle r="1.6" fill="#22e0ff" opacity="0.9">
                  <animateMotion dur="9.5s" begin="1.1s" repeatCount="indefinite" path="M80 22 a58 58 0 1 1 -0.1 0" />
                </circle>
              </g>
            ) : null}
          </svg>

          <dl>
            <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">{copy.gauge}</dt>
            <dd className="mx-numeric mt-1 text-lg font-bold text-amber">
              {shown.toFixed(useTera ? 2 : 1)} {unit}
            </dd>
            <dd className="mx-numeric mt-1 text-[0.68rem] text-ink-faint">
              {copy.projected}: {usd(series[series.length - 1])}
            </dd>
          </dl>
        </div>
      </div>

      <div className="grid gap-5">
        <div>
          <h3 className="text-[0.6rem] tracking-[0.14em] text-ink-faint uppercase">{copy.nodes}</h3>

          <div className="mt-2.5 rounded-xl border border-white/8 bg-[#04060d]/70 px-3 py-2">
            <svg viewBox="0 0 280 76" className="h-20 w-full" aria-hidden>
              <defs>
                <linearGradient id="topology-link" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="rgba(212,175,55,0.65)" />
                  <stop offset="100%" stopColor="rgba(34,224,255,0.65)" />
                </linearGradient>
              </defs>

              {satellites.map((node) => (
                <path
                  key={`link-${node.x}-${node.y}`}
                  d={`M${hub.x} ${hub.y} Q${(hub.x + node.x) / 2} ${(hub.y + node.y) / 2 - 14} ${node.x} ${node.y}`}
                  fill="none"
                  stroke="url(#topology-link)"
                  strokeWidth="1.1"
                  className={snapshot ? 'mx-flow' : undefined}
                  opacity={snapshot ? 0.95 : 0.35}
                />
              ))}

              <circle cx={hub.x} cy={hub.y} r="6" fill="#d4af37" opacity="0.22" />
              <circle cx={hub.x} cy={hub.y} r="3.4" fill="#ffd27a" />

              {satellites.map((node) => (
                <g key={`node-${node.x}-${node.y}`}>
                  {snapshot ? (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="5"
                      fill="none"
                      stroke="#4ade9f"
                      strokeWidth="1"
                      className="mx-node-ring"
                    />
                  ) : null}
                  <circle cx={node.x} cy={node.y} r="4" fill={snapshot ? '#4ade9f' : '#39435a'} />
                  <circle cx={node.x} cy={node.y} r="8" fill="none" stroke="rgba(255,255,255,0.1)" />
                </g>
              ))}
            </svg>
          </div>

          <ul className="mt-2.5 grid gap-2 sm:grid-cols-3">
            {nodes.map((node) => (
              <li
                key={node}
                className="flex items-center justify-between gap-2 rounded-lg border border-white/8 bg-[#04060d]/70 px-3 py-2"
              >
                <span className="mx-numeric text-[0.68rem] text-ink-soft">{node}</span>
                <span className={`inline-flex items-center gap-1.5 text-[0.62rem] ${snapshot ? 'text-mint' : 'text-ink-faint'}`}>
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${snapshot ? 'animate-pulse bg-mint' : 'bg-ink-faint'}`}
                    aria-hidden
                  />
                  {snapshot ? copy.active : copy.standby}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/8 bg-[#04060d]/70 p-4">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-[0.78rem] font-semibold text-ink">{copy.yieldTitle}</h3>
            <span className="mx-numeric text-[0.8rem] font-bold text-cyan">{usd(projected)}</span>
          </div>
          <p className="mt-1.5 text-[0.7rem] leading-relaxed text-ink-mute">{copy.yieldBody}</p>
          <svg viewBox="0 0 280 90" className="mt-3 h-24 w-full" role="img" aria-label={copy.yieldTitle}>
            <defs>
              <linearGradient id="telemetry-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(34,224,255,0.38)" />
                <stop offset="100%" stopColor="rgba(34,224,255,0)" />
              </linearGradient>
            </defs>
            <g stroke="rgba(248,250,252,0.06)" strokeWidth="0.6" aria-hidden>
              <path d="M8 22h264M8 51h264M8 84h264" fill="none" />
            </g>
            {area ? <path d={area} fill="url(#telemetry-area)" /> : null}
            {line ? (
              <path d={line} fill="none" stroke="#22e0ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            ) : null}
            <circle cx={lastPoint.x} cy={lastPoint.y} r="4.4" fill="rgba(34,224,255,0.22)" aria-hidden>
              <animate attributeName="r" values="3.4;5.4;3.4" dur="2.4s" repeatCount="indefinite" />
            </circle>
            <circle cx={lastPoint.x} cy={lastPoint.y} r="2" fill="#22e0ff" />
          </svg>
          <div className="mx-numeric mt-1 flex justify-between text-[0.56rem] text-ink-faint">
            <span>−2h</span>
            <span>−1h</span>
            <span className="text-mint">{copy.active}</span>
          </div>
        </div>

        <div className="rounded-xl border border-white/8 bg-[#04060d]/70 p-4">
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-[0.78rem] font-semibold text-ink">{copy.portfolio}</h3>
            <span className="mx-numeric text-[0.72rem] text-ink-faint">
              {slices.length ? `${Math.round(leadShare)}%` : '—'}
            </span>
          </div>

          <div className="mt-3 flex items-center gap-4">
            <div
              className="relative h-24 w-24 shrink-0 rounded-full"
              style={{ background: donutBackground }}
              role="img"
              aria-label={copy.portfolio}
            >
              <div className="absolute inset-[19%] rounded-full bg-[#04060d]" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="mx-numeric text-[0.78rem] font-bold text-ink">
                  {slices.length ? `${Math.round(leadShare)}%` : '—'}
                </span>
              </div>
            </div>

            <ul className="min-w-0 flex-1 space-y-1.5">
              {slices.length ? (
                slices.map((slice) => (
                  <li key={slice.coin} className="flex items-center justify-between gap-3 text-[0.68rem]">
                    <span className="inline-flex min-w-0 items-center gap-2 text-ink-soft">
                      <span className="h-2 w-2 rounded-full" style={{ background: slice.color }} aria-hidden />
                      <span className="truncate">{slice.coin}</span>
                    </span>
                    <span className="mx-numeric text-ink-faint">{Math.round(slice.value)}%</span>
                  </li>
                ))
              ) : (
                <li className="text-[0.68rem] text-ink-faint">—</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function MiningView() {
  const { eco, t, lang, href: to } = useI18n();
  const uid = useUid();

  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [allocation, setAllocation] = useState<Record<string, number> | null>(null);
  const [selectedCoin, setSelectedCoin] = useState('mineai');
  const [stakeAmount, setStakeAmount] = useState('100');
  const [withdrawAmount, setWithdrawAmount] = useState('25');
  const [wallet, setWallet] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: Tone; text: string } | null>(null);
  const [copiedChannel, setCopiedChannel] = useState<string | null>(null);

  const copy = eco.mining;

  const notify = useCallback((tone: Tone, text: string) => {
    setToast({ tone, text });
    window.setTimeout(() => setToast(null), 5200);
  }, []);

  const apply = useCallback((payload: Partial<Snapshot>) => {
    setSnapshot((previous) => (previous ? { ...previous, ...payload } : (payload as Snapshot)));
  }, []);

  const load = useCallback(async () => {
    if (!uid) return;
    try {
      const response = await fetch(`/api/mining?uid=${encodeURIComponent(uid)}`, { cache: 'no-store' });
      if (!response.ok) return;
      const payload = (await response.json()) as Snapshot & { ok?: boolean };
      if (payload.ok) apply(payload);
    } catch {
      // Keep the last snapshot; accrual continues server-side.
    }
  }, [uid, apply]);

  useEffect(() => {
    if (!uid) return;
    load();
    const timer = window.setInterval(load, 15_000);
    return () => window.clearInterval(timer);
  }, [uid, load]);

  useEffect(() => {
    if (snapshot && !allocation) setAllocation({ ...snapshot.allocations });
  }, [snapshot, allocation]);

  const act = useCallback(
    async (action: 'claim-streak' | 'stake' | 'unstake' | 'withdraw' | 'allocate' | 'share-boost' | 'toggle', body: Record<string, unknown>) => {
      if (!uid) return;
      setBusy(action);
      try {
        const response = await fetch('/api/mining', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, uid, ...body }),
        });
        const payload = (await response.json()) as Snapshot & {
          ok?: boolean;
          error?: string;
          bonus?: number;
          payout?: { id: string; wallet: string; symbol?: string };
        };

        if (!payload.ok) {
          notify('error', payload.error ?? t.common.error);
          if (payload.hashrateMhs !== undefined) apply(payload);
          return;
        }

        apply(payload);
        if (action === 'claim-streak') {
          notify('ok', `+${payload.bonus ?? 0} $MINEAI`);
        } else if (action === 'withdraw') {
          notify('ok', `${copy.withdrawSuccess} ${payload.payout?.wallet ?? ''}`);
        } else if (action === 'allocate') {
          notify('ok', copy.allocationSaved);
        } else if (action === 'toggle') {
          notify('info', payload.miningActive ? copy.resumeMining : copy.pauseMining);
        } else {
          notify('info', action === 'stake' ? copy.stake : copy.unstake);
        }
      } catch {
        notify('error', t.common.error);
      } finally {
        setBusy(null);
      }
    },
    [uid, apply, notify, copy.stake, copy.unstake, copy.withdrawSuccess, copy.allocationSaved, t.common.error],
  );

  const number = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        maximumFractionDigits: 2,
      }),
    [lang],
  );

  const tokens = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 4,
      }),
    [lang],
  );

  const usd = useMemo(
    () =>
      new Intl.NumberFormat(lang === 'zh' ? 'zh-CN' : 'en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [lang],
  );

  const coins = snapshot?.coins ?? [];
  const selected = coins.find((coin) => coin.id === selectedCoin) ?? coins[0] ?? null;
  const claimIn = snapshot
    ? new Date(snapshot.nextClaimAt).toLocaleTimeString(
        lang === 'zh' ? 'zh-CN' : lang === 'ar' ? 'ar' : 'en-US',
        { hour: '2-digit', minute: '2-digit' },
      )
    : '—';

  const allocationTotal = useMemo(
    () => Object.values(allocation ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [allocation],
  );

  const formatCoin = useCallback((value: number, decimals: number) => {
    const digits = Math.min(8, Math.max(0, decimals));
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: value > 0 && value < 1 ? Math.min(digits, 6) : 0,
      maximumFractionDigits: digits,
    }).format(value);
  }, []);

  const selectCoin = (id: string) => {
    setSelectedCoin(id);
    const coin = coins.find((item) => item.id === id);
    if (coin) setWithdrawAmount(String(coin.minWithdraw));
    setWallet('');
  };

  const boost = BOOST_COPY[lang] ?? BOOST_COPY.en;
  const telemetry = TELEMETRY_COPY[lang] ?? TELEMETRY_COPY.en;
  const shareCopy = SHARE_COPY[lang] ?? SHARE_COPY.en;

  /**
   * Share-to-Boost across six channels.
   *
   * Every channel opens the network's own composer with the referral link
   * already attached; the copy fallback is the only one that cannot be
   * intercepted. The first share of the day arms the +15% window server-side —
   * the panel only reports it.
   */
  const shareTo = useCallback(
    async (channel: 'whatsapp' | 'telegram' | 'x' | 'facebook' | 'linkedin' | 'copy') => {
      const url = `${window.location.origin}${to('/mining')}?ref=${encodeURIComponent(snapshot?.referralCode ?? '')}`;
      const text = `${copy.hashrate}: ${snapshot ? number.format(snapshot.hashrateMhs) : '—'} MH/s · MineAI`;
      const encodedUrl = encodeURIComponent(url);
      const encodedText = encodeURIComponent(text);

      try {
        if (channel === 'copy') {
          await navigator.clipboard.writeText(`${text}\n${url}`);
          setCopiedChannel('copy');
          window.setTimeout(() => setCopiedChannel(null), 2000);
        } else {
          const targets: Record<Exclude<typeof channel, 'copy'>, string> = {
            whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
            telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
            x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
          };
          window.open(targets[channel], '_blank', 'noopener,noreferrer');
        }
      } catch {
        // A blocked popup or clipboard still counts as a share attempt here; the
        // server decides whether the boost window opens.
      }
      await act('share-boost', {});
    },
    [act, copy.hashrate, number, snapshot?.hashrateMhs, snapshot?.referralCode, to],
  );

  const shareChannels = [
    { id: 'whatsapp' as const, label: shareCopy.whatsapp },
    { id: 'telegram' as const, label: shareCopy.telegram },
    { id: 'x' as const, label: shareCopy.x },
    { id: 'facebook' as const, label: shareCopy.facebook },
    { id: 'linkedin' as const, label: shareCopy.linkedin },
    { id: 'copy' as const, label: copiedChannel === 'copy' ? shareCopy.copied : shareCopy.copy },
  ];

  const latestPayout = snapshot?.payouts?.[0] ?? null;
  const payoutStage = latestPayout ? (['pending', 'processing', 'sent'] as const).indexOf(latestPayout.status) : -1;
  const payoutStages = [
    { key: 'pending', label: copy.pipeline.pending },
    { key: 'processing', label: copy.pipeline.processing },
    { key: 'sent', label: copy.pipeline.sent },
  ] as const;

  return (
    <>
      {/* ---------------------------------------------------------- Header */}
      <section className="grid gap-10 pb-14 pt-14 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <div>
          <p className="mx-eyebrow">{copy.eyebrow}</p>
          <h1 className="mx-display mt-6">{copy.title}</h1>
          <p className="mx-lede mt-6 max-w-xl">{copy.lead}</p>

          <div className="mt-8 flex flex-wrap gap-2">
            <span className="mx-chip !border-mint/40 !text-mint">{copy.zeroPower}</span>
            <span className="mx-chip !border-cyan/35 !text-cyan">{copy.compliance}</span>
            <span className="mx-chip">{copy.edgeTitle}</span>
          </div>
        </div>

        <div className="flex items-center justify-center gap-8">
          <div className="mx-coin-stage">
            <div className="mx-coin-tilt">
              <MineAICoinLogo size={190} />
            </div>
          </div>
          <dl className="space-y-4">
            <div>
              <dt className="text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">{copy.hashrate}</dt>
              <dd className="mx-numeric mt-1 text-xl font-bold text-ink">
                {snapshot ? number.format(snapshot.hashrateMhs) : '—'} <span className="text-[0.7rem] text-ink-faint">MH/s</span>
              </dd>
            </div>
            <div>
              <dt className="text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">{copy.multiplier}</dt>
              <dd className="mx-numeric mt-1 text-xl font-bold text-cyan">
                {snapshot ? `${snapshot.effectiveMultiplier.toFixed(2)}x` : '—'}
              </dd>
            </div>
            <div>
              <dt className="text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">{copy.vip}</dt>
              <dd className="mt-1 text-[0.95rem] font-semibold text-amber">
                {snapshot ? snapshot.vipTier : '—'}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* --------------------------------------------------------- Reactor */}
      <div className="mb-6">
        <MiningReactor
          hashrateMhs={snapshot?.hashrateMhs ?? 0}
          active={snapshot?.miningActive !== false}
          planName={snapshot?.planName ?? 'Genesis Free Cloud'}
          busy={busy === 'toggle'}
          onToggle={() => void act('toggle', { active: snapshot?.miningActive === false })}
        />
      </div>

      {/* ------------------------------------------------ Share-to-Boost */}
      <section className="mb-6 rounded-2xl border border-amber/25 bg-[linear-gradient(120deg,rgba(212,175,55,0.12),rgba(8,13,24,0.95))] px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[0.86rem] font-bold text-amber">{boost.title}</p>
            <p className="mt-1 max-w-2xl text-[0.74rem] leading-relaxed text-ink-mute">{boost.body}</p>
            {snapshot?.shareBoostActive ? (
              <p className="mx-numeric mt-1.5 text-[0.68rem] text-mint">
                {boost.active}
                {snapshot.shareBoostUntil ? ` · ${boost.until} ${new Date(snapshot.shareBoostUntil).toLocaleTimeString(
                  lang === 'zh' ? 'zh-CN' : 'en-US',
                  { hour: '2-digit', minute: '2-digit' },
                )}` : ''}
              </p>
            ) : null}
          </div>
          <p className="text-[0.62rem] tracking-[0.14em] text-ink-faint uppercase">{shareCopy.label}</p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {shareChannels.map((channel) => (
            <button
              key={channel.id}
              type="button"
              onClick={() => void shareTo(channel.id)}
              disabled={busy === 'share-boost' || !snapshot}
              className="rounded-lg border border-white/12 bg-white/[0.03] px-3 py-2 text-[0.72rem] font-semibold text-ink-soft transition hover:border-amber/45 hover:text-amber disabled:opacity-50"
            >
              {channel.label}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[0.66rem] leading-relaxed text-ink-faint">{shareCopy.note}</p>
      </section>

      {toast ? (
        <div
          role="status"
          className={`mb-8 rounded-xl border px-4 py-3 text-[0.82rem] font-medium ${
            toast.tone === 'ok'
              ? 'border-mint/40 bg-mint/8 text-mint'
              : toast.tone === 'error'
                ? 'border-rose/40 bg-rose/8 text-rose'
                : 'border-cyan/40 bg-cyan/8 text-cyan'
          }`}
        >
          {toast.text}
        </div>
      ) : null}

      {/* ----------------------------------------------------------- Stats */}
      <section className="grid gap-px overflow-hidden rounded-2xl border border-white/8 bg-white/8 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label={copy.hashrate} value={snapshot ? `${number.format(snapshot.hashrateMhs)} MH/s` : '—'} />
        <Stat label={copy.mined} value={snapshot ? tokens.format(snapshot.lifetimeMinedTokens) : '—'} accent="cyan" />
        <Stat label={copy.portfolio} value={snapshot ? usd.format(snapshot.totalUsdValue) : '—'} accent="mint" />
        <Stat label={copy.pending} value={snapshot ? tokens.format(snapshot.claimableTokens) : '—'} accent="mint" />
        <Stat
          label={copy.streak}
          value={snapshot ? `${snapshot.streakDays}d · ${snapshot.streakMultiplier.toFixed(1)}x` : '—'}
          accent="amber"
        />
      </section>

      <TelemetryPanel snapshot={snapshot} allocation={allocation} copy={telemetry} />

      {/* -------------------------------------------------- Coin terminal */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-amber/20 bg-[linear-gradient(135deg,rgba(212,175,55,0.06),rgba(8,13,24,0.97)_46%)]">
        <div className="border-b border-white/8 p-6 sm:p-7">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mx-eyebrow">{copy.coin}</p>
              <h2 className="mt-3 text-[1.15rem] font-bold tracking-[-0.01em] text-ink">
                {copy.terminalTitle}
              </h2>
              <p className="mt-2 max-w-2xl text-[0.8rem] leading-relaxed text-ink-mute">
                {copy.terminalBody}
              </p>
            </div>
            <div className="text-end">
              <p className="text-[0.6rem] tracking-[0.14em] text-ink-faint uppercase">{copy.perDay}</p>
              <p className="mx-numeric mt-1 text-[1rem] font-bold text-amber">
                {snapshot ? usd.format(snapshot.emissionUsdPerDay) : '—'}
              </p>
            </div>
          </div>
        </div>

        <div className="divide-y divide-white/6">
          {coins.map((coin) => {
            const share = allocation?.[coin.id] ?? coin.share;
            const selectedRow = coin.id === selectedCoin;
            return (
              <div
                key={coin.id}
                className={`grid items-center gap-3 px-5 py-3.5 sm:grid-cols-[1.6fr_1fr_1fr_7.5rem] sm:px-7 ${
                  selectedRow ? 'bg-white/[0.03]' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => selectCoin(coin.id)}
                  className="flex min-w-0 items-center gap-3 text-start"
                >
                  <span
                    className={`grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gradient-to-br text-[0.62rem] font-extrabold shadow-[0_6px_16px_-6px_rgba(0,0,0,0.9)] ${coinTone(
                      coin.id,
                    )}`}
                  >
                    {coin.symbol.replace('$', '').slice(0, 1)}
                  </span>
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[0.84rem] font-semibold text-ink">{coin.symbol}</span>
                      {coin.bonus > 1 ? (
                        <span className="rounded-full border border-amber/45 bg-amber/12 px-1.5 py-0.5 text-[0.52rem] font-bold tracking-[0.08em] text-amber uppercase">
                          {coin.bonus}× {copy.bonus}
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-0.5 block truncate text-[0.62rem] text-ink-faint">{coin.chain}</span>
                  </span>
                </button>

                <div>
                  <p className="text-[0.58rem] tracking-[0.12em] text-ink-faint uppercase">{copy.pending}</p>
                  <p className="mx-numeric mt-0.5 text-[0.82rem] font-semibold text-ink">
                    {formatCoin(coin.amount, coin.decimals)}{' '}
                    <span className="text-[0.6rem] font-normal text-ink-faint">{coin.symbol}</span>
                  </p>
                  <p className="mx-numeric text-[0.6rem] text-ink-faint">{usd.format(coin.usdValue)}</p>
                </div>

                <div>
                  <p className="text-[0.58rem] tracking-[0.12em] text-ink-faint uppercase">{copy.allocation}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-1 w-16 overflow-hidden rounded-full bg-white/10">
                      <span
                        className="block h-full rounded-full bg-gradient-to-r from-[#FFF3B0] to-[#D4AF37]"
                        style={{ width: `${Math.min(100, coin.sharePct)}%` }}
                      />
                    </div>
                    <span className="mx-numeric text-[0.68rem] text-amber">{coin.sharePct.toFixed(1)}%</span>
                  </div>
                </div>

                <label className="block">
                  <span className="sr-only">
                    {copy.allocation} — {coin.symbol}
                  </span>
                  <input
                    inputMode="decimal"
                    value={share}
                    onChange={(event) => {
                      const value = Number(event.target.value.replace(/[^0-9.]/g, ''));
                      setAllocation((previous) => ({
                        ...(previous ?? snapshot?.allocations ?? {}),
                        [coin.id]: Number.isFinite(value) ? value : 0,
                      }));
                    }}
                    className="mx-numeric w-full rounded-lg border border-white/12 bg-[#04060d] px-2.5 py-2 text-[0.78rem] text-ink outline-none focus:border-amber/55"
                  />
                </label>
              </div>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-white/8 bg-[#050810]/60 px-5 py-4 sm:px-7">
          <p className="text-[0.66rem] leading-relaxed text-ink-faint">
            {copy.allocationHint}{' '}
            <span className="mx-numeric text-ink-mute">
              Σ {number.format(allocationTotal)}
            </span>
          </p>
          <button
            type="button"
            onClick={() => act('allocate', { allocation: allocation ?? snapshot?.allocations ?? {} })}
            disabled={busy === 'allocate'}
            className="mx-btn !py-2 !text-[0.76rem]"
          >
            {busy === 'allocate' ? copy.savingAllocation : copy.saveAllocation}
          </button>
        </div>
      </section>

      {/* ------------------------------------------------------ Workbench */}
      <section className="mt-6 grid gap-5 lg:grid-cols-3">
        {/* Streak */}
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <h2 className="text-[0.95rem] font-bold text-ink">{copy.streak}</h2>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">
            {snapshot?.claimedToday ? copy.tomorrow : eco.rewards.streakBody}
          </p>

          <div className="mt-6 flex items-end gap-2">
            <span className="mx-numeric text-4xl font-extrabold text-amber">
              {snapshot?.streakDays ?? 0}
            </span>
            <span className="mb-1 text-[0.7rem] text-ink-faint">/ 7</span>
          </div>
          <div className="mt-3 flex gap-1">
            {Array.from({ length: 7 }).map((_, index) => (
              <span
                key={index}
                className={`h-1.5 flex-1 rounded-full ${
                  (snapshot?.streakDays ?? 0) > index ? 'bg-amber' : 'bg-white/10'
                }`}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={() => act('claim-streak', {})}
            disabled={busy === 'claim-streak' || snapshot?.claimedToday}
            className="mx-btn mt-6 w-full !py-2.5 !text-[0.8rem]"
          >
            {snapshot?.claimedToday ? copy.claimed : copy.claimStreak}
          </button>
          <p className="mx-numeric mt-3 text-center text-[0.66rem] text-ink-faint">
            {eco.rewards.tomorrow} {claimIn}
          </p>
        </article>

        {/* Stake */}
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <h2 className="text-[0.95rem] font-bold text-ink">{copy.stakeTitle}</h2>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.stakeBody}</p>

          <div className="mt-5 rounded-xl border border-white/8 bg-[#050810] p-4">
            <p className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">{eco.token.staked}</p>
            <p className="mx-numeric mt-1 text-lg font-bold text-ink">
              {snapshot ? tokens.format(snapshot.stakedTokens) : '—'}{' '}
              <span className="text-[0.66rem] text-ink-faint">$MINEAI</span>
            </p>
          </div>

          <label htmlFor="stake-amount" className="mt-4 block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
            {copy.stakeAmount}
          </label>
          <input
            id="stake-amount"
            inputMode="decimal"
            value={stakeAmount}
            onChange={(event) => setStakeAmount(event.target.value.replace(/[^0-9.]/g, ''))}
            className="mx-numeric mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.85rem] text-ink outline-none focus:border-cyan/55"
          />

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => act('stake', { amount: Number(stakeAmount) })}
              disabled={busy === 'stake'}
              className="mx-btn !py-2 !text-[0.76rem]"
            >
              {copy.stake}
            </button>
            <button
              type="button"
              onClick={() => act('unstake', { amount: Number(stakeAmount) })}
              disabled={busy === 'unstake'}
              className="mx-btn-quiet !py-2 !text-[0.76rem]"
            >
              {copy.unstake}
            </button>
          </div>
        </article>

        {/* Withdraw */}
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <h2 className="text-[0.95rem] font-bold text-ink">{copy.withdrawTitle}</h2>
          <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.withdrawBody}</p>

          <div className="mt-5 flex items-center justify-between rounded-xl border border-mint/25 bg-mint/[0.05] px-4 py-3">
            <span className="text-[0.66rem] text-ink-mute">
              {copy.pending} · {selected?.symbol ?? '$MINEAI'}
            </span>
            <span className="mx-numeric text-[0.95rem] font-bold text-mint">
              {selected ? formatCoin(selected.amount, selected.decimals) : '—'}
            </span>
          </div>

          <label htmlFor="withdraw-coin" className="mt-4 block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
            {copy.coin}
          </label>
          <select
            id="withdraw-coin"
            value={selectedCoin}
            onChange={(event) => selectCoin(event.target.value)}
            className="mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.8rem] text-ink outline-none focus:border-cyan/55"
          >
            {coins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.symbol} — {coin.chain}
              </option>
            ))}
          </select>

          <label htmlFor="withdraw-wallet" className="mt-3 block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
            {copy.wallet}
          </label>
          <input
            id="withdraw-wallet"
            value={wallet}
            onChange={(event) => setWallet(event.target.value.trim())}
            placeholder={WALLET_PLACEHOLDER[selected?.family ?? 'evm'] ?? '0x…'}
            className="mx-numeric mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.75rem] text-ink outline-none focus:border-cyan/55"
          />
          <p className="mt-1.5 text-[0.6rem] leading-relaxed text-ink-faint">{copy.addressHint}</p>

          <div className="mt-3 flex items-end gap-2">
            <div className="flex-1">
              <label htmlFor="withdraw-amount" className="block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                {copy.withdraw}
              </label>
              <input
                id="withdraw-amount"
                inputMode="decimal"
                value={withdrawAmount}
                onChange={(event) => setWithdrawAmount(event.target.value.replace(/[^0-9.]/g, ''))}
                className="mx-numeric mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.85rem] text-ink outline-none focus:border-cyan/55"
              />
            </div>
            <span className="mx-numeric mb-2.5 text-[0.62rem] text-ink-faint">
              {copy.min} {selected ? formatCoin(selected.minWithdraw, selected.decimals) : '25'}
            </span>
          </div>

          {snapshot?.twoFactorEnabled ? (
            <div className="mt-3">
              <label htmlFor="withdraw-2fa" className="block text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                {eco.rewards.securityCode}
              </label>
              <input
                id="withdraw-2fa"
                inputMode="numeric"
                value={twoFactorCode}
                onChange={(event) => setTwoFactorCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                className="mx-numeric mt-1.5 w-full rounded-lg border border-white/12 bg-[#04060d] px-3 py-2.5 text-[0.85rem] tracking-[0.2em] text-ink outline-none focus:border-cyan/55"
              />
            </div>
          ) : null}

          <button
            type="button"
            onClick={() =>
              act('withdraw', {
                coin: selectedCoin,
                amount: Number(withdrawAmount),
                wallet,
                ...(twoFactorCode ? { code: twoFactorCode } : {}),
              })
            }
            disabled={
              busy === 'withdraw' ||
              !wallet ||
              !selectedCoin ||
              Boolean(snapshot?.twoFactorEnabled && twoFactorCode.length !== 6)
            }
            className="mx-btn mt-3 w-full !py-2.5 !text-[0.78rem]"
          >
            {busy === 'withdraw' ? `${copy.withdrawing}…` : copy.withdraw}
          </button>

          {latestPayout ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-[#04060d]/70 p-3.5">
              <div className="flex items-center justify-between gap-2">
                <span className="mx-numeric text-[0.58rem] tracking-[0.08em] text-ink-faint uppercase">
                  {latestPayout.id}
                </span>
                <span className="mx-numeric text-[0.6rem] text-ink-mute">{latestPayout.wallet}</span>
              </div>
              <ol className="mt-3 grid grid-cols-3 gap-2">
                {payoutStages.map((stage, index) => {
                  const done = index < payoutStage;
                  const active = index === payoutStage;
                  return (
                    <li
                      key={stage.key}
                      className={`rounded-lg border px-2 py-1.5 text-center text-[0.6rem] font-semibold transition ${
                        done
                          ? 'border-mint/40 bg-mint/[0.08] text-mint'
                          : active
                            ? 'border-amber/50 bg-amber/[0.09] text-amber'
                            : 'border-white/10 bg-white/[0.02] text-ink-faint'
                      }`}
                      aria-current={active ? 'step' : undefined}
                    >
                      <span className="mx-numeric block text-[0.55rem] opacity-70">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      {stage.label}
                    </li>
                  );
                })}
              </ol>
              {latestPayout.status === 'sent' && latestPayout.txHash ? (
                <p className="mx-numeric mt-2.5 break-all text-[0.58rem] leading-relaxed text-mint/80">
                  <span className="text-ink-faint">{copy.pipeline.reference}: </span>
                  {latestPayout.txHash}
                </p>
              ) : null}
            </div>
          ) : null}

          <p className="mt-3 text-[0.64rem] leading-relaxed text-ink-faint">
            {eco.rewards.securityBody}
          </p>
        </article>
      </section>

      {/* --------------------------------------------------- Tape + board */}
      <div className="mt-6">
        <PayoutTicker limit={8} />
      </div>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-[0.95rem] font-bold text-ink">{eco.rewards.leaderboard}</h2>
            <Link href={to('/rewards')} className="text-[0.72rem] font-semibold text-cyan hover:underline">
              {eco.nav.rewards}
            </Link>
          </div>

          <ol className="mt-4 divide-y divide-white/6">
            {(snapshot?.leaderboard ?? []).map((row) => (
              <li
                key={`${row.rank}-${row.operator}`}
                className={`flex items-center justify-between gap-3 py-2.5 ${row.you ? 'text-cyan' : 'text-ink-soft'}`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <span className="mx-numeric w-5 text-[0.68rem] text-ink-faint">{row.rank}</span>
                  <span className="truncate text-[0.8rem] font-medium">{row.operator}</span>
                  <span className="rounded border border-white/10 px-1.5 py-0.5 text-[0.55rem] uppercase text-ink-faint">
                    {row.tier}
                  </span>
                </span>
                <span className="mx-numeric text-[0.76rem]">{number.format(row.minedTokens)}</span>
              </li>
            ))}
            {!snapshot ? <li className="py-3 text-[0.8rem] text-ink-faint">{t.common.loading}…</li> : null}
          </ol>
        </article>

        <div className="grid gap-5">
          <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
            <h2 className="text-[0.95rem] font-bold text-ink">{copy.zeroPower}</h2>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.zeroPowerBody}</p>

            <dl className="mt-5 grid grid-cols-2 gap-4">
              <div>
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                  {copy.cron}
                </dt>
                <dd className="mx-numeric mt-1 text-[0.76rem] text-ink-soft">
                  {snapshot?.networkStats.lastAccrualAt
                    ? new Date(snapshot.networkStats.lastAccrualAt).toLocaleTimeString(
                        lang === 'zh' ? 'zh-CN' : 'en-US',
                        { hour: '2-digit', minute: '2-digit', second: '2-digit' },
                      )
                    : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                  {eco.markets.live}
                </dt>
                <dd className="mx-numeric mt-1 text-[0.76rem] text-ink-soft">
                  {snapshot ? number.format(snapshot.networkStats.activeMiners) : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                  {copy.hashrate}
                </dt>
                <dd className="mx-numeric mt-1 text-[0.76rem] text-ink-soft">
                  {snapshot ? `${number.format(snapshot.networkStats.totalHashrateMhs)} MH/s` : '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[0.6rem] tracking-[0.12em] text-ink-faint uppercase">
                  {eco.token.burned}
                </dt>
                <dd className="mx-numeric mt-1 text-[0.76rem] text-ink-soft">
                  {snapshot ? number.format(snapshot.networkStats.burnedTokens) : '—'}
                </dd>
              </div>
            </dl>
          </article>

          <article className="rounded-2xl border border-white/8 bg-[#080d18] p-6">
            <h2 className="text-[0.95rem] font-bold text-ink">{copy.edgeTitle}</h2>
            <p className="mt-2 text-[0.78rem] leading-relaxed text-ink-mute">{copy.edgeBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="mx-chip">{snapshot?.networkStats.cron ?? 'daily · 03:00 UTC'}</span>
              <Link href={to('/rewards')} className="mx-chip !border-cyan/35 !text-cyan">
                {eco.nav.rewards}
              </Link>
            </div>
          </article>
        </div>
      </section>
    </>
  );
}

function Stat({
  label,
  value,
  accent = 'ink',
}: {
  label: string;
  value: string;
  accent?: 'ink' | 'cyan' | 'mint' | 'amber';
}) {
  const tone =
    accent === 'cyan' ? 'text-cyan' : accent === 'mint' ? 'text-mint' : accent === 'amber' ? 'text-amber' : 'text-ink';

  return (
    <div className="bg-[#070c17] px-5 py-5">
      <p className="text-[0.6rem] font-semibold tracking-[0.14em] text-ink-faint uppercase">{label}</p>
      <p className={`mx-numeric mt-2 text-xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}
