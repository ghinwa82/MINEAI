import type { SupportedLanguage } from '@/types';
import { DEFAULT_LANGUAGE } from '@/lib/languages';

/**
 * Zero-electricity cloud mining plans.
 *
 * The matrix is authored once per language so the homepage, the store and the
 * structured-data payload all read the same record. Copy is deliberately plain:
 * short sentences, no protocol jargon, every fee stated in everyday words.
 */

export type PlanId = 'genesis' | 'node' | 'pro' | 'elite' | 'sovereign';

export interface PlanCopy {
  name: string;
  tier: string;
  tagline: string;
  description: string;
  features: string[];
  cta: string;
  badge?: string;
}

export interface MiningPlan {
  id: PlanId;
  slug: string;
  canonicalName: string;
  priceUsd: number;
  /** $MINEAI bonus yield multiplier. */
  multiplier: number;
  /** Base cloud power in MH/s. */
  hashrateMhs: number;
  popular: boolean;
  copy: Record<SupportedLanguage, PlanCopy>;
}

export const MINING_PLANS: MiningPlan[] = [
  {
    id: 'genesis',
    slug: 'genesis-free-cloud',
    canonicalName: 'Genesis Free Cloud',
    priceUsd: 0,
    multiplier: 1,
    hashrateMhs: 120,
    popular: false,
    copy: {
      en: {
        name: 'Genesis Free Cloud',
        tier: 'Starter',
        tagline: 'Free forever',
        description: 'Start mining today with free cloud power. No card, no risk.',
        features: ['120 MH/s free cloud power', 'Mine $MINEAI and 7 coins', 'Daily rewards', 'Withdraw to your wallet'],
        cta: 'Start free',
      },
      ar: {
        name: 'سحابة البداية المجانية',
        tier: 'المبتدئ',
        tagline: 'مجانًا للأبد',
        description: 'ابدأ التعدين اليوم بقوة سحابية مجانية. بدون بطاقة وبدون مخاطرة.',
        features: ['قوة سحابية مجانية 120 MH/s', 'عدّن $MINEAI و7 عملات', 'مكافآت يومية', 'اسحب إلى محفظتك'],
        cta: 'ابدأ مجانًا',
      },
      fr: {
        name: 'Nuage Genesis Gratuit',
        tier: 'Débutant',
        tagline: 'Gratuit pour toujours',
        description: 'Commencez à miner aujourd’hui avec de la puissance cloud gratuite. Sans carte, sans risque.',
        features: ['120 MH/s de puissance gratuite', 'Minez $MINEAI et 7 pièces', 'Récompenses quotidiennes', 'Retrait vers votre portefeuille'],
        cta: 'Commencer gratuitement',
      },
      es: {
        name: 'Nube Genesis Gratis',
        tier: 'Inicial',
        tagline: 'Gratis para siempre',
        description: 'Empieza a minar hoy con potencia en la nube gratis. Sin tarjeta y sin riesgo.',
        features: ['120 MH/s de potencia gratis', 'Mina $MINEAI y 7 monedas', 'Recompensas diarias', 'Retira a tu billetera'],
        cta: 'Empezar gratis',
      },
      zh: {
        name: '创世免费云',
        tier: '入门',
        tagline: '永久免费',
        description: '今天就用免费云算力开始挖矿。无需银行卡，没有风险。',
        features: ['120 MH/s 免费算力', '挖取 $MINEAI 和 7 种币', '每日奖励', '提现到你的钱包'],
        cta: '免费开始',
      },
      hi: {
        name: 'जेनेसिस फ्री क्लाउड',
        tier: 'शुरुआती',
        tagline: 'हमेशा मुफ़्त',
        description: 'आज ही मुफ़्त क्लाउड पावर से माइनिंग शुरू करें। कोई कार्ड नहीं, कोई जोखिम नहीं।',
        features: ['120 MH/s मुफ़्त क्लाउड पावर', '$MINEAI और 7 कॉइन माइन करें', 'रोज़ाना इनाम', 'अपने वॉलेट में निकालें'],
        cta: 'मुफ़्त शुरू करें',
      },
    },
  },
  {
    id: 'node',
    slug: 'cloud-node-v1',
    canonicalName: 'Cloud Node v1',
    priceUsd: 29.99,
    multiplier: 1.2,
    hashrateMhs: 480,
    popular: false,
    copy: {
      en: {
        name: 'Cloud Node v1',
        tier: 'Node',
        tagline: 'One-time $29.99',
        description: 'Your own dedicated cloud power with daily rewards and a 1.2x bonus.',
        features: ['480 MH/s dedicated power', '1.2x $MINEAI bonus yield', 'Daily rewards', 'Priority support'],
        cta: 'Choose Node',
      },
      ar: {
        name: 'عقدة السحابة v1',
        tier: 'عقدة',
        tagline: 'دفعة واحدة 29.99 $',
        description: 'قوة سحابية مخصصة لك مع مكافآت يومية ومضاعف 1.2x.',
        features: ['قوة مخصصة 480 MH/s', 'مكافأة $MINEAI بمضاعف 1.2x', 'مكافآت يومية', 'دعم ذو أولوية'],
        cta: 'اختر العقدة',
      },
      fr: {
        name: 'Nœud Cloud v1',
        tier: 'Nœud',
        tagline: 'Paiement unique de 29,99 $',
        description: 'Votre propre puissance cloud dédiée avec des récompenses quotidiennes et un bonus de 1,2x.',
        features: ['480 MH/s de puissance dédiée', 'Bonus $MINEAI de 1,2x', 'Récompenses quotidiennes', 'Support prioritaire'],
        cta: 'Choisir le Nœud',
      },
      es: {
        name: 'Nodo Cloud v1',
        tier: 'Nodo',
        tagline: 'Pago único de $29.99',
        description: 'Tu propia potencia en la nube con recompensas diarias y un bono de 1.2x.',
        features: ['480 MH/s de potencia dedicada', 'Bono de $MINEAI de 1.2x', 'Recompensas diarias', 'Soporte prioritario'],
        cta: 'Elegir Nodo',
      },
      zh: {
        name: '云节点 v1',
        tier: '节点',
        tagline: '一次性 $29.99',
        description: '专属于你的云算力，每日奖励，1.2 倍加成。',
        features: ['480 MH/s 专属算力', '1.2 倍 $MINEAI 奖励', '每日奖励', '优先客服'],
        cta: '选择节点',
      },
      hi: {
        name: 'क्लाउड नोड v1',
        tier: 'नोड',
        tagline: 'एकमुश्त $29.99',
        description: 'आपकी अपनी क्लाउड पावर, रोज़ाना इनाम और 1.2x बोनस।',
        features: ['480 MH/s समर्पित पावर', '1.2x $MINEAI बोनस', 'रोज़ाना इनाम', 'प्राथमिक सहायता'],
        cta: 'नोड चुनें',
      },
    },
  },
  {
    id: 'pro',
    slug: 'cloud-pro-v2',
    canonicalName: 'Cloud Pro v2',
    priceUsd: 99.99,
    multiplier: 1.5,
    hashrateMhs: 1600,
    popular: true,
    copy: {
      en: {
        name: 'Cloud Pro v2',
        tier: 'Pro',
        tagline: 'Most popular · $99.99',
        description: 'A high-speed multi-coin cluster with priority payouts and zero upkeep fees.',
        features: ['1,600 MH/s multi-coin cluster', '1.5x $MINEAI bonus yield', 'Priority payouts', 'Zero maintenance fees'],
        cta: 'Go Pro',
        badge: 'Most popular',
      },
      ar: {
        name: 'السحابة برو v2',
        tier: 'برو',
        tagline: 'الأكثر شعبية · 99.99 $',
        description: 'مجموعة سريعة متعددة العملات مع سحب ذي أولوية وبدون رسوم صيانة.',
        features: ['مجموعة 1,600 MH/s متعددة العملات', 'مكافأة $MINEAI بمضاعف 1.5x', 'سحب ذو أولوية', 'بدون رسوم صيانة'],
        cta: 'اختر برو',
        badge: 'الأكثر شعبية',
      },
      fr: {
        name: 'Cloud Pro v2',
        tier: 'Pro',
        tagline: 'Le plus populaire · 99,99 $',
        description: 'Une grappe multi-pièces rapide avec paiements prioritaires et aucun frais d’entretien.',
        features: ['Grappe de 1 600 MH/s', 'Bonus $MINEAI de 1,5x', 'Paiements prioritaires', 'Aucun frais d’entretien'],
        cta: 'Passer Pro',
        badge: 'Le plus populaire',
      },
      es: {
        name: 'Cloud Pro v2',
        tier: 'Pro',
        tagline: 'La más popular · $99.99',
        description: 'Un clúster rápido de varias monedas con pagos prioritarios y sin cuotas de mantenimiento.',
        features: ['Clúster de 1,600 MH/s', 'Bono de $MINEAI de 1.5x', 'Pagos prioritarios', 'Sin cuotas de mantenimiento'],
        cta: 'Pasar a Pro',
        badge: 'La más popular',
      },
      zh: {
        name: '云专业版 v2',
        tier: '专业',
        tagline: '最受欢迎 · $99.99',
        description: '高速多币种集群，优先出款，零维护费。',
        features: ['1,600 MH/s 多币种集群', '1.5 倍 $MINEAI 奖励', '优先出款', '零维护费'],
        cta: '选择专业版',
        badge: '最受欢迎',
      },
      hi: {
        name: 'क्लाउड प्रो v2',
        tier: 'प्रो',
        tagline: 'सबसे लोकप्रिय · $99.99',
        description: 'तेज़ मल्टी-कॉइन क्लस्टर, प्राथमिक भुगतान और ज़ीरो रखरखाव शुल्क।',
        features: ['1,600 MH/s मल्टी-कॉइन क्लस्टर', '1.5x $MINEAI बोनस', 'प्राथमिक भुगतान', 'ज़ीरो रखरखाव शुल्क'],
        cta: 'प्रो चुनें',
        badge: 'सबसे लोकप्रिय',
      },
    },
  },
  {
    id: 'elite',
    slug: 'cloud-elite-v3',
    canonicalName: 'Cloud Elite v3',
    priceUsd: 299.99,
    multiplier: 2,
    hashrateMhs: 4200,
    popular: false,
    copy: {
      en: {
        name: 'Cloud Elite v3',
        tier: 'Elite',
        tagline: 'One-time $299.99',
        description: 'Institutional cloud allocation with smart auto-allocation to top coins.',
        features: ['4,200 MH/s institutional power', '2.0x $MINEAI multiplier', 'Smart auto-allocation', 'Dedicated account manager'],
        cta: 'Choose Elite',
      },
      ar: {
        name: 'السحابة إيليت v3',
        tier: 'إيليت',
        tagline: 'دفعة واحدة 299.99 $',
        description: 'تخصيص سحابي مؤسسي مع توزيع ذكي تلقائي على أفضل العملات.',
        features: ['قوة مؤسسية 4,200 MH/s', 'مضاعف $MINEAI 2.0x', 'توزيع ذكي تلقائي', 'مدير حساب مخصص'],
        cta: 'اختر إيليت',
      },
      fr: {
        name: 'Cloud Elite v3',
        tier: 'Elite',
        tagline: 'Paiement unique de 299,99 $',
        description: 'Allocation cloud institutionnelle avec répartition automatique vers les meilleures pièces.',
        features: ['4 200 MH/s de puissance', 'Multiplicateur $MINEAI de 2,0x', 'Répartition automatique', 'Gestionnaire de compte dédié'],
        cta: 'Choisir Elite',
      },
      es: {
        name: 'Cloud Elite v3',
        tier: 'Elite',
        tagline: 'Pago único de $299.99',
        description: 'Asignación en la nube institucional con reparto automático hacia las mejores monedas.',
        features: ['4,200 MH/s de potencia', 'Multiplicador de $MINEAI de 2.0x', 'Reparto automático', 'Gestor de cuenta dedicado'],
        cta: 'Elegir Elite',
      },
      zh: {
        name: '云精英版 v3',
        tier: '精英',
        tagline: '一次性 $299.99',
        description: '机构级云配额，智能自动分配到表现最好的币种。',
        features: ['4,200 MH/s 机构算力', '2.0 倍 $MINEAI 加成', '智能自动分配', '专属客户经理'],
        cta: '选择精英版',
      },
      hi: {
        name: 'क्लाउड एलीट v3',
        tier: 'एलीट',
        tagline: 'एकमुश्त $299.99',
        description: 'संस्थागत क्लाउड पावर, बेहतरीन कॉइन में स्मार्ट ऑटो-आवंटन।',
        features: ['4,200 MH/s संस्थागत पावर', '2.0x $MINEAI गुणक', 'स्मार्ट ऑटो-आवंटन', 'समर्पित अकाउंट मैनेजर'],
        cta: 'एलीट चुनें',
      },
    },
  },
  {
    id: 'sovereign',
    slug: 'sovereign-master-v4',
    canonicalName: 'Sovereign Master v4',
    priceUsd: 799.99,
    multiplier: 3,
    hashrateMhs: 12000,
    popular: false,
    copy: {
      en: {
        name: 'Sovereign Master v4',
        tier: 'Sovereign',
        tagline: 'One-time $799.99',
        description: 'Maximum cloud compute with a 3.0x royal multiplier and an instant VIP payout lane.',
        features: ['12,000 MH/s maximum power', '3.0x $MINEAI royal multiplier', 'Instant VIP payout lane', '24/7 private support'],
        cta: 'Go Sovereign',
      },
      ar: {
        name: 'سيد السيادة v4',
        tier: 'السيادة',
        tagline: 'دفعة واحدة 799.99 $',
        description: 'أقصى قوة سحابية مع مضاعف ملكي 3.0x ومسار سحب VIP فوري.',
        features: ['أقصى قوة 12,000 MH/s', 'مضاعف $MINEAI الملكي 3.0x', 'مسار سحب VIP فوري', 'دعم خاص 24/7'],
        cta: 'اختر السيادة',
      },
      fr: {
        name: 'Sovereign Master v4',
        tier: 'Souverain',
        tagline: 'Paiement unique de 799,99 $',
        description: 'Puissance cloud maximale avec un multiplicateur royal de 3,0x et une voie de paiement VIP instantanée.',
        features: ['12 000 MH/s de puissance maximale', 'Multiplicateur royal $MINEAI de 3,0x', 'Voie de paiement VIP instantanée', 'Support privé 24/7'],
        cta: 'Devenir Souverain',
      },
      es: {
        name: 'Sovereign Master v4',
        tier: 'Soberano',
        tagline: 'Pago único de $799.99',
        description: 'Máxima potencia en la nube con un multiplicador real de 3.0x y una vía de pago VIP instantánea.',
        features: ['12,000 MH/s de potencia máxima', 'Multiplicador real de $MINEAI de 3.0x', 'Vía de pago VIP instantánea', 'Soporte privado 24/7'],
        cta: 'Ser Soberano',
      },
      zh: {
        name: '至尊大师版 v4',
        tier: '至尊',
        tagline: '一次性 $799.99',
        description: '最高云算力，3.0 倍皇家加成，即时 VIP 出款通道。',
        features: ['12,000 MH/s 最高算力', '3.0 倍 $MINEAI 皇家加成', '即时 VIP 出款通道', '24/7 私人客服'],
        cta: '选择至尊版',
      },
      hi: {
        name: 'सॉवरेन मास्टर v4',
        tier: 'सॉवरेन',
        tagline: 'एकमुश्त $799.99',
        description: 'अधिकतम क्लाउड पावर, 3.0x रॉयल गुणक और तुरंत VIP भुगतान लेन।',
        features: ['12,000 MH/s अधिकतम पावर', '3.0x $MINEAI रॉयल गुणक', 'तुरंत VIP भुगतान लेन', '24/7 निजी सहायता'],
        cta: 'सॉवरेन चुनें',
      },
    },
  },
];

