import type { SupportedLanguage } from '@/types';
import { DEFAULT_LANGUAGE } from '@/lib/languages';

export interface InsightsCopy {
  eyebrow: string;
  title: string;
  lead: string;
  latest: string;
  readBrief: string;
  scriptsTitle: string;
  scriptsLead: string;
  copy: string;
  copied: string;
  published: string;
  minutes: string;
  keywords: string;
  back: string;
  cta: string;
  feedNote: string;
  topics: Record<string, string>;
}

export const INSIGHTS_COPY: Record<SupportedLanguage, InsightsCopy> = {
  en: {
    eyebrow: 'Market insights',
    title: 'Daily market briefs',
    lead: 'Short, plain-language market notes written every day from live prices. Read in one minute.',
    latest: 'Latest briefs',
    readBrief: 'Read brief',
    scriptsTitle: 'Share this brief',
    scriptsLead: 'Ready-to-post scripts for TikTok, YouTube Shorts, X and Telegram. Copy one and post it.',
    copy: 'Copy script',
    copied: 'Copied',
    published: 'Published',
    minutes: 'min read',
    keywords: 'Topics',
    back: 'All briefs',
    cta: 'Start free cloud mining',
    feedNote: 'This page updates automatically every day. Subscribe to the RSS feed for new briefs.',
    topics: { bitcoin: 'Bitcoin', gold: 'Gold', stocks: 'US stocks', currency: 'USD / EGP', mining: 'Cloud mining' },
  },
  ar: {
    eyebrow: 'رؤى السوق',
    title: 'موجزات السوق اليومية',
    lead: 'ملاحظات سوق قصيرة بلغة بسيطة تُكتب كل يوم من الأسعار المباشرة. اقرأها في دقيقة.',
    latest: 'أحدث الموجزات',
    readBrief: 'اقرأ الموجز',
    scriptsTitle: 'شارك هذا الموجز',
    scriptsLead: 'نصوص جاهزة للنشر على تيك توك ويوتيوب شورتس وX وتيليجرام. انسخ واحدًا وانشره.',
    copy: 'نسخ النص',
    copied: 'تم النسخ',
    published: 'نُشر',
    minutes: 'دقيقة قراءة',
    keywords: 'المواضيع',
    back: 'كل الموجزات',
    cta: 'ابدأ التعدين السحابي المجاني',
    feedNote: 'تتحدث هذه الصفحة تلقائيًا كل يوم. اشترك في خلاصة RSS للموجزات الجديدة.',
    topics: { bitcoin: 'بيتكوين', gold: 'الذهب', stocks: 'الأسهم الأمريكية', currency: 'الدولار / الجنيه', mining: 'التعدين السحابي' },
  },
  fr: {
    eyebrow: 'Analyses marché',
    title: 'Briefs marché quotidiens',
    lead: 'Des notes courtes et simples écrites chaque jour à partir des prix en direct. Lecture en une minute.',
    latest: 'Derniers briefs',
    readBrief: 'Lire le brief',
    scriptsTitle: 'Partager ce brief',
    scriptsLead: 'Des scripts prêts à publier pour TikTok, YouTube Shorts, X et Telegram. Copiez-en un et publiez.',
    copy: 'Copier le script',
    copied: 'Copié',
    published: 'Publié',
    minutes: 'min de lecture',
    keywords: 'Sujets',
    back: 'Tous les briefs',
    cta: 'Commencer le minage cloud gratuit',
    feedNote: 'Cette page se met à jour chaque jour. Abonnez-vous au flux RSS pour les nouveaux briefs.',
    topics: { bitcoin: 'Bitcoin', gold: 'Or', stocks: 'Actions US', currency: 'USD / EGP', mining: 'Minage cloud' },
  },
  es: {
    eyebrow: 'Análisis de mercado',
    title: 'Resúmenes diarios de mercado',
    lead: 'Notas breves y sencillas escritas cada día con precios en vivo. Se leen en un minuto.',
    latest: 'Últimos resúmenes',
    readBrief: 'Leer resumen',
    scriptsTitle: 'Comparte este resumen',
    scriptsLead: 'Guiones listos para TikTok, YouTube Shorts, X y Telegram. Copia uno y publícalo.',
    copy: 'Copiar guion',
    copied: 'Copiado',
    published: 'Publicado',
    minutes: 'min de lectura',
    keywords: 'Temas',
    back: 'Todos los resúmenes',
    cta: 'Empezar minería en la nube gratis',
    feedNote: 'Esta página se actualiza cada día. Suscríbete al RSS para nuevos resúmenes.',
    topics: { bitcoin: 'Bitcoin', gold: 'Oro', stocks: 'Acciones de EE. UU.', currency: 'USD / EGP', mining: 'Minería en la nube' },
  },
  zh: {
    eyebrow: '市场洞察',
    title: '每日市场简报',
    lead: '每天根据实时价格写成的大白话市场笔记，一分钟读完。',
    latest: '最新简报',
    readBrief: '阅读简报',
    scriptsTitle: '分享这份简报',
    scriptsLead: '可直接发布到 TikTok、YouTube Shorts、X 和 Telegram 的文案，复制即可发布。',
    copy: '复制文案',
    copied: '已复制',
    published: '发布时间',
    minutes: '分钟阅读',
    keywords: '主题',
    back: '全部简报',
    cta: '开始免费云挖矿',
    feedNote: '本页每天自动更新。订阅 RSS 获取新简报。',
    topics: { bitcoin: '比特币', gold: '黄金', stocks: '美股', currency: '美元 / 埃镑', mining: '云挖矿' },
  },
  hi: {
    eyebrow: 'बाज़ार अंतर्दृष्टि',
    title: 'रोज़ाना बाज़ार ब्रीफ',
    lead: 'हर दिन लाइव कीमतों से लिखी जाने वाली छोटी और आसान बाज़ार नोट्स। एक मिनट में पढ़ें।',
    latest: 'नवीनतम ब्रीफ',
    readBrief: 'ब्रीफ पढ़ें',
    scriptsTitle: 'यह ब्रीफ शेयर करें',
    scriptsLead: 'TikTok, YouTube Shorts, X और Telegram के लिए तैयार स्क्रिप्ट। एक कॉपी करें और पोस्ट करें।',
    copy: 'स्क्रिप्ट कॉपी करें',
    copied: 'कॉपी हो गया',
    published: 'प्रकाशित',
    minutes: 'मिनट पढ़ें',
    keywords: 'विषय',
    back: 'सभी ब्रीफ',
    cta: 'मुफ़्त क्लाउड माइनिंग शुरू करें',
    feedNote: 'यह पेज हर दिन अपने आप अपडेट होता है। नई ब्रीफ के लिए RSS फ़ीड सब्सक्राइब करें।',
    topics: { bitcoin: 'बिटकॉइन', gold: 'सोना', stocks: 'अमेरिकी शेयर', currency: 'डॉलर / मिस्र पाउंड', mining: 'क्लाउड माइनिंग' },
  },
};

export function getInsightsCopy(lang: SupportedLanguage): InsightsCopy {
  return INSIGHTS_COPY[lang] ?? INSIGHTS_COPY[DEFAULT_LANGUAGE];
}
