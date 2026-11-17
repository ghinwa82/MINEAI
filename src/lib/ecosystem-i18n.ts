import type { SupportedLanguage } from '@/types';
import { DEFAULT_LANGUAGE } from '@/lib/languages';

/**
 * Copy for the financial and Web3 surface.
 *
 * The original site dictionary stays untouched; this module owns the language
 * matrix for the seven new modules (checkout, token, mining, markets, rewards,
 * explainer video). Every locale is authored by hand rather than machine
 * translated, and every key exists in all six languages so no label can ever
 * fall back to English mid-sentence.
 */

export interface CaptionScene {
  title: string;
  line: string;
}

export interface EcosystemCopy {
  nav: {
    mining: string;
    markets: string;
    rewards: string;
    news: string;
    plans: string;
    insights: string;
    support: string;
    startFree: string;
  };
  rails: {
    eyebrow: string;
    title: string;
    lead: string;
    cardTitle: string;
    cardBody: string;
    currencies: string;
    cryptoTitle: string;
    cryptoBody: string;
    feeBadge: string;
    compliance: string;
  };
  checkout: {
    title: string;
    lead: string;
    fiatTitle: string;
    fiatLead: string;
    cryptoTitle: string;
    cryptoLead: string;
    payWith: string;
    railKashier: string;
    railPaymob: string;
    railStripe: string;
    cardNote: string;
    applePay: string;
    localWallets: string;
    ownerBank: string;
    ownerWallet: string;
    settleNote: string;
    openCheckout: string;
    opening: string;
    close: string;
    back: string;
    networkLabel: string;
    amountLabel: string;
    addressLabel: string;
    copy: string;
    copied: string;
    minLabel: string;
    expiryLabel: string;
    txHashLabel: string;
    verify: string;
    verifying: string;
    verified: string;
    pending: string;
    failed: string;
    qrAlt: string;
    configured: string;
    notConfigured: string;
    demo: string;
    sandboxNote: string;
    selectNetwork: string;
    amountDue: string;
    railMode: string;
  };
  token: {
    eyebrow: string;
    title: string;
    lead: string;
    supply: string;
    burned: string;
    staked: string;
    holders: string;
    price: string;
    contract: string;
    copyContract: string;
    auditNote: string;
    buy: string;
    addChain: string;
  };
  mining: {
    eyebrow: string;
    title: string;
    lead: string;
    hashrate: string;
    mined: string;
    pending: string;
    streak: string;
    claimStreak: string;
    claimed: string;
    tomorrow: string;
    multiplier: string;
    vip: string;
    stakeTitle: string;
    stakeBody: string;
    stake: string;
    unstake: string;
    stakeAmount: string;
    withdrawTitle: string;
    withdrawBody: string;
    wallet: string;
    withdraw: string;
    withdrawing: string;
    withdrawSuccess: string;
    min: string;
    payoutsTitle: string;
    payoutsBody: string;
    zeroPower: string;
    zeroPowerBody: string;
    edgeTitle: string;
    edgeBody: string;
    compliance: string;
    cron: string;
    terminalTitle: string;
    terminalBody: string;
    allocation: string;
    allocationHint: string;
    saveAllocation: string;
    savingAllocation: string;
    coin: string;
    bonus: string;
    portfolio: string;
    perDay: string;
    allocationSaved: string;
    addressHint: string;
  };
  markets: {
    eyebrow: string;
    title: string;
    lead: string;
    live: string;
    updated: string;
    indices: string;
    forex: string;
    commodities: string;
    crypto: string;
    internal: string;
    change: string;
    refresh: string;
  };
  rewards: {
    eyebrow: string;
    title: string;
    lead: string;
    streakTitle: string;
    streakBody: string;
    claim: string;
    claimed: string;
    tomorrow: string;
    multiplier: string;
    vipTitle: string;
    vipBody: string;
    referralTitle: string;
    referralBody: string;
    yourCode: string;
    copy: string;
    copied: string;
    invited: string;
    earned: string;
    leaderboard: string;
    rank: string;
    operator: string;
    mined: string;
    securityTitle: string;
    securityBody: string;
    securityEnroll: string;
    securitySecret: string;
    securityVerify: string;
    securityVerified: string;
    securityCode: string;
  };
  video: {
    title: string;
    lead: string;
    play: string;
    pause: string;
    restart: string;
    mute: string;
    unmute: string;
    sceneOf: string;
    captionsOn: string;
    captionsOff: string;
    captions: CaptionScene[];
  };
}