export interface PlanNotes {
  title: string;
  lead: string;
  fees: string;
  gas: string;
  minimum: string;
  payoutTitle: string;
  payoutBody: string;
  statuses: [string, string, string];
  disclaimer: string;
  calculatorTitle: string;
  calculatorLead: string;
  powerLabel: string;
  daily: string;
  monthly: string;
  tokenLabel: string;
  planLabel: string;
  estimateNote: string;
}

export const PLAN_NOTES: Record<SupportedLanguage, PlanNotes> = {
  en: {
    title: 'Simple plans, clear fees',
    lead: 'Pick a plan once. There is no electricity bill and no hidden monthly charge.',
    fees: 'Plan price is charged once. Card payments may add a small bank processing fee; crypto payments add 0% platform fee.',
    gas: 'You only pay the network fee when you withdraw to your own wallet. It is shown before you confirm.',
    minimum: 'Minimum withdrawal: $25 in $MINEAI, or the small coin minimum shown in the mining dashboard.',
    payoutTitle: 'Direct to your wallet',
    payoutBody: 'Earnings go straight to the wallet you choose. Track every payout in three clear steps.',
    statuses: ['Pending', 'Processing', 'Sent with on-chain txHash'],
    disclaimer: 'Rewards are estimates based on live network output, not a promise of profit.',
    calculatorTitle: 'See what you could earn',
    calculatorLead: 'Move the slider to see an estimate for each plan. All values are in US dollars.',
    powerLabel: 'Cloud power',
    daily: 'Estimated per day',
    monthly: 'Estimated per month',
    tokenLabel: 'Your $MINEAI bonus',
    planLabel: 'Plan',
    estimateNote: 'Estimates change with live mining output and coin prices.',
  },
  ar: {
    title: 'خطط بسيطة ورسوم واضحة',
    lead: 'اختر خطتك مرة واحدة. لا فاتورة كهرباء ولا رسوم شهرية خفية.',
    fees: 'سعر الخطة يُدفع مرة واحدة. قد تضيف بطاقات الدفع رسوم معالجة بنكية صغيرة؛ الدفع بالعملات الرقمية يضيف 0% رسوم منصة.',
    gas: 'تدفع فقط رسوم الشبكة عند السحب إلى محفظتك. تظهر لك قبل التأكيد.',
    minimum: 'الحد الأدنى للسحب: 25 $ بعملة $MINEAI، أو الحد الصغير الموضح في لوحة التعدين.',
    payoutTitle: 'مباشرة إلى محفظتك',
    payoutBody: 'تذهب الأرباح مباشرة إلى المحفظة التي تختارها. تابع كل عملية سحب بثلاث خطوات واضحة.',
    statuses: ['قيد الانتظار', 'قيد المعالجة', 'تم الإرسال مع txHash على الشبكة'],
    disclaimer: 'المكافآت تقديرات بناءً على إنتاج الشبكة الحقيقي، وليست وعدًا بالربح.',
    calculatorTitle: 'اعرف ما يمكنك ربحه',
    calculatorLead: 'حرّك الشريط لترى تقديرًا لكل خطة. كل القيم بالدولار الأمريكي.',
    powerLabel: 'قوة السحابة',
    daily: 'التقدير اليومي',
    monthly: 'التقدير الشهري',
    tokenLabel: 'مكافأة $MINEAI',
    planLabel: 'الخطة',
    estimateNote: 'تتغير التقديرات حسب إنتاج التعدين وأسعار العملات.',
  },
  fr: {
    title: 'Des forfaits simples, des frais clairs',
    lead: 'Choisissez un forfait une seule fois. Aucune facture d’électricité, aucun frais mensuel caché.',
    fees: 'Le prix du forfait est facturé une fois. Les cartes peuvent ajouter de petits frais bancaires ; le paiement crypto ajoute 0 % de frais de plateforme.',
    gas: 'Vous ne payez que les frais de réseau lors du retrait vers votre portefeuille. Ils sont affichés avant confirmation.',
    minimum: 'Retrait minimum : 25 $ en $MINEAI, ou le petit minimum affiché dans le tableau de minage.',
    payoutTitle: 'Directement vers votre portefeuille',
    payoutBody: 'Les gains vont directement au portefeuille que vous choisissez. Suivez chaque paiement en trois étapes claires.',
    statuses: ['En attente', 'En traitement', 'Envoyé avec txHash on-chain'],
    disclaimer: 'Les récompenses sont des estimations basées sur la production réelle du réseau, pas une promesse de profit.',
    calculatorTitle: 'Voyez ce que vous pourriez gagner',
    calculatorLead: 'Déplacez le curseur pour estimer chaque forfait. Toutes les valeurs sont en dollars américains.',
    powerLabel: 'Puissance cloud',
    daily: 'Estimation par jour',
    monthly: 'Estimation par mois',
    tokenLabel: 'Votre bonus $MINEAI',
    planLabel: 'Forfait',
    estimateNote: 'Les estimations varient avec la production de minage et les prix des pièces.',
  },
  es: {
    title: 'Planes simples, tarifas claras',
    lead: 'Elige un plan una sola vez. Sin factura de electricidad y sin cargos mensuales ocultos.',
    fees: 'El precio del plan se cobra una vez. Las tarjetas pueden añadir una pequeña comisión bancaria; el pago con cripto añade 0% de comisión de plataforma.',
    gas: 'Solo pagas la comisión de red al retirar a tu billetera. Se muestra antes de confirmar.',
    minimum: 'Retiro mínimo: $25 en $MINEAI, o el mínimo pequeño que aparece en el panel de minería.',
    payoutTitle: 'Directo a tu billetera',
    payoutBody: 'Las ganancias van directo a la billetera que elijas. Sigue cada pago en tres pasos claros.',
    statuses: ['Pendiente', 'Procesando', 'Enviado con txHash en cadena'],
    disclaimer: 'Las recompensas son estimaciones basadas en la producción real de la red, no una promesa de ganancias.',
    calculatorTitle: 'Mira lo que podrías ganar',
    calculatorLead: 'Mueve el control para ver una estimación de cada plan. Todos los valores están en dólares.',
    powerLabel: 'Potencia en la nube',
    daily: 'Estimado por día',
    monthly: 'Estimado por mes',
    tokenLabel: 'Tu bono $MINEAI',
    planLabel: 'Plan',
    estimateNote: 'Las estimaciones cambian con la producción de minería y los precios de las monedas.',
  },
  zh: {
    title: '方案简单，费用清楚',
    lead: '一次选择方案。没有电费，也没有隐藏月费。',
    fees: '方案价格只收一次。银行卡可能收取少量银行处理费；加密支付收取 0% 平台费。',
    gas: '提现到自己的钱包时只需支付网络费，确认前会显示。',
    minimum: '最低提现：$MINEAI 为 25 美元，其他币种见挖矿面板显示的小额最低值。',
    payoutTitle: '直接到你的钱包',
    payoutBody: '收益直接进入你选择的钱包。通过三个清晰步骤跟踪每笔出款。',
    statuses: ['待处理', '处理中', '已发送并附链上 txHash'],
    disclaimer: '奖励是根据实时网络产出估算的，不是收益承诺。',
    calculatorTitle: '看看你能赚多少',
    calculatorLead: '拖动滑块查看每个方案的估算值。所有数值均以美元计算。',
    powerLabel: '云算力',
    daily: '每日估算',
    monthly: '每月估算',
    tokenLabel: '你的 $MINEAI 加成',
    planLabel: '方案',
    estimateNote: '估算值会随挖矿产出和币价变化。',
  },
  hi: {
    title: 'आसान प्लान, साफ़ शुल्क',
    lead: 'प्लान एक बार चुनें। कोई बिजली बिल नहीं और कोई छिपा मासिक शुल्क नहीं।',
    fees: 'प्लान की कीमत एक बार ली जाती है। कार्ड भुगतान में छोटा बैंक शुल्क जुड़ सकता है; क्रिप्टो भुगतान में 0% प्लेटफ़ॉर्म शुल्क।',
    gas: 'अपने वॉलेट में निकालते समय केवल नेटवर्क शुल्क देना होता है। पुष्टि से पहले दिखाया जाता है।',
    minimum: 'न्यूनतम निकासी: $MINEAI में $25, या माइनिंग डैशबोर्ड में दिखाया गया छोटा न्यूनतम।',
    payoutTitle: 'सीधे आपके वॉलेट में',
    payoutBody: 'कमाई सीधे आपके चुने हुए वॉलेट में जाती है। हर भुगतान तीन साफ़ चरणों में देखें।',
    statuses: ['प्रतीक्षारत', 'प्रोसेसिंग', 'चेन पर txHash के साथ भेजा गया'],
    disclaimer: 'इनाम लाइव नेटवर्क आउटपुट पर आधारित अनुमान हैं, मुनाफ़े का वादा नहीं।',
    calculatorTitle: 'देखें आप कितना कमा सकते हैं',
    calculatorLead: 'हर प्लान का अनुमान देखने के लिए स्लाइडर घुमाएँ। सभी मान अमेरिकी डॉलर में हैं।',
    powerLabel: 'क्लाउड पावर',
    daily: 'प्रति दिन अनुमान',
    monthly: 'प्रति माह अनुमान',
    tokenLabel: 'आपका $MINEAI बोनस',
    planLabel: 'प्लान',
    estimateNote: 'अनुमान लाइव माइनिंग आउटपुट और कॉइन कीमतों के साथ बदलते हैं।',
  },
};

export function getPlans(lang: SupportedLanguage): Array<MiningPlan & { text: PlanCopy }> {
  return MINING_PLANS.map((plan) => ({
    ...plan,
    text: plan.copy[lang] ?? plan.copy[DEFAULT_LANGUAGE],
  }));
}

export function getPlanNotes(lang: SupportedLanguage): PlanNotes {
  return PLAN_NOTES[lang] ?? PLAN_NOTES[DEFAULT_LANGUAGE];
}

/** Same emission maths as the mining engine, exposed for the calculator. */
export const EMISSION_USD_PER_MH_PER_DAY = 0.0335232;

export function estimateDailyUsd(hashrateMhs: number, multiplier: number): number {
  return Number((Math.max(0, hashrateMhs) * EMISSION_USD_PER_MH_PER_DAY * Math.max(1, multiplier)).toFixed(2));
}
