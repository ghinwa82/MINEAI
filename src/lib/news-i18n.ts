import type { SupportedLanguage } from '@/types';
import { DEFAULT_LANGUAGE } from '@/lib/languages';
import type { NewsFilter } from '@/lib/news';

/**
 * Copy for the news intelligence page and the breaking ticker.
 *
 * Written per locale rather than machine translated: the labels sit beside
 * live headlines, so a clumsy phrase would be read as a broken feed.
 */

export interface NewsCopy {
  eyebrow: string;
  title: string;
  lead: string;
  live: string;
  degraded: string;
  updated: string;
  refreshNote: string;
  tickerLabel: string;
  filterLabel: string;
  categories: Record<NewsFilter, string>;
  readMore: string;
  empty: string;
  error: string;
  retry: string;
  marketsTitle: string;
  marketsLead: string;
  viewMarkets: string;
  sourcesNote: string;
  share: string;
  shareTitle: string;
}

const EN: NewsCopy = {
  eyebrow: 'Live intelligence',
  title: 'World news, gold, markets and crypto — as it breaks',
  lead: 'A single desk for breaking world news, the global economy, gold and precious metals, stock indices, forex and digital assets. Headlines refresh every five minutes from public feeds; prices stream beside them.',
  live: 'Live',
  degraded: 'Partial feed',
  updated: 'Updated',
  refreshNote: 'Auto-refreshes every 5 minutes',
  tickerLabel: 'Breaking',
  filterLabel: 'Filter by desk',
  categories: {
    all: 'All',
    breaking: 'Breaking world news',
    gold: 'Gold & commodities',
    stocks: 'Stock market',
    economy: 'Global economy',
    crypto: 'Crypto',
  },
  readMore: 'Read at source',
  empty: 'No headlines in this desk yet. The next refresh will fill it.',
  error: 'The news desk is unreachable right now.',
  retry: 'Retry',
  marketsTitle: 'Prices beside the headlines',
  marketsLead: 'Gold, bitcoin, ether, solana and the USD/EGP rate — the same prints the market terminal serves.',
  viewMarkets: 'Open the market terminal',
  sourcesNote: 'Headlines link to the original publisher. MineAI Node aggregates, it does not rewrite.',
  share: 'Share',
  shareTitle: 'Share this desk',
};

const AR: NewsCopy = {
  eyebrow: 'استخبارات حيّة',
  title: 'أخبار العالم والذهب والأسواق والعملات الرقمية — لحظة بلحظة',
  lead: 'مكتب واحد للأخبار العالمية العاجلة والاقتصاد العالمي والذهب والمعادن الثمينة ومؤشرات الأسهم والفوركس والأصول الرقمية. تتحدّث العناوين كل خمس دقائق من مصادر عامة، والأسعار تتدفق بجانبها.',
  live: 'مباشر',
  degraded: 'تغذية جزئية',
  updated: 'آخر تحديث',
  refreshNote: 'تحديث تلقائي كل 5 دقائق',
  tickerLabel: 'عاجل',
  filterLabel: 'تصفية حسب القسم',
  categories: {
    all: 'الكل',
    breaking: 'أخبار العالم العاجلة',
    gold: 'الذهب والسلع',
    stocks: 'سوق الأسهم',
    economy: 'الاقتصاد العالمي',
    crypto: 'العملات الرقمية',
  },
  readMore: 'اقرأ عند المصدر',
  empty: 'لا عناوين في هذا القسم بعد. سيملؤه التحديث القادم.',
  error: 'تعذّر الوصول إلى مكتب الأخبار الآن.',
  retry: 'إعادة المحاولة',
  marketsTitle: 'الأسعار بجانب العناوين',
  marketsLead: 'الذهب وبيتكوين وإيثر وسولانا وسعر الدولار مقابل الجنيه المصري — نفس الأرقام التي تعرضها طرفية الأسواق.',
  viewMarkets: 'افتح طرفية الأسواق',
  sourcesNote: 'ترتبط العناوين بالناشر الأصلي. MineAI Node يجمع ولا يعيد الصياغة.',
  share: 'مشاركة',
  shareTitle: 'شارك هذا المكتب',
};

const FR: NewsCopy = {
  eyebrow: 'Renseignement en direct',
  title: "Actualité mondiale, or, marchés et crypto — à l'instant",
  lead: "Un seul desk pour l'actualité mondiale urgente, l'économie globale, l'or et les métaux précieux, les indices boursiers, le forex et les actifs numériques. Les titres se rafraîchissent toutes les cinq minutes depuis des flux publics ; les prix défilent à côté.",
  live: 'En direct',
  degraded: 'Flux partiel',
  updated: 'Mis à jour',
  refreshNote: 'Rafraîchissement automatique toutes les 5 minutes',
  tickerLabel: 'Urgent',
  filterLabel: 'Filtrer par desk',
  categories: {
    all: 'Tout',
    breaking: 'Actualité mondiale urgente',
    gold: 'Or et matières premières',
    stocks: 'Marchés boursiers',
    economy: 'Économie mondiale',
    crypto: 'Crypto',
  },
  readMore: 'Lire à la source',
  empty: 'Aucun titre dans ce desk pour le moment. Le prochain rafraîchissement le remplira.',
  error: 'Le desk actualités est injoignable pour le moment.',
  retry: 'Réessayer',
  marketsTitle: 'Les prix à côté des titres',
  marketsLead: "Or, bitcoin, ether, solana et le taux USD/EGP — les mêmes cours que la console de marchés.",
  viewMarkets: 'Ouvrir la console de marchés',
  sourcesNote: "Les titres renvoient à l'éditeur d'origine. MineAI Node agrège, il ne réécrit pas.",
  share: 'Partager',
  shareTitle: 'Partager ce desk',
};

