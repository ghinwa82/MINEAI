'use client';

import React, { useState } from 'react';

type SupportedLang = 'en' | 'ar' | 'fr' | 'es' | 'zh' | 'hi';

interface TranslationMatrix {
  storeTitle: string;
  storeSubtitle: string;
  heroBadge: string;
  heroHeadline: string;
  heroDesc: string;
  balanceLabel: string;
  withdrawBtn: string;
  activateBtn: string;
  activatedBtn: string;
  withdrawalModalTitle: string;
  withdrawAmountLabel: string;
  destinationLabel: string;
  confirmWithdrawal: string;
  cancelBtn: string;
  featuresTitle: string;
  popularBadge: string;
  highYieldBadge: string;
  sovereignBadge: string;
  products: {
    id: string;
    name: string;
    tier: string;
    compute: string;
    price: number;
    period: string;
    desc: string;
    roi: string;
    features: string[];
  }[];
}

const translations: Record<SupportedLang, TranslationMatrix> = {
  en: {
    storeTitle: 'MineAI DePIN Store',
    storeSubtitle: 'Autonomous AI E-Commerce & Dropshipping Node Clusters',
    heroBadge: 'DEPIN AUTONOMOUS HARDWARE LAYER',
    heroHeadline: 'Deploy High-Yield AI Dropshipping Compute Nodes',
    heroDesc: 'Connect distributed neural clusters to automate product discovery, competitor ad surveillance, and supplier fulfillment with guaranteed uptime.',
    balanceLabel: 'Available Treasury Balance',
    withdrawBtn: 'Withdraw Funds',
    activateBtn: '⚡ Activate Node Now',
    activatedBtn: '● Node Active & Mining Yield',
    withdrawalModalTitle: 'Treasury & Wallet Fiat/Crypto Withdrawal',
    withdrawAmountLabel: 'Amount ($USD):',
    destinationLabel: 'Destination Wallet / Stripe IBAN:',
    confirmWithdrawal: 'Execute Immediate Transfer',
    cancelBtn: 'Close',
    featuresTitle: 'Agent Capabilities Included:',
    popularBadge: 'TOP CHOICE',
    highYieldBadge: 'HIGH YIELD',
    sovereignBadge: 'SOVEREIGN MASTER',
    products: [
      {
        id: 'node-1',
        name: 'NexusPulse AI - Viral Trend & Supplier Scout',
        tier: 'GENESIS NODE',
        compute: '850 TFLOPS Neural Cluster',
        price: 149,
        period: '/ month',
        desc: 'Autonomous scraper continuously scanning TikTok Ads, Meta Creative Center, and AliExpress for high-margin breakout products.',
        roi: '+340% Projected Scaled ROAS',
        features: [
          '24/7 TikTok & Meta Ad Intelligence Mining',
          'Instant CJ & AliExpress Cost Arbitrage',
          'Automated AI Video Creative Generation',
          'Strix AI Saturation Protection Filter',
        ],
      },
      {
        id: 'node-2',
        name: 'OmniCartel AI - Multi-Store Hyper-Fulfillment Core',
        tier: 'ENTERPRISE NODE',
        compute: '1.8 PFLOPS Multi-Cluster',
        price: 349,
        period: '/ month',
        desc: 'Decentralized fulfillment engine managing order processing, tracking sync, and customer resolution across 15+ Shopify stores.',
        roi: '99.96% Zero-Touch Order Precision',
        features: [
          'Zero-Touch Automated Order Dispatch',
          '30-Language Contextual AI Customer Agent',
          'Real-time Dynamic Profit Margin Optimizer',
          'Chargeback & Fraud Shield Architecture',
        ],
      },
      {
        id: 'node-3',
        name: 'QuantumDrop AI - Sovereign DePIN Master Engine',
        tier: 'SOVEREIGN MASTER',
        compute: '4.2 PFLOPS Distributed Grid',
        price: 799,
        period: 'Lifetime Access',
        desc: 'The pinnacle DePIN master cluster. Full inventory synchronization, algorithmic multi-supplier balancing, and direct Stripe payout routing.',
        roi: 'Max Compute Hashrate Yield + Token Rewards',
        features: [
          'Full DePIN Network Computing Power Share',
          'Instant Stripe & Crypto Liquidity Off-Ramp',
          'Multi-Supplier Matrix Self-Healing Engine',
          'VIP Automated Growth Hacking Agent Layer',
        ],
      },
    ],
  },
  ar: {
    storeTitle: 'متجر MineAI DePIN',
    storeSubtitle: 'عقد الذكاء الاصطناعي المستقلة للدروبشيبينغ والتجارة الإلكترونية',
    heroBadge: 'طبقة أجهزة DePIN اللامركزية',
    heroHeadline: 'شغّل عقد التعدين والدروبشيبينغ الذكية ذات العائد المرتفع',
    heroDesc: 'اربط العناقيد العصبية الموزعة لأتمتة اكتشاف المنتجات الفيروسية، ومراقبة إعلانات المنافسين، والتوريد الذاتي بنسبة استقرار تامة.',
    balanceLabel: 'رصيد الخزينة المتاح',
    withdrawBtn: 'سحب الأرباح',
    activateBtn: '⚡ تفعيل وتشغيل العقدة فوراً',
    activatedBtn: '● العقدة تعمل وتولد العوائد',
    withdrawalModalTitle: 'سحب الأموال إلى المحفظة أو الحساب البنكي / Stripe',
    withdrawAmountLabel: 'المبلغ ($USD):',
    destinationLabel: 'عنوان المحفظة أو رقم IBAN / Stripe:',
    confirmWithdrawal: 'تنفيذ التحويل الفوري',
    cancelBtn: 'إغلاق',
    featuresTitle: 'القدرات البرمجية المضمنة للعقدة:',
    popularBadge: 'الأكثر طلباً',
    highYieldBadge: 'عائد استثنائي',
    sovereignBadge: 'العقدة السيادية',
    products: [
      {
        id: 'node-1',
        name: 'NexusPulse AI - المستكشف الآلي للترندات والموردين',
        tier: 'عقدة Genesis',
        compute: '850 TFLOPS معالج عصبي',
        price: 149,
        period: '/ شهرياً',
        desc: 'ماسح آلي يحلل إعلانات تيك توك وميتا ومستودعات علي إكسبريس لاقتناص المنتجات الرابحة قبل تشبع السوق.',
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
        name: 'OmniCartel AI - التوريد وإدارة المتاجر المتعددة الآلي',
        tier: 'عقدة Enterprise',
        compute: '1.8 PFLOPS حوسبة فائقة',
        price: 349,
        period: '/ شهرياً',
        desc: 'محرك توريد لامركزي يدير الطلبيات وتتبع الشحنات وخدمة العملاء لأكثر من 15 متجر شوبيفاي بنمط آلي 100%.',
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
        name: 'QuantumDrop AI - الماستر نود السيادية المستقلة',
        tier: 'الماستر نود السيادية',
        compute: '4.2 PFLOPS شبكة موزعة',
        price: 799,
        period: 'وصول دائم مدى الحياة',
        desc: 'العقدة السيادية الأقوى في شبكة DePIN. مزامنة شاملة للمخزون وموازنة الموردين مع مسارات سحب نقدية مباشرة عبر Stripe والعملات الرقمية.',
        roi: 'أعلى معدل تعدين وعوائد توكنز مضاعفة',
        features: [
          'حصة مباشرة من قوة حوسبة شبكة DePIN العالمية',
          'سحب نقدي لحظي عبر Stripe ومحافظ الكريبتو',
          'معالجة ذاتية للأعطال وتناغم متقدم للموردين',
          'وكيل النمو التسويقي المضاعف مع نقاط XP إضافية',
        ],
      },
    ],
  },
  fr: {
    storeTitle: 'Boutique MineAI DePIN',
    storeSubtitle: 'Nœuds Autonomes d’E-Commerce et Dropshipping par IA',
    heroBadge: 'COUCHE MATÉRIELLE DEPIN DÉCENTRALISÉE',
    heroHeadline: 'Déployez des Nœuds Dropshipping IA à Haut Rendement',
    heroDesc: 'Connectez des clusters neuronaux décentralisés pour automatiser la recherche de produits gagnants et l’exécution des commandes.',
    balanceLabel: 'Solde Disponible Trésorerie',
    withdrawBtn: 'Retirer des Fonds',
    activateBtn: '⚡ Activer le Nœud',
    activatedBtn: '● Nœud Actif et en Minage',
    withdrawalModalTitle: 'Retrait Vers Portefeuille / Stripe',
    withdrawAmountLabel: 'Montant ($USD):',
    destinationLabel: 'Adresse de Portefeuille ou IBAN Stripe:',
    confirmWithdrawal: 'Exécuter le Transfert Immédiat',
    cancelBtn: 'Fermer',
    featuresTitle: 'Capacités Incluses de l’Agent:',
    popularBadge: 'TOP CHOIX',
    highYieldBadge: 'HAUT RENDEMENT',
    sovereignBadge: 'NŒUD MAÎTRE',
    products: [
      {
        id: 'node-1',
        name: 'NexusPulse AI - Chasseur de Tendances et Fournisseurs',
        tier: 'NŒUD GENESIS',
        compute: '850 TFLOPS Cluster Neuronal',
        price: 149,
        period: '/ mois',
        desc: 'Scraper autonome scannant TikTok Ads et Meta pour dénicher les produits viraux avant saturation.',
        roi: '+340% ROAS Projeté',
        features: [
          'Surveillance Continue TikTok & Meta Ads',
          'Arbitrage Automatisé CJ & AliExpress',
          'Génération Vidéo Publicitaire par IA',
          'Bouclier Anti-Saturation Strix AI',
        ],
      },
      {
        id: 'node-2',
        name: 'OmniCartel AI - Centre d’Exécution Multi-Boutiques',
        tier: 'NŒUD ENTREPRISE',
        compute: '1.8 PFLOPS Multi-Cluster',
        price: 349,
        period: '/ mois',
        desc: 'Moteur d’exécution décentralisé gérant les commandes et le support sur plus de 15 boutiques Shopify.',
        roi: '99.96% Précision sans intervention',
        features: [
          'Envoi Automatisé des Commandes Fournisseurs',
          'Agent Client IA en 30 Langues 24/7',
          'Optimiseur Dynamique de Marge Nette',
          'Protection contre la Fraude et Impayés',
        ],
      },
      {
        id: 'node-3',
        name: 'QuantumDrop AI - Nœud Maître Souverain DePIN',
        tier: 'MAÎTRE SOUVERAIN',
        compute: '4.2 PFLOPS Grille Distribuée',
        price: 799,
        period: 'Accès à Vie',
        desc: 'Le cluster DePIN suprême. Synchronisation d’inventaire et paiements directs Stripe et Crypto.',
        roi: 'Rendement Maximal Hashrate + Tokens',
        features: [
          'Partage Complet du Calcul DePIN Réseau',
          'Passerelle Retrait Stripe & Crypto Instantanée',
          'Auto-Guérison des Flux Fournisseurs',
          'Agent VIP Growth Hacking Intégré',
        ],
      },
    ],
  },
  es: {
    storeTitle: 'Tienda MineAI DePIN',
    storeSubtitle: 'Nodos Autónomos de IA para Dropshipping y Comercio Digital',
    heroBadge: 'CAPA DE HARDWARE DEPIN AUTÓNOMA',
    heroHeadline: 'Despliegue Nodos de Cómputo IA de Alto Rendimiento',
    heroDesc: 'Conecte clústeres neuronales distribuidos para automatizar el descubrimiento de productos virales y el cumplimiento de pedidos sin intervención manual.',
    balanceLabel: 'Balance Disponible en Tesorería',
    withdrawBtn: 'Retirar Fondos',
    activateBtn: '⚡ Activar Nodo Ahora',
    activatedBtn: '● Nodo Activo y Minando Rendimiento',
    withdrawalModalTitle: 'Retiro de Fondos a Billetera / Stripe',
    withdrawAmountLabel: 'Monto ($USD):',
    destinationLabel: 'Billetera Crypto o IBAN Stripe:',
    confirmWithdrawal: 'Ejecutar Transferencia Inmediata',
    cancelBtn: 'Cerrar',
    featuresTitle: 'Capacidades Incluidas del Agente:',
    popularBadge: 'MÁS POPULAR',
    highYieldBadge: 'ALTO RENDIMIENTO',
    sovereignBadge: 'NODO MAESTRO',
    products: [
      {
        id: 'node-1',
        name: 'NexusPulse AI - Explorador de Tendencias y Proveedores',
        tier: 'NODO GÉNESIS',
        compute: '850 TFLOPS Clúster Neuronal',
        price: 149,
        period: '/ mes',
        desc: 'Agente autónomo que analiza anuncios de TikTok y Meta para detectar productos ganadores antes de su saturación.',
        roi: '+340% ROAS Promedio Proyectado',
        features: [
          'Monitoreo Continuo de TikTok y Meta Ads',
          'Arbitraje de Precios CJ y AliExpress',
          'Generación Automática de Creativos de Video',
          'Filtro Defensivo Strix AI Anti-Saturación',
        ],
      },
      {
        id: 'node-2',
        name: 'OmniCartel AI - Núcleo de Despacho Multi-Tienda',
        tier: 'NODO EMPRESARIAL',
        compute: '1.8 PFLOPS Multi-Clúster',
        price: 349,
        period: '/ mes',
        desc: 'Motor descentralizado que gestiona pedidos y atención al cliente en más de 15 tiendas Shopify en piloto automático.',
        roi: '99.96% Precisión de Despacho sin Fricción',
        features: [
          'Despacho Automatizado de Pedidos a Proveedor',
          'Soporte al Cliente IA en 30 Idiomas',
          'Optimizador Dinámico de Margen de Ganancia',
          'Blindaje contra Fraude y Contracargos',
        ],
      },
      {
        id: 'node-3',
        name: 'QuantumDrop AI - Nodo Maestro Soberano DePIN',
        tier: 'MAESTRO SOBERANO',
        compute: '4.2 PFLOPS Red Distribuida',
        price: 799,
        period: 'Acceso Vitalicio',
        desc: 'El clúster DePIN definitivo. Sincronización multi-proveedor y liquidación directa a cuentas Stripe y criptomonedas.',
        roi: 'Máximo Hashrate y Recompensas de Tokens',
        features: [
          'Cuota Directa del Poder de Cómputo DePIN',
          'Salida Directa a Stripe y Liquidez Crypto',
          'Matriz de Proveedores con Auto-Reparación',
          'Agente VIP Growth Hacking con Multiplicador',
        ],
      },
    ],
  },
  zh: {
    storeTitle: 'MineAI DePIN 算力商城',
    storeSubtitle: '自主 AI 电商与一件代发节点集群',
    heroBadge: 'DEPIN 自主算力硬件层',
    heroHeadline: '部署高收益 AI 电商一件代发算力节点',
    heroDesc: '连接分布式神经元网络集群，全天候全自动执行爆品挖掘、竞品广告监控与跨国供应链无缝履约。',
    balanceLabel: '可提现资金余额',
    withdrawBtn: '提取资金',
    activateBtn: '⚡ 立即激活节点',
    activatedBtn: '● 节点运行中并持续产出收益',
    withdrawalModalTitle: '国库资金提现至钱包 / Stripe 银行账户',
    withdrawAmountLabel: '提现金额 ($USD):',
    destinationLabel: '接收钱包地址或 Stripe 银行账户:',
    confirmWithdrawal: '确认执行即时转账',
    cancelBtn: '关闭',
    featuresTitle: '内置智能体能力:',
    popularBadge: '热门首选',
    highYieldBadge: '高收益',
    sovereignBadge: '至尊主节点',
    products: [
      {
        id: 'node-1',
        name: 'NexusPulse AI - 爆品侦察与供应链节点',
        tier: '创世节点',
        compute: '850 TFLOPS 神经网络算力',
        price: 149,
        period: '/ 月',
        desc: '自主爬虫节点持续扫描 TikTok Ads 和 Meta 创意中心，在爆品饱和前精准锁定高利润品类。',
        roi: '+340% 预期投资回报率',
        features: [
          '24/7 全天候监控 TikTok 与 Meta 爆品广告',
          '即时对比 CJ 与速卖通底层供货底价',
          'AI 自动生成高转化短视频脚本与素材',
          'Strix AI 防市场饱和风控防护网',
        ],
      },
      {
        id: 'node-2',
        name: 'OmniCartel AI - 多店铺全自动履约超级核心',
        tier: '企业级节点',
        compute: '1.8 PFLOPS 密集集群',
        price: 349,
        period: '/ 月',
        desc: '去中心化供应链执行引擎，自动管理超过15个 Shopify 店铺的订单派发、物流跟踪与客户服务。',
        roi: '99.96% 零失误自动下单准确率',
        features: [
          '零人工干预全自动派发供应商订单',
          '支持30种语言的多语种 AI 智能客服',
          '基于汇率波动的动态利润率智能调节',
          '防恶意退款与欺诈防范安全护盾',
        ],
      },
      {
        id: 'node-3',
        name: 'QuantumDrop AI - 顶级至尊 DePIN 主节点',
        tier: '至尊主节点',
        compute: '4.2 PFLOPS 全球分布式网格',
        price: 799,
        period: '终身授权',
        desc: '终极 DePIN 主算力集群。配备全面的供应链同步引擎与 Stripe 法币/加密货币实时下发通道。',
        roi: '极速计算算力收益 + 代币奖励加成',
        features: [
          '享有全球 DePIN 算力网络分成份额',
          '支持 Stripe 与加密货币即时提现通道',
          '多供应商故障自愈级调度矩阵',
          '内置 VIP 裂变增长智能体与 XP 双倍加速',
        ],
      },
    ],
  },
  hi: {
    storeTitle: 'MineAI DePIN स्टोर',
    storeSubtitle: 'स्वायत्त AI ई-कॉमर्स और ड्रॉपशीपिंग नोड क्लस्टर्स',
    heroBadge: 'DEPIN स्वायत्त हार्डवेयर परत',
    heroHeadline: 'उच्च-उपज वाले AI ड्रॉपशीपिंग नोड्स तैनात करें',
    heroDesc: 'उत्पाद खोज, प्रतिस्पर्धी विज्ञापनों की निगरानी, और आपूर्तिकर्ता पूर्ति को स्वचालित करने के लिए वितरित न्यूरल क्लस्टर्स कनेक्ट करें।',
    balanceLabel: 'उपलब्ध ट्रेजरी बैलेंस',
    withdrawBtn: 'पैसे निकालें',
    activateBtn: '⚡ नोड सक्रिय करें',
    activatedBtn: '● नोड सक्रिय है और लाभ माइन कर रहा है',
    withdrawalModalTitle: 'वॉलेट / स्ट्राइप में निकासी',
    withdrawAmountLabel: 'राशि ($USD):',
    destinationLabel: 'वॉलेट पता या स्ट्राइप IBAN:',
    confirmWithdrawal: 'तत्काल स्थानांतरण निष्पादित करें',
    cancelBtn: 'बंद करें',
    featuresTitle: 'शामिल एजेंट क्षमताएं:',
    popularBadge: 'सर्वश्रेष्ठ पसंद',
    highYieldBadge: 'उच्च लाभ',
    sovereignBadge: 'सॉवरेन मास्टर',
    products: [
      {
        id: 'node-1',
        name: 'NexusPulse AI - ट्रेंड और आपूर्तिकर्ता स्काउट',
        tier: 'जेनेसिस नोड',
        compute: '850 TFLOPS न्यूरल क्लस्टर',
        price: 149,
        period: '/ माह',
        desc: 'स्वायत्त स्क्रैपर जो टिकटॉक और मेटा विज्ञापनों को स्कैन करके उच्च-मार्जिन वाले वायरल उत्पाद ढूंढता है।',
        roi: '+340% अनुमानित लाभ दर',
        features: [
          '24/7 टिकटॉक और मेटा विज्ञापन निगरानी',
          'त्वरित आपूर्तिकर्ता लागत संतुलन',
          'स्वचालित AI वीडियो विज्ञापन निर्माण',
          'Strix AI संतृप्ति सुरक्षा प्रणाली',
        ],
      },
      {
        id: 'node-2',
        name: 'OmniCartel AI - मल्टी-स्टोर पूर्ति कोर',
        tier: 'एंटरप्राइज नोड',
        compute: '1.8 PFLOPS मल्टी-क्लस्टर',
        price: 349,
        period: '/ माह',
        desc: 'विकेंद्रीकृत इंजन जो 15+ शॉपिफाई स्टोर्स में ऑर्डर प्रोसेसिंग और ग्राहक सेवा को ऑटो-पायलट पर प्रबंधित करता है।',
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
        name: 'QuantumDrop AI - सॉवरेन DePIN मास्टर इंजन',
        tier: 'सॉवरेन मास्टर नोड',
        compute: '4.2 PFLOPS वितरित ग्रिड',
        price: 799,
        period: 'लाइफटाइम एक्सेस',
        desc: 'सर्वोच्च DePIN क्लस्टर। पूर्ण इन्वेंट्री सिंक्रोनाइज़ेशन और सीधे स्ट्राइप तथा क्रिप्टो भुगतान विकल्प।',
        roi: 'अधिकतम हैशरेट उपज और टोकन पुरस्कार',
        features: [
          'पूर्ण DePIN नेटवर्क कंप्यूटिंग पावर शेयर',
          'तत्काल स्ट्राइप और क्रिप्टो निकासी',
          'मल्टी-सप्लायर मैट्रिक्स स्व-उपचार इंजन',
          'VIP ग्रोथ हैकिंग एजेंट और 2x XP गुणक',
        ],
      },
    ],
  },
};

