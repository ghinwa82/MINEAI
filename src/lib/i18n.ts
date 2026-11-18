import type { SupportedLanguage } from '@/types';
import { DEFAULT_LANGUAGE } from '@/lib/languages';

export interface CopyItem {
  title: string;
  body: string;
}

export interface FaqEntry {
  question: string;
  answer: string;
}

export interface StatEntry {
  value: string;
  label: string;
}

export interface Dictionary {
  meta: {
    homeTitle: string;
    homeDescription: string;
    storeTitle: string;
    storeDescription: string;
    notesTitle: string;
    notesDescription: string;
  };
  brand: {
    name: string;
    product: string;
    tagline: string;
    network: string;
  };
  nav: {
    home: string;
    store: string;
    notes: string;
    product: string;
    openConsole: string;
    skipToContent: string;
  };
  language: {
    label: string;
    switch: string;
  };
  home: {
    eyebrow: string;
    headline: string;
    headlineAccent: string;
    lead: string;
    ctaPrimary: string;
    ctaSecondary: string;
    liveNetwork: string;
    statsLabel: string;
    pillarsTitle: string;
    pillarsLead: string;
    pillars: CopyItem[];
    swarmTitle: string;
    swarmLead: string;
    swarmBody: string;
    stats: {
      shards: string;
      uptime: string;
      cycles: string;
      locales: string;
    };
    tiersTitle: string;
    tiersLead: string;
    tiersCta: string;
    closingTitle: string;
    faqTitle: string;
    faq: FaqEntry[];
  };
  store: {
    eyebrow: string;
    title: string;
    lead: string;
    balanceLabel: string;
    withdraw: string;
    activate: string;
    activated: string;
    deactivate: string;
    deploying: string;
    featuresTitle: string;
    roiLabel: string;
    periodLabel: string;
    deploy: string;
    purchasing: string;
    modalTitle: string;
    amountLabel: string;
    destinationLabel: string;
    holderLabel: string;
    bankLabel: string;
    swiftLabel: string;
    currencyLabel: string;
    confirm: string;
    cancel: string;
    processing: string;
    success: string;
    error: string;
    insufficient: string;
    feedTitle: string;
    feedEmpty: string;
    connectTitle: string;
    connectVerified: string;
    connectPending: string;
    connectSandbox: string;
    cycleTitle: string;
    cycleRunning: string;
    lastCycle: string;
    maxLabel: string;
    activatedToast: string;
    pausedToast: string;
    purchaseToast: string;
    activationFailed: string;
    tierLabels: {
      popular: string;
      yield: string;
      sovereign: string;
    };
  };
  notes: {
    eyebrow: string;
    title: string;
    lead: string;
    composerTitle: string;
    titlePlaceholder: string;
    bodyPlaceholder: string;
    categoryLabel: string;
    categories: {
      arbitrage: string;
      supplier: string;
      stripe: string;
      telemetry: string;
    };
    save: string;
    saving: string;
    empty: string;
    delete: string;
    feedTitle: string;
    feedEmpty: string;
    justNow: string;
  };
  product: {
    backToStore: string;
    computeLabel: string;
    includesTitle: string;
    roiLabel: string;
    deployCta: string;
    activeCta: string;
    specRows: {
      compute: string;
      cadence: string;
      settlement: string;
      support: string;
    };
  };
  footer: {
    tagline: string;
    rights: string;
    status: string;
    navTitle: string;
    legalTitle: string;
  };
  common: {
    loading: string;
    retry: string;
    close: string;
    error: string;
    skipToContent: string;
  };
}

const en: Dictionary = {
  meta: {
    homeTitle: 'MineAI Node — Autonomous DePIN compute with a resident agent workforce',
    homeDescription:
      'A decentralised compute mesh whose resident agent workforce scouts winning products, fulfils orders across every connected store and settles earnings to a wallet or bank account.',
    storeTitle: 'Node store — deploy an autonomous compute shard',
    storeDescription:
      'Three tiers of DePIN compute with the same four resident agents behind them. Activate a shard, watch the agent feed, and settle earnings to a wallet or bank account.',
    notesTitle: 'Field notes — the agent ledger, written as it happens',
    notesDescription:
      'Agent decisions, supplier margins and settlement events land in the MineAI ledger the moment they occur. Read them, keep them, or write your own.',
  },
  brand: {
    name: 'MineAI',
    product: 'Node',
    tagline: 'Autonomous compute, arbitraged for you',
    network: 'MineAI DePIN mesh',
  },
  nav: {
    home: 'Home',
    store: 'Node Store',
    notes: 'Field Notes',
    product: 'Node detail',
    openConsole: 'Open console',
    skipToContent: 'Skip to content',
  },
  language: {
    label: 'Language',
    switch: 'Switch interface language',
  },
  home: {
    eyebrow: 'DePIN compute, put to work',
    headline: 'Your trading desk runs',
    headlineAccent: 'while you sleep',
    lead:
      'MineAI rents the silicon and keeps the lights on. A resident agent swarm watches ad platforms, prices suppliers, settles orders and files payouts on your behalf — every decision written to a ledger you can read.',
    ctaPrimary: 'Reserve a node',
    ctaSecondary: 'Read the field notes',
    liveNetwork: 'Live mesh telemetry',
    statsLabel: 'Measured across the last 24 hours',
    pillarsTitle: 'Four systems, one unattended operation',
    pillarsLead:
      'Most platforms stop at the dashboard. MineAI keeps working after you close the tab.',
    pillars: [
      {
        title: 'Scout',
        body:
          'Ad-library crawlers read every new creative on TikTok and Meta, price the supplier gap in seconds, and discard anything already saturated.',
      },
      {
        title: 'Fulfil',
        body:
          'Order routing, tracking fan-out and customer replies happen without a keystroke — across every store you connect.',
      },
      {
        title: 'Settle',
        body:
          'Earnings clear into a wallet or a bank account through a verified Stripe Connect rail, with each transfer carrying its own reference.',
      },
      {
        title: 'Prove',
        body:
          'Every agent action lands in an append-only ledger. No silent retries, no opaque approvals, nothing to reconcile by hand.',
      },
    ],
    swarmTitle: 'The resident agent swarm',
    swarmLead: 'Four agents trade shifts around the clock.',
    swarmBody:
      'They overlap, they correct each other, and they never sleep. The telemetry agent owns hardware health, sentiment owns the customer thread, finance owns the settlement corridor and growth owns the bid ceiling.',
    stats: {
      shards: 'Shards live',
      uptime: 'Mesh uptime',
      cycles: 'Autonomous cycles',
      locales: 'Locales served',
    },
    tiersTitle: 'Three tiers of compute',
    tiersLead:
      'Start on a single shard. Move up when the margin justifies it.',
    tiersCta: 'Compare every tier',
    closingTitle: 'One operation. Six languages. No operator required.',
    faqTitle: 'Questions worth asking first',
    faq: [
      {
        question: 'What happens after I activate a node?',
        answer:
          'The telemetry agent claims the shard, the scout agent starts reading ad libraries against your product set, and the fulfilment agent opens the supplier pipeline. You can watch all three in the field notes, live.',
      },
      {
        question: 'How do payouts reach my account?',
        answer:
          'Earnings accumulate in your treasury. From there you can settle to a crypto wallet instantly, or move a fiat amount to a bank account over a verified Stripe Connect rail.',
      },
      {
        question: 'What does the monthly figure include?',
        answer:
          'Compute share, the agent workforce, ad intelligence and unlimited order fulfilment. There is no per-message fee and no charge for a node sitting idle.',
      },
      {
        question: 'Can I leave it running while I am away?',
        answer:
          'That is the point of the design. The swarm is hosted, it survives a closed browser, and it re-balances itself when a supplier changes price mid-flight.',
      },
    ],
  },
  store: {
    eyebrow: 'Node catalogue',
    title: 'Pick the shard you want running',
    lead:
      'Every tier ships the same four agents. What changes is how much compute stands behind them and how quickly a payout clears.',
    balanceLabel: 'Treasury available',
    withdraw: 'Settle funds',
    activate: 'Activate node',
    activated: 'Node active',
    deactivate: 'Pause node',
    deploying: 'Provisioning',
    featuresTitle: 'What ships with the shard',
    roiLabel: 'Projected return',
    periodLabel: 'billing period',
    deploy: 'Buy this tier',
    purchasing: 'Opening checkout',
    modalTitle: 'Settle to a bank account',
    amountLabel: 'Amount in USD',
    destinationLabel: 'IBAN or account number',
    holderLabel: 'Account holder',
    bankLabel: 'Bank and branch',
    swiftLabel: 'SWIFT / BIC',
    currencyLabel: 'Currency',
    confirm: 'Send transfer',
    cancel: 'Keep funds',
    processing: 'Routing transfer',
    success: 'Transfer settled',
    error: 'Transfer rejected',
    insufficient: 'Treasury balance is too low for that amount.',
    feedTitle: 'Agent activity',
    feedEmpty: 'No agent activity recorded yet.',
    connectTitle: 'Payout rail',
    connectVerified: 'Stripe Connect verified',
    connectPending: 'Stripe Connect awaiting verification',
    connectSandbox: 'Sandbox rail — add a Stripe key for live settlement',
    cycleTitle: 'Autonomous cycle',
    cycleRunning: 'Cycle running',
    lastCycle: 'Last cycle',
    maxLabel: 'Treasury ceiling',
    activatedToast: '{name} claimed by the mesh — the agent crew is already working.',
    pausedToast: '{name} released back to the pool.',
    purchaseToast: 'Stripe opened in a new tab — it will bring you back here.',
    activationFailed: 'The mesh refused the request.',
    tierLabels: {
      popular: 'Most deployed',
      yield: 'Highest yield',
      sovereign: 'Sovereign tier',
    },
  },
  notes: {
    eyebrow: 'Field notes',
    title: 'The ledger, written as it happens',
    lead:
      'Agent decisions, supplier margins and settlement events land here the moment they occur. Read them, keep them, or write your own.',
    composerTitle: 'Add an observation',
    titlePlaceholder: 'Supplier, product or agent observation',
    bodyPlaceholder: 'Margins, links, thresholds — anything a later run should remember.',
    categoryLabel: 'Category',
    categories: {
      arbitrage: 'Arbitrage',
      supplier: 'Supplier',
      stripe: 'Payouts',
      telemetry: 'Telemetry',
    },
    save: 'Write to ledger',
    saving: 'Writing',
    empty: 'The ledger is empty. Write the first entry.',
    delete: 'Remove',
    feedTitle: 'Live agent feed',
    feedEmpty: 'Waiting for the next autonomous cycle.',
    justNow: 'Just now',
  },
  product: {
    backToStore: 'Back to the catalogue',
    computeLabel: 'Compute',
    includesTitle: 'Included in this tier',
    roiLabel: 'Projected return',
    deployCta: 'Deploy this tier',
    activeCta: 'Deployed and running',
    specRows: {
      compute: 'Compute envelope',
      cadence: 'Agent cadence',
      settlement: 'Settlement rail',
      support: 'Operator support',
    },
  },
  footer: {
    tagline: 'Compute that keeps working after you close the tab.',
    rights: 'All rights reserved.',
    status: 'Mesh status: operational',
    navTitle: 'Platform',
    legalTitle: 'Legal',
  },
  common: {
    loading: 'Loading',
    retry: 'Try again',
    close: 'Close',
    error: 'Something went wrong',
    skipToContent: 'Skip to content',
  },
};

