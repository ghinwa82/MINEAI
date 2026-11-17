import type { SupportedLanguage } from '@/types';
import { DEFAULT_LANGUAGE, normalizeLanguage } from '@/lib/languages';
import { getMarketSnapshot } from '@/lib/markets';

/**
 * Live financial and world-news intelligence.
 *
 * Headlines are pulled from free public RSS endpoints, normalised into one
 * shape, de-duplicated and cached for five minutes — inside the 5–10 minute
 * refresh window the product promises, and short enough that a breaking story
 * appears while it is still breaking.
 *
 * English reads a curated desk of named publishers. The other five locales ask
 * Google News for the same five topics in their own language, so an Arabic
 * reader gets Arabic headlines rather than translated chrome around English
 * copy. If an upstream is unreachable the feed falls back to the previous
 * cached batch, then to the English desk; it never invents a headline.
 */

export type NewsCategory = 'breaking' | 'gold' | 'stocks' | 'economy' | 'crypto';
export type NewsFilter = 'all' | NewsCategory;

export interface NewsItem {
  id: string;
  title: string;
  link: string;
  source: string;
  category: NewsCategory;
  publishedAt: string;
  summary: string;
}

export interface NewsBadge {
  symbol: string;
  label: string;
  price: number;
  changePercent: number;
  currency: string;
}

export interface NewsPayload {
  lang: SupportedLanguage;
  items: NewsItem[];
  badges: NewsBadge[];
  updatedAt: string;
  upstream: 'ok' | 'degraded';
  refreshSeconds: number;
}

interface FeedSource {
  url: string;
  source: string;
  category: NewsCategory;
}

const CURATED: FeedSource[] = [
  { url: 'https://feeds.bbci.co.uk/news/world/rss.xml', source: 'BBC World', category: 'breaking' },
  { url: 'https://www.aljazeera.com/xml/rss/all.xml', source: 'Al Jazeera', category: 'breaking' },
  { url: 'https://www.theguardian.com/world/rss', source: 'The Guardian', category: 'breaking' },
  { url: 'https://feeds.bbci.co.uk/news/business/rss.xml', source: 'BBC Business', category: 'economy' },
  { url: 'https://www.theguardian.com/business/rss', source: 'The Guardian', category: 'economy' },
  { url: 'https://www.cnbc.com/id/10000664/device/rss/rss.html', source: 'CNBC', category: 'economy' },
  { url: 'https://www.mining.com/feed/', source: 'Mining.com', category: 'gold' },
  { url: 'https://www.kitco.com/rss/KitcoNews.xml', source: 'Kitco', category: 'gold' },
  { url: 'https://finance.yahoo.com/news/rssindex', source: 'Yahoo Finance', category: 'stocks' },
  { url: 'https://www.cnbc.com/id/20910258/device/rss/rss.html', source: 'CNBC Markets', category: 'stocks' },
  { url: 'https://cointelegraph.com/rss', source: 'Cointelegraph', category: 'crypto' },
  { url: 'https://www.coindesk.com/arc/outboundfeeds/rss/', source: 'CoinDesk', category: 'crypto' },
];

interface LocaleNewsConfig {
  hl: string;
  gl: string;
  ceid: string;
  queries: Record<NewsCategory, string>;
}