export default function StorePage() {
  const [lang, setLang] = useState<SupportedLang>('en');
  const [treasuryBalance, setTreasuryBalance] = useState<number>(482.65);
  const [activeNodes, setActiveNodes] = useState<Record<string, boolean>>({
    'node-1': true,
  });
  const [showWithdrawModal, setShowWithdrawModal] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<string>('150');
  const [withdrawDestination, setWithdrawDestination] = useState<string>('0x71C...9B42 (Stripe Connect)');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const t = translations[lang];
  const isRtl = lang === 'ar';

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = e.target.value as SupportedLang;
    setLang(selected);
    if (typeof document !== 'undefined') {
      document.documentElement.dir = selected === 'ar' ? 'rtl' : 'ltr';
      document.documentElement.lang = selected;
    }
  };

  const handleToggleNode = (id: string, name: string) => {
    setActiveNodes((prev) => {
      const isCurrentlyActive = !!prev[id];
      const nextState = { ...prev, [id]: !isCurrentlyActive };
      
      const msg = !isCurrentlyActive
        ? `⚡ [STATUS]: Node "${name}" successfully booted & connected to DePIN Stream!`
        : `⏸ [STATUS]: Node "${name}" paused.`;

      setToastMessage(msg);
      setTimeout(() => setToastMessage(null), 4000);
      return nextState;
    });
  };

  const executeWithdrawal = () => {
    const amt = parseFloat(withdrawAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }
    if (amt > treasuryBalance) {
      alert('Insufficient treasury balance.');
      return;
    }

    setTreasuryBalance((prev) => parseFloat((prev - amt).toFixed(2)));
    setShowWithdrawModal(false);
    setToastMessage(`✓ Transfer executed: $${amt} USD sent to ${withdrawDestination} via Stripe Gateway.`);
    setTimeout(() => setToastMessage(null), 5000);
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
      {/* Top Embedded Header */}
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
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #00ff88 0%, #00e5ff 100%)',
              color: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              fontWeight: '900',
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff' }}>
                {t.storeTitle}
              </span>
              <span
                style={{
                  backgroundColor: '#042f1a',
                  color: '#00ff88',
                  border: '1px solid #00ff88',
                  padding: '2px 8px',
                  borderRadius: '20px',
                  fontSize: '11px',
                  fontWeight: '700',
                }}
              >
                PROD v3.0
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#94a3b8' }}>
              {t.storeSubtitle}
            </p>
          </div>
        </div>

        {/* Global Controls & Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          {/* Treasury Balance Pill */}
          <div
            style={{
              backgroundColor: '#0d1527',
              border: '1px solid #1e293b',
              padding: '6px 14px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{t.balanceLabel}:</div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: '#00ff88', fontFamily: 'monospace' }}>
              ${treasuryBalance.toFixed(2)} USD
            </div>
          </div>

          {/* Withdraw Button */}
          <button
            onClick={() => setShowWithdrawModal(true)}
            style={{
              backgroundColor: '#0284c7',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <span>💳</span>
            <span>{t.withdrawBtn}</span>
          </button>

          {/* Links */}
          <a
            href="/notes"
            style={{
              color: '#38bdf8',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              textDecoration: 'none',
            }}
          >
            📓 Notes Log
          </a>

          {/* Automatic Multi-Language Dropdown */}
          <div style={{ position: 'relative' }}>
            <select
              value={lang}
              onChange={handleLanguageChange}
              style={{
                backgroundColor: '#0f172a',
                color: '#00ff88',
                border: '1.5px solid #00ff88',
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="en">English (Default)</option>
              <option value="ar">العربية (RTL)</option>
              <option value="fr">Français</option>
              <option value="es">Español</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="hi">हिन्दी (Hindi)</option>
            </select>
          </div>
        </div>
      </header>

      {/* Floating Status Notification Toast */}
      {toastMessage && (
        <div
          style={{
            maxWidth: '960px',
            margin: '16px auto -8px auto',
            padding: '12px 20px',
            backgroundColor: '#032616',
            border: '1.5px solid #00ff88',
            borderRadius: '12px',
            color: '#a7f3d0',
            fontSize: '13px',
            fontWeight: '600',
            boxShadow: '0 0 20px rgba(0, 255, 136, 0.25)',
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* Hero Header */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '36px 20px 80px 20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '4px 14px',
              backgroundColor: 'rgba(0, 255, 136, 0.1)',
              border: '1px solid #00ff88',
              borderRadius: '999px',
              color: '#00ff88',
              fontSize: '11px',
              fontWeight: '800',
              letterSpacing: '1px',
              marginBottom: '12px',
            }}
          >
            {t.heroBadge}
          </div>
          <h1
            style={{
              fontSize: '34px',
              fontWeight: '900',
              color: '#ffffff',
              margin: '0 0 12px 0',
              lineHeight: 1.2,
            }}
          >
            {t.heroHeadline}
          </h1>
          <p
            style={{
              fontSize: '15px',
              color: '#94a3b8',
              maxWidth: '740px',
              margin: '0 auto',
              lineHeight: 1.6,
            }}
          >
            {t.heroDesc}
          </p>
        </div>

        {/* 3 Real High-Yield Products Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {t.products.map((item, index) => {
            const isActive = !!activeNodes[item.id];
            const badgeLabel =
              index === 0 ? t.popularBadge : index === 1 ? t.highYieldBadge : t.sovereignBadge;

            return (
              <div
                key={item.id}
                style={{
                  backgroundColor: '#0b101e',
                  border: isActive ? '2px solid #00ff88' : '1px solid #1e293b',
                  borderRadius: '18px',
                  padding: '28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isActive
                    ? '0 0 30px rgba(0, 255, 136, 0.18)'
                    : '0 8px 24px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                }}
              >
                <div>
                  {/* Top Badges */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: '#00e5ff',
                        backgroundColor: 'rgba(0, 229, 255, 0.1)',
                        border: '1px solid #00e5ff',
                        padding: '3px 8px',
                        borderRadius: '6px',
                      }}
                    >
                      {item.tier}
                    </span>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '800',
                        color: '#00ff88',
                        backgroundColor: '#042f1a',
                        border: '1px solid #00ff88',
                        padding: '3px 8px',
                        borderRadius: '999px',
                      }}
                    >
                      {badgeLabel}
                    </span>
                  </div>

                  {/* Title & Hashrate */}
                  <h3 style={{ fontSize: '18px', fontWeight: '800', color: '#ffffff', margin: '0 0 8px 0' }}>
                    {item.name}
                  </h3>
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: '700',
                      color: isActive ? '#00ff88' : '#eab308',
                      fontFamily: 'monospace',
                      marginBottom: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>●</span>
                    <span>{item.compute}</span>
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#94a3b8',
                      lineHeight: 1.6,
                      minHeight: '60px',
                      margin: '0 0 20px 0',
                    }}
                  >
                    {item.desc}
                  </p>

                  {/* Pricing Box */}
                  <div
                    style={{
                      backgroundColor: '#060a14',
                      border: '1px solid #1e293b',
                      borderRadius: '12px',
                      padding: '14px',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '30px',
                          fontWeight: '900',
                          color: '#00ff88',
                          fontFamily: 'monospace',
                        }}
                      >
                        ${item.price}
                      </span>
                      <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '600' }}>
                        USD {item.period}
                      </span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#38bdf8', fontWeight: '600', marginTop: '4px' }}>
                      📈 {item.roi}
                    </div>
                  </div>

                  {/* Features List */}
                  <div style={{ marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', fontWeight: '700', color: '#cbd5e1', marginBottom: '8px' }}>
                      {t.featuresTitle}
                    </div>
                    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.features.map((feat, idx) => (
                        <li key={idx} style={{ fontSize: '12px', color: '#e2e8f0', display: 'flex', gap: '6px' }}>
                          <span style={{ color: '#00ff88' }}>✓</span>
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Neon Action Button */}
                <button
                  onClick={() => handleToggleNode(item.id, item.name)}
                  style={{
                    width: '100%',
                    padding: '12px 18px',
                    borderRadius: '10px',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '13px',
                    cursor: 'pointer',
                    backgroundColor: isActive ? '#032616' : '#00ff88',
                    color: isActive ? '#00ff88' : '#000000',
                    borderWidth: '1.5px',
                    borderStyle: 'solid',
                    borderColor: '#00ff88',
                    boxShadow: isActive ? 'none' : '0 0 20px rgba(0, 255, 136, 0.4)',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isActive ? t.activatedBtn : t.activateBtn}
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* Embedded Wallet Withdrawal Modal */}
      {showWithdrawModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '20px',
          }}
        >
          <div
            style={{
              backgroundColor: '#0c1222',
              border: '1.5px solid #00ff88',
              borderRadius: '20px',
              maxWidth: '480px',
              width: '100%',
              padding: '28px',
              boxShadow: '0 0 40px rgba(0, 255, 136, 0.2)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                {t.withdrawalModalTitle}
              </h3>
              <button
                onClick={() => setShowWithdrawModal(false)}
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '18px', cursor: 'pointer' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                {t.withdrawAmountLabel}
              </label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#060a14',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#00ff88',
                  fontSize: '16px',
                  fontFamily: 'monospace',
                  outline: 'none',
                }}
              />
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                Max Treasury Available: ${treasuryBalance.toFixed(2)} USD
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '6px' }}>
                {t.destinationLabel}
              </label>
              <input
                type="text"
                value={withdrawDestination}
                onChange={(e) => setWithdrawDestination(e.target.value)}
                style={{
                  width: '100%',
                  backgroundColor: '#060a14',
                  border: '1px solid #334155',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  color: '#ffffff',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={executeWithdrawal}
                style={{
                  flex: 1,
                  backgroundColor: '#00ff88',
                  color: '#000000',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '8px',
                  fontWeight: '800',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {t.confirmWithdrawal}
              </button>
              <button
                onClick={() => setShowWithdrawModal(false)}
                style={{
                  backgroundColor: '#1e293b',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px 18px',
                  borderRadius: '8px',
                  fontWeight: '600',
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {t.cancelBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}