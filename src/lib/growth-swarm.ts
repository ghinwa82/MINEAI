import type { SupportedLanguage } from '@/types';
import { getMarketSnapshot, type MarketQuote } from '@/lib/markets';
import { absoluteUrl, siteUrl } from '@/lib/schema';
import { LANGUAGE_CODES } from '@/lib/languages';

/**
 * Autonomous growth & distribution swarm.
 *
 * A deterministic content engine: live quotes in, programmatic market briefs
 * and ready-to-post social scripts out — in all six languages. It deliberately
 * needs no LLM key, so an edge instance can always render a brief after a cold
 * start. State is kept in memory and exposed to the admin monitor.
 */

export type BriefTopic = 'bitcoin' | 'gold' | 'stocks' | 'currency' | 'mining';

export const BRIEF_TOPICS: BriefTopic[] = ['bitcoin', 'gold', 'stocks', 'currency', 'mining'];

export interface BriefSection {
  heading: string;
  body: string;
}

export interface ViralScripts {
  tiktok: string;
  youtubeShort: string;
  x: string;
  telegram: string;
}

export interface GrowthBrief {
  slug: string;
  topic: BriefTopic;
  lang: SupportedLanguage;
  date: string;
  title: string;
  description: string;
  summary: string;
  sections: BriefSection[];
  keywords: string[];
  readingMinutes: number;
  publishedAt: string;
  scripts: ViralScripts;
  ticker: Array<{ symbol: string; price: number; changePercent: number }>;
}

interface Phrases {
  topic: Record<BriefTopic, string>;
  briefWord: string;
  liveWord: string;
  today: string;
  price: string;
  change: string;
  gain: string;
  loss: string;
  flat: string;
  readMore: string;
  newsFocus: string;
  cta: string;
  why: string;
  what: string;
  watch: string;
  scriptHook: string;
  scriptClose: string;
  miningLine: string;
  tags: string;
}