const EN: EcosystemCopy = {
  nav: { mining: 'Cloud Mining', markets: 'Live Markets', rewards: 'VIP & Rewards', news: 'Global News', plans: 'Plans & Pricing', insights: 'Market Insights', support: 'Support', startFree: 'Start Free Mining' },
  rails: {
    eyebrow: 'Payment rails',
    title: 'Pay by card, or settle on-chain with zero platform fee',
    lead: 'Visa, Mastercard and debit cards settle through Kashier and Paymob in US dollars or Egyptian pounds. Direct USDT and BTC settlement skips the processor entirely.',
    cardTitle: 'Global & local cards',
    cardBody:
      'Kashier and Paymob authorise Visa, Mastercard and Meeza debit cards, then settle to the merchant bank account by webhook. The card form is hosted by the processor — no card number touches this server.',
    currencies: 'Priced in USD $ · Charged in EGP ج.م at the displayed rate',
    cryptoTitle: 'Borderless crypto',
    cryptoBody:
      'USDT and BTC settle straight to the published owner wallet on the network you choose. A deposit is credited only after the transaction hash is verified against a public RPC.',
    feeBadge: '0% platform fee',
    compliance: 'Terms, privacy, refund policy and contact are published for processor review.',
  },
  checkout: {
    title: 'Settle this node',
    lead: 'Two rails, one destination. Card and wallet payments clear through the fiat processor; crypto clears on-chain and is verified before the treasury is credited.',
    fiatTitle: 'Fiat rail',
    fiatLead: 'Visa, Mastercard, debit, Apple Pay and local wallets.',
    cryptoTitle: 'On-chain rail',
    cryptoLead: 'Seven networks, one deposit address per network, verified by transaction hash.',
    payWith: 'Pay with',
    railKashier: 'Kashier',
    railPaymob: 'Paymob',
    railStripe: 'Stripe',
    cardNote: 'Card data never touches this server. The processor hosts the payment page.',
    applePay: 'Apple Pay',
    localWallets: 'Local wallets',
    ownerBank: 'Owner settlement account',
    ownerWallet: 'Owner wallet',
    settleNote: 'Funds route directly to the owner account configured in the deployment environment.',
    openCheckout: 'Open secure checkout',
    opening: 'Opening the rail',
    close: 'Close',
    back: 'Back to rails',
    networkLabel: 'Network',
    amountLabel: 'Amount',
    addressLabel: 'Deposit address',
    copy: 'Copy',
    copied: 'Copied',
    minLabel: 'Minimum',
    expiryLabel: 'Quote expires',
    txHashLabel: 'Transaction hash',
    verify: 'Verify deposit',
    verifying: 'Checking the chain',
    verified: 'Deposit verified and credited',
    pending: 'Not confirmed yet. The chain has not finalised this transaction.',
    failed: 'The chain rejected or could not find that transaction.',
    qrAlt: 'Deposit QR code',
    configured: 'Configured',
    notConfigured: 'Not configured',
    demo: 'Demo address. Replace before accepting funds.',
    sandboxNote: 'No processor key is present, so this rail runs in clearly labelled sandbox mode.',
    selectNetwork: 'Select a network',
    amountDue: 'Amount due',
    railMode: 'Rail mode',
  },
  token: {
    eyebrow: 'The $MINEAI asset',
    title: 'One token behind every shard',
    lead: 'Fixed supply, deflationary burn, staking pools. One contract source compiles to BEP-20 and ERC-20, so liquidity can follow whichever chain the market chooses.',
    supply: 'Fixed supply',
    burned: 'Burned to date',
    staked: 'Staked in pools',
    holders: 'Holders',
    price: 'Utility index',
    contract: 'Contract',
    copyContract: 'Copy contract',
    auditNote: 'Deploy with the Hardhat script, verify the source on-chain, then seed liquidity on a DEX.',
    buy: 'Trade $MINEAI',
    addChain: 'Add to wallet',
  },
  mining: {
    eyebrow: 'Zero-electricity compute',
    title: 'Mine on someone else’s silicon',
    lead: 'Your shard runs on external edge capacity. No hardware, no power draw, no noise. Just a reward stream that accrues every second and withdraws to your own wallet.',
    hashrate: 'Effective hashrate',
    mined: 'Mined',
    pending: 'Claimable',
    streak: 'Mining streak',
    claimStreak: 'Claim daily streak',
    claimed: 'Streak claimed for today',
    tomorrow: 'Come back tomorrow to extend the multiplier.',
    multiplier: 'Multiplier',
    vip: 'VIP tier',
    stakeTitle: 'Stake $MINEAI',
    stakeBody: 'Stake to lift your multiplier and unlock whale tiers. Unstake at any time.',
    stake: 'Stake',
    unstake: 'Unstake',
    stakeAmount: 'Amount to stake',
    withdrawTitle: 'Withdraw rewards',
    withdrawBody: 'Rewards leave the pool to your own wallet. The minimum is 25 $MINEAI.',
    wallet: 'Wallet address',
    withdraw: 'Withdraw',
    withdrawing: 'Broadcasting',
    withdrawSuccess: 'Withdrawal queued to',
    min: 'Minimum',
    payoutsTitle: 'Live payouts',
    payoutsBody: 'Settlements leaving the pool right now.',
    zeroPower: 'Zero electricity',
    zeroPowerBody: 'Compute is rented from external cloud capacity. The platform never mines on your device and never bills you for power.',
    edgeTitle: 'Edge cron',
    edgeBody: 'A serverless cron accrues every active position, even while this tab is closed.',
    compliance: 'Cloud-terms compliant',
    cron: 'Last accrual',
    terminalTitle: 'Multi-coin emission terminal',
    terminalBody:
      'One fixed dollar budget, split across seven rails. $MINEAI carries a 3× bonus, so an equal share earns three times the budget — the total yield never changes.',
    allocation: 'Allocation',
    allocationHint: 'Shares are normalised; they do not need to add up to 100.',
    saveAllocation: 'Save allocation',
    savingAllocation: 'Saving…',
    coin: 'Coin',
    bonus: 'Bonus',
    portfolio: 'Portfolio value',
    perDay: 'Emission / day',
    allocationSaved: 'Emission split updated.',
    addressHint: 'Withdrawal address for the selected chain.',
  },
  markets: {
    eyebrow: 'Institutional terminal',
    title: 'Markets, without the noise',
    lead: 'Global indices, commodities, currencies and the top digital assets on one board, refreshed continuously. $MINEAI sits alongside them on its own utility index.',
    live: 'Live',
    updated: 'Updated',
    indices: 'Global indices',
    forex: 'Currencies',
    commodities: 'Commodities',
    crypto: 'Digital assets',
    internal: 'Utility index',
    change: '24h',
    refresh: 'Refresh',
  },
  rewards: {
    eyebrow: 'Retention engine',
    title: 'The longer you stay, the more the mesh pays',
    lead: 'Daily streaks compound your yield, whale tiers unlock higher multipliers, and every operator you bring in earns you a lifetime slice of their mining rewards.',
    streakTitle: 'Daily streak',
    streakBody: 'Claim once per day. Every consecutive day adds ten percent, capped at a 1.7x multiplier.',
    claim: 'Claim today',
    claimed: 'Claimed',
    tomorrow: 'The next claim unlocks at 00:00 UTC.',
    multiplier: 'Current multiplier',
    vipTitle: 'Whale tiers',
    vipBody: 'Tiers are measured on staked $MINEAI and never expire while you stay staked.',
    referralTitle: 'Referral programme',
    referralBody: 'Share your code. You earn eight percent of every referred operator’s mining rewards, for life.',
    yourCode: 'Your code',
    copy: 'Copy code',
    copied: 'Copied',
    invited: 'Operators invited',
    earned: 'Referral earnings',
    leaderboard: 'Global leaderboard',
    rank: 'Rank',
    operator: 'Operator',
    mined: 'Mined',
    securityTitle: 'Account vault',
    securityBody: 'Two-factor authentication is enforced on every withdrawal once you enrol. Enrol once and keep the recovery codes offline.',
    securityEnroll: 'Enrol authenticator',
    securitySecret: 'Secret key',
    securityVerify: 'Verify code',
    securityVerified: 'Two-factor enabled',
    securityCode: '6-digit code',
  },
  video: {
    title: 'See the mesh work',
    lead: 'A ninety-second explainer, narrated in your language.',
    play: 'Play explainer',
    pause: 'Pause',
    restart: 'Restart',
    mute: 'Mute narration',
    unmute: 'Unmute narration',
    sceneOf: 'Scene',
    captionsOn: 'Captions on',
    captionsOff: 'Captions off',
    captions: [
      {
        title: 'The mesh wakes',
        line: 'Resident agents claim idle capacity across external clouds. No hardware in your room, no power on your bill.',
      },
      {
        title: 'It scouts',
        line: 'Ad libraries and supplier catalogues are read continuously. Saturated products are discarded before they cost you a cent.',
      },
      {
        title: 'It settles',
        line: 'Orders fulfil themselves and earnings clear to your bank or your own wallet, each transfer carrying its own reference.',
      },
      {
        title: 'It proves',
        line: 'Every action lands in an append-only ledger you can read in six languages.',
      },
    ],
  },
};