const LOCALES: Record<SupportedLanguage, LocaleNewsConfig> = {
  en: {
    hl: 'en-US',
    gl: 'US',
    ceid: 'US:en',
    queries: {
      breaking: 'breaking world news',
      gold: 'gold price XAU',
      stocks: 'stock market today',
      economy: 'global economy',
      crypto: 'bitcoin ethereum crypto',
    },
  },
  ar: {
    hl: 'ar',
    gl: 'AE',
    ceid: 'AE:ar',
    queries: {
      breaking: 'أخبار العالم العاجلة',
      gold: 'سعر الذهب اليوم',
      stocks: 'أسواق الأسهم العالمية',
      economy: 'الاقتصاد العالمي',
      crypto: 'بيتكوين عملات رقمية',
    },
  },
  fr: {
    hl: 'fr',
    gl: 'FR',
    ceid: 'FR:fr',
    queries: {
      breaking: 'actualités mondiales',
      gold: "prix de l'or",
      stocks: 'marchés boursiers',
      economy: 'économie mondiale',
      crypto: 'bitcoin crypto-monnaie',
    },
  },
  es: {
    hl: 'es',
    gl: 'ES',
    ceid: 'ES:es',
    queries: {
      breaking: 'noticias mundiales',
      gold: 'precio del oro',
      stocks: 'mercados bursátiles',
      economy: 'economía mundial',
      crypto: 'bitcoin criptomonedas',
    },
  },
  zh: {
    hl: 'zh-CN',
    gl: 'CN',
    ceid: 'CN:zh-Hans',
    queries: {
      breaking: '世界新闻',
      gold: '黄金价格',
      stocks: '全球股市',
      economy: '全球经济',
      crypto: '比特币 加密货币',
    },
  },
  hi: {
    hl: 'hi',
    gl: 'IN',
    ceid: 'IN:hi',
    queries: {
      breaking: 'विश्व समाचार',
      gold: 'सोने की कीमत',
      stocks: 'शेयर बाजार',
      economy: 'वैश्विक अर्थव्यवस्था',
      crypto: 'बिटकॉइन क्रिप्टोकरेंसी',
    },
  },
};

const TTL_MS = 5 * 60_000;
const REFRESH_SECONDS = 300;

interface CacheEntry {
  payload: NewsPayload | null;
  at: number;
}

const globalRef = globalThis as unknown as { __mineaiNews?: Map<string, CacheEntry> };

function cache(): Map<string, CacheEntry> {
  if (!globalRef.__mineaiNews) globalRef.__mineaiNews = new Map();
  return globalRef.__mineaiNews;
}

function decodeEntities(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)));
}

function stripTags(value: string): string {
  return decodeEntities(value.replace(/<[^>]+>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function pick(block: string, tags: string[]): string {
  for (const tag of tags) {
    const match = block.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'));
    if (match) return match[1];
  }
  return '';
}

function pickLink(block: string): string {
  const href = block.match(/<link\b[^>]*href=["']([^"']+)["']/i);
  if (href) return decodeEntities(href[1]).trim();
  return stripTags(pick(block, ['link']));
}

function hashString(value: string): string {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) % 2_147_483_647;
  }
  return hash.toString(36);
}

function parseFeed(xml: string, source: string, category: NewsCategory): NewsItem[] {
  const blocks = [
    ...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi),
    ...xml.matchAll(/<entry\b[^>]*>([\s\S]*?)<\/entry>/gi),
  ].map((match) => match[1]);

  const items: NewsItem[] = [];

  for (const block of blocks) {
    const rawTitle = stripTags(pick(block, ['title']));
    if (!rawTitle) continue;

    const link = pickLink(block);
    if (!link || !/^https?:/i.test(link)) continue;

    const rawDate = stripTags(pick(block, ['pubDate', 'published', 'updated', 'dc:date']));
    const parsed = rawDate ? new Date(rawDate) : new Date();
    const publishedAt = Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();

    const feedSource = stripTags(pick(block, ['source'])) || source;
    // Google News appends " - Publisher" to the headline; drop it when the
    // publisher is already in the source field so the title reads cleanly.
    const title = feedSource && rawTitle.endsWith(` - ${feedSource}`)
      ? rawTitle.slice(0, -(feedSource.length + 3)).trim()
      : rawTitle;

    const summary = stripTags(pick(block, ['description', 'summary', 'content'])).slice(0, 220);

    items.push({
      id: hashString(link + title),
      title,
      link,
      source: feedSource,
      category,
      publishedAt,
      summary,
    });
  }

  return items;
}

async function fetchFeed(feed: FeedSource): Promise<NewsItem[]> {
  try {
    const response = await fetch(feed.url, {
      headers: {
        Accept: 'application/rss+xml, application/atom+xml, application/xml, text/xml;q=0.9, */*;q=0.8',
        'User-Agent': 'Mozilla/5.0 (compatible; MineAI-News/1.0; +https://mineai-node.vercel.app)',
      },
      cache: 'no-store',
      signal: AbortSignal.timeout(5500),
    });
    if (!response.ok) return [];
    return parseFeed(await response.text(), feed.source, feed.category);
  } catch {
    return [];
  }
}

