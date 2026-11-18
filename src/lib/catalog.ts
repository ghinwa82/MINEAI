import type { SupportedLanguage } from '@/types';
import { DEFAULT_LANGUAGE } from '@/lib/languages';

export type NodeTierKey = 'genesis' | 'enterprise' | 'sovereign';

export interface NodePlan {
  id: string;
  /** Localised display name. */
  name: string;
  /** English canonical name — used for SEO, structured data and URL slugs. */
  canonicalName: string;
  /** Localised tier label. */
  tierLabel: string;
  tier: NodeTierKey;
  compute: string;
  priceUsd: number;
  periodLabel: string;
  description: string;
  roi: string;
  features: string[];
  /** Machine-readable operating envelope surfaced on the product page. */
  envelope: {
    compute: string;
    cadence: string;
    settlement: string;
    support: string;
  };
}

/**
 * The catalogue is authored once per language. English is the source of truth
 * and every other locale mirrors it entry-for-entry, so the storefront, the
 * product routes, the sitemap and the JSON-LD payloads all read from the same
 * record and can never drift apart.
 */
interface LocalisedPlan extends Omit<NodePlan, 'canonicalName' | 'envelope'> {
  canonicalName?: string;
  name: string;
  tierLabel: string;
  envelope?: NodePlan['envelope'];
}

const ENVELOPE: Record<NodeTierKey, NodePlan['envelope']> = {
  genesis: {
    compute: '850 TFLOPS neural cluster',
    cadence: 'Continuous ad-library sweep',
    settlement: 'Wallet or verified bank rail',
    support: 'Operator response inside one business day',
  },
  enterprise: {
    compute: '1.8 PFLOPS multi-cluster',
    cadence: 'Sweep plus supplier re-pricing every 15 minutes',
    settlement: 'Same-day bank settlement, priority queue',
    support: 'Operator response inside four hours',
  },
  sovereign: {
    compute: '4.2 PFLOPS distributed grid',
    cadence: 'Sweep, re-pricing and fulfilment in one pass',
    settlement: 'Instant off-ramp, crypto and fiat in parallel',
    support: 'Named operator, 24/7 escalation channel',
  },
};

const EN: LocalisedPlan[] = [
  {
    id: 'node-1',
    canonicalName: 'NexusPulse AI',
    name: 'NexusPulse AI - Viral Trend & Supplier Scout',
    tier: 'genesis',
    tierLabel: 'Genesis node',
    compute: '850 TFLOPS Neural Cluster',
    priceUsd: 149,
    periodLabel: '/ month',
    description:
      'An autonomous scraper that reads TikTok Ads, Meta Creative Center and AliExpress continuously, surfacing high-margin breakouts while the market is still open.',
    roi: '+340% projected scaled ROAS',
    features: [
      'Round-the-clock TikTok and Meta ad intelligence',
      'Live CJ and AliExpress cost arbitrage',
      'Automated AI video creative generation',
      'Strix AI saturation protection filter',
    ],
  },
  {
    id: 'node-2',
    canonicalName: 'OmniCartel AI',
    name: 'OmniCartel AI - Multi-Store Hyper-Fulfillment Core',
    tier: 'enterprise',
    tierLabel: 'Enterprise node',
    compute: '1.8 PFLOPS Multi-Cluster',
    priceUsd: 349,
    periodLabel: '/ month',
    description:
      'A decentralised fulfilment engine that runs order processing, tracking sync and customer resolution across fifteen or more connected storefronts.',
    roi: '99.96% zero-touch order precision',
    features: [
      'Zero-touch automated supplier order dispatch',
      'Thirty-language contextual customer agent',
      'Live profit margin modulation against FX drift',
      'Chargeback and fraud shield architecture',
    ],
  },
  {
    id: 'node-3',
    canonicalName: 'QuantumDrop AI',
    name: 'QuantumDrop AI - Sovereign DePIN Master Engine',
    tier: 'sovereign',
    tierLabel: 'Sovereign master',
    compute: '4.2 PFLOPS Distributed Grid',
    priceUsd: 799,
    periodLabel: 'Lifetime access',
    description:
      'The pinnacle of the mesh: full inventory synchronisation, algorithmic multi-supplier balancing and a direct bank payout route running beside the crypto off-ramp.',
    roi: 'Maximum compute yield plus token rewards',
    features: [
      'Full share of DePIN network compute',
      'Instant bank and crypto liquidity off-ramp',
      'Self-healing multi-supplier matrix',
      'VIP growth agent layer with double XP',
    ],
  },
];