const AR: EcosystemCopy = {
  nav: { mining: 'التعدين السحابي', markets: 'الأسواق المباشرة', rewards: 'VIP والمكافآت', news: 'أخبار العالم', plans: 'الخطط والأسعار', insights: 'رؤى السوق', support: 'الدعم', startFree: 'ابدأ التعدين المجاني' },
  rails: {
    eyebrow: 'مسارات الدفع',
    title: 'ادفع بالبطاقة، أو سوِّ على السلسلة دون أي رسوم منصة',
    lead: 'تُسوّى بطاقات Visa وMastercard والبطاقات المدينة عبر Kashier وPaymob بالدولار الأمريكي أو الجنيه المصري. أما تسوية USDT وBTC المباشرة فتتجاوز بوابة الدفع بالكامل.',
    cardTitle: 'بطاقات عالمية ومحلية',
    cardBody:
      'تُجيز Kashier وPaymob بطاقات Visa وMastercard وMeeza المدينة ثم تسوّيان إلى حساب التاجر البنكي عبر webhook. تستضيف البوابة نموذج البطاقة — لا يمر رقم بطاقة عبر هذا الخادم.',
    currencies: 'السعر بالدولار $ · التحصيل بالجنيه ج.م بالسعر المعروض',
    cryptoTitle: 'عملات رقمية بلا حدود',
    cryptoBody:
      'تُسوّى USDT وBTC مباشرة إلى محفظة المالك المنشورة على الشبكة التي تختارها. لا يُضاف الإيداع إلا بعد التحقق من بصمة المعاملة عبر RPC عام.',
    feeBadge: '0% رسوم منصة',
    compliance: 'الشروط والخصوصية وسياسة الاسترداد والاتصال منشورة لمراجعة بوابة الدفع.',
  },
  checkout: {
    title: 'أتمم شراء هذه العقدة',
    lead: 'مساران ووجهة واحدة. تُحصّل مدفوعات البطاقات والمحافظ عبر معالج الدفع، وتُحصّل العملات الرقمية على السلسلة ويتم التحقق منها قبل إضافة الرصيد.',
    fiatTitle: 'المسار النقدي',
    fiatLead: 'فيزا وماستركارد والبطاقات المدينة وApple Pay والمحافظ المحلية.',
    cryptoTitle: 'مسار السلسلة',
    cryptoLead: 'سبع شبكات، عنوان إيداع واحد لكل شبكة، يُتحقق منه عبر بصمة المعاملة.',
    payWith: 'ادفع بواسطة',
    railKashier: 'Kashier',
    railPaymob: 'Paymob',
    railStripe: 'Stripe',
    cardNote: 'بيانات البطاقة لا تصل إلى هذا الخادم أبداً. المعالج يستضيف صفحة الدفع.',
    applePay: 'Apple Pay',
    localWallets: 'المحافظ المحلية',
    ownerBank: 'حساب تسوية المالك',
    ownerWallet: 'محفظة المالك',
    settleNote: 'تذهب الأموال مباشرة إلى حساب المالك المُعرّف في بيئة النشر.',
    openCheckout: 'فتح الدفع الآمن',
    opening: 'جارٍ فتح المسار',
    close: 'إغلاق',
    back: 'العودة إلى المسارات',
    networkLabel: 'الشبكة',
    amountLabel: 'المبلغ',
    addressLabel: 'عنوان الإيداع',
    copy: 'نسخ',
    copied: 'تم النسخ',
    minLabel: 'الحد الأدنى',
    expiryLabel: 'انتهاء العرض',
    txHashLabel: 'بصمة المعاملة',
    verify: 'التحقق من الإيداع',
    verifying: 'جارٍ فحص السلسلة',
    verified: 'تم التحقق من الإيداع وإضافته',
    pending: 'لم يتم التأكيد بعد. السلسلة لم تُنهِ هذه المعاملة.',
    failed: 'رفضت السلسلة المعاملة أو لم تجدها.',
    qrAlt: 'رمز QR للإيداع',
    configured: 'مُهيّأ',
    notConfigured: 'غير مُهيّأ',
    demo: 'عنوان تجريبي. استبدله قبل استقبال الأموال.',
    sandboxNote: 'لا يوجد مفتاح معالج، لذلك يعمل هذا المسار في وضع تجريبي موسوم بوضوح.',
    selectNetwork: 'اختر شبكة',
    amountDue: 'المبلغ المستحق',
    railMode: 'وضع المسار',
  },
  token: {
    eyebrow: 'أصل $MINEAI',
    title: 'توكن واحد خلف كل عقدة',
    lead: 'عرض ثابت، حرق انكماشي، ومجمعات ستاكينغ. مصدر عقد واحد يُترجم إلى BEP-20 وERC-20، لتتبع السيولة السلسلة التي يختارها السوق.',
    supply: 'العرض الثابت',
    burned: 'المحرق حتى الآن',
    staked: 'المُستثمر في المجمعات',
    holders: 'الحاملون',
    price: 'مؤشر المنفعة',
    contract: 'العقد',
    copyContract: 'نسخ العقد',
    auditNote: 'انشر عبر سكربت Hardhat، وتحقق من المصدر على السلسلة، ثم ابدأ السيولة على منصة لامركزية.',
    buy: 'تداول $MINEAI',
    addChain: 'أضف إلى المحفظة',
  },
  mining: {
    eyebrow: 'حوسبة بلا كهرباء',
    title: 'عدّن على سيليكون الآخرين',
    lead: 'تعمل عقدتك على سعة حوسبة خارجية. لا أجهزة، لا استهلاك كهرباء، لا ضجيج. فقط تدفق مكافآت يتراكم كل ثانية ويُسحب إلى محفظتك.',
    hashrate: 'معدل التجزئة الفعلي',
    mined: 'المُعدّن',
    pending: 'قابل للمطالبة',
    streak: 'سلسلة التعدين',
    claimStreak: 'المطالبة بالسلسلة اليومية',
    claimed: 'تمت المطالبة اليوم',
    tomorrow: 'عد غداً لمضاعفة المعامل.',
    multiplier: 'المعامل',
    vip: 'فئة VIP',
    stakeTitle: 'ستاك $MINEAI',
    stakeBody: 'ارفع معاملك وافتح فئات الحيتان. يمكنك فك الستاك في أي وقت.',
    stake: 'ستاك',
    unstake: 'فك الستاك',
    stakeAmount: 'المبلغ المطلوب ستاكه',
    withdrawTitle: 'سحب المكافآت',
    withdrawBody: 'تخرج المكافآت من المجمع إلى محفظتك. الحد الأدنى 25 $MINEAI.',
    wallet: 'عنوان المحفظة',
    withdraw: 'سحب',
    withdrawing: 'جارٍ البث',
    withdrawSuccess: 'تمت جدولة السحب إلى',
    min: 'الحد الأدنى',
    payoutsTitle: 'مدفوعات حية',
    payoutsBody: 'تسويات تغادر المجمع الآن.',
    zeroPower: 'كهرباء صفرية',
    zeroPowerBody: 'تُستأجر الحوسبة من سعة سحابية خارجية. لا تعدّن المنصة على جهازك ولا تحاسبك على الطاقة.',
    edgeTitle: 'كرون الحافة',
    edgeBody: 'كرون بلا خادم يراكم كل مركز نشط حتى وإغلاق هذه النافذة.',
    compliance: 'متوافق مع شروط السحابة',
    cron: 'آخر استحقاق',
    terminalTitle: 'طرفية الإصدار متعددة العملات',
    terminalBody:
      'ميزانية دولارية ثابتة واحدة تُقسَّم على سبعة مسارات. يحمل $MINEAI مكافأة 3×، فالحصة المتساوية تكسب ثلاثة أضعاف الميزانية — ولا يتغيّر إجمالي العائد أبداً.',
    allocation: 'التوزيع',
    allocationHint: 'تُوحَّد الحصص؛ لا يلزم أن تجمع 100.',
    saveAllocation: 'حفظ التوزيع',
    savingAllocation: 'جارٍ الحفظ…',
    coin: 'العملة',
    bonus: 'المكافأة',
    portfolio: 'قيمة المحفظة',
    perDay: 'الإصدار / يوم',
    allocationSaved: 'تم تحديث تقسيم الإصدار.',
    addressHint: 'عنوان السحب للسلسلة المختارة.',
  },
  markets: {
    eyebrow: 'محطة مؤسسية',
    title: 'الأسواق بلا ضجيج',
    lead: 'المؤشرات العالمية والسلع والعملات وأهم الأصول الرقمية في لوحة واحدة تتحدث باستمرار. و$MINEAI بجانبها بمؤشر منفعته الخاص.',
    live: 'حي',
    updated: 'آخر تحديث',
    indices: 'المؤشرات العالمية',
    forex: 'العملات',
    commodities: 'السلع',
    crypto: 'الأصول الرقمية',
    internal: 'مؤشر المنفعة',
    change: '24 ساعة',
    refresh: 'تحديث',
  },
  rewards: {
    eyebrow: 'محرك الاحتفاظ',
    title: 'كلما بقيت أطول، دفع لك النسيج أكثر',
    lead: 'تضاعف السلاسل اليومية عائدك، وتفتح فئات الحيتان معاملات أعلى، وكل مشغّل تجلبه يمنحك حصة دائمة من مكافآت تعدينه.',
    streakTitle: 'السلسلة اليومية',
    streakBody: 'طالب مرة كل يوم. كل يوم متتالٍ يضيف عشرة بالمئة حتى سقف 1.7x.',
    claim: 'مطالبة اليوم',
    claimed: 'تمت المطالبة',
    tomorrow: 'تُفتح المطالبة التالية عند 00:00 UTC.',
    multiplier: 'المعامل الحالي',
    vipTitle: 'فئات الحيتان',
    vipBody: 'تُقاس الفئات بمقدار $MINEAI المُستثمر ولا تنتهي ما دمت مستمراً في الستاك.',
    referralTitle: 'برنامج الإحالة',
    referralBody: 'شارك رمزك. تحصل على ثمانية بالمئة من مكافآت كل مشغّل مُحال، مدى الحياة.',
    yourCode: 'رمزك',
    copy: 'نسخ الرمز',
    copied: 'تم النسخ',
    invited: 'المشغلون المدعوون',
    earned: 'أرباح الإحالة',
    leaderboard: 'لوحة الصدارة العالمية',
    rank: 'الترتيب',
    operator: 'المشغّل',
    mined: 'المُعدّن',
    securityTitle: 'خزنة الحساب',
    securityBody: 'يُفرض التحقق بخطوتين على كل سحب بعد تفعيله. فعّله مرة واحفظ رموز الاسترداد دون اتصال.',
    securityEnroll: 'تفعيل تطبيق المصادقة',
    securitySecret: 'المفتاح السري',
    securityVerify: 'تحقق من الرمز',
    securityVerified: 'التحقق بخطوتين مُفعّل',
    securityCode: 'رمز من 6 أرقام',
  },
  video: {
    title: 'شاهد الشبكة تعمل',
    lead: 'شرح في تسعين ثانية، بصوت لغتك.',
    play: 'تشغيل الشرح',
    pause: 'إيقاف مؤقت',
    restart: 'إعادة',
    mute: 'كتم الصوت',
    unmute: 'تشغيل الصوت',
    sceneOf: 'مشهد',
    captionsOn: 'الترجمة مفعّلة',
    captionsOff: 'الترجمة متوقفة',
    captions: [
      {
        title: 'الشبكة تستيقظ',
        line: 'تستحوذ الوكلاء المقيمون على السعة الخاملة في السحب الخارجية. لا أجهزة في غرفتك ولا كهرباء في فاتورتك.',
      },
      {
        title: 'تستكشف',
        line: 'تُقرأ مكتبات الإعلانات وكتالوجات الموردين باستمرار، وتُستبعد المنتجات المشبعة قبل أن تكلفك شيئاً.',
      },
      {
        title: 'تسوّي',
        line: 'تُنفّذ الطلبات نفسها وتصل الأرباح إلى بنكك أو محفظتك، ولكل تحويل مرجعه الخاص.',
      },
      {
        title: 'تُثبت',
        line: 'كل إجراء يُسجّل في دفتر غير قابل للتعديل تقرأه بست لغات.',
      },
    ],
  },
};