const ES: NewsCopy = {
  eyebrow: 'Inteligencia en vivo',
  title: 'Noticias mundiales, oro, mercados y cripto — al instante',
  lead: 'Una sola mesa para noticias mundiales de última hora, economía global, oro y metales preciosos, índices bursátiles, forex y activos digitales. Los titulares se actualizan cada cinco minutos desde fuentes públicas; los precios fluyen al lado.',
  live: 'En vivo',
  degraded: 'Fuente parcial',
  updated: 'Actualizado',
  refreshNote: 'Se actualiza automáticamente cada 5 minutos',
  tickerLabel: 'Última hora',
  filterLabel: 'Filtrar por mesa',
  categories: {
    all: 'Todo',
    breaking: 'Noticias mundiales de última hora',
    gold: 'Oro y materias primas',
    stocks: 'Mercado de valores',
    economy: 'Economía global',
    crypto: 'Cripto',
  },
  readMore: 'Leer en la fuente',
  empty: 'Aún no hay titulares en esta mesa. La próxima actualización los llenará.',
  error: 'La mesa de noticias no está disponible ahora.',
  retry: 'Reintentar',
  marketsTitle: 'Precios junto a los titulares',
  marketsLead: 'Oro, bitcoin, ether, solana y el tipo USD/EGP: las mismas cotizaciones que sirve la terminal de mercados.',
  viewMarkets: 'Abrir la terminal de mercados',
  sourcesNote: 'Los titulares enlazan al editor original. MineAI Node agrega, no reescribe.',
  share: 'Compartir',
  shareTitle: 'Comparte esta mesa',
};

const ZH: NewsCopy = {
  eyebrow: '实时情报',
  title: '全球新闻、黄金、股市与加密资产 —— 即时呈现',
  lead: '一个编辑台汇聚突发国际新闻、全球经济、黄金与贵金属、股票指数、外汇与数字资产。头条每五分钟从公共信息源刷新，价格同步滚动。',
  live: '实时',
  degraded: '部分信息源',
  updated: '更新于',
  refreshNote: '每 5 分钟自动刷新',
  tickerLabel: '突发',
  filterLabel: '按栏目筛选',
  categories: {
    all: '全部',
    breaking: '突发国际新闻',
    gold: '黄金与商品',
    stocks: '股票市场',
    economy: '全球经济',
    crypto: '加密货币',
  },
  readMore: '前往来源阅读',
  empty: '此栏目暂无头条，下次刷新将填充。',
  error: '新闻编辑台暂时无法访问。',
  retry: '重试',
  marketsTitle: '头条旁边的价格',
  marketsLead: '黄金、比特币、以太坊、Solana 与美元/埃及镑汇率——与行情终端一致。',
  viewMarkets: '打开行情终端',
  sourcesNote: '头条链接至原始发布方。MineAI Node 仅聚合，不重写内容。',
  share: '分享',
  shareTitle: '分享此栏目',
};

const HI: NewsCopy = {
  eyebrow: 'लाइव इंटेलिजेंस',
  title: 'विश्व समाचार, सोना, बाज़ार और क्रिप्टो — तुरंत',
  lead: 'ताज़ा वैश्विक समाचार, वैश्विक अर्थव्यवस्था, सोना और कीमती धातुएँ, शेयर सूचकांक, फ़ॉरेक्स और डिजिटल संपत्ति — एक ही डेस्क पर। शीर्षक हर पाँच मिनट में सार्वजनिक फ़ीड से ताज़ा होते हैं; कीमतें साथ चलती हैं।',
  live: 'लाइव',
  degraded: 'आंशिक फ़ीड',
  updated: 'अद्यतन',
  refreshNote: 'हर 5 मिनट में स्वतः ताज़ा',
  tickerLabel: 'ब्रेकिंग',
  filterLabel: 'डेस्क से फ़िल्टर करें',
  categories: {
    all: 'सभी',
    breaking: 'ब्रेकिंग विश्व समाचार',
    gold: 'सोना और कमोडिटी',
    stocks: 'शेयर बाज़ार',
    economy: 'वैश्विक अर्थव्यवस्था',
    crypto: 'क्रिप्टो',
  },
  readMore: 'स्रोत पर पढ़ें',
  empty: 'इस डेस्क में अभी कोई शीर्षक नहीं है। अगला रिफ़्रेश इसे भर देगा।',
  error: 'समाचार डेस्क अभी उपलब्ध नहीं है।',
  retry: 'पुनः प्रयास',
  marketsTitle: 'शीर्षकों के साथ कीमतें',
  marketsLead: 'सोना, बिटकॉइन, ईथर, सोलाना और USD/EGP दर — वही कोट जो मार्केट टर्मिनल देता है।',
  viewMarkets: 'मार्केट टर्मिनल खोलें',
  sourcesNote: 'शीर्षक मूल प्रकाशक से जुड़ते हैं। MineAI Node केवल एकत्र करता है, पुनर्लेखन नहीं करता।',
  share: 'साझा करें',
  shareTitle: 'यह डेस्क साझा करें',
};

const COPY: Record<SupportedLanguage, NewsCopy> = { en: EN, ar: AR, fr: FR, es: ES, zh: ZH, hi: HI };

export function getNewsCopy(lang: SupportedLanguage): NewsCopy {
  return COPY[lang] ?? COPY[DEFAULT_LANGUAGE];
}