const ar: Dictionary = {
  meta: {
    homeTitle: 'MineAI Node — حوسبة DePIN ذاتية بأسطول وكلاء مقيم',
    homeDescription:
      'شبكة حوسبة لامركزية يتبع سرب من الوكلاء المقيمين المنتجات الرابحة، وينفّذ الطلبيات في كل متجر متصل، ويسوّي الأرباح إلى محفظة أو حساب بنكي.',
    storeTitle: 'متجر العقد — شغّل شريحة حوسبة ذاتية',
    storeDescription:
      'ثلاث طبقات من حوسبة DePIN بالخلفات ذاتها: أربعة وكلاء مقيمون. فعّل الشريحة، وراقب نشاط الوكلاء، وسوِّ الأرباح إلى محفظة أو حساب بنكي.',
    notesTitle: 'الميدانية — سجل الوكلاء، يُكتب لحظة وقوعه',
    notesDescription:
      'قرارات الوكلاء وهوامش الموردين وأحداث التسوية تصل إلى سجل MineAI فور وقوعها. اقرأها أو احتفظ بها أو اكتب ملاحظاتك.',
  },
  brand: {
    name: 'MineAI',
    product: 'Node',
    tagline: 'حوسبة ذاتية تتولّى المراجحة عنك',
    network: 'شبكة MineAI اللامركزية',
  },
  nav: {
    home: 'الرئيسية',
    store: 'متجر العقد',
    notes: 'الميدانية',
    product: 'تفاصيل العقدة',
    openConsole: 'افتح اللوحة',
    skipToContent: 'تخطَّ إلى المحتوى',
  },
  language: {
    label: 'اللغة',
    switch: 'تغيير لغة الواجهة',
  },
  home: {
    eyebrow: 'حوسبة لامركزية تعمل فعلياً',
    headline: 'مكتب التداول الخاص بك يعمل',
    headlineAccent: 'أثناء نومك',
    lead:
      'تستأجر MineAI العتاد وتُبقي الأضواء مضاءة. يراقب سرب من الوكلاء منصات الإعلانات، ويسعّر الموردين، ويُنشئ الطلبيات، ويحوّل أرباحك — وكل قرار مُوثَّق في سجل يمكنك قراءته.',
    ctaPrimary: 'احجز عقدة',
    ctaSecondary: 'اقرأ الميدانية',
    liveNetwork: 'قياسات الشبكة الحية',
    statsLabel: 'مقيسة خلال آخر 24 ساعة',
    pillarsTitle: 'أربع منظومة، عملية واحدة دون إشراف',
    pillarsLead:
      'أغلب المنصات تتوقف عند لوحة القيادة. MineAI تستمر بعد أن تُغلق التبويب.',
    pillars: [
      {
        title: 'الرصد',
        body:
          'زواحف مكتبات الإعلانات تقرأ كل تصميم جديد على تيك توك وميتا، وتحسب فارق التكلفة مع المورد خلال ثوانٍ، وتستبعد ما بلغ حد التشبع.',
      },
      {
        title: 'التنفيذ',
        body:
          'توجيه الطلبيات وتتبّع الشحنات والرد على العملاء تتم دون ضغطة واحدة — عبر كل متجر تربطه.',
      },
      {
        title: 'التسوية',
        body:
          'تتراكم الأرباح في خزينتك، ثم تصل إلى محفظة أو حساب بنكي عبر وصلة Stripe Connect موثّقة، لكل تحويل مرجع خاص به.',
      },
      {
        title: 'الإثبات',
        body:
          'كل إجراء للوكلاء يُسجَّل في سجل لا يُعدَّل. لا إعادة محاولة صامتة، ولا موافقات غامضة، ولا حاجة لأي مطابقة يدوية.',
      },
    ],
    swarmTitle: 'سرب الوكلاء المقيم',
    swarmLead: 'أربعة وكلاء يتناوبون المناوبات طوال اليوم.',
    swarmBody:
      'يتداخلون، ويصحّحون بعضهم، ولا ينامون. وكيل القياسات يملك سلامة العتاد، ووكيل المشاعر يملك خيط العميل، ووكيل التمويل يملك قناة التسوية، ووكيل النمو يملك سقف المزايدة.',
    stats: {
      shards: 'شرائح تعمل',
      uptime: 'زمن تشغيل الشبكة',
      cycles: 'دورات ذاتية',
      locales: 'لغات مقدمة',
    },
    tiersTitle: 'ثلاث طبقات من الحوسبة',
    tiersLead:
      'ابدأ بشريحة واحدة، وارتقِ حين يبرّر الهامش ذلك.',
    tiersCta: 'قارن كل الطبقات',
    closingTitle: 'عملية واحدة. ست لغات. دون الحاجة إلى مشغّل.',
    faqTitle: 'أسئلة تستحق أن تُطرح أولاً',
    faq: [
      {
        question: 'ماذا يحدث بعد تفعيل العقدة؟',
        answer:
          'يستولي وكيل القياسات على الشريحة، ويبدأ وكيل الرصد في قراءة مكتبات الإعلانات مقابل منتجاتك، ويفتح وكيل التنفيذ قناة الموردين. وتابع الثلاثة مباشرة في الميدانية.',
      },
      {
        question: 'كيف تصل الأرباح إلى حسابي؟',
        answer:
          'تتراكم الأرباح في خزينتك، ومن هناك تسوّيها إلى محفظة رقمية فوراً، أو تحوّل مبلغاً fiat إلى حساب بنكي عبر وصلة Stripe Connect موثّقة.',
      },
      {
        question: 'ماذا يشمل الرقم الشهري؟',
        answer:
          'حصة الحوسبة، وسرب الوكلاء، وذكاء الإعلانات، وتنفيذ طلبيات بلا حدود. لا رسم لكل رسالة، ولا رسوم لعقدة خامدة.',
      },
      {
        question: 'هل يمكن تركها تعمل أثناء غيابي؟',
        answer:
          'هذا هو المقصود بالتصميم. السرب مستضاف، ويقاوم إغلاق المتصفح، ويعيد توزيع الأحمال بنفسه عند تغيّر سعر مورد في منتصف العملية.',
      },
    ],
  },
  store: {
    eyebrow: 'دليل العقد',
    title: 'اختر الشريحة التي تريد تشغيلها',
    lead:
      'كل طبقة تضم الوكلاء الأربعة نفسها. ما يتغيّر هو حجم الحوسبة خلفهم وسرعة وصول التحويل.',
    balanceLabel: 'المتاح في الخزينة',
    withdraw: 'سوِّ الأرباح',
    activate: 'تفعيل العقدة',
    activated: 'العقدة تعمل',
    deactivate: 'إيقاف العقدة',
    deploying: 'جارٍ التجهيز',
    featuresTitle: 'ما الذي يصل مع الشريحة',
    roiLabel: 'العائد المتوقع',
    periodLabel: 'دورة الفوترة',
    deploy: 'شراء هذه الطبقة',
    purchasing: 'جارٍ فتح بوابة الدفع',
    modalTitle: 'التحويل إلى حساب بنكي',
    amountLabel: 'المبلغ بالدولار',
    destinationLabel: 'الآيبان أو رقم الحساب',
    holderLabel: 'اسم صاحب الحساب',
    bankLabel: 'البنك والفرع',
    swiftLabel: 'سويفت / BIC',
    currencyLabel: 'العملة',
    confirm: 'إرسال التحويل',
    cancel: 'أبقِ الأموال',
    processing: 'جارٍ توجيه التحويل',
    success: 'تم تسوية التحويل',
    error: 'تم رفض التحويل',
    insufficient: 'رصيد الخزينة لا يكفي لهذا المبلغ.',
    feedTitle: 'نشاط الوكلاء',
    feedEmpty: 'لا يوجد نشاط مسجَّل بعد.',
    connectTitle: 'وصلة التحويل',
    connectVerified: 'Stripe Connect موثّق',
    connectPending: 'Stripe Connect بانتظار التوثيق',
    connectSandbox: 'وصلة تجريبية — أضف مفتاح Stripe للتحويل الحقيقي',
    cycleTitle: 'الدورة الذاتية',
    cycleRunning: 'الدورة قيد التنفيذ',
    lastCycle: 'آخر دورة',
    maxLabel: 'سقف الخزينة',
    activatedToast: 'استلمت الشبكةُ {name} — طاقم الوكلاء يعمل عليها الآن.',
    pausedToast: 'أُعيدت {name} إلى مجمع العقد.',
    purchaseToast: 'فُتح Stripe في تبويب جديد — وسيعيدك إلى هنا.',
    activationFailed: 'رفضت الشبكة الطلب.',
    tierLabels: {
      popular: 'الأكثر استخداماً',
      yield: 'الأعلى عائداً',
      sovereign: 'الطبقة السيادية',
    },
  },
  notes: {
    eyebrow: 'ميدانية',
    title: 'السجل يُكتب لحظة وقوعه',
    lead:
      'قرارات الوكلاء وهوامش الموردين وأحداث التسوية تصل هنا فور 발생ها. اقرأها، احتفظ بها، أو اكتب ملاحظاتك.',
    composerTitle: 'أضف ملاحظة',
    titlePlaceholder: 'مورد أو منتج أو ملاحظة وكيل',
    bodyPlaceholder: 'هوامش وروابط وعتبات — أي شيء يجب أن تتذكره الجولة القادمة.',
    categoryLabel: 'التصنيف',
    categories: {
      arbitrage: 'مراجحة',
      supplier: 'مورد',
      stripe: 'التحويلات',
      telemetry: 'قياسات',
    },
    save: 'اكتب في السجل',
    saving: 'جارٍ الكتابة',
    empty: 'السجل فارغ. اكتب أول مدخل.',
    delete: 'حذف',
    feedTitle: 'بث الوكلاء الحي',
    feedEmpty: 'في انتظار الدورة الذاتية القادمة.',
    justNow: 'الآن',
  },
  product: {
    backToStore: 'العودة إلى الدليل',
    computeLabel: 'الحوسبة',
    includesTitle: 'ما تتضمنه هذه الطبقة',
    roiLabel: 'العائد المتوقع',
    deployCta: 'شغّل هذه الطبقة',
    activeCta: 'مُشغَّلة وتعمل',
    specRows: {
      compute: 'سعة الحوسبة',
      cadence: 'دورية الوكلاء',
      settlement: 'وصلة التسوية',
      support: 'دعم المشغّل',
    },
  },
  footer: {
    tagline: 'حوسبة تستمر بعد أن تُغلق التبويب.',
    rights: 'جميع الحقوق محفوظة.',
    status: 'حالة الشبكة: تعمل',
    navTitle: 'المنصة',
    legalTitle: 'قانوني',
  },
  common: {
    loading: 'جارٍ التحميل',
    retry: 'أعد المحاولة',
    close: 'إغلاق',
    error: 'حدث خطأ ما',
    skipToContent: 'تخطَّ إلى المحتوى',
  },
};