const FR: EcosystemCopy = {
  nav: { mining: 'Minage cloud', markets: 'Marchés en direct', rewards: 'VIP & récompenses', news: 'Actualités mondiales', plans: 'Offres & tarifs', insights: 'Analyses marché', support: 'Assistance', startFree: 'Commencer gratuitement' },
  rails: {
    eyebrow: 'Rails de paiement',
    title: "Payez par carte, ou réglez on-chain sans frais de plateforme",
    lead: "Les cartes Visa, Mastercard et de débit sont réglées via Kashier et Paymob en dollars américains ou en livres égyptiennes. Le règlement direct USDT et BTC contourne entièrement le processeur.",
    cardTitle: 'Cartes mondiales et locales',
    cardBody:
      "Kashier et Paymob autorisent les cartes Visa, Mastercard et Meeza, puis règlent le compte bancaire du marchand par webhook. Le formulaire de carte est hébergé par le processeur — aucun numéro de carte ne transite par ce serveur.",
    currencies: 'Prix en USD $ · Débit en EGP ج.م au taux affiché',
    cryptoTitle: 'Crypto sans frontières',
    cryptoBody:
      "USDT et BTC sont réglés directement sur le portefeuille du propriétaire publié, sur le réseau choisi. Un dépôt n'est crédité qu'après vérification du hash auprès d'un RPC public.",
    feeBadge: '0 % de frais de plateforme',
    compliance:
      "Conditions, confidentialité, politique de remboursement et contact sont publiés pour l'examen du processeur.",
  },
  checkout: {
    title: 'Régler ce nœud',
    lead: "Deux rails, une seule destination. Les cartes et portefeuilles passent par le processeur fiat ; la crypto est réglée on-chain et vérifiée avant crédit.",
    fiatTitle: 'Rail fiat',
    fiatLead: 'Visa, Mastercard, débit, Apple Pay et portefeuilles locaux.',
    cryptoTitle: 'Rail on-chain',
    cryptoLead: "Sept réseaux, une adresse de dépôt par réseau, vérifiée par hash de transaction.",
    payWith: 'Payer avec',
    railKashier: 'Kashier',
    railPaymob: 'Paymob',
    railStripe: 'Stripe',
    cardNote: "Les données de carte ne touchent jamais ce serveur. Le processeur héberge la page de paiement.",
    applePay: 'Apple Pay',
    localWallets: 'Portefeuilles locaux',
    ownerBank: 'Compte de règlement du propriétaire',
    ownerWallet: 'Portefeuille du propriétaire',
    settleNote: "Les fonds vont directement au compte propriétaire configuré dans l'environnement de déploiement.",
    openCheckout: 'Ouvrir le paiement sécurisé',
    opening: 'Ouverture du rail',
    close: 'Fermer',
    back: 'Retour aux rails',
    networkLabel: 'Réseau',
    amountLabel: 'Montant',
    addressLabel: 'Adresse de dépôt',
    copy: 'Copier',
    copied: 'Copié',
    minLabel: 'Minimum',
    expiryLabel: 'Devis expire',
    txHashLabel: 'Hash de transaction',
    verify: 'Vérifier le dépôt',
    verifying: 'Vérification de la chaîne',
    verified: 'Dépôt vérifié et crédité',
    pending: "Pas encore confirmé. La chaîne n'a pas finalisé cette transaction.",
    failed: "La chaîne a rejeté cette transaction ou ne l'a pas trouvée.",
    qrAlt: 'QR code de dépôt',
    configured: 'Configuré',
    notConfigured: 'Non configuré',
    demo: 'Adresse de démonstration. À remplacer avant de recevoir des fonds.',
    sandboxNote: "Aucune clé processeur n'est présente : ce rail tourne en mode sandbox clairement signalé.",
    selectNetwork: 'Choisir un réseau',
    amountDue: 'Montant dû',
    railMode: 'Mode du rail',
  },
  token: {
    eyebrow: "L'actif $MINEAI",
    title: 'Un token derrière chaque shard',
    lead: "Offre fixe, burn déflationniste, pools de staking. Une seule source compile en BEP-20 et ERC-20, la liquidité suit la chaîne choisie par le marché.",
    supply: 'Offre fixe',
    burned: 'Brûlé à ce jour',
    staked: 'Staké en pools',
    holders: 'Détenteurs',
    price: 'Indice utilitaire',
    contract: 'Contrat',
    copyContract: 'Copier le contrat',
    auditNote: "Déployez avec le script Hardhat, vérifiez la source on-chain, puis amorcez la liquidité sur un DEX.",
    buy: 'Trader $MINEAI',
    addChain: 'Ajouter au wallet',
  },
  mining: {
    eyebrow: 'Calcul sans électricité',
    title: "Minez sur le silicium des autres",
    lead: "Votre shard tourne sur une capacité edge externe. Aucun matériel, aucune consommation, aucun bruit. Juste un flux de récompenses qui s'accumule chaque seconde et se retire sur votre wallet.",
    hashrate: 'Hashrate effectif',
    mined: 'Miné',
    pending: 'Réclamable',
    streak: 'Série de minage',
    claimStreak: 'Réclamer la série du jour',
    claimed: 'Série réclamée aujourd’hui',
    tomorrow: 'Revenez demain pour prolonger le multiplicateur.',
    multiplier: 'Multiplicateur',
    vip: 'Palier VIP',
    stakeTitle: 'Staker $MINEAI',
    stakeBody: 'Stakez pour augmenter votre multiplicateur et débloquer les paliers baleine. Retrait libre à tout moment.',
    stake: 'Staker',
    unstake: 'Déstaker',
    stakeAmount: 'Montant à staker',
    withdrawTitle: 'Retirer les récompenses',
    withdrawBody: 'Les récompenses quittent le pool vers votre wallet. Minimum 25 $MINEAI.',
    wallet: 'Adresse du wallet',
    withdraw: 'Retirer',
    withdrawing: 'Diffusion',
    withdrawSuccess: 'Retrait mis en file vers',
    min: 'Minimum',
    payoutsTitle: 'Paiements en direct',
    payoutsBody: 'Règlements qui quittent le pool en ce moment.',
    zeroPower: 'Zéro électricité',
    zeroPowerBody: "Le calcul est loué à une capacité cloud externe. La plateforme ne mine jamais sur votre appareil et ne facture aucune énergie.",
    edgeTitle: 'Cron edge',
    edgeBody: 'Un cron serverless accumule chaque position active, même onglet fermé.',
    compliance: 'Conforme aux conditions cloud',
    cron: 'Dernière accumulation',
    terminalTitle: "Terminal d'émission multi-coin",
    terminalBody:
      'Un budget dollar fixe, réparti sur sept rails. $MINEAI porte un bonus de 3× : une part égale gagne trois fois le budget, sans jamais augmenter le rendement total.',
    allocation: 'Allocation',
    allocationHint: 'Les parts sont normalisées ; elles n’ont pas besoin de totaliser 100.',
    saveAllocation: "Enregistrer l'allocation",
    savingAllocation: 'Enregistrement…',
    coin: 'Jeton',
    bonus: 'Bonus',
    portfolio: 'Valeur du portefeuille',
    perDay: 'Émission / jour',
    allocationSaved: 'Répartition de l’émission mise à jour.',
    addressHint: 'Adresse de retrait pour la chaîne sélectionnée.',
  },
  markets: {
    eyebrow: 'Terminal institutionnel',
    title: 'Les marchés, sans le bruit',
    lead: 'Indices mondiaux, matières premières, devises et principaux actifs numériques sur un seul tableau, rafraîchi en continu. $MINEAI y figure avec son indice utilitaire.',
    live: 'En direct',
    updated: 'Mis à jour',
    indices: 'Indices mondiaux',
    forex: 'Devises',
    commodities: 'Matières premières',
    crypto: 'Actifs numériques',
    internal: 'Indice utilitaire',
    change: '24 h',
    refresh: 'Rafraîchir',
  },
  rewards: {
    eyebrow: "Moteur de rétention",
    title: 'Plus vous restez, plus le mesh paie',
    lead: "Les séries quotidiennes composent votre rendement, les paliers baleine ouvrent de meilleurs multiplicateurs, et chaque opérateur parrainé vous verse une part à vie.",
    streakTitle: 'Série quotidienne',
    streakBody: 'Réclamez une fois par jour. Chaque jour consécutif ajoute dix pour cent, plafonné à 1,7x.',
    claim: "Réclamer aujourd'hui",
    claimed: 'Réclamé',
    tomorrow: 'La prochaine réclamation ouvre à 00:00 UTC.',
    multiplier: 'Multiplicateur actuel',
    vipTitle: 'Paliers baleine',
    vipBody: "Les paliers se mesurent sur le $MINEAI staké et n'expirent pas tant que vous restez staké.",
    referralTitle: 'Programme de parrainage',
    referralBody: 'Partagez votre code. Vous gagnez huit pour cent des récompenses de chaque filleul, à vie.',
    yourCode: 'Votre code',
    copy: 'Copier le code',
    copied: 'Copié',
    invited: 'Opérateurs invités',
    earned: 'Gains de parrainage',
    leaderboard: 'Classement mondial',
    rank: 'Rang',
    operator: 'Opérateur',
    mined: 'Miné',
    securityTitle: 'Coffre du compte',
    securityBody: "La double authentification est exigée à chaque retrait dès que vous l'activez. Activez-la une fois et gardez les codes de secours hors ligne.",
    securityEnroll: "Activer l'authentificateur",
    securitySecret: 'Clé secrète',
    securityVerify: 'Vérifier le code',
    securityVerified: 'Double authentification active',
    securityCode: 'Code à 6 chiffres',
  },
  video: {
    title: 'Voyez le mesh travailler',
    lead: 'Une explication de quatre-vingt-dix secondes, narrée dans votre langue.',
    play: "Lancer l'explication",
    pause: 'Pause',
    restart: 'Recommencer',
    mute: 'Couper la narration',
    unmute: 'Activer la narration',
    sceneOf: 'Scène',
    captionsOn: 'Sous-titres activés',
    captionsOff: 'Sous-titres désactivés',
    captions: [
      {
        title: 'Le mesh se réveille',
        line: "Les agents résidents réquisitionnent la capacité inactive des clouds externes. Aucun matériel chez vous, aucune énergie facturée.",
      },
      {
        title: 'Il explore',
        line: "Les bibliothèques publicitaires et catalogues fournisseurs sont lus en continu. Les produits saturés sont écartés avant de coûter un centime.",
      },
      {
        title: 'Il règle',
        line: "Les commandes s'exécutent seules et les gains arrivent sur votre banque ou votre wallet, chaque transfert portant sa référence.",
      },
      {
        title: 'Il prouve',
        line: 'Chaque action atterrit dans un registre immuable, lisible en six langues.',
      },
    ],
  },
};