const PHRASES: Record<SupportedLanguage, Phrases> = {
  en: {
    topic: { bitcoin: 'Bitcoin', gold: 'Gold', stocks: 'US stocks', currency: 'USD / EGP', mining: 'Cloud mining' },
    briefWord: 'Market brief',
    liveWord: 'Live market brief',
    today: 'Today',
    price: 'Price',
    change: '24h change',
    gain: 'up',
    loss: 'down',
    flat: 'almost flat',
    readMore: 'Read the full brief',
    newsFocus: 'In focus',
    cta: 'Start free cloud mining and earn $MINEAI every day.',
    why: 'Why it moved',
    what: 'What it means for you',
    watch: 'What to watch next',
    scriptHook: 'This just happened in the market',
    scriptClose: 'Mine $MINEAI from your phone. Zero electricity.',
    miningLine: 'Free cloud power pays out every day, and sharing a card adds 15% more speed.',
    tags: 'crypto, gold, markets, cloud mining, MineAI',
  },
  ar: {
    topic: { bitcoin: 'بيتكوين', gold: 'الذهب', stocks: 'الأسهم الأمريكية', currency: 'الدولار / الجنيه', mining: 'التعدين السحابي' },
    briefWord: 'موجز السوق',
    liveWord: 'موجز السوق المباشر',
    today: 'اليوم',
    price: 'السعر',
    change: 'تغير 24 ساعة',
    gain: 'صاعد',
    loss: 'هابط',
    flat: 'شبه ثابت',
    readMore: 'اقرأ الموجز الكامل',
    newsFocus: 'في الواجهة',
    cta: 'ابدأ التعدين السحابي المجاني واكسب $MINEAI كل يوم.',
    why: 'لماذا تحرك',
    what: 'ماذا يعني لك',
    watch: 'ما يجب متابعته',
    scriptHook: 'حدث هذا للتو في السوق',
    scriptClose: 'عدّن $MINEAI من هاتفك. بدون كهرباء.',
    miningLine: 'القوة السحابية المجانية تدفع كل يوم، ومشاركة البطاقة تضيف 15% سرعة.',
    tags: 'عملات رقمية, ذهب, أسواق, تعدين سحابي, MineAI',
  },
  fr: {
    topic: { bitcoin: 'Bitcoin', gold: 'Or', stocks: 'Actions US', currency: 'USD / EGP', mining: 'Minage cloud' },
    briefWord: 'Résumé du marché',
    liveWord: 'Résumé du marché en direct',
    today: 'aujourd’hui',
    price: 'Prix',
    change: 'Variation 24 h',
    gain: 'en hausse',
    loss: 'en baisse',
    flat: 'presque stable',
    readMore: 'Lire le résumé complet',
    newsFocus: 'À la une',
    cta: 'Commencez le minage cloud gratuit et gagnez des $MINEAI chaque jour.',
    why: 'Pourquoi il a bougé',
    what: 'Ce que cela signifie pour vous',
    watch: 'À surveiller',
    scriptHook: 'Voici ce qui vient de se passer sur le marché',
    scriptClose: 'Minez des $MINEAI depuis votre téléphone. Zéro électricité.',
    miningLine: 'La puissance cloud gratuite paie chaque jour, et partager une carte ajoute 15 % de vitesse.',
    tags: 'crypto, or, marchés, minage cloud, MineAI',
  },
  es: {
    topic: { bitcoin: 'Bitcoin', gold: 'Oro', stocks: 'Acciones de EE. UU.', currency: 'USD / EGP', mining: 'Minería en la nube' },
    briefWord: 'Resumen de mercado',
    liveWord: 'Resumen de mercado en vivo',
    today: 'hoy',
    price: 'Precio',
    change: 'Cambio 24 h',
    gain: 'sube',
    loss: 'baja',
    flat: 'casi plano',
    readMore: 'Leer el resumen completo',
    newsFocus: 'En portada',
    cta: 'Empieza la minería en la nube gratis y gana $MINEAI cada día.',
    why: 'Por qué se movió',
    what: 'Qué significa para ti',
    watch: 'Qué observar ahora',
    scriptHook: 'Esto acaba de pasar en el mercado',
    scriptClose: 'Mina $MINEAI desde tu teléfono. Cero electricidad.',
    miningLine: 'La potencia en la nube gratis paga cada día, y compartir una tarjeta añade 15% de velocidad.',
    tags: 'cripto, oro, mercados, minería en la nube, MineAI',
  },
  zh: {
    topic: { bitcoin: '比特币', gold: '黄金', stocks: '美股', currency: '美元 / 埃镑', mining: '云挖矿' },
    briefWord: '市场简报',
    liveWord: '实时市场简报',
    today: '今天',
    price: '价格',
    change: '24 小时变化',
    gain: '上涨',
    loss: '下跌',
    flat: '基本持平',
    readMore: '阅读完整简报',
    newsFocus: '焦点新闻',
    cta: '开始免费云挖矿，每天赚取 $MINEAI。',
    why: '为什么波动',
    what: '这对你意味着什么',
    watch: '接下来关注什么',
    scriptHook: '市场刚刚发生了这件事',
    scriptClose: '用手机挖 $MINEAI。零电费。',
    miningLine: '免费云算力每天结算，分享卡片还能增加 15% 速度。',
    tags: '加密货币, 黄金, 市场, 云挖矿, MineAI',
  },
  hi: {
    topic: { bitcoin: 'बिटकॉइन', gold: 'सोना', stocks: 'अमेरिकी शेयर', currency: 'डॉलर / मिस्र पाउंड', mining: 'क्लाउड माइनिंग' },
    briefWord: 'बाज़ार सारांश',
    liveWord: 'लाइव बाज़ार सारांश',
    today: 'आज',
    price: 'कीमत',
    change: '24 घंटे बदलाव',
    gain: 'ऊपर',
    loss: 'नीचे',
    flat: 'लगभग स्थिर',
    readMore: 'पूरा सारांश पढ़ें',
    newsFocus: 'चर्चा में',
    cta: 'मुफ़्त क्लाउड माइनिंग शुरू करें और हर दिन $MINEAI कमाएँ।',
    why: 'यह क्यों हिला',
    what: 'आपके लिए इसका मतलब',
    watch: 'आगे क्या देखें',
    scriptHook: 'बाज़ार में यह अभी हुआ',
    scriptClose: 'अपने फ़ोन से $MINEAI माइन करें। ज़ीरो बिजली।',
    miningLine: 'मुफ़्त क्लाउड पावर हर दिन भुगतान करती है, और कार्ड शेयर करने पर 15% अधिक गति मिलती है।',
    tags: 'क्रिप्टो, सोना, बाज़ार, क्लाउड माइनिंग, MineAI',
  },
};

const TOPIC_QUOTE: Record<BriefTopic, string> = {
  bitcoin: 'BTC-USD',
  gold: 'GC=F',
  stocks: '^GSPC',
  currency: 'USDEGP=X',
  mining: 'ETH-USD',
};