const fr: Dictionary = {
  meta: {
    homeTitle: 'MineAI Node — Calcul DePIN autonome avec un essaim d’agents résidents',
    homeDescription:
      'Un maillage de calcul décentralisé dont l’essaim d’agents résidents débusque les produits gagnants, exécute les commandes sur chaque boutique connectée et règle les gains vers un portefeuille ou un compte bancaire.',
    storeTitle: 'Catalogue de nœuds — déployez une tranche de calcul autonome',
    storeDescription:
      'Trois paliers de calcul DePIN adossés aux mêmes quatre agents résidents. Activez une tranche, suivez le flux des agents et réglez vos gains vers un portefeuille ou un compte bancaire.',
    notesTitle: 'Carnet de terrain — le registre des agents, écrit en temps réel',
    notesDescription:
      'Décisions d’agents, marges fournisseurs et événements de règlement arrivent dans le registre MineAI dès leur occurrence. Lisez-les, gardez-les ou écrivez les vôtres.',
  },
  brand: {
    name: 'MineAI',
    product: 'Node',
    tagline: 'Le calcul autonome, arbitré pour vous',
    network: 'Maille DePIN MineAI',
  },
  nav: {
    home: 'Accueil',
    store: 'Catalogue de nœuds',
    notes: 'Carnet de terrain',
    product: 'Détail du nœud',
    openConsole: 'Ouvrir la console',
    skipToContent: 'Aller au contenu',
  },
  language: {
    label: 'Langue',
    switch: 'Changer la langue de l’interface',
  },
  home: {
    eyebrow: 'Du calcul DePIN mis au travail',
    headline: 'Votre bureau de trading travaille',
    headlineAccent: 'pendant que vous dormez',
    lead:
      'MineAI loue la puissance et entretient la salle machine. Un essaim d’agents résidents surveille les plateformes publicitaires, price les fournisseurs, passe les commandes et exécute les virements — chaque décision consignée dans un registre lisible.',
    ctaPrimary: 'Réserver un nœud',
    ctaSecondary: 'Lire le carnet de terrain',
    liveNetwork: 'Télémétrie du maillage en direct',
    statsLabel: 'Mesuré sur les dernières 24 heures',
    pillarsTitle: 'Quatre systèmes, une seule exploitation sans surveillance',
    pillarsLead:
      'La plupart des plateformes s’arrêtent au tableau de bord. MineAI continue après que vous avez fermé l’onglet.',
    pillars: [
      {
        title: 'Repérer',
        body:
          'Les collecteurs de bibliothèques publicitaires lisent chaque nouvelle création sur TikTok et Meta, chiffrent l’écart fournisseur en quelques secondes et écartent tout ce qui est déjà saturé.',
      },
      {
        title: 'Exécuter',
        body:
          'Acheminement des commandes, suivi des colis et réponses clients se font sans une seule frappe — sur toutes vos boutiques connectées.',
      },
      {
        title: 'Régler',
        body:
          'Les gains s’accumulent dans votre trésorerie, puis partent vers un portefeuille ou un compte bancaire via un rail Stripe Connect vérifié, chaque transfert portant sa propre référence.',
      },
      {
        title: 'Justifier',
        body:
          'Chaque action d’agent atterrit dans un registre en ajout seul. Aucune relance silencieuse, aucune approbation opaque, rien à rapprocher à la main.',
      },
    ],
    swarmTitle: 'L’essaim d’agents résident',
    swarmLead: 'Quatre agents se relèvent en continu.',
    swarmBody:
      'Ils se recouvrent, se corrigent, et ne dorment jamais. L’agent de télémétrie tient la santé du matériel, celui de sentiment tient le fil client, celui de finance tient le corridor de règlement et celui de croissance tient le plafond d’enchère.',
    stats: {
      shards: 'Tranches actives',
      uptime: 'Disponibilité du maillage',
      cycles: 'Cycles autonomes',
      locales: 'Langues servies',
    },
    tiersTitle: 'Trois paliers de puissance',
    tiersLead:
      'Commencez sur une seule tranche. Montez quand la marge le justifie.',
    tiersCta: 'Comparer tous les paliers',
    closingTitle: 'Une seule opération. Six langues. Aucun opérateur requis.',
    faqTitle: 'Les questions à poser d’abord',
    faq: [
      {
        question: 'Que se passe-t-il après l’activation d’un nœud ?',
        answer:
          'L’agent de télémétrie réclame la tranche, l’agent de repérage commence à lire les bibliothèques publicitaires face à votre catalogue, et l’agent d’exécution ouvre le pipeline fournisseurs. Les trois sont visibles en direct dans le carnet.',
      },
      {
        question: 'Comment les virements arrivent-ils sur mon compte ?',
        answer:
          'Les gains s’accumulent dans votre trésorerie. De là, règlement instantané vers un portefeuille crypto, ou transfert d’un montant fiat vers un compte bancaire via un rail Stripe Connect vérifié.',
      },
      {
        question: 'Que comprend le tarif mensuel ?',
        answer:
          'Part de calcul, force de travail des agents, intelligence publicitaire et exécution de commandes illimitée. Aucun frais par message, aucun tarif pour un nœud inactif.',
      },
      {
        question: 'Puis-je le laisser tourner en mon absence ?',
        answer:
          'C’est précisément l’objectif. L’essaim est hébergé, survit à la fermeture du navigateur et rééquilibre ses charges si un fournisseur change de prix en cours de route.',
      },
    ],
  },
  store: {
    eyebrow: 'Catalogue de nœuds',
    title: 'Choisissez la tranche à faire tourner',
    lead:
      'Chaque palier embarque les mêmes quatre agents. Ce qui change, c’est la puissance qui les soutient et la vitesse de liquidation.',
    balanceLabel: 'Trésorerie disponible',
    withdraw: 'Régler les fonds',
    activate: 'Activer le nœud',
    activated: 'Nœud actif',
    deactivate: 'Mettre en veille',
    deploying: 'Provisionnement',
    featuresTitle: 'Ce qui est livré avec la tranche',
    roiLabel: 'Rendement projeté',
    periodLabel: 'période de facturation',
    deploy: 'Acheter ce palier',
    purchasing: 'Ouverture du paiement',
    modalTitle: 'Virement vers un compte bancaire',
    amountLabel: 'Montant en USD',
    destinationLabel: 'IBAN ou numéro de compte',
    holderLabel: 'Titulaire du compte',
    bankLabel: 'Banque et agence',
    swiftLabel: 'SWIFT / BIC',
    currencyLabel: 'Devise',
    confirm: 'Envoyer le virement',
    cancel: 'Conserver les fonds',
    processing: 'Acheminement du virement',
    success: 'Virement réglé',
    error: 'Virement refusé',
    insufficient: 'La trésorerie est insuffisante pour ce montant.',
    feedTitle: 'Activité des agents',
    feedEmpty: 'Aucune activité enregistrée pour l’instant.',
    connectTitle: 'Rail de liquidation',
    connectVerified: 'Stripe Connect vérifié',
    connectPending: 'Stripe Connect en attente de vérification',
    connectSandbox: 'Rail de test — ajoutez une clé Stripe pour le règlement réel',
    cycleTitle: 'Cycle autonome',
    cycleRunning: 'Cycle en cours',
    lastCycle: 'Dernier cycle',
    maxLabel: 'Plafond de trésorerie',
    activatedToast: '{name} a été revendiqué par le maillage — l’équipage d’agents travaille déjà dessus.',
    pausedToast: '{name} a été relâché dans le pool.',
    purchaseToast: 'Stripe s’est ouvert dans un nouvel onglet — il vous ramènera ici.',
    activationFailed: 'Le maillage a refusé la requête.',
    tierLabels: {
      popular: 'Le plus déployé',
      yield: 'Rendement maximal',
      sovereign: 'Palier souverain',
    },
  },
  notes: {
    eyebrow: 'Carnet de terrain',
    title: 'Le registre, écrit en temps réel',
    lead:
      'Décisions d’agents, marges fournisseurs et événements de règlement arrivent ici dès leur occurrence. Lisez-les, gardez-les, ou écrivez les vôtres.',
    composerTitle: 'Ajouter une observation',
    titlePlaceholder: 'Fournisseur, produit ou observation d’agent',
    bodyPlaceholder: 'Marges, liens, seuils — tout ce qu’un passage ultérieur doit retenir.',
    categoryLabel: 'Catégorie',
    categories: {
      arbitrage: 'Arbitrage',
      supplier: 'Fournisseur',
      stripe: 'Virements',
      telemetry: 'Télémétrie',
    },
    save: 'Écrire dans le registre',
    saving: 'Écriture',
    empty: 'Le registre est vide. Écrivez la première entrée.',
    delete: 'Supprimer',
    feedTitle: 'Flux d’agents en direct',
    feedEmpty: 'En attente du prochain cycle autonome.',
    justNow: 'À l’instant',
  },
  product: {
    backToStore: 'Retour au catalogue',
    computeLabel: 'Calcul',
    includesTitle: 'Inclus dans ce palier',
    roiLabel: 'Rendement projeté',
    deployCta: 'Déployer ce palier',
    activeCta: 'Déployé et actif',
    specRows: {
      compute: 'Enveloppe de calcul',
      cadence: 'Cadence des agents',
      settlement: 'Rail de règlement',
      support: 'Support opérateur',
    },
  },
  footer: {
    tagline: 'Un calcul qui continue après la fermeture de l’onglet.',
    rights: 'Tous droits réservés.',
    status: 'État du maillage : opérationnel',
    navTitle: 'Plateforme',
    legalTitle: 'Mentions',
  },
  common: {
    loading: 'Chargement',
    retry: 'Réessayer',
    close: 'Fermer',
    error: 'Une erreur est survenue',
    skipToContent: 'Aller au contenu',
  },
};