const ES: EcosystemCopy = {
  nav: { mining: 'Minería cloud', markets: 'Mercados en vivo', rewards: 'VIP y recompensas', news: 'Noticias globales', plans: 'Planes y precios', insights: 'Análisis de mercado', support: 'Soporte', startFree: 'Empezar gratis' },
  rails: {
    eyebrow: 'Canales de pago',
    title: 'Paga con tarjeta o liquida on-chain sin comisión de plataforma',
    lead: 'Las tarjetas Visa, Mastercard y de débito se liquidan con Kashier y Paymob en dólares estadounidenses o libras egipcias. La liquidación directa en USDT y BTC evita por completo al procesador.',
    cardTitle: 'Tarjetas globales y locales',
    cardBody:
      'Kashier y Paymob autorizan tarjetas Visa, Mastercard y Meeza, y liquidan a la cuenta bancaria del comercio por webhook. El formulario de tarjeta lo aloja el procesador: ningún número de tarjeta pasa por este servidor.',
    currencies: 'Precio en USD $ · Cargo en EGP ج.م al tipo mostrado',
    cryptoTitle: 'Cripto sin fronteras',
    cryptoBody:
      'USDT y BTC se liquidan directamente a la cartera del propietario publicada, en la red que elijas. Un depósito se acredita solo tras verificar el hash contra un RPC público.',
    feeBadge: '0% de comisión de plataforma',
    compliance:
      'Los términos, la privacidad, la política de reembolso y el contacto están publicados para la revisión del procesador.',
  },
  checkout: {
    title: 'Liquidar este nodo',
    lead: 'Dos raíles, un destino. Las tarjetas y carteras pasan por el procesador fiat; la cripto se liquida on-chain y se verifica antes de abonar.',
    fiatTitle: 'Raíl fiat',
    fiatLead: 'Visa, Mastercard, débito, Apple Pay y carteras locales.',
    cryptoTitle: 'Raíl on-chain',
    cryptoLead: 'Siete redes, una dirección de depósito por red, verificada por hash de transacción.',
    payWith: 'Pagar con',
    railKashier: 'Kashier',
    railPaymob: 'Paymob',
    railStripe: 'Stripe',
    cardNote: 'Los datos de la tarjeta nunca tocan este servidor. El procesador aloja la página de pago.',
    applePay: 'Apple Pay',
    localWallets: 'Carteras locales',
    ownerBank: 'Cuenta de liquidación del propietario',
    ownerWallet: 'Cartera del propietario',
    settleNote: 'Los fondos van directos a la cuenta del propietario configurada en el entorno de despliegue.',
    openCheckout: 'Abrir pago seguro',
    opening: 'Abriendo el raíl',
    close: 'Cerrar',
    back: 'Volver a los raíles',
    networkLabel: 'Red',
    amountLabel: 'Importe',
    addressLabel: 'Dirección de depósito',
    copy: 'Copiar',
    copied: 'Copiado',
    minLabel: 'Mínimo',
    expiryLabel: 'La cotización expira',
    txHashLabel: 'Hash de transacción',
    verify: 'Verificar depósito',
    verifying: 'Comprobando la cadena',
    verified: 'Depósito verificado y abonado',
    pending: 'Aún sin confirmar. La cadena no ha finalizado esta transacción.',
    failed: 'La cadena rechazó o no encontró esa transacción.',
    qrAlt: 'Código QR de depósito',
    configured: 'Configurado',
    notConfigured: 'No configurado',
    demo: 'Dirección de demostración. Sustitúyela antes de aceptar fondos.',
    sandboxNote: 'No hay clave de procesador: este raíl funciona en modo sandbox claramente etiquetado.',
    selectNetwork: 'Elige una red',
    amountDue: 'Importe a pagar',
    railMode: 'Modo del raíl',
  },
  token: {
    eyebrow: 'El activo $MINEAI',
    title: 'Un token detrás de cada shard',
    lead: 'Suministro fijo, quema deflacionaria y pools de staking. Una sola fuente compila a BEP-20 y ERC-20, para que la liquidez siga la cadena que elija el mercado.',
    supply: 'Suministro fijo',
    burned: 'Quemado hasta hoy',
    staked: 'En staking',
    holders: 'Tenedores',
    price: 'Índice de utilidad',
    contract: 'Contrato',
    copyContract: 'Copiar contrato',
    auditNote: 'Despliega con el script de Hardhat, verifica el código on-chain y luego aporta liquidez en un DEX.',
    buy: 'Operar $MINEAI',
    addChain: 'Añadir a la cartera',
  },
  mining: {
    eyebrow: 'Cómputo sin electricidad',
    title: 'Mina en el silicio de otros',
    lead: 'Tu shard corre sobre capacidad edge externa. Sin hardware, sin consumo, sin ruido. Solo un flujo de recompensas que se acumula cada segundo y se retira a tu cartera.',
    hashrate: 'Hashrate efectivo',
    mined: 'Minado',
    pending: 'Reclamable',
    streak: 'Racha de minería',
    claimStreak: 'Reclamar racha diaria',
    claimed: 'Racha reclamada hoy',
    tomorrow: 'Vuelve mañana para ampliar el multiplicador.',
    multiplier: 'Multiplicador',
    vip: 'Nivel VIP',
    stakeTitle: 'Stakear $MINEAI',
    stakeBody: 'Stakea para elevar tu multiplicador y abrir niveles ballena. Retira cuando quieras.',
    stake: 'Stakear',
    unstake: 'Desstakear',
    stakeAmount: 'Importe a stakear',
    withdrawTitle: 'Retirar recompensas',
    withdrawBody: 'Las recompensas salen del pool a tu cartera. Mínimo 25 $MINEAI.',
    wallet: 'Dirección de cartera',
    withdraw: 'Retirar',
    withdrawing: 'Difundiendo',
    withdrawSuccess: 'Retiro en cola hacia',
    min: 'Mínimo',
    payoutsTitle: 'Pagos en vivo',
    payoutsBody: 'Liquidaciones saliendo del pool ahora mismo.',
    zeroPower: 'Cero electricidad',
    zeroPowerBody: 'El cómputo se alquila a capacidad cloud externa. La plataforma nunca mina en tu dispositivo ni te cobra energía.',
    edgeTitle: 'Cron edge',
    edgeBody: 'Un cron serverless acumula cada posición activa, incluso con la pestaña cerrada.',
    compliance: 'Conforme a términos cloud',
    cron: 'Última acumulación',
    terminalTitle: 'Terminal de emisión multicripto',
    terminalBody:
      'Un presupuesto fijo en dólares, repartido entre siete canales. $MINEAI lleva un bono de 3×: una cuota igual gana tres veces el presupuesto sin aumentar el rendimiento total.',
    allocation: 'Asignación',
    allocationHint: 'Las cuotas se normalizan; no necesitan sumar 100.',
    saveAllocation: 'Guardar asignación',
    savingAllocation: 'Guardando…',
    coin: 'Moneda',
    bonus: 'Bono',
    portfolio: 'Valor de la cartera',
    perDay: 'Emisión / día',
    allocationSaved: 'Reparto de emisión actualizado.',
    addressHint: 'Dirección de retiro para la cadena seleccionada.',
  },
  markets: {
    eyebrow: 'Terminal institucional',
    title: 'Mercados, sin ruido',
    lead: 'Índices globales, materias primas, divisas y los principales activos digitales en un solo tablero, actualizado sin pausa. $MINEAI aparece con su propio índice de utilidad.',
    live: 'En vivo',
    updated: 'Actualizado',
    indices: 'Índices globales',
    forex: 'Divisas',
    commodities: 'Materias primas',
    crypto: 'Activos digitales',
    internal: 'Índice de utilidad',
    change: '24 h',
    refresh: 'Actualizar',
  },
  rewards: {
    eyebrow: 'Motor de retención',
    title: 'Cuanto más te quedas, más paga la malla',
    lead: 'Las rachas diarias componen tu rendimiento, los niveles ballena abren mejores multiplicadores y cada operador que traes te da una parte de por vida.',
    streakTitle: 'Racha diaria',
    streakBody: 'Reclama una vez al día. Cada día consecutivo suma un diez por ciento, con tope de 1,7x.',
    claim: 'Reclamar hoy',
    claimed: 'Reclamado',
    tomorrow: 'La próxima reclamación abre a las 00:00 UTC.',
    multiplier: 'Multiplicador actual',
    vipTitle: 'Niveles ballena',
    vipBody: 'Los niveles se miden sobre $MINEAI stakeado y no caducan mientras sigas stakeando.',
    referralTitle: 'Programa de referidos',
    referralBody: 'Comparte tu código. Ganas el ocho por ciento de las recompensas de cada referido, de por vida.',
    yourCode: 'Tu código',
    copy: 'Copiar código',
    copied: 'Copiado',
    invited: 'Operadores invitados',
    earned: 'Ganancias por referidos',
    leaderboard: 'Clasificación global',
    rank: 'Puesto',
    operator: 'Operador',
    mined: 'Minado',
    securityTitle: 'Bóveda de la cuenta',
    securityBody: 'La doble autenticación se exige en cada retiro una vez que la activas. Actívala una vez y guarda los códigos offline.',
    securityEnroll: 'Activar autenticador',
    securitySecret: 'Clave secreta',
    securityVerify: 'Verificar código',
    securityVerified: 'Doble autenticación activa',
    securityCode: 'Código de 6 dígitos',
  },
  video: {
    title: 'Mira la malla trabajar',
    lead: 'Una explicación de noventa segundos, narrada en tu idioma.',
    play: 'Reproducir explicación',
    pause: 'Pausa',
    restart: 'Reiniciar',
    mute: 'Silenciar narración',
    unmute: 'Activar narración',
    sceneOf: 'Escena',
    captionsOn: 'Subtítulos activados',
    captionsOff: 'Subtítulos desactivados',
    captions: [
      {
        title: 'La malla despierta',
        line: 'Los agentes residentes reclaman capacidad inactiva en nubes externas. Sin hardware en tu casa, sin energía en tu factura.',
      },
      {
        title: 'Explora',
        line: 'Las bibliotecas de anuncios y catálogos de proveedores se leen sin parar. Los productos saturados se descartan antes de costarte un céntimo.',
      },
      {
        title: 'Liquida',
        line: 'Los pedidos se ejecutan solos y las ganancias llegan a tu banco o cartera, cada transferencia con su referencia.',
      },
      {
        title: 'Demuestra',
        line: 'Cada acción queda en un registro inmutable que puedes leer en seis idiomas.',
      },
    ],
  },
};