const AR: LocalisedPlan[] = [
  {
    id: 'node-1',
    canonicalName: 'NexusPulse AI',
    name: 'NexusPulse AI - المستكشف الآلي للترندات والموردين',
    tier: 'genesis',
    tierLabel: 'عقدة Genesis',
    compute: '850 TFLOPS معالج عصبي',
    priceUsd: 149,
    periodLabel: '/ شهرياً',
    description:
      'ماسح آلي يحلل إعلانات تيك توك وميتا ومستودعات علي إكسبريس لاقتناص المنتجات الرابحة قبل تشبع السوق.',
    roi: '+340% متوسط مضاعفة العائد الإعلاني',
    features: [
      'استكشاف حي لإعلانات تيك توك وميتا 24/7',
      'موازنة أسعار فورية مع واجهات CJ و AliExpress',
      'توليد آلي لإعلانات الفيديو والنصوص التسويقية',
      'درع Strix AI الدفاعي لمنع تشبع السوق',
    ],
  },
  {
    id: 'node-2',
    canonicalName: 'OmniCartel AI',
    name: 'OmniCartel AI - التوريد وإدارة المتاجر المتعددة الآلي',
    tier: 'enterprise',
    tierLabel: 'عقدة Enterprise',
    compute: '1.8 PFLOPS حوسبة فائقة',
    priceUsd: 349,
    periodLabel: '/ شهرياً',
    description:
      'محرك توريد لامركزي يدير الطلبيات وتتبع الشحنات وخدمة العملاء لأكثر من 15 متجر شوبيفاي بنمط آلي 100%.',
    roi: '99.96% دقة إرسال الطلبيات بدون أخطاء',
    features: [
      'إرسال طلبيات الموردين آلياً بدون تدخل بشري',
      'خدمة عملاء ذكية بـ 30 لغة عالمية على مدار الساعة',
      'تعديل ديناميكي لنسب الربح وفق تقلبات العملات',
      'حماية متطورة من الاحتيال واسترجاع الأموال',
    ],
  },
  {
    id: 'node-3',
    canonicalName: 'QuantumDrop AI',
    name: 'QuantumDrop AI - الماستر نود السيادية المستقلة',
    tier: 'sovereign',
    tierLabel: 'الماستر نود السيادية',
    compute: '4.2 PFLOPS شبكة موزعة',
    priceUsd: 799,
    periodLabel: 'وصول دائم مدى الحياة',
    description:
      'العقدة السيادية الأقوى في شبكة DePIN. مزامنة شاملة للمخزون وموازنة الموردين مع مسارات سحب نقدية مباشرة عبر التسوية البنكية والعملات الرقمية.',
    roi: 'أعلى معدل تعدين وعوائد توكنز مضاعفة',
    features: [
      'حصة مباشرة من قوة حوسبة شبكة DePIN العالمية',
      'سحب نقدي لحظي عبر البنك ومحافظ الكريبتو',
      'معالجة ذاتية للأعطال وتناغم متقدم للموردين',
      'وكيل النمو التسويقي المضاعف مع نقاط XP إضافية',
    ],
  },
];