const es: Dictionary = {
  meta: {
    homeTitle: 'MineAI Node — Cómputo DePIN autónomo con un enjambre de agentes residentes',
    homeDescription:
      'Una malla de cómputo descentralizada cuyo enjambre de agentes residentes localiza productos ganadores, ejecuta pedidos en cada tienda conectada y liquida las ganancias a una cartera o cuenta bancaria.',
    storeTitle: 'Catálogo de nodos — despliega una partición de cómputo autónoma',
    storeDescription:
      'Tres niveles de cómputo DePIN con los mismos cuatro agentes residentes detrás. Activa una partición, sigue el feed de agentes y liquida las ganancias a una cartera o cuenta bancaria.',
    notesTitle: 'Cuaderno de campo — el registro de agentes, escrito al instante',
    notesDescription:
      'Las decisiones de los agentes, los márgenes de proveedor y los eventos de liquidación llegan al registro de MineAI en cuanto ocurren. Léelos, guárdalos o escribe los tuyos.',
  },
  brand: {
    name: 'MineAI',
    product: 'Node',
    tagline: 'Cómputo autónomo, arbitrado por ti',
    network: 'Malla DePIN de MineAI',
  },
  nav: {
    home: 'Inicio',
    store: 'Catálogo de nodos',
    notes: 'Cuaderno de campo',
    product: 'Detalle del nodo',
    openConsole: 'Abrir consola',
    skipToContent: 'Ir al contenido',
  },
  language: {
    label: 'Idioma',
    switch: 'Cambiar el idioma de la interfaz',
  },
  home: {
    eyebrow: 'Cómputo DePIN puesto a trabajar',
    headline: 'Tu mesa de operaciones trabaja',
    headlineAccent: 'mientras duermes',
    lead:
      'MineAI alquila el silicio y mantiene las luces encendidas. Un enjambre de agentes residentes vigila las plataformas publicitarias, negocia con proveedores, emite pedidos y liquida pagos por ti — cada decisión queda en un registro que puedes leer.',
    ctaPrimary: 'Reservar un nodo',
    ctaSecondary: 'Leer el cuaderno de campo',
    liveNetwork: 'Telemetría de la malla en vivo',
    statsLabel: 'Medido en las últimas 24 horas',
    pillarsTitle: 'Cuatro sistemas, una operación sin vigilancia',
    pillarsLead:
      'La mayoría de plataformas se detienen en el panel. MineAI sigue trabajando después de que cierras la pestaña.',
    pillars: [
      {
        title: 'Explorar',
        body:
          'Rastreadores de bibliotecas publicitarias leen cada pieza nueva en TikTok y Meta, calculan la brecha con el proveedor en segundos y descartan lo que ya está saturado.',
      },
      {
        title: 'Ejecutar',
        body:
          'Despacho de pedidos, seguimiento de envíos y respuestas al cliente ocurren sin una sola pulsación — en todas tus tiendas conectadas.',
      },
      {
        title: 'Liquidar',
        body:
          'Las ganancias se acumulan en tu tesorería y salen hacia una cartera o una cuenta bancaria por un carril Stripe Connect verificado, con su propia referencia en cada transferencia.',
      },
      {
        title: 'Rendir cuentas',
        body:
          'Cada acción de agente queda en un registro de solo adición. Sin reintentos silenciosos, sin aprobaciones opacas, sin nada que conciliar a mano.',
      },
    ],
    swarmTitle: 'El enjambre de agentes residentes',
    swarmLead: 'Cuatro agentes se relevan por turnos.',
    swarmBody:
      'Se solapan, se corrigen y nunca duermen. El agente de telemetría sostiene la salud del hardware, el de sentimiento sostiene el hilo del cliente, el financiero sostiene el corredor de liquidación y el de crecimiento sostiene el techo de puja.',
    stats: {
      shards: 'Particiones activas',
      uptime: 'Disponibilidad de la malla',
      cycles: 'Ciclos autónomos',
      locales: 'Idiomas servidos',
    },
    tiersTitle: 'Tres niveles de cómputo',
    tiersLead:
      'Empieza con una sola partición. Sube cuando el margen lo justifique.',
    tiersCta: 'Comparar todos los niveles',
    closingTitle: 'Una sola operación. Seis idiomas. Sin operador.',
    faqTitle: 'Preguntas que conviene hacer primero',
    faq: [
      {
        question: '¿Qué ocurre al activar un nodo?',
        answer:
          'El agente de telemetría reclama la partición, el agente explorador empieza a leer las bibliotecas publicitarias frente a tu catálogo y el agente de ejecución abre el canal con proveedores. Los tres se ven en vivo en el cuaderno.',
      },
      {
        question: '¿Cómo llegan los pagos a mi cuenta?',
        answer:
          'Las ganancias se acumulan en tu tesorería. Desde ahí puedes liquidar al instante a una cartera cripto o mover un importe fiat a una cuenta bancaria por un carril Stripe Connect verificado.',
      },
      {
        question: '¿Qué incluye la cifra mensual?',
        answer:
          'Parte de cómputo, la fuerza de agentes, inteligencia publicitaria y ejecución ilimitada de pedidos. Sin coste por mensaje ni por nodo en reposo.',
      },
      {
        question: '¿Puedo dejarlo funcionando mientras no estoy?',
        answer:
          'Esa es la razón del diseño. El enjambre está alojado, sobrevive al cierre del navegador y reequilibra su carga si un proveedor cambia de precio a mitad de una operación.',
      },
    ],
  },
  store: {
    eyebrow: 'Catálogo de nodos',
    title: 'Elige la partición que quieres activa',
    lead:
      'Cada nivel incluye los mismos cuatro agentes. Lo que cambia es el cómputo que los sostiene y la rapidez con la que se liquida un pago.',
    balanceLabel: 'Tesorería disponible',
    withdraw: 'Liquidar fondos',
    activate: 'Activar nodo',
    activated: 'Nodo activo',
    deactivate: 'Pausar nodo',
    deploying: 'Aprovisionando',
    featuresTitle: 'Lo que se incluye con la partición',
    roiLabel: 'Rendimiento previsto',
    periodLabel: 'periodo de facturación',
    deploy: 'Comprar este nivel',
    purchasing: 'Abriendo el pago',
    modalTitle: 'Transferencia a cuenta bancaria',
    amountLabel: 'Importe en USD',
    destinationLabel: 'IBAN o número de cuenta',
    holderLabel: 'Titular de la cuenta',
    bankLabel: 'Banco y sucursal',
    swiftLabel: 'SWIFT / BIC',
    currencyLabel: 'Moneda',
    confirm: 'Enviar transferencia',
    cancel: 'Conservar fondos',
    processing: 'Enrutando la transferencia',
    success: 'Transferencia liquidada',
    error: 'Transferencia rechazada',
    insufficient: 'La tesorería no cubre ese importe.',
    feedTitle: 'Actividad de los agentes',
    feedEmpty: 'Aún no hay actividad registrada.',
    connectTitle: 'Carril de liquidación',
    connectVerified: 'Stripe Connect verificado',
    connectPending: 'Stripe Connect pendiente de verificación',
    connectSandbox: 'Carril de pruebas — añade una clave de Stripe para liquidar de verdad',
    cycleTitle: 'Ciclo autónomo',
    cycleRunning: 'Ciclo en curso',
    lastCycle: 'Último ciclo',
    maxLabel: 'Techo de tesorería',
    activatedToast: 'La malla reclamó {name} — la tripulación de agentes ya está trabajando.',
    pausedToast: '{name} volvió al pool.',
    purchaseToast: 'Stripe se abrió en una pestaña nueva — te devolverá aquí.',
    activationFailed: 'La malla rechazó la petición.',
    tierLabels: {
      popular: 'El más desplegado',
      yield: 'Mayor rendimiento',
      sovereign: 'Nivel soberano',
    },
  },
  notes: {
    eyebrow: 'Cuaderno de campo',
    title: 'El registro, escrito según ocurre',
    lead:
      'Las decisiones de los agentes, los márgenes de proveedor y los eventos de liquidación llegan aquí en cuanto ocurren. Léelos, consérvalos o escribe los tuyos.',
    composerTitle: 'Añadir una observación',
    titlePlaceholder: 'Proveedor, producto u observación de agente',
    bodyPlaceholder: 'Márgenes, enlaces, umbrales — lo que una pasada posterior deba recordar.',
    categoryLabel: 'Categoría',
    categories: {
      arbitrage: 'Arbitraje',
      supplier: 'Proveedor',
      stripe: 'Liquidaciones',
      telemetry: 'Telemetría',
    },
    save: 'Escribir en el registro',
    saving: 'Escribiendo',
    empty: 'El registro está vacío. Escribe la primera entrada.',
    delete: 'Eliminar',
    feedTitle: 'Flujo de agentes en vivo',
    feedEmpty: 'Esperando el próximo ciclo autónomo.',
    justNow: 'Ahora mismo',
  },
  product: {
    backToStore: 'Volver al catálogo',
    computeLabel: 'Cómputo',
    includesTitle: 'Incluido en este nivel',
    roiLabel: 'Rendimiento previsto',
    deployCta: 'Desplegar este nivel',
    activeCta: 'Desplegado y activo',
    specRows: {
      compute: 'Envolvente de cómputo',
      cadence: 'Cadencia de agentes',
      settlement: 'Carril de liquidación',
      support: 'Soporte del operador',
    },
  },
  footer: {
    tagline: 'Cómputo que sigue trabajando cuando cierras la pestaña.',
    rights: 'Todos los derechos reservados.',
    status: 'Estado de la malla: operativo',
    navTitle: 'Plataforma',
    legalTitle: 'Legal',
  },
  common: {
    loading: 'Cargando',
    retry: 'Reintentar',
    close: 'Cerrar',
    error: 'Algo ha fallado',
    skipToContent: 'Ir al contenido',
  },
};

