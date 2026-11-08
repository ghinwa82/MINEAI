import { SupportedLanguage } from '@/types';

export interface TranslationDictionary {
  brandTagline: string;
  navDashboard: string;
  navTelemetry: string;
  navSwarm: string;
  navLeaderboard: string;
  navVault: string;
  statusOnline: string;
  statusHealing: string;
  nodeMiningControls: string;
  startMining: string;
  stopMining: string;
  hashrate: string;
  uptime: string;
  balanceLive: string;
  temp: string;
  agentSwarmTitle: string;
  agentTelemetryDesc: string;
  agentSupportDesc: string;
  agentFinanceDesc: string;
  agentGrowthDesc: string;
  leaderboardTitle: string;
  streakTitle: string;
  daysStreak: string;
  rankTier: string;
  vaultDepositCard: string;
  vaultCryptoReceiver: string;
  vaultBankPayout: string;
  executePayout: string;
  chatPlaceholder: string;
  chatSend: string;
  payoutProcessing: string;
  payoutSuccess: string;
}

export const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en: {
    brandTagline: 'Autonomous DePIN & AI Swarm Infrastructure',
    navDashboard: 'Dashboard',
    navTelemetry: 'Node Telemetry',
    navSwarm: 'AI Agent Swarm',
    navLeaderboard: 'Leaderboard',
    navVault: 'Profit Vault',
    statusOnline: 'Operational & Connected',
    statusHealing: 'Self-Healing Active',
    nodeMiningControls: 'Mining Node Terminal',
    startMining: 'Start Node Mining',
    stopMining: 'Pause Node Mining',
    hashrate: 'Live Hashrate',
    uptime: 'Uptime',
    balanceLive: 'Accumulated Profit',
    temp: 'Core Temp',
    agentSwarmTitle: 'Autonomous Multi-Agent AI Workforce',
    agentTelemetryDesc: 'Continuous hardware audit, edge pings, and hashrate balancing.',
    agentSupportDesc: 'Multilingual sentiment mapping & enterprise context replies.',
    agentFinanceDesc: 'Real-time CoinGecko feeds & automated bank settlement loops.',
    agentGrowthDesc: '7-Day retention streaks, XP tiers & viral referral optimization.',
    leaderboardTitle: 'Global DePIN Leaderboard',
    streakTitle: 'Daily Mining Streak',
    daysStreak: 'Days Consecutive',
    rankTier: 'Node Rank Tier',
    vaultDepositCard: 'Buy Compute Hashrate (Stripe)',
    vaultCryptoReceiver: 'Direct Web3 Settlement',
    vaultBankPayout: 'Instant International Bank Payout',
    executePayout: 'Transfer to Bank Account',
    chatPlaceholder: 'Ask the Autonomous Support Agent in any language...',
    chatSend: 'Transmit',
    payoutProcessing: 'Executing Strix AI Bank Routing...',
    payoutSuccess: 'Funds Successfully Routed to Bank Account'
  },
  ar: {
    brandTagline: 'البنية التحتية اللامركزية لشبكات DePIN وأسراب الذكاء الاصطناعي',
    navDashboard: 'لوحة التحكم',
    navTelemetry: 'قياسات العقدة',
    navSwarm: 'سرب وكلاء الذكاء الاصطناعي',
    navLeaderboard: 'المتصدرين',
    navVault: 'خزينة الأرباح',
    statusOnline: 'العقدة متصلة وتعمل بكفاءة',
    statusHealing: 'الاستشفاء الذاتي قيد التنفيذ',
    nodeMiningControls: 'محطة تعدين العقدة الذكية',
    startMining: 'تشغيل تعدين العقدة',
    stopMining: 'إيقاف التعدين مؤقتاً',
    hashrate: 'معدل التجزئة اللحظي',
    uptime: 'زمن التشغيل المستمر',
    balanceLive: 'الأرباح التراكمية الحية',
    temp: 'حرارة المعالج',
    agentSwarmTitle: 'قوة عمل وكلاء الذكاء الاصطناعي المستقلة',
    agentTelemetryDesc: 'تدقيق لحظي للعتاد، فحص الاتصال وتوازن معدلات الهاش دون انقطاع.',
    agentSupportDesc: 'تحليل المشاعر بدقة وتوليد ردود سياقية بست لغات عالمية.',
    agentFinanceDesc: 'تزامن لحظي مع أسعار CoinGecko وتنفيذ مسارات الصرف البنكي التلقائية.',
    agentGrowthDesc: 'تتبع سلاسل الأيام السبعة، مستويات الخبرة، ومضاعفات الإحالة الفيروسية.',
    leaderboardTitle: 'لوحة شرف عمال التعدين العالمية',
    streakTitle: 'سلسلة النشاط اليومي المتواصل',
    daysStreak: 'أيام متتالية',
    rankTier: 'رتبة العقدة التعدينية',
    vaultDepositCard: 'شراء طاقة تجزئة إضافية (Stripe)',
    vaultCryptoReceiver: 'إيداع وتسوية مباشرة عبر Web3',
    vaultBankPayout: 'سحب فوري إلى الحساب البنكي الدولي',
    executePayout: 'تنفيذ التحويل البنكي الفوري',
    chatPlaceholder: 'تحدث مع وكيل الدعم الآلي بأي لغة تفضلها...',
    chatSend: 'إرسال',
    payoutProcessing: 'جاري تنفيذ مسارات الأمان والتحويل البنكي...',
    payoutSuccess: 'تم تحويل العوائد المالية إلى الحساب البنكي بنجاح'
  },
  fr: {
    brandTagline: 'Infrastructure DePIN et Essaim d’Agents IA Autonomes',
    navDashboard: 'Tableau de bord',
    navTelemetry: 'Télémétrie',
    navSwarm: 'Essaim d’Agents IA',
    navLeaderboard: 'Classement',
    navVault: 'Coffre de Profits',
    statusOnline: 'Opérationnel et Connecté',
    statusHealing: 'Auto-guérison Active',
    nodeMiningControls: 'Terminal de Minage du Nœud',
    startMining: 'Démarrer le Minage',
    stopMining: 'Suspendre le Minage',
    hashrate: 'Hashrate en Direct',
    uptime: 'Disponibilité',
    balanceLive: 'Bénéfice Accumulé',
    temp: 'Temp. CPU/GPU',
    agentSwarmTitle: 'Agents IA Autonomes Multi-Tâches',
    agentTelemetryDesc: 'Audit continu du matériel, pings réseau et équilibrage.',
    agentSupportDesc: 'Analyse des sentiments et assistance multilingue.',
    agentFinanceDesc: 'Synchronisation CoinGecko et virements bancaires instantanés.',
    agentGrowthDesc: 'Séries de 7 jours, paliers XP et parrainage dynamique.',
    leaderboardTitle: 'Classement Mondial DePIN',
    streakTitle: 'Série Quotidienne de Minage',
    daysStreak: 'Jours Consécutifs',
    rankTier: 'Rang du Nœud',
    vaultDepositCard: 'Acheter de la Puissance (Stripe)',
    vaultCryptoReceiver: 'Règlement Direct Web3',
    vaultBankPayout: 'Virement Bancaire International Immédiat',
    executePayout: 'Transférer sur le Compte Bancaire',
    chatPlaceholder: 'Posez votre question à l’agent de support IA...',
    chatSend: 'Envoyer',
    payoutProcessing: 'Routage bancaire sécurisé en cours...',
    payoutSuccess: 'Fonds transférés avec succès sur votre compte bancaire'
  },
  es: {
    brandTagline: 'Infraestructura DePIN y Enjambre de IA Autónoma',
    navDashboard: 'Panel de Control',
    navTelemetry: 'Telemetría',
    navSwarm: 'Enjambre IA',
    navLeaderboard: 'Clasificación',
    navVault: 'Bóveda de Beneficios',
    statusOnline: 'Operativo y Conectado',
    statusHealing: 'Auto-recuperación Activa',
    nodeMiningControls: 'Terminal de Minería de Nodo',
    startMining: 'Iniciar Minería',
    stopMining: 'Pausar Minería',
    hashrate: 'Hashrate en Vivo',
    uptime: 'Tiempo Activo',
    balanceLive: 'Ganancia Acumulada',
    temp: 'Temp. Núcleo',
    agentSwarmTitle: 'Fuerza de Trabajo Autónoma Multi-Agente',
    agentTelemetryDesc: 'Auditoría continua de hardware y equilibrio de cómputo.',
    agentSupportDesc: 'Mapeo de sentimientos y soporte contextual nativo.',
    agentFinanceDesc: 'Sincronización con CoinGecko y liquidación bancaria directa.',
    agentGrowthDesc: 'Racha de 7 días, niveles de XP y recompensas por recomendación.',
    leaderboardTitle: 'Tabla Global de Mineros DePIN',
    streakTitle: 'Racha de Minería Diaria',
    daysStreak: 'Días Consecutivos',
    rankTier: 'Nivel del Nodo',
    vaultDepositCard: 'Comprar Cómputo (Stripe)',
    vaultCryptoReceiver: 'Liquidación Directa Web3',
    vaultBankPayout: 'Transferencia Bancaria Internacional Instantánea',
    executePayout: 'Transferir a Cuenta Bancaria',
    chatPlaceholder: 'Consulte al agente de soporte en cualquier idioma...',
    chatSend: 'Transmitir',
    payoutProcessing: 'Ejecutando enrutamiento bancario seguro...',
    payoutSuccess: 'Fondos transferidos exitosamente a su cuenta bancaria'
  },
  zh: {
    brandTagline: '自主式 DePIN 与 AI 多智能体集群基础设施',
    navDashboard: '仪表盘',
    navTelemetry: '节点遥测',
    navSwarm: 'AI 智能体集群',
    navLeaderboard: '全球排行榜',
    navVault: '收益金库',
    statusOnline: '系统在线且稳定运行',
    statusHealing: '自动修复机制运行中',
    nodeMiningControls: '智能节点挖矿终端',
    startMining: '启动节点计算',
    stopMining: '暂停节点计算',
    hashrate: '实时哈希率',
    uptime: '连续运行时间',
    balanceLive: '实时累计收益',
    temp: '核心温度',
    agentSwarmTitle: '全自动多智能体 AI 工作流',
    agentTelemetryDesc: '不间断硬件审计、边缘测速与算力负载自适应调控。',
    agentSupportDesc: '多语言情绪分析，毫秒级自适应企业级智能应答。',
    agentFinanceDesc: '实时对接 CoinGecko 汇率，自动化跨境银行提现结算。',
    agentGrowthDesc: '7日连续挖矿激励、经验段位与病毒式裂变奖励。',
    leaderboardTitle: '全球 DePIN 矿工排行榜',
    streakTitle: '连续挖矿打卡纪录',
    daysStreak: '天连续在线',
    rankTier: '节点段位',
    vaultDepositCard: '充值算力额度 (Stripe)',
    vaultCryptoReceiver: 'Web3 加密货币直连结算',
    vaultBankPayout: '全球国际银行账户即时结算',
    executePayout: '执行银行账户划转',
    chatPlaceholder: '随时向多语言 AI 客服智能体提问...',
    chatSend: '发送',
    payoutProcessing: '正在执行 Strix AI 银行加密转账...',
    payoutSuccess: '资金已安全汇入您的国际银行账户'
  },
  hi: {
    brandTagline: 'स्वायत्त DePIN और AI एजेंट नेटवर्क इन्फ्रास्ट्रक्चर',
    navDashboard: 'डैशबोर्ड',
    navTelemetry: 'नोड टेलीमेट्री',
    navSwarm: 'AI एजेंट झुंड',
    navLeaderboard: 'लीडरबोर्ड',
    navVault: 'लाभ वॉल्ट',
    statusOnline: 'सक्रिय और कनेक्टेड',
    statusHealing: 'स्वतः-सुधार सक्रिय',
    nodeMiningControls: 'माइनिंग नोड टर्मिनल',
    startMining: 'माइनिंग शुरू करें',
    stopMining: 'माइनिंग रोकें',
    hashrate: 'लाइव हैशरेट',
    uptime: 'अपटाइम',
    balanceLive: 'संचित कुल लाभ',
    temp: 'कोर तापमान',
    agentSwarmTitle: 'स्वायत्त मल्टी-एजेंट AI कार्यबल',
    agentTelemetryDesc: 'हार्डवेयर ऑडिट, नोड लेटेंसी और हैशरेट संतुलन।',
    agentSupportDesc: 'बहुभाषी भावना विश्लेषण और त्वरित ग्राहक सहायता।',
    agentFinanceDesc: 'CoinGecko डेटा और स्वचालित बैंक ट्रांसफर प्रणाली।',
    agentGrowthDesc: '7-दिवसीय स्ट्रीक, XP स्तर और रेफरल रिवार्ड्स।',
    leaderboardTitle: 'ग्लोबल DePIN लीडरबोर्ड',
    streakTitle: 'दैनिक माइनिंग स्ट्रीक',
    daysStreak: 'लगातार सक्रिय दिन',
    rankTier: 'नोड रैंक स्तर',
    vaultDepositCard: 'हैशरेट खरीदें (Stripe)',
    vaultCryptoReceiver: 'प्रत्यक्ष Web3 भुगतान',
    vaultBankPayout: 'त्वरित अंतर्राष्ट्रीय बैंक ट्रांसफर',
    executePayout: 'बैंक खाते में ट्रांसफर करें',
    chatPlaceholder: 'किसी भी भाषा में AI एजेंट से प्रश्न पूछें...',
    chatSend: 'भेजें',
    payoutProcessing: 'सुरक्षित बैंक भुगतान प्रक्रिया जारी...',
    payoutSuccess: 'धनराशि आपके बैंक खाते में सफलतापूर्वक भेज दी गई है'
  }
};

export function isRTL(lang: SupportedLanguage): boolean {
  return lang === 'ar';
}