const ZH: EcosystemCopy = {
  nav: { mining: '云端挖矿', markets: '实时行情', rewards: 'VIP 与奖励', news: '全球新闻', plans: '套餐与价格', insights: '市场洞察', support: '客服支持', startFree: '免费开始挖矿' },
  rails: {
    eyebrow: '支付通道',
    title: '银行卡支付，或链上结算零平台费',
    lead: 'Visa、Mastercard 与借记卡经 Kashier 和 Paymob 以美元或埃及镑结算；USDT 与 BTC 直接结算，完全绕过支付机构。',
    cardTitle: '全球与本地银行卡',
    cardBody:
      'Kashier 与 Paymob 受理 Visa、Mastercard 与 Meeza 借记卡，并通过 webhook 结算至商户银行账户。卡片表单由支付机构托管——本服务器不接触任何卡号。',
    currencies: '以美元 $ 标价 · 按显示汇率以埃及镑 ج.م 扣款',
    cryptoTitle: '无国界加密支付',
    cryptoBody:
      'USDT 与 BTC 直接结算至所公布的所有者钱包，网络由你选择。仅在通过公共 RPC 验证交易哈希后才会入账。',
    feeBadge: '0% 平台费',
    compliance: '服务条款、隐私政策、退款政策与联系方式已公布，供支付机构审核。',
  },
  checkout: {
    title: '结算此节点',
    lead: '两条通道，一个去向。银行卡与钱包经法币通道结算；加密货币在链上结算，验证后才计入余额。',
    fiatTitle: '法币通道',
    fiatLead: 'Visa、Mastercard、借记卡、Apple Pay 与本地钱包。',
    cryptoTitle: '链上通道',
    cryptoLead: '七条网络，每条网络一个充值地址，通过交易哈希验证。',
    payWith: '支付方式',
    railKashier: 'Kashier',
    railPaymob: 'Paymob',
    railStripe: 'Stripe',
    cardNote: '卡片数据不会经过本服务器，支付页面由处理商托管。',
    applePay: 'Apple Pay',
    localWallets: '本地钱包',
    ownerBank: '所有者结算账户',
    ownerWallet: '所有者钱包',
    settleNote: '资金直接进入部署环境中配置的所有者账户。',
    openCheckout: '打开安全结算',
    opening: '正在打开通道',
    close: '关闭',
    back: '返回通道选择',
    networkLabel: '网络',
    amountLabel: '金额',
    addressLabel: '充值地址',
    copy: '复制',
    copied: '已复制',
    minLabel: '最低充值',
    expiryLabel: '报价到期',
    txHashLabel: '交易哈希',
    verify: '验证充值',
    verifying: '正在查询链上状态',
    verified: '充值已验证并计入',
    pending: '尚未确认，链上还未最终确定该交易。',
    failed: '链上拒绝了该交易或未找到。',
    qrAlt: '充值二维码',
    configured: '已配置',
    notConfigured: '未配置',
    demo: '演示地址，接收资金前请替换。',
    sandboxNote: '未检测到处理商密钥，此通道以明确标注的沙箱模式运行。',
    selectNetwork: '选择网络',
    amountDue: '应付金额',
    railMode: '通道模式',
  },
  token: {
    eyebrow: '$MINEAI 资产',
    title: '每个节点背后的同一枚代币',
    lead: '固定总量、通缩销毁、质押奖池。同一份合约源码可编译为 BEP-20 与 ERC-20，流动性可跟随市场选择的链。',
    supply: '固定总量',
    burned: '累计销毁',
    staked: '质押总量',
    holders: '持有人',
    price: '效用指数',
    contract: '合约地址',
    copyContract: '复制合约',
    auditNote: '使用 Hardhat 脚本部署，在链上验证源码，然后在 DEX 注入流动性。',
    buy: '交易 $MINEAI',
    addChain: '添加到钱包',
  },
  mining: {
    eyebrow: '零电费算力',
    title: '在别人的芯片上挖矿',
    lead: '你的分片运行在外部边缘算力上。无需硬件、不耗电、无噪音。奖励每秒累积，并可直接提到自己的钱包。',
    hashrate: '有效算力',
    mined: '已产出',
    pending: '可领取',
    streak: '挖矿连续天数',
    claimStreak: '领取每日连续奖励',
    claimed: '今日已领取',
    tomorrow: '明天再来可继续提高倍率。',
    multiplier: '倍率',
    vip: 'VIP 等级',
    stakeTitle: '质押 $MINEAI',
    stakeBody: '质押可提升倍率并解锁巨鲸等级，随时可解除质押。',
    stake: '质押',
    unstake: '解除质押',
    stakeAmount: '质押数量',
    withdrawTitle: '提取奖励',
    withdrawBody: '奖励从奖池转入你的钱包，最低 25 $MINEAI。',
    wallet: '钱包地址',
    withdraw: '提取',
    withdrawing: '正在广播',
    withdrawSuccess: '提取已排队至',
    min: '最低',
    payoutsTitle: '实时支付',
    payoutsBody: '正在离开奖池的结算。',
    zeroPower: '零电费',
    zeroPowerBody: '算力租自外部云容量。平台绝不在你的设备上挖矿，也不收取任何电费。',
    edgeTitle: '边缘定时任务',
    edgeBody: '无服务器定时任务为每个活跃仓位累计收益，即使关闭页面也不停。',
    compliance: '符合云服务条款',
    cron: '最近累计',
    terminalTitle: '多币种发行终端',
    terminalBody:
      '固定的美元发行预算，按七条通道拆分。$MINEAI 享 3× 加成，同等份额可获得三倍预算——总收益始终不变。',
    allocation: '分配',
    allocationHint: '份额会自动归一化，无需合计为 100。',
    saveAllocation: '保存分配',
    savingAllocation: '保存中…',
    coin: '币种',
    bonus: '加成',
    portfolio: '持仓价值',
    perDay: '每日发行',
    allocationSaved: '发行分配已更新。',
    addressHint: '所选链的提现地址。',
  },
  markets: {
    eyebrow: '机构级终端',
    title: '没有噪音的市场',
    lead: '全球指数、大宗商品、外汇与主流数字资产汇聚一屏，持续刷新。$MINEAI 以自身效用指数并列其中。',
    live: '实时',
    updated: '更新于',
    indices: '全球指数',
    forex: '外汇',
    commodities: '大宗商品',
    crypto: '数字资产',
    internal: '效用指数',
    change: '24 小时',
    refresh: '刷新',
  },
  rewards: {
    eyebrow: '留存引擎',
    title: '停留越久，网络支付越多',
    lead: '每日连续奖励叠加收益，巨鲸等级解锁更高倍率，每带来一位运营者，你都能终身获得其挖矿奖励的一部分。',
    streakTitle: '每日连续奖励',
    streakBody: '每天领取一次。每连续一天增加百分之十，最高 1.7 倍。',
    claim: '领取今日奖励',
    claimed: '已领取',
    tomorrow: '下一次领取将在 UTC 00:00 开放。',
    multiplier: '当前倍率',
    vipTitle: '巨鲸等级',
    vipBody: '等级按质押的 $MINEAI 计算，只要保持质押便不会失效。',
    referralTitle: '推荐计划',
    referralBody: '分享你的推荐码。每位被推荐运营者挖矿奖励的百分之八，终身归你。',
    yourCode: '你的推荐码',
    copy: '复制推荐码',
    copied: '已复制',
    invited: '已邀请运营者',
    earned: '推荐收益',
    leaderboard: '全球排行榜',
    rank: '排名',
    operator: '运营者',
    mined: '已产出',
    securityTitle: '账户保险库',
    securityBody: '启用后，每次提现都会强制双因素验证。启用一次，并将恢复码离线保存。',
    securityEnroll: '绑定验证器',
    securitySecret: '密钥',
    securityVerify: '验证代码',
    securityVerified: '双因素已启用',
    securityCode: '6 位验证码',
  },
  video: {
    title: '看网络如何运转',
    lead: '九十秒讲解，以你的语言旁白。',
    play: '播放讲解',
    pause: '暂停',
    restart: '重新播放',
    mute: '关闭旁白',
    unmute: '开启旁白',
    sceneOf: '场景',
    captionsOn: '字幕已开启',
    captionsOff: '字幕已关闭',
    captions: [
      {
        title: '网络苏醒',
        line: '常驻智能体接管外部云的闲置算力。你的房间没有硬件，账单上没有电费。',
      },
      {
        title: '它去侦察',
        line: '持续读取广告库与供应商目录，饱和产品在被你花钱之前就被剔除。',
      },
      {
        title: '它去结算',
        line: '订单自动履约，收益直达你的银行或钱包，每笔转账都有独立凭证。',
      },
      {
        title: '它去证明',
        line: '每个动作都写入只可追加的账本，六种语言随时可读。',
      },
    ],
  },
};