function googleFeeds(lang: SupportedLanguage): FeedSource[] {
  const config = LOCALES[lang];
  return (Object.keys(config.queries) as NewsCategory[]).map((category) => ({
    url: `https://news.google.com/rss/search?q=${encodeURIComponent(config.queries[category])}&hl=${encodeURIComponent(
      config.hl,
    )}&gl=${config.gl}&ceid=${encodeURIComponent(config.ceid)}`,
    source: 'Google News',
    category,
  }));
}

function dedupe(items: NewsItem[]): NewsItem[] {
  const seen = new Set<string>();
  const out: NewsItem[] = [];
  for (const item of items) {
    const key = item.title.toLowerCase().replace(/[^a-z0-9\u0600-\u06ff\u4e00-\u9fff]+/g, ' ').trim();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out.sort((a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt));
}

async function collect(feeds: FeedSource[]): Promise<NewsItem[]> {
  const settled = await Promise.allSettled(feeds.map((feed) => fetchFeed(feed)));
  const items: NewsItem[] = [];
  for (const result of settled) {
    if (result.status === 'fulfilled') items.push(...result.value);
  }
  return dedupe(items);
}

function badgesFromQuotes(
  quotes: Awaited<ReturnType<typeof getMarketSnapshot>>['quotes'],
): NewsBadge[] {
  const wanted = ['GC=F', 'BTC-USD', 'ETH-USD', 'SOL-USD', 'USDEGP=X', 'MINEAI'];
  const labels: Record<string, string> = {
    'GC=F': 'Gold',
    'BTC-USD': 'BTC',
    'ETH-USD': 'ETH',
    'SOL-USD': 'SOL',
    'USDEGP=X': 'USD/EGP',
    MINEAI: '$MINEAI',
  };
  return wanted
    .map((symbol) => quotes.find((quote) => quote.symbol === symbol))
    .filter((quote): quote is NonNullable<typeof quote> => Boolean(quote))
    .map((quote) => ({
      symbol: quote.symbol,
      label: labels[quote.symbol] ?? quote.name,
      price: quote.price,
      changePercent: quote.changePercent,
      currency: quote.currency,
    }));
}

export async function getNewsFeed(
  language: string | null | undefined,
  force = false,
): Promise<NewsPayload> {
  const lang = normalizeLanguage(language ?? DEFAULT_LANGUAGE);
  const store = cache();
  const cached = store.get(lang);

  if (!force && cached?.payload && Date.now() - cached.at < TTL_MS) {
    return cached.payload;
  }

  let items: NewsItem[] = [];
  let upstream: 'ok' | 'degraded' = 'ok';

  // The market sweep and the headline sweep are independent; run them
  // together so a cold request costs one upstream round-trip, not two.
  const snapshotPromise = getMarketSnapshot().catch(() => null);

  if (lang === 'en') {
    items = await collect(CURATED);
  } else {
    items = await collect(googleFeeds(lang));
    if (items.length < 8) {
      const english = await collect(CURATED);
      items = dedupe([...items, ...english]);
      upstream = 'degraded';
    }
  }

  if (items.length === 0 && cached?.payload) {
    return { ...cached.payload, upstream: 'degraded' };
  }

  const snapshot = await snapshotPromise;
  const badges = snapshot ? badgesFromQuotes(snapshot.quotes) : [];

  const payload: NewsPayload = {
    lang,
    items: items.slice(0, 72),
    badges,
    updatedAt: new Date().toISOString(),
    upstream: snapshot ? upstream : 'degraded',
    refreshSeconds: REFRESH_SECONDS,
  };

  store.set(lang, { payload, at: Date.now() });
  return payload;
}

export const NEWS_CATEGORIES: NewsCategory[] = ['breaking', 'gold', 'stocks', 'economy', 'crypto'];
export const NEWS_REFRESH_MS = TTL_MS;