const FR: LocalisedPlan[] = [
  {
    id: 'node-1',
    canonicalName: 'NexusPulse AI',
    name: 'NexusPulse AI - Chasseur de Tendances et Fournisseurs',
    tier: 'genesis',
    tierLabel: 'Nœud Genesis',
    compute: '850 TFLOPS Cluster Neuronal',
    priceUsd: 149,
    periodLabel: '/ mois',
    description:
      'Scraper autonome scannant en continu TikTok Ads, Meta Creative Center et AliExpress pour dénicher les produits viraux avant saturation.',
    roi: '+340% ROAS projeté',
    features: [
      'Surveillance continue TikTok et Meta Ads',
      'Arbitrage automatisé CJ et AliExpress',
      'Génération de créatives vidéo par IA',
      'Bouclier anti-saturation Strix AI',
    ],
  },
  {
    id: 'node-2',
    canonicalName: 'OmniCartel AI',
    name: 'OmniCartel AI - Centre d’Exécution Multi-Boutiques',
    tier: 'enterprise',
    tierLabel: 'Nœud Enterprise',
    compute: '1.8 PFLOPS Multi-Cluster',
    priceUsd: 349,
    periodLabel: '/ mois',
    description:
      'Moteur d’exécution décentralisé gérant les commandes, le suivi des colis et le support sur plus de quinze boutiques connectées.',
    roi: '99.96% de précision sans intervention',
    features: [
      'Envoi automatisé des commandes fournisseurs',
      'Agent client IA en 30 langues, 24h/24',
      'Optimiseur dynamique de marge nette',
      'Protection contre la fraude et les impayés',
    ],
  },
  {
    id: 'node-3',
    canonicalName: 'QuantumDrop AI',
    name: 'QuantumDrop AI - Nœud Maître Souverain DePIN',
    tier: 'sovereign',
    tierLabel: 'Maître souverain',
    compute: '4.2 PFLOPS Grille Distribuée',
    priceUsd: 799,
    periodLabel: 'Accès à vie',
    description:
      'Le cluster DePIN suprême : synchronisation d’inventaire, équilibrage multi-fournisseurs et paiements directs bancaires et crypto.',
    roi: 'Rendement maximal plus récompenses de tokens',
    features: [
      'Partage complet du calcul du réseau DePIN',
      'Passerelle de retrait instantanée banque et crypto',
      'Auto-guérison de la matrice fournisseurs',
      'Couche d’agent growth VIP avec XP doublé',
    ],
  },
];

const ES: LocalisedPlan[] = [
  {
    id: 'node-1',
    canonicalName: 'NexusPulse AI',
    name: 'NexusPulse AI - Explorador de Tendencias y Proveedores',
    tier: 'genesis',
    tierLabel: 'Nodo Génesis',
    compute: '850 TFLOPS Clúster Neuronal',
    priceUsd: 149,
    periodLabel: '/ mes',
    description:
      'Agente autónomo que analiza sin parar TikTok Ads, Meta Creative Center y AliExpress para detectar productos ganadores antes de su saturación.',
    roi: '+340% ROAS medio proyectado',
    features: [
      'Monitoreo continuo de TikTok y Meta Ads',
      'Arbitraje de precios CJ y AliExpress',
      'Generación automática de creatividades de video',
      'Filtro defensivo Strix AI anti-saturación',
    ],
  },
  {
    id: 'node-2',
    canonicalName: 'OmniCartel AI',
    name: 'OmniCartel AI - Núcleo de Despacho Multi-Tienda',
    tier: 'enterprise',
    tierLabel: 'Nodo Enterprise',
    compute: '1.8 PFLOPS Multi-Clúster',
    priceUsd: 349,
    periodLabel: '/ mes',
    description:
      'Motor descentralizado que gestiona pedidos, seguimiento de envíos y atención al cliente en más de quince tiendas conectadas, en piloto automático.',
    roi: '99.96% de precisión de despacho sin fricción',
    features: [
      'Despacho automatizado de pedidos al proveedor',
      'Soporte al cliente con IA en 30 idiomas',
      'Optimizador dinámico de margen de ganancia',
      'Blindaje contra fraude y contracargos',
    ],
  },
  {
    id: 'node-3',
    canonicalName: 'QuantumDrop AI',
    name: 'QuantumDrop AI - Nodo Maestro Soberano DePIN',
    tier: 'sovereign',
    tierLabel: 'Maestro Soberano',
    compute: '4.2 PFLOPS Red Distribuida',
    priceUsd: 799,
    periodLabel: 'Acceso Vitalicio',
    description:
      'El clúster DePIN definitivo: sincronización de inventario, balanceo multi-proveedor y liquidación directa a cuentas bancarias y criptomonedas.',
    roi: 'Máximo hashrate y recompensas de tokens',
    features: [
      'Cuota directa de la potencia de cómputo DePIN',
      'Salida directa a la banca y liquidez crypto',
      'Matriz de proveedores con auto-reparación',
      'Agente VIP growth hacking con multiplicador',
    ],
  },
];