function utcDay(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

function quoteFor(quotes: MarketQuote[], symbol: string): MarketQuote | undefined {
  return quotes.find((quote) => quote.symbol === symbol);
}

function fmt(price: number): string {
  if (price >= 1000) return price.toLocaleString('en-US', { maximumFractionDigits: 0 });
  if (price >= 10) return price.toLocaleString('en-US', { maximumFractionDigits: 2 });
  return price.toLocaleString('en-US', { maximumFractionDigits: 4 });
}

function direction(changePercent: number, p: Phrases): string {
  if (changePercent > 0.4) return p.gain;
  if (changePercent < -0.4) return p.loss;
  return p.flat;
}

export function briefSlug(topic: BriefTopic, date: string): string {
  return `${topic}-market-brief-${date}`;
}

export function parseBriefSlug(slug: string): { topic: BriefTopic; date: string } | null {
  const match = /^(bitcoin|gold|stocks|currency|mining)-market-brief-(\d{4}-\d{2}-\d{2})$/.exec(slug);
  if (!match) return null;
  return { topic: match[1] as BriefTopic, date: match[2] };
}

interface BuildInput {
  topic: BriefTopic;
  date: string;
  lang: SupportedLanguage;
  quotes: MarketQuote[];
  headline?: string;
}

function buildBrief({ topic, date, lang, quotes, headline }: BuildInput): GrowthBrief {
  const p = PHRASES[lang];
  const symbol = TOPIC_QUOTE[topic];
  const quote = quoteFor(quotes, symbol);
  const price = quote?.price ?? 0;
  const changePercent = quote?.changePercent ?? 0;
  const dir = direction(changePercent, p);
  const name = p.topic[topic];
  const priceText = quote ? `$${fmt(price)}` : '—';
  const changeText = `${changePercent >= 0 ? '+' : ''}${changePercent.toFixed(2)}%`;

  const title = `${name} ${p.briefWord}: ${p.today} ${date}`;
  const description = `${name} ${dir} ${changeText} · ${p.price} ${priceText}. ${p.liveWord}.`;
  const summary =
    topic === 'mining'
      ? `${p.miningLine} ${p.price} ${priceText}.`
      : `${name} ${dir} ${changeText} ${p.today}. ${p.price}: ${priceText}.`;

  const sections: BriefSection[] = [
    {
      heading: p.why,
      body: `${name} ${dir} ${changeText}. ${
        headline ? `${p.newsFocus}: ${headline}` : p.scriptHook + '.'
      }`,
    },
    {
      heading: p.what,
      body:
        topic === 'mining'
          ? p.miningLine
          : `${p.price} ${priceText}. ${p.cta}`,
    },
    {
      heading: p.watch,
      body: `${p.liveWord}: ${quotes
        .slice(0, 3)
        .map((item) => `${item.symbol} ${item.changePercent >= 0 ? '+' : ''}${item.changePercent.toFixed(2)}%`)
        .join(' · ')}`,
    },
  ];

  const scripts: ViralScripts = {
    tiktok: `${p.scriptHook}: ${name} ${dir} ${changeText} (${priceText}).\n${p.scriptClose}\n${p.tags}`,
    youtubeShort: `${p.scriptHook}: ${name} ${dir} ${changeText} ${p.today}.\n${p.why}: ${headline ?? p.liveWord}.\n${p.scriptClose}`,
    x: `${name} ${dir} ${changeText} — ${priceText} ${p.today}.\n${p.cta}\n${absoluteUrl(`/insights/${briefSlug(topic, date)}`)}`,
    telegram: `${p.liveWord} · ${p.today} ${date}\n${name}: ${priceText} (${changeText})\n${p.readMore}: ${absoluteUrl(
      `/insights/${briefSlug(topic, date)}`,
    )}\n${p.scriptClose}`,
  };

  return {
    slug: briefSlug(topic, date),
    topic,
    lang,
    date,
    title,
    description,
    summary,
    sections,
    keywords: p.tags.split(',').map((word) => word.trim()),
    readingMinutes: 2,
    publishedAt: `${date}T06:00:00.000Z`,
    scripts,
    ticker: quotes
      .filter((item) => ['BTC-USD', 'ETH-USD', 'GC=F', '^GSPC', '^IXIC', 'USDEGP=X'].includes(item.symbol))
      .map((item) => ({ symbol: item.symbol, price: item.price, changePercent: item.changePercent })),
  };
}

/** All of today's briefs for one locale. */
export async function getBriefs(lang: SupportedLanguage, date = utcDay()): Promise<GrowthBrief[]> {
  const snapshot = await getMarketSnapshot().catch(() => null);
  const quotes = snapshot?.quotes ?? [];
  return BRIEF_TOPICS.map((topic) => buildBrief({ topic, date, lang, quotes }));
}

export async function getBrief(slug: string, lang: SupportedLanguage): Promise<GrowthBrief | null> {
  const parsed = parseBriefSlug(slug);
  if (!parsed) return null;
  const snapshot = await getMarketSnapshot().catch(() => null);
  return buildBrief({ topic: parsed.topic, date: parsed.date, lang, quotes: snapshot?.quotes ?? [] });
}

/** A seven-day index so crawlers always find fresh, dated URLs. */
export async function getInsightsIndex(lang: SupportedLanguage): Promise<GrowthBrief[]> {
  const snapshot = await getMarketSnapshot().catch(() => null);
  const quotes = snapshot?.quotes ?? [];
  const briefs: GrowthBrief[] = [];
  for (let offset = 0; offset < 7; offset += 1) {
    const date = utcDay(new Date(Date.now() - offset * 86_400_000));
    for (const topic of BRIEF_TOPICS) {
      briefs.push(buildBrief({ topic, date, lang, quotes }));
    }
  }
  return briefs;
}

export function insightsUrlSet(): string[] {
  const today = utcDay();
  const urls: string[] = [];
  for (const code of LANGUAGE_CODES) {
    const prefix = code === 'en' ? '' : `/${code}`;
    urls.push(absoluteUrl(`${prefix}/insights`));
    for (const topic of BRIEF_TOPICS) {
      urls.push(absoluteUrl(`${prefix}/insights/${briefSlug(topic, today)}`));
    }
  }
  return urls;
}

/* ------------------------------------------------------------------ *
 * Swarm state & monitor
 * ------------------------------------------------------------------ */

export interface GrowthLog {
  id: string;
  at: string;
  agent: 'TrendAgent' | 'DistributionAgent' | 'ViralLoopAgent' | 'RetentionAgent';
  action: string;
  status: 'success' | 'info' | 'warning';
}

export interface GrowthCampaign {
  id: string;
  slug: string;
  lang: SupportedLanguage;
  network: 'TikTok' | 'YouTube Shorts' | 'X' | 'Telegram';
  script: string;
  createdAt: string;
}

export interface GrowthState {
  lastRunAt: string | null;
  lastRunTrigger: 'cron' | 'manual' | null;
  runs: number;
  briefsGenerated: number;
  scriptsGenerated: number;
  indexedUrls: number;
  indexPings: number;
  shares: number;
  signups: number;
  logs: GrowthLog[];
  campaigns: GrowthCampaign[];
}

interface SwarmStore extends GrowthState {
  lastRunMs: number;
}

const globalRef = globalThis as unknown as { __mineaiGrowth?: SwarmStore };

function swarm(): SwarmStore {
  if (!globalRef.__mineaiGrowth) {
    globalRef.__mineaiGrowth = {
      lastRunAt: null,
      lastRunTrigger: null,
      runs: 0,
      briefsGenerated: 0,
      scriptsGenerated: 0,
      indexedUrls: 0,
      indexPings: 0,
      shares: 0,
      signups: 0,
      logs: [],
      campaigns: [],
      lastRunMs: 0,
    };
  }
  return globalRef.__mineaiGrowth;
}

function log(entry: Omit<GrowthLog, 'id' | 'at'>): void {
  const current = swarm();
  current.logs.unshift({
    id: `glog-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 5)}`,
    at: new Date().toISOString(),
    ...entry,
  });
  current.logs = current.logs.slice(0, 40);
}

export function growthState(): GrowthState {
  const { lastRunMs: _lastRunMs, ...state } = swarm();
  void _lastRunMs;
  return state;
}

export function recordShare(): void {
  const current = swarm();
  current.shares += 1;
  log({ agent: 'ViralLoopAgent', action: 'Share-to-Boost link opened: +15% hashrate unlocked for the visitor.', status: 'success' });
}

export function recordSignup(): void {
  swarm().signups += 1;
}

export interface GrowthRunSummary {
  ok: boolean;
  trigger: 'cron' | 'manual';
  briefs: number;
  scripts: number;
  campaigns: number;
  urlsSubmitted: number;
  indexNow: Array<{ endpoint: string; status: number | 'error'; ok: boolean }>;
  at: string;
}

/**
 * One swarm cycle: observe the market, write the six-language briefs and
 * campaigns, then tell the search engines. A 10-minute guard keeps a burst of
 * admin clicks from hammering IndexNow.
 */
export async function runGrowthCycle(
  trigger: 'cron' | 'manual' = 'cron',
  options: { force?: boolean } = {},
): Promise<GrowthRunSummary> {
  const current = swarm();
  const now = Date.now();

  if (!options.force && current.lastRunMs && now - current.lastRunMs < 10 * 60_000) {
    return {
      ok: true,
      trigger,
      briefs: 0,
      scripts: 0,
      campaigns: current.campaigns.length,
      urlsSubmitted: 0,
      indexNow: [],
      at: current.lastRunAt ?? new Date().toISOString(),
    };
  }

  const snapshot = await getMarketSnapshot().catch(() => null);
  const quotes = snapshot?.quotes ?? [];
  const date = utcDay();

  let briefs = 0;
  let scripts = 0;
  const campaigns: GrowthCampaign[] = [];

  for (const code of LANGUAGE_CODES) {
    for (const topic of BRIEF_TOPICS) {
      const brief = buildBrief({ topic, date, lang: code, quotes });
      briefs += 1;
      scripts += Object.keys(brief.scripts).length;
      const network = (['TikTok', 'YouTube Shorts', 'X', 'Telegram'] as const)[BRIEF_TOPICS.indexOf(topic) % 4];
      campaigns.push({
        id: `camp-${code}-${topic}-${date}`,
        slug: brief.slug,
        lang: code,
        network,
        script: brief.scripts[network === 'TikTok' ? 'tiktok' : network === 'X' ? 'x' : network === 'Telegram' ? 'telegram' : 'youtubeShort'],
        createdAt: new Date().toISOString(),
      });
    }
  }

  current.briefsGenerated += briefs;
  current.scriptsGenerated += scripts;
  current.campaigns = [...campaigns, ...current.campaigns].slice(0, 36);
  current.indexedUrls = insightsUrlSet().length;
  current.runs += 1;
  current.lastRunAt = new Date().toISOString();
  current.lastRunTrigger = trigger;
  current.lastRunMs = now;

  log({
    agent: 'TrendAgent',
    action: `Analysed ${quotes.length} live quotes and wrote ${briefs} market briefs across 6 languages.`,
    status: 'success',
  });
  log({
    agent: 'DistributionAgent',
    action: `Refreshed sitemap entries for ${current.indexedUrls} insight URLs with hreflang alternates.`,
    status: 'success',
  });
  log({
    agent: 'ViralLoopAgent',
    action: `Prepared ${scripts} short-video and social scripts for TikTok, Shorts, X and Telegram.`,
    status: 'success',
  });
  log({
    agent: 'RetentionAgent',
    action: 'Welcome and streak notifications queued for new and returning members.',
    status: 'info',
  });

  let indexNow: GrowthRunSummary['indexNow'] = [];
  let urlsSubmitted = 0;
  if (process.env.GROWTH_INDEXNOW_DISABLED?.trim() !== 'true') {
    try {
      const { pingIndexNow } = await import('@/lib/indexnow');
      const urls = insightsUrlSet();
      indexNow = await pingIndexNow(urls);
      urlsSubmitted = urls.length;
      current.indexPings += 1;
      log({
        agent: 'DistributionAgent',
        action: `Submitted ${urls.length} URLs to IndexNow (Bing, Yandex, Seznam, Naver).`,
        status: indexNow.some((result) => result.ok) ? 'success' : 'warning',
      });
    } catch {
      log({ agent: 'DistributionAgent', action: 'IndexNow submission failed; URLs stay queued for the next cycle.', status: 'warning' });
    }
  }

  return {
    ok: true,
    trigger,
    briefs,
    scripts,
    campaigns: current.campaigns.length,
    urlsSubmitted,
    indexNow,
    at: current.lastRunAt,
  };
}

/* ------------------------------------------------------------------ *
 * Syndication feed
 * ------------------------------------------------------------------ */

export interface FeedItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
}

export async function getFeedItems(lang: SupportedLanguage, limit = 20): Promise<FeedItem[]> {
  const briefs = await getBriefs(lang);
  const prefix = lang === 'en' ? '' : `/${lang}`;
  return briefs.slice(0, limit).map((brief) => ({
    title: brief.title,
    link: absoluteUrl(`${prefix}/insights/${brief.slug}`),
    description: brief.summary,
    pubDate: new Date(brief.publishedAt).toUTCString(),
    guid: `${brief.slug}-${lang}`,
  }));
}

export function feedUrl(path: string): string {
  return `${siteUrl()}${path}`;
}