const zh: Dictionary = {
  meta: {
    homeTitle: 'MineAI Node — 常驻智能体驱动的自主 DePIN 算力',
    homeDescription:
      '一套去中心化算力网格，由常驻智能体集群负责挖掘爆品、在每个已连接店铺执行订单，并将收益结算至钱包或银行账户。',
    storeTitle: '节点商城 — 部署一枚自主算力分片',
    storeDescription:
      '三档 DePIN 算力，背后的常驻智能体完全相同。启用分片，实时查看智能体动态，并将收益结算至钱包或银行账户。',
    notesTitle: '现场笔记 — 智能体账本，随事即写',
    notesDescription:
      '智能体决策、供应商毛利与结算事件一发生就进入 MineAI 账本。可以阅读、留存，也可以写下你自己的判断。',
  },
  brand: {
    name: 'MineAI',
    product: 'Node',
    tagline: '自主算力，为你完成套利',
    network: 'MineAI DePIN 网格',
  },
  nav: {
    home: '首页',
    store: '节点商城',
    notes: '现场笔记',
    product: '节点详情',
    openConsole: '打开控制台',
    skipToContent: '跳到正文',
  },
  language: {
    label: '语言',
    switch: '切换界面语言',
  },
  home: {
    eyebrow: '真正投入生产的 DePIN 算力',
    headline: '你的交易台',
    headlineAccent: '在你入睡后继续运转',
    lead:
      'MineAI 租下算力并持续供电。一组常驻智能体盯住广告平台、核算供应商成本、派发订单并完成结算 —— 每一个决策都会写进你可以随时查阅的账本。',
    ctaPrimary: '预订节点',
    ctaSecondary: '阅读现场笔记',
    liveNetwork: '网格实时遥测',
    statsLabel: '取自最近 24 小时',
    pillarsTitle: '四套系统，一套无人值守的运转',
    pillarsLead:
      '多数平台做到仪表盘就停下了。MineAI 在你关掉标签页之后依旧工作。',
    pillars: [
      {
        title: '侦察',
        body:
          '广告库爬虫逐条读取 TikTok 与 Meta 的新素材，数秒内算出供应商价差，并剔除已经饱和的商品。',
      },
      {
        title: '履约',
        body:
          '订单派发、物流跟踪与客户回复完全无需人工触发 —— 在你接入的每一家店铺同时进行。',
      },
      {
        title: '结算',
        body:
          '收益先沉淀到你的金库，再经由已验证的 Stripe Connect 通道进入钱包或银行账户，每笔转账都带独立参考号。',
      },
      {
        title: '留痕',
        body:
          '智能体的每次动作都会落入只追加的账本。没有静默重试，没有含糊审批，也不需要人工对账。',
      },
    ],
    swarmTitle: '常驻智能体集群',
    swarmLead: '四个智能体轮班运转。',
    swarmBody:
      '彼此重叠、互相纠错，从不休息。遥测智能体掌管硬件健康，舆情智能体掌管客户线索，财务智能体掌管结算通道，增长智能体掌管出价上限。',
    stats: {
      shards: '运行分片',
      uptime: '网格可用率',
      cycles: '自主循环',
      locales: '支持语种',
    },
    tiersTitle: '三档算力',
    tiersLead: '先从单个分片开始，等利润跑通再升级。',
    tiersCta: '对比全部档位',
    closingTitle: '一次运行，六种语言，无需人工值守。',
    faqTitle: '先问清楚这几个问题',
    faq: [
      {
        question: '激活节点之后会发生什么？',
        answer:
          '遥测智能体接管分片，侦察智能体开始对照你的商品读取广告库，履约智能体打开供应商通道。三个过程都能在笔记页实时看到。',
      },
      {
        question: '收益如何进入我的账户？',
        answer:
          '收益先累积在你的金库。之后可以即时结算到加密钱包，或通过已验证的 Stripe Connect 通道把法币金额转入银行账户。',
      },
      {
        question: '月度费用包含什么？',
        answer:
          '算力份额、智能体集群、广告情报与不限量的订单履约。不按消息计费，节点闲置也不收费。',
      },
      {
        question: '我可以放着不管吗？',
        answer:
          '这正是设计目的。集群托管运行，关闭浏览器也不会中断，供应商中途改价时它会自行重新分配负载。',
      },
    ],
  },
  store: {
    eyebrow: '节点目录',
    title: '挑一个要跑起来的分片',
    lead:
      '每一档都包含同样的四个智能体。差别在于支撑它们的算力规模，以及结算到账的速度。',
    balanceLabel: '可用金库余额',
    withdraw: '结算资金',
    activate: '激活节点',
    activated: '节点运行中',
    deactivate: '暂停节点',
    deploying: '正在开通',
    featuresTitle: '分片随附的能力',
    roiLabel: '预期回报',
    periodLabel: '计费周期',
    deploy: '购买该档位',
    purchasing: '正在打开支付页',
    modalTitle: '转账至银行账户',
    amountLabel: '金额（美元）',
    destinationLabel: 'IBAN 或银行账号',
    holderLabel: '账户持有人',
    bankLabel: '银行与分行',
    swiftLabel: 'SWIFT / BIC',
    currencyLabel: '币种',
    confirm: '发起转账',
    cancel: '保留资金',
    processing: '正在路由转账',
    success: '转账已结算',
    error: '转账被拒绝',
    insufficient: '金库余额不足以覆盖该金额。',
    feedTitle: '智能体动态',
    feedEmpty: '暂无动态记录。',
    connectTitle: '结算通道',
    connectVerified: 'Stripe Connect 已验证',
    connectPending: 'Stripe Connect 等待验证',
    connectSandbox: '沙盒通道 —— 配置 Stripe 密钥即可真实结算',
    cycleTitle: '自主循环',
    cycleRunning: '循环执行中',
    lastCycle: '上次循环',
    maxLabel: '金库上限',
    activatedToast: '{name} 已被网格接管 —— 智能体团队已经开始工作。',
    pausedToast: '{name} 已释放回节点池。',
    purchaseToast: 'Stripe 已在新标签页打开，稍后会把带回这里。',
    activationFailed: '网格拒绝了这次请求。',
    tierLabels: {
      popular: '部署最多',
      yield: '收益最高',
      sovereign: '至尊档位',
    },
  },
  notes: {
    eyebrow: '现场笔记',
    title: '账本随事即写',
    lead:
      '智能体决策、供应商毛利与结算事件一发生就出现在这里。可以阅读、留存，也可以写下你自己的判断。',
    composerTitle: '添加一条观察',
    titlePlaceholder: '供应商、产品或智能体观察',
    bodyPlaceholder: '毛利、链接、阈值 —— 下一轮运行需要记住的任何东西。',
    categoryLabel: '分类',
    categories: {
      arbitrage: '套利',
      supplier: '供应商',
      stripe: '结算',
      telemetry: '遥测',
    },
    save: '写入账本',
    saving: '写入中',
    empty: '账本还是空的。写下第一条吧。',
    delete: '删除',
    feedTitle: '实时智能体动态',
    feedEmpty: '等待下一次自主循环。',
    justNow: '刚刚',
  },
  product: {
    backToStore: '返回目录',
    computeLabel: '算力',
    includesTitle: '该档位包含',
    roiLabel: '预期回报',
    deployCta: '部署该档位',
    activeCta: '已部署并运行中',
    specRows: {
      compute: '算力规格',
      cadence: '智能体节奏',
      settlement: '结算通道',
      support: '运营支持',
    },
  },
  footer: {
    tagline: '关掉标签页也不会停下的算力。',
    rights: '版权所有。',
    status: '网格状态：运行正常',
    navTitle: '平台',
    legalTitle: '条款',
  },
  common: {
    loading: '加载中',
    retry: '重试',
    close: '关闭',
    error: '出了点问题',
    skipToContent: '跳到正文',
  },
};