const ZH: LocalisedPlan[] = [
  {
    id: 'node-1',
    canonicalName: 'NexusPulse AI',
    name: 'NexusPulse AI - 爆品侦察与供应链节点',
    tier: 'genesis',
    tierLabel: '创世节点',
    compute: '850 TFLOPS 神经网络算力',
    priceUsd: 149,
    periodLabel: '/ 月',
    description:
      '自主爬虫节点持续扫描 TikTok Ads、Meta 创意中心与速卖通，在爆品饱和前精准锁定高利润品类。',
    roi: '+340% 预期广告投入回报',
    features: [
      '24/7 全天候监控 TikTok 与 Meta 爆品广告',
      '即时对比 CJ 与速卖通底层供货底价',
      'AI 自动生成高转化短视频素材',
      'Strix AI 防市场饱和风控防护网',
    ],
  },
  {
    id: 'node-2',
    canonicalName: 'OmniCartel AI',
    name: 'OmniCartel AI - 多店铺全自动履约超级核心',
    tier: 'enterprise',
    tierLabel: '企业级节点',
    compute: '1.8 PFLOPS 密集集群',
    priceUsd: 349,
    periodLabel: '/ 月',
    description:
      '去中心化供应链执行引擎，自动管理超过 15 家已连接店铺的订单派发、物流跟踪与客户服务。',
    roi: '99.96% 零失误自动下单准确率',
    features: [
      '零人工干预全自动派发供应商订单',
      '支持 30 种语言的多语种 AI 智能客服',
      '基于汇率波动的动态利润率智能调节',
      '防恶意退款与欺诈防范安全护盾',
    ],
  },
  {
    id: 'node-3',
    canonicalName: 'QuantumDrop AI',
    name: 'QuantumDrop AI - 顶级至尊 DePIN 主节点',
    tier: 'sovereign',
    tierLabel: '至尊主节点',
    compute: '4.2 PFLOPS 全球分布式网格',
    priceUsd: 799,
    periodLabel: '终身授权',
    description:
      '终极 DePIN 主算力集群。配备全面的供应链同步引擎与 银行 法币／加密货币实时下发通道。',
    roi: '极速算力收益 + 代币奖励加成',
    features: [
      '享有全球 DePIN 算力网络分成份额',
      '支持 银行账户 与加密货币即时提现通道',
      '多供应商故障自愈级调度矩阵',
      '内置 VIP 裂变增长智能体与 XP 双倍加速',
    ],
  },
];

