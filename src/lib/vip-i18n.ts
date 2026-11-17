import type { SupportedLanguage } from '@/types';

/**
 * Copy for the VIP card and the reserves bar.
 *
 * Hand-authored per locale rather than machine-translated: these two surfaces
 * carry the brand promise, so the wording matters more than the string count.
 * The bar reads live numbers from `/api/token`; only its labels live here.
 */

export interface VipCopy {
  cardLabel: string;
  cardholder: string;
  memberSince: string;
  tier: string;
  multiplier: string;
  staked: string;
  memberCode: string;
  member: string;
  proofEyebrow: string;
  proofTitle: string;
  proofBody: string;
  circulating: string;
  burned: string;
  treasury: string;
  custody: string;
  encryption: string;
  reserves: string;
  chains: string;
  live: string;
  backing: string;
  verified: string;
  cardHint: string;
}

const EN: VipCopy = {
  cardLabel: 'Private client',
  cardholder: 'Cardholder',
  memberSince: 'Member since',
  tier: 'Tier',
  multiplier: 'Multiplier',
  staked: 'Staked',
  memberCode: 'Member code',
  member: 'MineAI operator',
  proofEyebrow: 'Institutional posture',
  proofTitle: 'Security & proof of reserves',
  proofBody:
    'Every treasury movement is logged, every secret is sealed, and the token supply is fixed at genesis — the only supply change the contract can make is a burn.',
  circulating: 'Circulating supply',
  burned: 'Burned to date',
  treasury: 'Genesis treasury',
  custody: 'Custody rails',
  encryption: 'At-rest encryption',
  reserves: 'Reserve ratio',
  chains: 'Settlement chains',
  live: 'Live',
  backing: 'Treasury-backed',
  verified: 'Verified',
  cardHint: 'Tilt the card to catch the light.',
};

const AR: VipCopy = {
  cardLabel: 'عميل خاص',
  cardholder: 'حامل البطاقة',
  memberSince: 'عضو منذ',
  tier: 'الفئة',
  multiplier: 'المضاعف',
  staked: 'المُجمَّد',
  memberCode: 'رمز العضوية',
  member: 'مشغّل MineAI',
  proofEyebrow: 'الوضع المؤسسي',
  proofTitle: 'الأمان وإثبات الاحتياطي',
  proofBody:
    'كل حركة في الخزينة مُسجَّلة، وكل سرّ مُشفَّر، والمعروض ثابت منذ التأسيس — التغيير الوحيد المسموح في العقد هو الإحراق.',
  circulating: 'المعروض المتداول',
  burned: 'المحرَق حتى الآن',
  treasury: 'خزينة التأسيس',
  custody: 'قنوات الحفظ',
  encryption: 'تشفير البيانات المخزّنة',
  reserves: 'نسبة الاحتياطي',
  chains: 'شبكات التسوية',
  live: 'مباشر',
  backing: 'مدعوم بالخزينة',
  verified: 'مُتحقَّق',
  cardHint: 'أمِل البطاقة لالتقاط الضوء.',
};

const FR: VipCopy = {
  cardLabel: 'Client privé',
  cardholder: 'Titulaire',
  memberSince: 'Membre depuis',
  tier: 'Palier',
  multiplier: 'Multiplicateur',
  staked: 'Mis en jeu',
  memberCode: 'Code membre',
  member: 'Opérateur MineAI',
  proofEyebrow: 'Posture institutionnelle',
  proofTitle: 'Sécurité et preuve de réserves',
  proofBody:
    'Chaque mouvement de trésorerie est journalisé, chaque secret est scellé et l’offre est fixée à la genèse — le contrat ne peut que brûler des jetons.',
  circulating: 'Offre en circulation',
  burned: 'Brûlé à ce jour',
  treasury: 'Trésorerie de genèse',
  custody: 'Rails de conservation',
  encryption: 'Chiffrement au repos',
  reserves: 'Ratio de réserve',
  chains: 'Chaînes de règlement',
  live: 'En direct',
  backing: 'Adossé à la trésorerie',
  verified: 'Vérifié',
  cardHint: 'Inclinez la carte pour accrocher la lumière.',
};

const ES: VipCopy = {
  cardLabel: 'Cliente privado',
  cardholder: 'Titular',
  memberSince: 'Miembro desde',
  tier: 'Nivel',
  multiplier: 'Multiplicador',
  staked: 'En staking',
  memberCode: 'Código de miembro',
  member: 'Operador de MineAI',
  proofEyebrow: 'Postura institucional',
  proofTitle: 'Seguridad y prueba de reservas',
  proofBody:
    'Cada movimiento de tesorería queda registrado, cada secreto va sellado y la oferta es fija desde el génesis: el contrato solo puede quemar tokens.',
  circulating: 'Oferta circulante',
  burned: 'Quemado hasta hoy',
  treasury: 'Tesorería génesis',
  custody: 'Rieles de custodia',
  encryption: 'Cifrado en reposo',
  reserves: 'Ratio de reserva',
  chains: 'Cadenas de liquidación',
  live: 'En vivo',
  backing: 'Respaldado por tesorería',
  verified: 'Verificado',
  cardHint: 'Inclina la tarjeta para atrapar la luz.',
};

const ZH: VipCopy = {
  cardLabel: '私人客户',
  cardholder: '持卡人',
  memberSince: '成为会员',
  tier: '等级',
  multiplier: '倍率',
  staked: '已质押',
  memberCode: '会员代码',
  member: 'MineAI 运营者',
  proofEyebrow: '机构级姿态',
  proofTitle: '安全与储备证明',
  proofBody:
    '每一笔金库流动都有记录，每一个密钥都被密封，代币供应在创世时即固定——合约唯一能改变供应的方式是销毁。',
  circulating: '流通供应量',
  burned: '累计销毁',
  treasury: '创世金库',
  custody: '托管通道',
  encryption: '静态加密',
  reserves: '储备比率',
  chains: '结算网络',
  live: '实时',
  backing: '金库支撑',
  verified: '已验证',
  cardHint: '倾斜卡片以捕捉光线。',
};

const HI: VipCopy = {
  cardLabel: 'निजी ग्राहक',
  cardholder: 'कार्डधारक',
  memberSince: 'सदस्यता आरंभ',
  tier: 'स्तर',
  multiplier: 'गुणक',
  staked: 'स्टेक किया',
  memberCode: 'सदस्य कोड',
  member: 'MineAI ऑपरेटर',
  proofEyebrow: 'संस्थागत मुद्रा',
  proofTitle: 'सुरक्षा और भंडार प्रमाण',
  proofBody:
    'हर ट्रेज़री लेन-देन दर्ज होता है, हर रहस्य सील किया जाता है, और टोकन आपूर्ति जेनेसिस पर स्थिर है — अनुबंध केवल बर्न कर सकता है।',
  circulating: 'परिचालित आपूर्ति',
  burned: 'अब तक बर्न',
  treasury: 'जेनेसिस ट्रेज़री',
  custody: 'कस्टडी रेल',
  encryption: 'स्टोरेज एन्क्रिप्शन',
  reserves: 'भंडार अनुपात',
  chains: 'सेटलमेंट चेन',
  live: 'लाइव',
  backing: 'ट्रेज़री-समर्थित',
  verified: 'सत्यापित',
  cardHint: 'रोशनी पकड़ने के लिए कार्ड झुकाएँ।',
};

const COPY: Record<SupportedLanguage, VipCopy> = { en: EN, ar: AR, fr: FR, es: ES, zh: ZH, hi: HI };

export function getVipCopy(lang: SupportedLanguage): VipCopy {
  return COPY[lang] ?? EN;
}