const hi: Dictionary = {
  meta: {
    homeTitle: 'MineAI Node — स्थायी एजेंट झुंड वाला स्वायत्त DePIN कंप्यूट',
    homeDescription:
      'एक विकेंद्रीकृत कंप्यूट मेश, जिसका स्थायी एजेंट झुंड जीतने वाले उत्पाद खोजता है, हर जुड़े स्टोर पर ऑर्डर पूरा करता है और कमाई को वॉलेट या बैंक खाते में निपटाता है।',
    storeTitle: 'नोड स्टोर — एक स्वायत्त कंप्यूट शेयर तैनात करें',
    storeDescription:
      'तीन स्तरों का DePIN कंप्यूट, और पीछे वही चार स्थायी एजेंट। शेयर सक्रिय करें, एजेंट फ़ीड देखें और कमाई वॉलेट या बैंक खाते में निपटाएँ।',
    notesTitle: 'फील्ड नोट्स — एजेंट बही, जैसे-जैसे घटनाएँ हों',
    notesDescription:
      'एजेंट के निर्णय, सप्लायर मार्जिन और निपटान की घटनाएँ MineAI बही में उसी वक्त आ जाती हैं। पढ़ें, रखें, या अपना खुद लिखें।',
  },
  brand: {
    name: 'MineAI',
    product: 'Node',
    tagline: 'स्वायत्त कंप्यूट, आपकी ओर से बेचा गया',
    network: 'MineAI DePIN मेश',
  },
  nav: {
    home: 'होम',
    store: 'नोड स्टोर',
    notes: 'फील्ड नोट्स',
    product: 'नोड विवरण',
    openConsole: 'कंसोल खोलें',
    skipToContent: 'सामग्री पर जाएँ',
  },
  language: {
    label: 'भाषा',
    switch: 'इंटरफ़ेस की भाषा बदलें',
  },
  home: {
    eyebrow: 'देपिन कंप्यूट, असली काम पर',
    headline: 'आपकी ट्रेडिंग डेस्क',
    headlineAccent: 'आपके सोते-सोते चलती है',
    lead:
      'MineAI सिलिकॉन किराए पर लेता है और चराग जलाए रखता है। एक स्थायी एजेंट झुंड विज्ञापन प्लेटफ़ॉर्म निगरानी करता है, सप्लायर का मूल्य लगाता है, ऑर्डर निपटाता है और भुगतान करवाता है — हर निर्णय एक ऐसी बही में दर्ज होता है जिसे आप पढ़ सकते हैं।',
    ctaPrimary: 'नोड बुक करें',
    ctaSecondary: 'फील्ड नोट्स पढ़ें',
    liveNetwork: 'लाइव मेश टेलीमेट्री',
    statsLabel: 'पिछले 24 घंटों का माप',
    pillarsTitle: 'चार प्रणाली, एक बिना निगरानी संचालन',
    pillarsLead:
      'ज़्यादातर प्लेटफ़ॉर्म डैशबोर्ड पर रुक जाते हैं। MineAI उसके बाद भी चलता रहता है।',
    pillars: [
      {
        title: 'नज़र',
        body:
          'विज्ञापन लाइब्रेरी क्रॉलर हर नया क्रिएटिव पढ़ते हैं, कुछ ही सेकंड में सप्लायर अंतर की गणना करते हैं और जो बाज़ार में पहले से भर चुका है उसे छोड़ देते हैं।',
      },
      {
        title: 'निष्पादन',
        body:
          'ऑर्डर रूटिंग, ट्रैकिंग और ग्राहक जवाब — आपके जुड़े हर स्टोर में — बिना एक की-प्रेस के चलते हैं।',
      },
      {
        title: 'निपटान',
        body:
          'कमाई पहले आपकी ट्रेज़री में जुड़ती है, फिर सत्यापित Stripe Connect रेल से वॉलेट या बैंक खाते में जाती है — हर ट्रांसफ़र का अपना संदर्भ होता है।',
      },
      {
        title: 'सबूत',
        body:
          'एजेंट का हर कदम केवल-जोड़ने वाली बही में दर्ज होता है। कोई चुपचाप पुनःप्रयास नहीं, कोई अस्पष्ट मंज़ूरी नहीं, और कुछ भी हाथ से मिलाने की ज़रूरत नहीं।',
      },
    ],
    swarmTitle: 'स्थायी एजेंट झुंड',
    swarmLead: 'चार एजेंट लगातार पाली बदलते हैं।',
    swarmBody:
      'वे एक-दूसरे के साथ ओवरलैप करते हैं, एक-दूसरे को सुधारते हैं, और कभी नहीं सोते। टेलीमेट्री एजेंट हार्डवेयर की सेहत संभालता है, भावना एजेंट ग्राहक की धारा, वित्त एजेंट निपटान मार्ग और ग्रोथ एजेंट बोली की सीमा।',
    stats: {
      shards: 'चल रहे शेयर',
      uptime: 'मेश उपलब्धता',
      cycles: 'स्वायत्त चक्र',
      locales: 'उपलब्ध भाषाएँ',
    },
    tiersTitle: 'कंप्यूट के तीन स्तर',
    tiersLead: 'एक शेयर से शुरुआत करें; मार्जिन ज़रूरी हो तो ऊपर जाएँ।',
    tiersCta: 'सभी स्तर मिलाएँ',
    closingTitle: 'एक संचालन। छह भाषाएँ। किसी ऑपरेटर की ज़रूरत नहीं।',
    faqTitle: 'पहले पूछने लायक सवाल',
    faq: [
      {
        question: 'नोड चालू करने के बाद क्या होता है?',
        answer:
          'टेलीमेट्री एजेंट शेयर ग्रब करता है, नज़र एजेंट आपकी उत्पाद सूची के सामने विज्ञापन लाइब्रेरी पढ़ना शुरू करता है, और निष्पादन एजेंट सप्लायर पाइपलाइन खोलता है। तीनों फील्ड नोट्स में लाइव दिखते हैं।',
      },
      {
        question: 'भुगतान मेरे खाते में कैसे पहुँचते हैं?',
        answer:
          'कमाई आपकी ट्रेज़री में जुड़ती है। वहाँ से आप तुरंत क्रिप्टो वॉलेट में निपटा सकते हैं, या सत्यापित Stripe Connect रेल से बैंक खाते में फ़िएट राशि भेज सकते हैं।',
      },
      {
        question: 'मासिक राशि में क्या शामिल है?',
        answer:
          'कंप्यूट हिस्सा, एजेंट कार्यबल, विज्ञापन इंटेलिजेंस और असीमित ऑर्डर निष्पादन। न प्रति संदेश शुल्क, न निष्क्रिय नोड का शुल्क।',
      },
      {
        question: 'क्या मैं इसे बिना देखे चला सकता हूँ?',
        answer:
          'यही इसकी बनावट का मकसद है। झुंड होस्ट होता है, ब्राउज़र बंद करने पर भी चलता रहता है, और बीच-बीच में सप्लायर का भाव बदलने पर अपना भार स्वयं बाँट लेता है।',
      },
    ],
  },
  store: {
    eyebrow: 'नोड सूची',
    title: 'जो शेयर चलाना है वह चुनें',
    lead:
      'हर स्तर में वही चार एजेंट मिलते हैं। बदलता है उनके पीछे का कंप्यूट और भुगतान की सफलता की रफ़्तार।',
    balanceLabel: 'उपलब्ध ट्रेज़री',
    withdraw: 'निधि निपटाएँ',
    activate: 'नोड सक्रिय करें',
    activated: 'नोड चालू',
    deactivate: 'नोड रोकें',
    deploying: 'तैयार हो रहा है',
    featuresTitle: 'शेयर के साथ क्या मिलता है',
    roiLabel: 'अनुमानित लाभ',
    periodLabel: 'बिलिंग अवधि',
    deploy: 'यह स्तर खरीदें',
    purchasing: 'चेकआउट खुल रहा है',
    modalTitle: 'बैंक खाते में स्थानांतरण',
    amountLabel: 'राशि (USD)',
    destinationLabel: 'IBAN या खाता संख्या',
    holderLabel: 'खाताधारक का नाम',
    bankLabel: 'बैंक और शाखा',
    swiftLabel: 'SWIFT / BIC',
    currencyLabel: 'मुद्रा',
    confirm: 'स्थानांतरण भेजें',
    cancel: 'निधि रोकें',
    processing: 'स्थानांतरण रूट हो रहा है',
    success: 'स्थानांतरण निपट गया',
    error: 'स्थानांतरण अस्वीकृत',
    insufficient: 'इस राशि के लिए ट्रेज़री अपर्याप्त है।',
    feedTitle: 'एजेंट गतिविधि',
    feedEmpty: 'अभी कोई गतिविधि दर्ज नहीं हुई।',
    connectTitle: 'भुगतान रेल',
    connectVerified: 'Stripe Connect सत्यापित',
    connectPending: 'Stripe Connect सत्यापन की प्रतीक्षा में',
    connectSandbox: 'सैंडबॉक्स रेल — लाइव निपटान के लिए Stripe कुंजी जोड़ें',
    cycleTitle: 'स्वायत्त चक्र',
    cycleRunning: 'चक्र चल रहा है',
    lastCycle: 'अंतिम चक्र',
    maxLabel: 'ट्रेज़री सीमा',
    activatedToast: '{name} को मेश ने अपनाया है — एजेंट दल पहले से काम कर रहा है।',
    pausedToast: '{name} वापस पूल में जारी कर दिया गया।',
    purchaseToast: 'Stripe नए टैब में खुला है — आपको वापस यहाँ लाएगा।',
    activationFailed: 'मेश ने अनुरोध अस्वीकार कर दिया।',
    tierLabels: {
      popular: 'सर्वाधिक प्रयुक्त',
      yield: 'उच्चतम लाभ',
      sovereign: 'सोवरेन स्तर',
    },
  },
  notes: {
    eyebrow: 'फील्ड नोट्स',
    title: 'बही, जैसे-जैसे घटनाएँ हों',
    lead:
      'एजेंट के निर्णय, सप्लायर मार्जिन और निपटान की घटनाएँ यहाँ उसी वक्त आ जाती हैं। पढ़ें, रखें, या अपना खुद लिखें।',
    composerTitle: 'नई टिप्पणी जोड़ें',
    titlePlaceholder: 'सप्लायर, उत्पाद या एजेंट प्रेक्षण',
    bodyPlaceholder: 'मार्जिन, लिंक, सीमाएँ — वह सब जो अगले चक्र को याद रखना चाहिए।',
    categoryLabel: 'श्रेणी',
    categories: {
      arbitrage: 'मार्जिन',
      supplier: 'सप्लायर',
      stripe: 'निपटान',
      telemetry: 'टेलीमेट्री',
    },
    save: 'बही में लिखें',
    saving: 'लिखा जा रहा है',
    empty: 'बही खाली है। पहली प्रविष्टि लिखें।',
    delete: 'हटाएँ',
    feedTitle: 'लाइव एजेंट फ़ीड',
    feedEmpty: 'अगले स्वायत्त चक्र की प्रतीक्षा में।',
    justNow: 'अभी-अभी',
  },
  product: {
    backToStore: 'सूची पर लौटें',
    computeLabel: 'कंप्यूट',
    includesTitle: 'इस स्तर में शामिल',
    roiLabel: 'अनुमानित लाभ',
    deployCta: 'यह स्तर तैनात करें',
    activeCta: 'तैनात और चालू',
    specRows: {
      compute: 'कंप्यूट सीमा',
      cadence: 'एजेंट ताल',
      settlement: 'निपटान रेल',
      support: 'ऑपरेटर सहायता',
    },
  },
  footer: {
    tagline: 'टैब बंद करने के बाद भी चलता कंप्यूट।',
    rights: 'सर्वाधिकार सुरक्षित।',
    status: 'मेश स्थिति: कार्यशील',
    navTitle: 'प्लेटफ़ॉर्म',
    legalTitle: 'कानूनी',
  },
  common: {
    loading: 'लोड हो रहा है',
    retry: 'फिर कोशिश करें',
    close: 'बंद करें',
    error: 'कुछ गड़बड़ हो गई',
    skipToContent: 'सामग्री पर जाएँ',
  },
};

/**
 * The universal dictionary. English is the root; every other locale mirrors it
 * key-for-key so a missing translation can never surface as a blank label.
 */
export const DICTIONARIES: Record<SupportedLanguage, Dictionary> = {
  en,
  ar,
  fr,
  es,
  zh,
  hi,
};

export function getDictionary(lang: SupportedLanguage): Dictionary {
  return DICTIONARIES[lang] ?? DICTIONARIES[DEFAULT_LANGUAGE];
}