const HI: LocalisedPlan[] = [
  {
    id: 'node-1',
    canonicalName: 'NexusPulse AI',
    name: 'NexusPulse AI - ट्रेंड और आपूर्तिकर्ता स्काउट',
    tier: 'genesis',
    tierLabel: 'जेनेसिस नोड',
    compute: '850 TFLOPS न्यूरल क्लस्टर',
    priceUsd: 149,
    periodLabel: '/ माह',
    description:
      'स्वायत्त स्क्रैपर जो टिकटॉक विज्ञापन, मेटा क्रिएटिव सेंटर और एलीएक्सप्रेस को लगातार स्कैन करता है, ताकि उच्च-मार्जिन वाले वायरल उत्पाद बाज़ार खुला रहते हुए पकड़े जा सकें।',
    roi: '+340% अनुमानित स्केल्ड ROAS',
    features: [
      '24/7 टिकटॉक और मेटा विज्ञापन निगरानी',
      'त्वरित CJ और एलीएक्सप्रेस लागत संतुलन',
      'स्वचालित AI वीडियो क्रिएटिव निर्माण',
      'Strix AI संतृप्ति सुरक्षा फ़िल्टर',
    ],
  },
  {
    id: 'node-2',
    canonicalName: 'OmniCartel AI',
    name: 'OmniCartel AI - मल्टी-स्टोर पूर्ति कोर',
    tier: 'enterprise',
    tierLabel: 'एंटरप्राइज नोड',
    compute: '1.8 PFLOPS मल्टी-क्लस्टर',
    priceUsd: 349,
    periodLabel: '/ माह',
    description:
      'विकेंद्रीकृत इंजन जो पंद्रह से अधिक जुड़े स्टोर्स में ऑर्डर प्रोसेसिंग, ट्रैकिंग सिंक और ग्राहक सेवा को पूरी तरह ऑटो-पायलट पर चलाता है।',
    roi: '99.96% सटीक ऑर्डर पूर्ति',
    features: [
      'मानव रहित स्वचालित ऑर्डर प्रेषण',
      '30 भाषाओं में ग्राहक सेवा एजेंट',
      'वास्तविक समय लाभ मार्जिन अनुकूलक',
      'धोखाधड़ी और चार्जबैक सुरक्षा कवच',
    ],
  },
  {
    id: 'node-3',
    canonicalName: 'QuantumDrop AI',
    name: 'QuantumDrop AI - सोवरेन DePIN मास्टर इंजन',
    tier: 'sovereign',
    tierLabel: 'सोवरेन मास्टर नोड',
    compute: '4.2 PFLOPS वितरित ग्रिड',
    priceUsd: 799,
    periodLabel: 'लाइफटाइम एक्सेस',
    description:
      'सर्वोच्च DePIN क्लस्टर। पूर्ण इन्वेंट्री सिंक्रोनाइज़ेशन, एल्गोरिथमिक मल्टी-सप्लायर संतुलन और सीधे बैंक तथा क्रिप्टो भुगतान मार्ग।',
    roi: 'अधिकतम हैशरेट उपज और टोकन पुरस्कार',
    features: [
      'पूर्ण DePIN नेटवर्क कंप्यूटिंग पावर शेयर',
      'तत्काल बैंक और क्रिप्टो निकासी',
      'मल्टी-सप्लायर मैट्रिक्स स्व-उपचार इंजन',
      'VIP ग्रोथ एजेंट और 2x XP गुणक',
    ],
  },
];

const CATALOGUE: Record<SupportedLanguage, LocalisedPlan[]> = {
  en: EN,
  ar: AR,
  fr: FR,
  es: ES,
  zh: ZH,
  hi: HI,
};

/** Localised catalogue for the given language. */
export function getCatalogue(lang: SupportedLanguage): NodePlan[] {
  const source = CATALOGUE[lang] ?? CATALOGUE[DEFAULT_LANGUAGE];
  return source.map((plan) => ({
    ...plan,
    canonicalName: plan.canonicalName ?? plan.name.split(' - ')[0],
    envelope: plan.envelope ?? ENVELOPE[plan.tier],
  }));
}

/**
 * Language-neutral catalogue. Crawlers, the sitemap and structured data all
 * read from this so the machine-readable layer stays stable across locales.
 */
export function getCanonicalCatalogue(): NodePlan[] {
  return getCatalogue(DEFAULT_LANGUAGE);
}

export function findPlanById(lang: SupportedLanguage, id: string): NodePlan | undefined {
  const needle = id.trim().toLowerCase();
  return getCatalogue(lang).find(
    (plan) =>
      plan.id.toLowerCase() === needle || plan.canonicalName.toLowerCase().replace(/\s+/g, '-') === needle,
  );
}

/** Stable slug used by the product routes and the sitemap. */
export function planSlug(plan: NodePlan): string {
  return plan.canonicalName.toLowerCase().replace(/\s+/g, '-');
}