const HI: EcosystemCopy = {
  nav: { mining: 'क्लाउड माइनिंग', markets: 'लाइव बाज़ार', rewards: 'VIP और इनाम', news: 'वैश्विक समाचार', plans: 'प्लान और कीमतें', insights: 'बाज़ार अंतर्दृष्टि', support: 'सहायता', startFree: 'मुफ़्त माइनिंग शुरू करें' },
  rails: {
    eyebrow: 'भुगतान रेल',
    title: 'कार्ड से भुगतान करें, या शून्य प्लेटफ़ॉर्म शुल्क पर ऑन-चेन निपटान',
    lead: 'Visa, Mastercard और डेबिट कार्ड Kashier और Paymob के माध्यम से अमेरिकी डॉलर या मिस्री पाउंड में निपटते हैं। सीधा USDT और BTC निपटान प्रोसेसर को पूरी तरह छोड़ देता है।',
    cardTitle: 'वैश्विक और स्थानीय कार्ड',
    cardBody:
      'Kashier और Paymob Visa, Mastercard और Meeza डेबिट कार्ड अधिकृत करते हैं, फिर webhook से व्यापारी के बैंक खाते में निपटान करते हैं। कार्ड फ़ॉर्म प्रोसेसर होस्ट करता है — कोई कार्ड नंबर इस सर्वर से नहीं गुज़रता।',
    currencies: 'कीमत USD $ में · दिखाई गई दर पर EGP ج.م में शुल्क',
    cryptoTitle: 'सीमा-रहित क्रिप्टो',
    cryptoBody:
      'USDT और BTC सीधे प्रकाशित ओनर वॉलेट में, आपके चुने नेटवर्क पर निपटते हैं। लेन-देन हैश सार्वजनिक RPC से सत्यापित होने के बाद ही जमा श्रेय पाता है।',
    feeBadge: '0% प्लेटफ़ॉर्म शुल्क',
    compliance: 'शर्तें, गोपनीयता, धनवापसी नीति और संपर्क प्रोसेसर समीक्षा के लिए प्रकाशित हैं।',
  },
  checkout: {
    title: 'इस नोड का भुगतान करें',
    lead: 'दो रेल, एक गंतव्य। कार्ड और वॉलेट फिएट प्रोसेसर से निपटते हैं; क्रिप्टो ऑन-चेन निपटता है और क्रेडिट से पहले सत्यापित होता है।',
    fiatTitle: 'फिएट रेल',
    fiatLead: 'वीज़ा, मास्टरकार्ड, डेबिट, Apple Pay और स्थानीय वॉलेट।',
    cryptoTitle: 'ऑन-चेन रेल',
    cryptoLead: 'सात नेटवर्क, हर नेटवर्क के लिए एक जमा पता, ट्रांज़ैक्शन हैश से सत्यापित।',
    payWith: 'भुगतान करें',
    railKashier: 'Kashier',
    railPaymob: 'Paymob',
    railStripe: 'Stripe',
    cardNote: 'कार्ड डेटा इस सर्वर तक कभी नहीं पहुँचता। भुगतान पृष्ठ प्रोसेसर होस्ट करता है।',
    applePay: 'Apple Pay',
    localWallets: 'स्थानीय वॉलेट',
    ownerBank: 'मालिक का सेटलमेंट खाता',
    ownerWallet: 'मालिक का वॉलेट',
    settleNote: 'धन सीधे डिप्लॉयमेंट एनवायरनमेंट में कॉन्फ़िगर मालिक खाते में जाता है।',
    openCheckout: 'सुरक्षित चेकआउट खोलें',
    opening: 'रेल खुल रही है',
    close: 'बंद करें',
    back: 'रेल पर लौटें',
    networkLabel: 'नेटवर्क',
    amountLabel: 'राशि',
    addressLabel: 'जमा पता',
    copy: 'कॉपी',
    copied: 'कॉपी हुआ',
    minLabel: 'न्यूनतम',
    expiryLabel: 'कोट समाप्त',
    txHashLabel: 'ट्रांज़ैक्शन हैश',
    verify: 'जमा सत्यापित करें',
    verifying: 'चेन जाँची जा रही है',
    verified: 'जमा सत्यापित और जमा हुआ',
    pending: 'अभी पुष्टि नहीं हुई। चेन ने इस लेनदेन को अंतिम रूप नहीं दिया।',
    failed: 'चेन ने लेनदेन अस्वीकार किया या नहीं पाया।',
    qrAlt: 'जमा QR कोड',
    configured: 'कॉन्फ़िगर',
    notConfigured: 'कॉन्फ़िगर नहीं',
    demo: 'डेमो पता। धन लेने से पहले बदलें।',
    sandboxNote: 'प्रोसेसर कुंजी नहीं है, इसलिए यह रेल स्पष्ट रूप से चिह्नित सैंडबॉक्स मोड में है।',
    selectNetwork: 'नेटवर्क चुनें',
    amountDue: 'देय राशि',
    railMode: 'रेल मोड',
  },
  token: {
    eyebrow: '$MINEAI परिसंपत्ति',
    title: 'हर शार्ड के पीछे एक टोकन',
    lead: 'स्थिर आपूर्ति, अपस्फीतिकारी बर्न, स्टेकिंग पूल। एक ही स्रोत BEP-20 और ERC-20 में संकलित होता है, ताकि तरलता बाज़ार की चुनी चेन पर जा सके।',
    supply: 'स्थिर आपूर्ति',
    burned: 'अब तक बर्न',
    staked: 'स्टेक में',
    holders: 'धारक',
    price: 'उपयोगिता सूचकांक',
    contract: 'कॉन्ट्रैक्ट',
    copyContract: 'कॉन्ट्रैक्ट कॉपी करें',
    auditNote: 'Hardhat स्क्रिप्ट से डिप्लॉय करें, ऑन-चेन स्रोत सत्यापित करें, फिर DEX पर तरलता डालें।',
    buy: '$MINEAI ट्रेड करें',
    addChain: 'वॉलेट में जोड़ें',
  },
  mining: {
    eyebrow: 'शून्य बिजली की कंप्यूटिंग',
    title: 'दूसरों के सिलिकॉन पर माइन करें',
    lead: 'आपका शार्ड बाहरी एज क्षमता पर चलता है। कोई हार्डवेयर नहीं, कोई बिजली खपत नहीं, कोई शोर नहीं। बस हर सेकंड बढ़ता इनाम, जो आपके वॉलेट में निकलता है।',
    hashrate: 'प्रभावी हैशरेट',
    mined: 'माइन हुआ',
    pending: 'दावा योग्य',
    streak: 'माइनिंग स्ट्रीक',
    claimStreak: 'दैनिक स्ट्रीक का दावा करें',
    claimed: 'आज का स्ट्रीक दावा हुआ',
    tomorrow: 'गुणक बढ़ाने के लिए कल लौटें।',
    multiplier: 'गुणक',
    vip: 'VIP स्तर',
    stakeTitle: '$MINEAI स्टेक करें',
    stakeBody: 'गुणक बढ़ाने और व्हेल स्तर खोलने के लिए स्टेक करें। कभी भी अनस्टेक करें।',
    stake: 'स्टेक',
    unstake: 'अनस्टेक',
    stakeAmount: 'स्टेक राशि',
    withdrawTitle: 'इनाम निकालें',
    withdrawBody: 'इनाम पूल से आपके वॉलेट में जाते हैं। न्यूनतम 25 $MINEAI।',
    wallet: 'वॉलेट पता',
    withdraw: 'निकालें',
    withdrawing: 'ब्रॉडकास्ट हो रहा है',
    withdrawSuccess: 'निकासी कतार में',
    min: 'न्यूनतम',
    payoutsTitle: 'लाइव भुगतान',
    payoutsBody: 'अभी पूल से निकल रहे सेटलमेंट।',
    zeroPower: 'शून्य बिजली',
    zeroPowerBody: 'कंप्यूट बाहरी क्लाउड क्षमता से किराए पर लिया जाता है। प्लेटफ़ॉर्म आपके डिवाइस पर कभी माइन नहीं करता और बिजली का बिल नहीं लेता।',
    edgeTitle: 'एज क्रॉन',
    edgeBody: 'सर्वरलेस क्रॉन हर सक्रिय स्थिति में इनाम जोड़ता है, टैब बंद होने पर भी।',
    compliance: 'क्लाउड शर्तों के अनुरूप',
    cron: 'अंतिम संचय',
    terminalTitle: 'मल्टी-कॉइन उत्सर्जन टर्मिनल',
    terminalBody:
      'एक निश्चित डॉलर बजट, सात रेलों में विभाजित। $MINEAI पर 3× बोनस है, इसलिए समान हिस्सा तीन गुना बजट कमाता है — कुल प्रतिफल कभी नहीं बढ़ता।',
    allocation: 'आवंटन',
    allocationHint: 'हिस्से सामान्यीकृत होते हैं; उनका योग 100 होना आवश्यक नहीं।',
    saveAllocation: 'आवंटन सहेजें',
    savingAllocation: 'सहेजा जा रहा है…',
    coin: 'कॉइन',
    bonus: 'बोनस',
    portfolio: 'पोर्टफ़ोलियो मूल्य',
    perDay: 'उत्सर्जन / दिन',
    allocationSaved: 'उत्सर्जन विभाजन अद्यतन हुआ।',
    addressHint: 'चयनित चेन के लिए निकासी पता।',
  },
  markets: {
    eyebrow: 'संस्थागत टर्मिनल',
    title: 'बाज़ार, शोर के बिना',
    lead: 'वैश्विक सूचकांक, कमोडिटी, मुद्राएँ और शीर्ष डिजिटल संपत्तियाँ एक ही बोर्ड पर, लगातार ताज़ा। $MINEAI अपने उपयोगिता सूचकांक के साथ इनके साथ है।',
    live: 'लाइव',
    updated: 'अद्यतन',
    indices: 'वैश्विक सूचकांक',
    forex: 'मुद्राएँ',
    commodities: 'कमोडिटी',
    crypto: 'डिजिटल संपत्ति',
    internal: 'उपयोगिता सूचकांक',
    change: '24 घंटे',
    refresh: 'रिफ़्रेश',
  },
  rewards: {
    eyebrow: 'रिटेंशन इंजन',
    title: 'जितना रुकेंगे, उतना अधिक मेश देगा',
    lead: 'दैनिक स्ट्रीक आपकी उपज बढ़ाती है, व्हेल स्तर ऊँचे गुणक खोलते हैं, और आपके लाए हर ऑपरेटर से आपको उसके माइनिंग इनाम का आजीवन हिस्सा मिलता है।',
    streakTitle: 'दैनिक स्ट्रीक',
    streakBody: 'दिन में एक बार दावा करें। हर लगातार दिन दस प्रतिशत जोड़ता है, अधिकतम 1.7x।',
    claim: 'आज का दावा करें',
    claimed: 'दावा हुआ',
    tomorrow: 'अगला दावा 00:00 UTC पर खुलेगा।',
    multiplier: 'वर्तमान गुणक',
    vipTitle: 'व्हेल स्तर',
    vipBody: 'स्तर स्टेक किए $MINEAI पर मापे जाते हैं और स्टेक रहने तक समाप्त नहीं होते।',
    referralTitle: 'रेफ़रल कार्यक्रम',
    referralBody: 'अपना कोड साझा करें। हर रेफ़र किए ऑपरेटर के माइनिंग इनाम का आठ प्रतिशत आजीवन आपका।',
    yourCode: 'आपका कोड',
    copy: 'कोड कॉपी करें',
    copied: 'कॉपी हुआ',
    invited: 'आमंत्रित ऑपरेटर',
    earned: 'रेफ़रल कमाई',
    leaderboard: 'वैश्विक लीडरबोर्ड',
    rank: 'रैंक',
    operator: 'ऑपरेटर',
    mined: 'माइन हुआ',
    securityTitle: 'खाता तिजोरी',
    securityBody: 'एक बार नामांकन करने के बाद हर निकासी पर दो-कारक प्रमाणीकरण अनिवार्य होता है। एक बार नामांकन करें और रिकवरी कोड ऑफ़लाइन रखें।',
    securityEnroll: 'प्रमाणक जोड़ें',
    securitySecret: 'गुप्त कुंजी',
    securityVerify: 'कोड सत्यापित करें',
    securityVerified: 'दो-कारक सक्रिय',
    securityCode: '6 अंकों का कोड',
  },
  video: {
    title: 'मेश को काम करते देखें',
    lead: 'नब्बे सेकंड की व्याख्या, आपकी भाषा में।',
    play: 'व्याख्या चलाएँ',
    pause: 'रोकें',
    restart: 'पुनः चलाएँ',
    mute: 'आवाज़ बंद करें',
    unmute: 'आवाज़ चालू करें',
    sceneOf: 'दृश्य',
    captionsOn: 'सबटाइटल चालू',
    captionsOff: 'सबटाइटल बंद',
    captions: [
      {
        title: 'मेश जागता है',
        line: 'स्थायी एजेंट बाहरी क्लाउड की निष्क्रिय क्षमता ले लेते हैं। आपके कमरे में हार्डवेयर नहीं, बिल पर बिजली नहीं।',
      },
      {
        title: 'वह खोजता है',
        line: 'विज्ञापन लाइब्रेरी और आपूर्तिकर्ता कैटलॉग लगातार पढ़े जाते हैं। संतृप्त उत्पाद एक पैसा खर्च होने से पहले हटा दिए जाते हैं।',
      },
      {
        title: 'वह निपटाता है',
        line: 'ऑर्डर स्वयं पूरे होते हैं और कमाई आपके बैंक या वॉलेट में पहुँचती है, हर ट्रांसफ़र का अपना संदर्भ।',
      },
      {
        title: 'वह प्रमाण देता है',
        line: 'हर क्रिया अपरिवर्तनीय बहीखाते में दर्ज होती है, जिसे आप छह भाषाओं में पढ़ सकते हैं।',
      },
    ],
  },
};

const COPY: Record<SupportedLanguage, EcosystemCopy> = {
  en: EN,
  ar: AR,
  fr: FR,
  es: ES,
  zh: ZH,
  hi: HI,
};

export function getEcosystemCopy(lang: SupportedLanguage): EcosystemCopy {
  return COPY[lang] ?? COPY[DEFAULT_LANGUAGE];
}
