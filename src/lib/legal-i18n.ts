import type { SupportedLanguage } from '@/types';
import { DEFAULT_LANGUAGE } from '@/lib/languages';

/**
 * Compliance copy for the four pages Kashier and Paymob reviewers open first.
 *
 * Every locale is authored, not machine translated, and every document carries
 * the same operative commitments: card data never touches this server, crypto
 * settlement is on-chain, refunds are defined, and a real contact route exists.
 * No personal name, national id or bank account is stored in this file.
 */

export type LegalSlug = 'terms' | 'privacy' | 'refund-policy' | 'contact';

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  slug: LegalSlug;
  eyebrow: string;
  title: string;
  intro: string;
  sections: LegalSection[];
}

export interface LegalCopy {
  nav: {
    terms: string;
    privacy: string;
    refund: string;
    contact: string;
  };
  common: {
    updated: string;
    effective: string;
    backHome: string;
    backStore: string;
    supportEmail: string;
    legalEmail: string;
    billingEmail: string;
    company: string;
  };
  docs: Record<LegalSlug, LegalDoc>;
}

const SUPPORT = 'support@mineai.network';
const LEGAL = 'legal@mineai.network';
const BILLING = 'billing@mineai.network';

const EN: LegalCopy = {
  nav: {
    terms: 'Terms of Service',
    privacy: 'Privacy Policy',
    refund: 'Refund Policy',
    contact: 'Contact',
  },
  common: {
    updated: 'Last updated',
    effective: 'Effective date',
    backHome: 'Back to overview',
    backStore: 'Open the node store',
    supportEmail: SUPPORT,
    legalEmail: LEGAL,
    billingEmail: BILLING,
    company: 'MineAI Node',
  },
  docs: {
    terms: {
      slug: 'terms',
      eyebrow: 'Legal',
      title: 'Terms of Service',
      intro:
        'These terms govern your use of MineAI Node, its node catalogue, cloud-mining terminal, market board and payment rails. By opening an account or paying for a node you accept them.',
      sections: [
        {
          heading: '1. The service',
          body: [
            'MineAI Node provides access to a decentralised compute mesh, a resident agent workforce, a multi-coin cloud-mining terminal and a market-intelligence board. No hardware is shipped and no electricity is billed to you.',
            'Compute is rented from external edge capacity. Availability is targeted, not guaranteed, and scheduled maintenance is announced in the field notes.',
          ],
        },
        {
          heading: '2. Eligibility and accounts',
          body: [
            'You must be at least 18 years old and legally able to enter a contract in your jurisdiction. You are responsible for the accuracy of the wallet address, bank details and contact email you submit.',
            'Operator ids are anonymous by design. You are responsible for safeguarding your device, your two-factor secret and your recovery codes.',
          ],
        },
        {
          heading: '3. Payments and settlement',
          body: [
            'Card payments are processed by Kashier or Paymob. The card form is hosted by the processor; MineAI Node never receives or stores a card number, CVV or full expiry date.',
            'Crypto payments settle directly to the owner wallet published at checkout. A crypto deposit is credited only after the transaction hash is verified against a public RPC. An unreachable RPC leaves the deposit pending; it is never credited optimistically.',
            'Prices are listed in US dollars. Local card rails may charge the equivalent in Egyptian pounds at the rate displayed before payment. Your bank may apply its own conversion or cross-border fee.',
          ],
        },
        {
          heading: '4. Mining rewards',
          body: [
            'Mining rewards accrue against the hashrate allocated to your position and are subject to the published emission schedule, VIP multiplier and streak multiplier. Rewards are not a security, a deposit or a promise of profit.',
            'Withdrawals require a valid address for the selected network and, once enrolled, a live two-factor code. The minimum withdrawal and network fee are shown before you confirm.',
          ],
        },
        {
          heading: '5. Acceptable use',
          body: [
            'You may not use the service to launder money, evade sanctions, defraud a processor, attack the platform, scrape it at a rate that degrades service, or present mining rewards as guaranteed investment returns.',
            'We may suspend a position, refuse a payment or freeze a withdrawal where a processor, bank or sanction list requires it, or where fraud is reasonably suspected.',
          ],
        },
        {
          heading: '6. Liability and governing law',
          body: [
            'The service is provided on an “as available” basis. To the maximum extent permitted by law, MineAI Node is not liable for indirect loss, lost profits, chain congestion, processor downtime or market movement.',
            'These terms are governed by the laws of the United Arab Emirates. Disputes are first referred to good-faith negotiation through the contact page.',
          ],
        },
      ],
    },
    privacy: {
      slug: 'privacy',
      eyebrow: 'Legal',
      title: 'Privacy Policy',
      intro:
        'This policy explains what MineAI Node collects, why it is collected, where it is stored and how you can remove it. We collect the minimum needed to run the service and settle payments.',
      sections: [
        {
          heading: '1. What we collect',
          body: [
            'An anonymous operator id generated in your browser, the language you select, the node you activate and the public wallet address you submit for a withdrawal.',
            'Payment metadata returned by Kashier or Paymob: a session or transaction reference, the amount, the currency and the status. We do not receive card numbers.',
            'Technical logs: IP address, user agent, request path and timestamp, retained to rate-limit abuse and investigate fraud.',
          ],
        },
        {
          heading: '2. What we never collect',
          body: [
            'We do not ask for a national identity number, a passport scan, a personal photograph or a bank IBAN. Owner settlement details are deployment secrets and are never rendered in the browser.',
            'We do not sell personal data and we do not run third-party advertising trackers.',
          ],
        },
        {
          heading: '3. How data is stored',
          body: [
            'Application records live in Supabase Postgres with Row Level Security enabled. Two-factor secrets are sealed with AES-256-GCM before they reach the database; the ciphertext is readable only by the server role.',
            'Card data stays with the processor. Crypto verification uses public chain data and a public RPC; no private key is ever requested.',
          ],
        },
        {
          heading: '4. Retention and your rights',
          body: [
            'Payment and withdrawal references are retained for the period required by accounting and anti-fraud rules. Technical logs are rotated regularly. Anonymous mining state can be reset by clearing the operator id in your browser.',
            `To request access, correction or deletion, write to ${LEGAL}. We answer within 30 days.`,
          ],
        },
        {
          heading: '5. Processors and transfers',
          body: [
            'Kashier, Paymob, Supabase, Vercel and public blockchain RPC providers act as processors or independent controllers for the limited purpose of delivering the service.',
            'Where data leaves your region it is protected by the processor’s contractual safeguards. We do not transfer data to a party that has no lawful basis to receive it.',
          ],
        },
        {
          heading: '6. Cookies and local storage',
          body: [
            'We store your language preference and anonymous operator id in local storage. No advertising cookie is set. Clearing site data removes both.',
          ],
        },
      ],
    },
    'refund-policy': {
      slug: 'refund-policy',
      eyebrow: 'Legal',
      title: 'Refund Policy',
      intro:
        'This policy explains when a card or crypto payment can be reversed. It is written to be read before you pay, not after a dispute.',
      sections: [
        {
          heading: '1. Card payments',
          body: [
            'A card payment may be refunded in full within 14 days of settlement if the node was never activated or the service was materially unavailable. Refunds return to the original card through Kashier or Paymob.',
            'Once a node has been activated and compute has been consumed, the unused portion of the current billing period may be refunded pro rata at our discretion.',
          ],
        },
        {
          heading: '2. Crypto payments',
          body: [
            'Crypto transfers are irreversible on-chain. A verified deposit can be refunded only to the same address after the funds have cleared, less the network fee actually paid.',
            'A deposit sent to the wrong network, or with an amount below the published minimum, may be unrecoverable. Always copy the address and network from the checkout screen.',
          ],
        },
        {
          heading: '3. Mining withdrawals',
          body: [
            'A queued withdrawal can be cancelled before broadcast. Once a transaction is broadcast, it cannot be recalled. A malformed address is rejected before broadcast rather than after.',
          ],
        },
        {
          heading: '4. How to request a refund',
          body: [
            `Write to ${BILLING} with the transaction or session reference, the node id and the reason. Do not send card numbers or identity documents.`,
            'We acknowledge within two business days and aim to resolve within ten. Chargebacks raised without contacting us first may delay the investigation.',
          ],
        },
        {
          heading: '5. Exceptions',
          body: [
            'Refunds are not available where the account was used for fraud, sanctions evasion, abuse of the referral programme or a chargeback already decided by the issuer.',
          ],
        },
      ],
    },
    contact: {
      slug: 'contact',
      eyebrow: 'Support',
      title: 'Contact',
      intro:
        'A real route to a real team. Choose the address that matches your question so it reaches the right queue on the first attempt.',
      sections: [
        {
          heading: 'Customer support',
          body: [
            `Node activation, mining rewards, two-factor enrolment and withdrawal status: ${SUPPORT}.`,
            'Include your anonymous operator id (shown on the rewards page) and the relevant transaction reference. Never send a card number, a seed phrase or a private key.',
          ],
        },
        {
          heading: 'Billing and refunds',
          body: [
            `Card settlement, invoices and refund requests: ${BILLING}.`,
            'State the amount, currency, date and the processor shown on the checkout screen. We reply within two business days.',
          ],
        },
        {
          heading: 'Legal and privacy',
          body: [
            `Terms, data-access and deletion requests: ${LEGAL}.`,
            'Privacy requests are answered within 30 days. Legal notices should identify the document and the clause at issue.',
          ],
        },
        {
          heading: 'Security disclosures',
          body: [
            `Report a vulnerability responsibly to ${SUPPORT} with the subject “Security”. Do not test against live funds or another operator’s position.`,
            'We acknowledge good-faith reports and will not pursue a researcher who stays within the scope described in the report.',
          ],
        },
        {
          heading: 'Response hours',
          body: [
            'Support is staffed Sunday to Thursday, 09:00–18:00 Gulf Standard Time. Critical payment incidents are monitored outside those hours.',
          ],
        },
      ],
    },
  },
};

const AR: LegalCopy = {
  nav: {
    terms: 'شروط الخدمة',
    privacy: 'سياسة الخصوصية',
    refund: 'سياسة الاسترداد',
    contact: 'اتصل بنا',
  },
  common: {
    updated: 'آخر تحديث',
    effective: 'تاريخ السريان',
    backHome: 'العودة إلى النظرة العامة',
    backStore: 'افتح متجر العقد',
    supportEmail: SUPPORT,
    legalEmail: LEGAL,
    billingEmail: BILLING,
    company: 'MineAI Node',
  },
  docs: {
    terms: {
      slug: 'terms',
      eyebrow: 'قانوني',
      title: 'شروط الخدمة',
      intro:
        'تنظّم هذه الشروط استخدامك لمنصة MineAI Node ودليل العقد وطرفية التعدين السحابي ولوحة الأسواق ومسارات الدفع. بفتح حساب أو بدفع ثمن عقدة فإنك تقبلها.',
      sections: [
        {
          heading: '1. الخدمة',
          body: [
            'توفّر MineAI Node شبكة حوسبة لامركزية وسرب وكلاء مقيمين وطرفية تعدين متعددة العملات ولوحة معلومات أسواق. لا يُشحن أي عتاد ولا تُفترض عليك أي فاتورة كهرباء.',
            'تُستأجر الحوسبة من سعة حوسبة خارجية. التوافر مستهدف وليس مضموناً، وتُعلن أعمال الصيانة في الملاحظات الميدانية.',
          ],
        },
        {
          heading: '2. الأهلية والحسابات',
          body: [
            'يجب أن تكون قد بلغت 18 عاماً وأن تكون أهلاً قانوناً لإبرام عقد في بلدك. أنت مسؤول عن دقة عنوان المحفظة والبيانات البنكية والبريد الذي تقدّمه.',
            'معرّفات المشغّل مجهولة بالتصميم. أنت مسؤول عن حماية جهازك وسرّ المصادقة الثنائية ورموز الاسترداد.',
          ],
        },
        {
          heading: '3. المدفوعات والتسوية',
          body: [
            'تُعالج مدفوعات البطاقات عبر Kashier أو Paymob. تستضيف بوابة الدفع نموذج البطاقة؛ ولا تستقبل MineAI Node رقم البطاقة أو رمز التحقق أو تاريخ الانتهاء الكامل.',
            'تُسوّى مدفوعات العملات الرقمية مباشرة إلى محفظة المالك المنشورة عند الدفع. لا يُضاف الإيداع إلا بعد التحقق من بصمة المعاملة عبر RPC عام. تعذّر الوصول إلى RPC يبقي الإيداع معلقاً ولا يُضاف تخميناً.',
            'تُعرض الأسعار بالدولار الأمريكي. قد تحصّل بوابات البطاقات المحلية المكافئ بالجنيه المصري بالسعر المعروض قبل الدفع. قد يطبّق بنكك رسوم تحويل أو عبر الحدود.',
          ],
        },
        {
          heading: '4. مكافآت التعدين',
          body: [
            'تتراكم مكافآت التعدين وفق معدل التجزئة المخصّص لموقفك وتخضع لجدول الإصدار المنشور ومضاعف VIP ومضاعف السلسلة. المكافآت ليست ورقة مالية ولا إيداعاً ولا وعداً بالربح.',
            'يتطلب السحب عنواناً صالحاً للشبكة المختارة، وبعد التسجيل رمز مصادقة ثنائية حياً. يُعرض الحد الأدنى ورسوم الشبكة قبل التأكيد.',
          ],
        },
        {
          heading: '5. الاستخدام المقبول',
          body: [
            'لا يجوز استخدام الخدمة لغسل الأموال أو التحايل على العقوبات أو الاحتيال على بوابة دفع أو مهاجمة المنصة أو سحب بياناتها بما يضرّ الخدمة أو تقديم مكافآت التعدين كعائد استثماري مضمون.',
            'يجوز لنا تعليق موقف أو رفض دفعة أو تجميد سحب إذا طلبت ذلك بوابة أو بنك أو قائمة عقوبات أو عند الاشتباه المعقول بالاحتيال.',
          ],
        },
        {
          heading: '6. المسؤولية والقانون الحاكم',
          body: [
            'تُقدَّم الخدمة «حسب التوافر». إلى أقصى حدّ يسمح به القانون، لا تتحمل MineAI Node مسؤولية الخسارة غير المباشرة أو الأرباح الفائتة أو ازدحام الشبكة أو توقف البوابة أو تحركات السوق.',
            'تخضع هذه الشروط لقوانين دولة الإمارات العربية المتحدة. تُحال النزاعات أولاً إلى تفاوض حسن النية عبر صفحة الاتصال.',
          ],
        },
      ],
    },
    privacy: {
      slug: 'privacy',
      eyebrow: 'قانوني',
      title: 'سياسة الخصوصية',
      intro:
        'توضح هذه السياسة ما تجمعه MineAI Node ولماذا وأين يُخزَّن وكيف يمكنك حذفه. نجمع الحد الأدنى اللازم لتشغيل الخدمة وتسوية المدفوعات.',
      sections: [
        {
          heading: '1. ما نجمعه',
          body: [
            'معرّف مشغّل مجهول يُنشأ في متصفحك، واللغة التي تختارها، والعقدة التي تفعّلها، وعنوان المحفظة العام الذي تقدّمه للسحب.',
            'بيانات وصفية للمدفوعات تعيدها Kashier أو Paymob: مرجع جلسة أو معاملة والمبلغ والعملة والحالة. لا نتلقى أرقام البطاقات.',
            'سجلات تقنية: عنوان IP ووكيل المستخدم ومسار الطلب والوقت، تُحفظ للحد من الإساءة والتحقيق في الاحتيال.',
          ],
        },
        {
          heading: '2. ما لا نجمعه أبداً',
          body: [
            'لا نطلب رقم هوية وطنية أو صورة جواز سفر أو صورة شخصية أو رقم IBAN بنكي. بيانات تسوية المالك أسرار نشر ولا تُعرض في المتصفح.',
            'لا نبيع البيانات الشخصية ولا نشغّل متتبعات إعلانية لطرف ثالث.',
          ],
        },
        {
          heading: '3. كيف تُخزَّن البيانات',
          body: [
            'تعيش سجلات التطبيق في Supabase Postgres مع تمكين أمان مستوى الصف. تُشفَّر أسرار المصادقة الثنائية بـ AES-256-GCM قبل وصولها لقاعدة البيانات، ولا يقرأها إلا دور الخادم.',
            'تبقى بيانات البطاقة لدى بوابة الدفع. يستخدم التحقق من العملات الرقمية بيانات السلسلة العامة و RPC عاماً؛ ولا يُطلب مفتاح خاص أبداً.',
          ],
        },
        {
          heading: '4. الاحتفاظ وحقوقك',
          body: [
            'تُحفظ مراجع المدفوعات والسحوبات للمدة التي تتطلبها قواعد المحاسبة ومكافحة الاحتيال. تُدوَّر السجلات التقنية بانتظام. يمكن إعادة ضبط حالة التعدين المجهولة بمسح معرّف المشغّل من متصفحك.',
            `لطلب الوصول أو التصحيح أو الحذف اكتب إلى ${LEGAL}. نرد خلال 30 يوماً.`,
          ],
        },
        {
          heading: '5. المعالجون والنقل',
          body: [
            'تعمل Kashier وPaymob وSupabase وVercel ومزوّدو RPC العامون كمعالجين أو متحكّمين مستقلين لغرض محدود هو تقديم الخدمة.',
            'حيث تغادر البيانات منطقتك تحميها ضمانات تعاقدية للمعالج. لا ننقل البيانات إلى طرف لا يملك أساساً قانونياً لتلقيها.',
          ],
        },
        {
          heading: '6. ملفات تعريف الارتباط والتخزين المحلي',
          body: [
            'نحفظ تفضيل اللغة ومعرّف المشغّل المجهول في التخزين المحلي. لا نضع أي ملف إعلاني. مسح بيانات الموقع يحذف الاثنين.',
          ],
        },
      ],
    },
    'refund-policy': {
      slug: 'refund-policy',
      eyebrow: 'قانوني',
      title: 'سياسة الاسترداد',
      intro:
        'توضح هذه السياسة متى يمكن عكس دفعة بطاقة أو عملة رقمية. كُتبت لتُقرأ قبل الدفع لا بعد نشوء نزاع.',
      sections: [
        {
          heading: '1. مدفوعات البطاقات',
          body: [
            'يمكن استرداد دفعة البطاقة كاملة خلال 14 يوماً من التسوية إذا لم تُفعَّل العقدة أو كانت الخدمة غير متاحة جوهرياً. تعود المبالغ إلى البطاقة الأصلية عبر Kashier أو Paymob.',
            'بعد تفعيل العقدة واستهلاك الحوسبة، قد يُسترد الجزء غير المستخدم من دورة الفوترة الحالية بالتناسب وفق تقديرنا.',
          ],
        },
        {
          heading: '2. مدفوعات العملات الرقمية',
          body: [
            'تحويلات العملات الرقمية غير قابلة للعكس على السلسلة. لا يمكن استرداد إيداع موثّق إلا إلى العنوان نفسه بعد تسوية الأموال، مخصوماً منه رسم الشبكة المدفوع فعلاً.',
            'الإيداع المرسل إلى شبكة خاطئة أو بمبلغ أقل من الحد المنشور قد يكون غير قابل للاسترداد. انسخ العنوان والشبكة دائماً من شاشة الدفع.',
          ],
        },
        {
          heading: '3. سحوبات التعدين',
          body: [
            'يمكن إلغاء السحب في قائمة الانتظار قبل البث. بعد بث المعاملة لا يمكن استرجاعها. يُرفض العنوان المشوّه قبل البث لا بعده.',
          ],
        },
        {
          heading: '4. كيفية طلب استرداد',
          body: [
            `اكتب إلى ${BILLING} مع مرجع المعاملة أو الجلسة ومعرّف العقدة والسبب. لا ترسل أرقام بطاقات أو وثائق هوية.`,
            'نؤكد الاستلام خلال يومي عمل ونهدف للحل خلال عشرة. قد تؤخر المطالبات العكسية المرفوعة دون التواصل معنا التحقيق.',
          ],
        },
        {
          heading: '5. الاستثناءات',
          body: [
            'لا تتوافر الاستردادات حيث استُخدم الحساب في احتيال أو التحايل على العقوبات أو إساءة برنامج الإحالة أو مطالبة عكسية حسمها المُصدر.',
          ],
        },
      ],
    },
    contact: {
      slug: 'contact',
      eyebrow: 'الدعم',
      title: 'اتصل بنا',
      intro:
        'مسار حقيقي إلى فريق حقيقي. اختر العنوان المطابق لسؤالك ليصل إلى قائمة الانتظار الصحيحة من المحاولة الأولى.',
      sections: [
        {
          heading: 'دعم العملاء',
          body: [
            `تفعيل العقد ومكافآت التعدين وتسجيل المصادقة الثنائية وحالة السحب: ${SUPPORT}.`,
            'أرفق معرّف المشغّل المجهول (يظهر في صفحة المكافآت) ومرجع المعاملة. لا ترسل رقم بطاقة أو عبارة استرداد أو مفتاحاً خاصاً أبداً.',
          ],
        },
        {
          heading: 'الفوترة والاسترداد',
          body: [
            `تسوية البطاقات والفواتير وطلبات الاسترداد: ${BILLING}.`,
            'اذكر المبلغ والعملة والتاريخ والبوابة الظاهرة في شاشة الدفع. نرد خلال يومي عمل.',
          ],
        },
        {
          heading: 'القانوني والخصوصية',
          body: [
            `الشروط وطلبات الوصول إلى البيانات وحذفها: ${LEGAL}.`,
            'تُجاب طلبات الخصوصية خلال 30 يوماً. يجب أن تحدد الإشعارات القانونية المستند والبند محل النزاع.',
          ],
        },
        {
          heading: 'الإفصاح الأمني',
          body: [
            `أبلغ عن ثغرة بمسؤولية إلى ${SUPPORT} بعنوان «Security». لا تختبر على أموال حقيقية أو موقف مشغّل آخر.`,
            'نعترف بالتقارير حسنة النية ولن نلاحق باحثاً يلتزم بنطاق التقرير.',
          ],
        },
        {
          heading: 'ساعات الاستجابة',
          body: [
            'الدعم يعمل من الأحد إلى الخميس، 09:00–18:00 بتوقيت الخليج. تُراقَب حوادث الدفع الحرجة خارج هذه الساعات.',
          ],
        },
      ],
    },
  },
};

const FR: LegalCopy = {
  nav: {
    terms: "Conditions d'utilisation",
    privacy: 'Politique de confidentialité',
    refund: 'Politique de remboursement',
    contact: 'Contact',
  },
  common: {
    updated: 'Dernière mise à jour',
    effective: "Date d'effet",
    backHome: "Retour à la vue d'ensemble",
    backStore: 'Ouvrir le catalogue',
    supportEmail: SUPPORT,
    legalEmail: LEGAL,
    billingEmail: BILLING,
    company: 'MineAI Node',
  },
  docs: {
    terms: {
      slug: 'terms',
      eyebrow: 'Mentions légales',
      title: "Conditions d'utilisation",
      intro:
        "Ces conditions régissent votre utilisation de MineAI Node, de son catalogue, de sa console de minage cloud, de son tableau de marchés et de ses rails de paiement. En ouvrant un compte ou en payant un nœud, vous les acceptez.",
      sections: [
        {
          heading: '1. Le service',
          body: [
            "MineAI Node fournit un maillage de calcul décentralisé, un essaim d'agents résidents, une console de minage multi-devises et un tableau d'intelligence de marché. Aucun matériel n'est expédié et aucune électricité ne vous est facturée.",
            "Le calcul est loué à une capacité edge externe. La disponibilité est visée, non garantie, et les maintenances sont annoncées dans le carnet de terrain.",
          ],
        },
        {
          heading: '2. Éligibilité et comptes',
          body: [
            "Vous devez avoir au moins 18 ans et être juridiquement capable de contracter dans votre juridiction. Vous êtes responsable de l'exactitude de l'adresse de portefeuille, des coordonnées bancaires et de l'e-mail fournis.",
            "Les identifiants d'opérateur sont anonymes par conception. Vous êtes responsable de la sécurité de votre appareil, de votre secret à deux facteurs et de vos codes de récupération.",
          ],
        },
        {
          heading: '3. Paiements et règlement',
          body: [
            "Les paiements par carte sont traités par Kashier ou Paymob. Le formulaire de carte est hébergé par le processeur ; MineAI Node ne reçoit ni ne stocke jamais un numéro de carte, un CVV ou une date d'expiration complète.",
            "Les paiements crypto sont réglés directement sur le portefeuille du propriétaire publié au paiement. Un dépôt n'est crédité qu'après vérification du hash de transaction auprès d'un RPC public. Un RPC injoignable laisse le dépôt en attente ; il n'est jamais crédité par optimisme.",
            "Les prix sont affichés en dollars américains. Les rails de carte locaux peuvent débiter l'équivalent en livres égyptiennes au taux affiché avant paiement. Votre banque peut appliquer ses propres frais de conversion ou transfrontaliers.",
          ],
        },
        {
          heading: '4. Récompenses de minage',
          body: [
            "Les récompenses s'accumulent selon le hashrate alloué à votre position et sont soumises au calendrier d'émission publié, au multiplicateur VIP et au multiplicateur de série. Elles ne sont ni un titre financier, ni un dépôt, ni une promesse de profit.",
            "Un retrait exige une adresse valide pour le réseau choisi et, une fois l'enrôlement effectué, un code à deux facteurs actif. Le minimum et les frais réseau sont affichés avant confirmation.",
          ],
        },
        {
          heading: '5. Usage acceptable',
          body: [
            "Il est interdit d'utiliser le service pour blanchir des fonds, contourner des sanctions, frauder un processeur, attaquer la plateforme, l'extraire à un rythme qui dégrade le service ou présenter les récompenses comme un rendement garanti.",
            "Nous pouvons suspendre une position, refuser un paiement ou geler un retrait lorsqu'un processeur, une banque ou une liste de sanctions l'exige, ou en cas de soupçon raisonnable de fraude.",
          ],
        },
        {
          heading: '6. Responsabilité et droit applicable',
          body: [
            "Le service est fourni « selon disponibilité ». Dans la mesure permise par la loi, MineAI Node n'est pas responsable des pertes indirectes, des profits manqués, de la congestion de la chaîne, des pannes de processeur ou des mouvements de marché.",
            "Ces conditions sont régies par le droit des Émirats arabes unis. Les litiges sont d'abord soumis à une négociation de bonne foi via la page de contact.",
          ],
        },
      ],
    },
    privacy: {
      slug: 'privacy',
      eyebrow: 'Mentions légales',
      title: 'Politique de confidentialité',
      intro:
        "Cette politique explique ce que MineAI Node collecte, pourquoi, où les données sont stockées et comment les supprimer. Nous collectons le minimum nécessaire au service et au règlement des paiements.",
      sections: [
        {
          heading: '1. Ce que nous collectons',
          body: [
            "Un identifiant d'opérateur anonyme généré dans votre navigateur, la langue choisie, le nœud activé et l'adresse publique de portefeuille soumise pour un retrait.",
            "Les métadonnées de paiement renvoyées par Kashier ou Paymob : référence de session ou de transaction, montant, devise et statut. Nous ne recevons pas les numéros de carte.",
            "Des journaux techniques : adresse IP, agent utilisateur, chemin de requête et horodatage, conservés pour limiter les abus et enquêter sur la fraude.",
          ],
        },
        {
          heading: '2. Ce que nous ne collectons jamais',
          body: [
            "Nous ne demandons ni numéro d'identité nationale, ni scan de passeport, ni photographie personnelle, ni IBAN bancaire. Les coordonnées de règlement du propriétaire sont des secrets de déploiement et ne sont jamais affichées au navigateur.",
            "Nous ne vendons pas de données personnelles et n'exécutons aucun traceur publicitaire tiers.",
          ],
        },
        {
          heading: '3. Stockage des données',
          body: [
            "Les enregistrements applicatifs vivent dans Supabase Postgres avec Row Level Security activé. Les secrets à deux facteurs sont scellés en AES-256-GCM avant d'atteindre la base ; seul le rôle serveur peut lire le chiffré.",
            "Les données de carte restent chez le processeur. La vérification crypto utilise des données publiques de chaîne et un RPC public ; aucune clé privée n'est jamais demandée.",
          ],
        },
        {
          heading: '4. Conservation et vos droits',
          body: [
            "Les références de paiement et de retrait sont conservées pendant la durée exigée par la comptabilité et la lutte anti-fraude. Les journaux techniques sont régulièrement renouvelés. L'état de minage anonyme peut être réinitialisé en effaçant l'identifiant d'opérateur du navigateur.",
            `Pour demander l'accès, la correction ou la suppression, écrivez à ${LEGAL}. Nous répondons sous 30 jours.`,
          ],
        },
        {
          heading: '5. Processeurs et transferts',
          body: [
            "Kashier, Paymob, Supabase, Vercel et les fournisseurs de RPC blockchain publics agissent comme sous-traitants ou responsables indépendants pour la seule finalité de fournir le service.",
            "Lorsque des données quittent votre région, elles sont protégées par les garanties contractuelles du processeur. Nous ne transférons pas de données à un tiers sans base légale.",
          ],
        },
        {
          heading: '6. Cookies et stockage local',
          body: [
            "Nous stockons votre préférence de langue et votre identifiant anonyme dans le stockage local. Aucun cookie publicitaire n'est déposé. Effacer les données du site supprime les deux.",
          ],
        },
      ],
    },
    'refund-policy': {
      slug: 'refund-policy',
      eyebrow: 'Mentions légales',
      title: 'Politique de remboursement',
      intro:
        "Cette politique explique quand un paiement par carte ou crypto peut être annulé. Elle est écrite pour être lue avant de payer, pas après un litige.",
      sections: [
        {
          heading: '1. Paiements par carte',
          body: [
            "Un paiement par carte peut être remboursé intégralement dans les 14 jours suivant le règlement si le nœud n'a jamais été activé ou si le service a été matériellement indisponible. Le remboursement retourne sur la carte d'origine via Kashier ou Paymob.",
            "Une fois le nœud activé et le calcul consommé, la partie inutilisée de la période en cours peut être remboursée au prorata à notre discrétion.",
          ],
        },
        {
          heading: '2. Paiements crypto',
          body: [
            "Les transferts crypto sont irréversibles on-chain. Un dépôt vérifié ne peut être remboursé qu'à la même adresse après compensation, moins les frais réseau réellement payés.",
            "Un dépôt envoyé sur le mauvais réseau, ou sous le minimum publié, peut être irrécupérable. Copiez toujours l'adresse et le réseau depuis l'écran de paiement.",
          ],
        },
        {
          heading: '3. Retraits de minage',
          body: [
            "Un retrait en file peut être annulé avant diffusion. Une fois la transaction diffusée, elle ne peut être rappelée. Une adresse mal formée est rejetée avant diffusion, pas après.",
          ],
        },
        {
          heading: '4. Demander un remboursement',
          body: [
            `Écrivez à ${BILLING} avec la référence de transaction ou de session, l'identifiant du nœud et le motif. N'envoyez pas de numéro de carte ni de document d'identité.`,
            "Nous accusons réception sous deux jours ouvrés et visons une résolution sous dix. Les rétrofacturations ouvertes sans nous contacter peuvent retarder l'enquête.",
          ],
        },
        {
          heading: '5. Exceptions',
          body: [
            "Aucun remboursement n'est accordé si le compte a servi à une fraude, au contournement de sanctions, à un abus du programme de parrainage ou à une rétrofacturation déjà tranchée par l'émetteur.",
          ],
        },
      ],
    },
    contact: {
      slug: 'contact',
      eyebrow: 'Support',
      title: 'Contact',
      intro:
        "Une vraie voie vers une vraie équipe. Choisissez l'adresse correspondant à votre question pour qu'elle atteigne la bonne file dès le premier essai.",
      sections: [
        {
          heading: 'Support client',
          body: [
            `Activation de nœud, récompenses de minage, enrôlement à deux facteurs et statut de retrait : ${SUPPORT}.`,
            "Indiquez votre identifiant d'opérateur anonyme (visible sur la page récompenses) et la référence de transaction. N'envoyez jamais de numéro de carte, de phrase de récupération ou de clé privée.",
          ],
        },
        {
          heading: 'Facturation et remboursements',
          body: [
            `Règlement carte, factures et demandes de remboursement : ${BILLING}.`,
            "Précisez le montant, la devise, la date et le processeur affiché au paiement. Nous répondons sous deux jours ouvrés.",
          ],
        },
        {
          heading: 'Juridique et confidentialité',
          body: [
            `Conditions, accès aux données et demandes de suppression : ${LEGAL}.`,
            "Les demandes de confidentialité reçoivent une réponse sous 30 jours. Les notifications juridiques doivent identifier le document et la clause en cause.",
          ],
        },
        {
          heading: 'Divulgations de sécurité',
          body: [
            `Signalez une vulnérabilité de bonne foi à ${SUPPORT} avec l'objet « Security ». Ne testez pas sur des fonds réels ou la position d'un autre opérateur.`,
            "Nous reconnaissons les rapports de bonne foi et ne poursuivrons pas un chercheur qui respecte le périmètre décrit dans son rapport.",
          ],
        },
        {
          heading: 'Horaires de réponse',
          body: [
            "Le support est assuré du dimanche au jeudi, 09:00–18:00 heure du Golfe. Les incidents de paiement critiques sont surveillés en dehors de ces heures.",
          ],
        },
      ],
    },
  },
};

const ES: LegalCopy = {
  nav: {
    terms: 'Términos del servicio',
    privacy: 'Política de privacidad',
    refund: 'Política de reembolso',
    contact: 'Contacto',
  },
  common: {
    updated: 'Última actualización',
    effective: 'Fecha de entrada en vigor',
    backHome: 'Volver al panorama',
    backStore: 'Abrir la tienda de nodos',
    supportEmail: SUPPORT,
    legalEmail: LEGAL,
    billingEmail: BILLING,
    company: 'MineAI Node',
  },
  docs: {
    terms: {
      slug: 'terms',
      eyebrow: 'Legal',
      title: 'Términos del servicio',
      intro:
        'Estos términos rigen tu uso de MineAI Node, su catálogo de nodos, la terminal de minería en la nube, el tablero de mercados y los canales de pago. Al abrir una cuenta o pagar un nodo los aceptas.',
      sections: [
        {
          heading: '1. El servicio',
          body: [
            'MineAI Node ofrece una malla de cómputo descentralizada, un enjambre de agentes residentes, una terminal de minería multicripto y un tablero de inteligencia de mercado. No se envía hardware ni se te factura electricidad.',
            'El cómputo se alquila a capacidad edge externa. La disponibilidad es un objetivo, no una garantía, y el mantenimiento se anuncia en el cuaderno de campo.',
          ],
        },
        {
          heading: '2. Elegibilidad y cuentas',
          body: [
            'Debes tener al menos 18 años y capacidad legal para contratar en tu jurisdicción. Eres responsable de la exactitud de la dirección de cartera, los datos bancarios y el correo que facilitas.',
            'Los identificadores de operador son anónimos por diseño. Eres responsable de proteger tu dispositivo, tu secreto de doble factor y tus códigos de recuperación.',
          ],
        },
        {
          heading: '3. Pagos y liquidación',
          body: [
            'Los pagos con tarjeta los procesan Kashier o Paymob. El formulario de tarjeta lo aloja el procesador; MineAI Node nunca recibe ni almacena un número de tarjeta, CVV o fecha de caducidad completa.',
            'Los pagos cripto se liquidan directamente a la cartera del propietario publicada al pagar. Un depósito se acredita solo tras verificar el hash contra un RPC público. Un RPC inaccesible deja el depósito pendiente; nunca se acredita de forma optimista.',
            'Los precios se muestran en dólares estadounidenses. Los canales de tarjeta locales pueden cobrar el equivalente en libras egipcias al tipo mostrado antes del pago. Tu banco puede aplicar su propia comisión de conversión o transfronteriza.',
          ],
        },
        {
          heading: '4. Recompensas de minería',
          body: [
            'Las recompensas se acumulan según el hashrate asignado a tu posición y están sujetas al calendario de emisión publicado, al multiplicador VIP y al de racha. No son un valor negociable, un depósito ni una promesa de beneficio.',
            'Un retiro exige una dirección válida para la red elegida y, tras el alta, un código de doble factor vigente. El mínimo y la comisión de red se muestran antes de confirmar.',
          ],
        },
        {
          heading: '5. Uso aceptable',
          body: [
            'No puedes usar el servicio para blanquear dinero, eludir sanciones, defraudar a un procesador, atacar la plataforma, extraerla a un ritmo que degrade el servicio o presentar las recompensas como rendimiento garantizado.',
            'Podemos suspender una posición, rechazar un pago o congelar un retiro cuando lo exija un procesador, un banco o una lista de sanciones, o ante sospecha razonable de fraude.',
          ],
        },
        {
          heading: '6. Responsabilidad y ley aplicable',
          body: [
            'El servicio se presta «según disponibilidad». En la máxima medida permitida por ley, MineAI Node no responde de pérdidas indirectas, lucro cesante, congestión de la cadena, caídas del procesador o movimientos de mercado.',
            'Estos términos se rigen por las leyes de los Emiratos Árabes Unidos. Las disputas se someten primero a negociación de buena fe a través de la página de contacto.',
          ],
        },
      ],
    },
    privacy: {
      slug: 'privacy',
      eyebrow: 'Legal',
      title: 'Política de privacidad',
      intro:
        'Esta política explica qué recoge MineAI Node, por qué, dónde se almacena y cómo puedes eliminarlo. Recogemos lo mínimo para operar el servicio y liquidar pagos.',
      sections: [
        {
          heading: '1. Qué recogemos',
          body: [
            'Un identificador de operador anónimo generado en tu navegador, el idioma que eliges, el nodo que activas y la dirección pública de cartera que envías para un retiro.',
            'Metadatos de pago devueltos por Kashier o Paymob: referencia de sesión o transacción, importe, moneda y estado. No recibimos números de tarjeta.',
            'Registros técnicos: dirección IP, agente de usuario, ruta de la petición y marca temporal, conservados para limitar abusos e investigar fraude.',
          ],
        },
        {
          heading: '2. Qué nunca recogemos',
          body: [
            'No pedimos número de identidad nacional, escaneo de pasaporte, fotografía personal ni IBAN bancario. Los datos de liquidación del propietario son secretos de despliegue y nunca se muestran en el navegador.',
            'No vendemos datos personales ni ejecutamos rastreadores publicitarios de terceros.',
          ],
        },
        {
          heading: '3. Cómo se almacenan los datos',
          body: [
            'Los registros de la aplicación viven en Supabase Postgres con Row Level Security activado. Los secretos de doble factor se sellan con AES-256-GCM antes de llegar a la base; solo el rol de servidor lee el cifrado.',
            'Los datos de tarjeta permanecen en el procesador. La verificación cripto usa datos públicos de la cadena y un RPC público; nunca se solicita una clave privada.',
          ],
        },
        {
          heading: '4. Conservación y tus derechos',
          body: [
            'Las referencias de pago y retiro se conservan durante el plazo exigido por la contabilidad y la lucha contra el fraude. Los registros técnicos se rotan con regularidad. El estado de minería anónimo puede restablecerse borrando el identificador de operador del navegador.',
            `Para solicitar acceso, rectificación o supresión, escribe a ${LEGAL}. Respondemos en 30 días.`,
          ],
        },
        {
          heading: '5. Procesadores y transferencias',
          body: [
            'Kashier, Paymob, Supabase, Vercel y los proveedores públicos de RPC blockchain actúan como encargados o responsables independientes con la única finalidad de prestar el servicio.',
            'Cuando los datos salen de tu región, los protegen las garantías contractuales del procesador. No transferimos datos a quien no tenga base legal para recibirlos.',
          ],
        },
        {
          heading: '6. Cookies y almacenamiento local',
          body: [
            'Guardamos tu preferencia de idioma y tu identificador anónimo en el almacenamiento local. No se instala ninguna cookie publicitaria. Borrar los datos del sitio elimina ambos.',
          ],
        },
      ],
    },
    'refund-policy': {
      slug: 'refund-policy',
      eyebrow: 'Legal',
      title: 'Política de reembolso',
      intro:
        'Esta política explica cuándo puede revertirse un pago con tarjeta o cripto. Está escrita para leerse antes de pagar, no después de una disputa.',
      sections: [
        {
          heading: '1. Pagos con tarjeta',
          body: [
            'Un pago con tarjeta puede reembolsarse íntegramente en los 14 días siguientes a la liquidación si el nodo nunca se activó o el servicio estuvo materialmente indisponible. El reembolso vuelve a la tarjeta original a través de Kashier o Paymob.',
            'Una vez activado el nodo y consumido cómputo, la parte no utilizada del periodo actual puede reembolsarse a prorrata a nuestra discreción.',
          ],
        },
        {
          heading: '2. Pagos cripto',
          body: [
            'Las transferencias cripto son irreversibles on-chain. Un depósito verificado solo puede reembolsarse a la misma dirección tras la compensación, menos la comisión de red realmente pagada.',
            'Un depósito enviado a la red equivocada, o por debajo del mínimo publicado, puede ser irrecuperable. Copia siempre la dirección y la red desde la pantalla de pago.',
          ],
        },
        {
          heading: '3. Retiros de minería',
          body: [
            'Un retiro en cola puede cancelarse antes de la difusión. Una vez difundida la transacción, no puede revocarse. Una dirección mal formada se rechaza antes de difundir, no después.',
          ],
        },
        {
          heading: '4. Cómo solicitar un reembolso',
          body: [
            `Escribe a ${BILLING} con la referencia de transacción o sesión, el id del nodo y el motivo. No envíes números de tarjeta ni documentos de identidad.`,
            'Acusamos recibo en dos días hábiles y procuramos resolver en diez. Las retrofacturaciones abiertas sin contactarnos pueden retrasar la investigación.',
          ],
        },
        {
          heading: '5. Excepciones',
          body: [
            'No hay reembolso cuando la cuenta se usó para fraude, elusión de sanciones, abuso del programa de referidos o una retrofacturación ya resuelta por el emisor.',
          ],
        },
      ],
    },
    contact: {
      slug: 'contact',
      eyebrow: 'Soporte',
      title: 'Contacto',
      intro:
        'Una vía real hacia un equipo real. Elige la dirección que corresponde a tu pregunta para que llegue a la cola correcta al primer intento.',
      sections: [
        {
          heading: 'Atención al cliente',
          body: [
            `Activación de nodos, recompensas de minería, alta de doble factor y estado de retiros: ${SUPPORT}.`,
            'Incluye tu identificador anónimo de operador (visible en la página de recompensas) y la referencia de la transacción. Nunca envíes un número de tarjeta, una frase semilla o una clave privada.',
          ],
        },
        {
          heading: 'Facturación y reembolsos',
          body: [
            `Liquidación con tarjeta, facturas y solicitudes de reembolso: ${BILLING}.`,
            'Indica el importe, la moneda, la fecha y el procesador mostrado al pagar. Respondemos en dos días hábiles.',
          ],
        },
        {
          heading: 'Legal y privacidad',
          body: [
            `Términos, acceso a datos y solicitudes de supresión: ${LEGAL}.`,
            'Las solicitudes de privacidad se responden en 30 días. Las notificaciones legales deben identificar el documento y la cláusula en cuestión.',
          ],
        },
        {
          heading: 'Divulgación de seguridad',
          body: [
            `Reporta una vulnerabilidad de buena fe a ${SUPPORT} con el asunto «Security». No pruebes contra fondos reales ni la posición de otro operador.`,
            'Reconocemos los informes de buena fe y no perseguiremos a un investigador que respete el alcance descrito.',
          ],
        },
        {
          heading: 'Horario de respuesta',
          body: [
            'El soporte opera de domingo a jueves, 09:00–18:00 hora del Golfo. Los incidentes críticos de pago se monitorizan fuera de ese horario.',
          ],
        },
      ],
    },
  },
};

const ZH: LegalCopy = {
  nav: {
    terms: '服务条款',
    privacy: '隐私政策',
    refund: '退款政策',
    contact: '联系我们',
  },
  common: {
    updated: '最后更新',
    effective: '生效日期',
    backHome: '返回总览',
    backStore: '打开节点商城',
    supportEmail: SUPPORT,
    legalEmail: LEGAL,
    billingEmail: BILLING,
    company: 'MineAI Node',
  },
  docs: {
    terms: {
      slug: 'terms',
      eyebrow: '法律',
      title: '服务条款',
      intro:
        '本条款约束你对 MineAI Node、节点目录、云挖矿终端、行情面板和支付通道的使用。开立账户或支付节点即表示接受本条款。',
      sections: [
        {
          heading: '1. 服务内容',
          body: [
            'MineAI Node 提供去中心化算力网格、常驻智能体集群、多币种云挖矿终端与市场情报面板。不寄送硬件，也不向你收取电费。',
            '算力租自外部边缘容量。可用性是目标而非保证，计划维护会在现场笔记中公告。',
          ],
        },
        {
          heading: '2. 资格与账户',
          body: [
            '你须年满 18 岁且在所在司法辖区具备签约能力。你需对所提交的钱包地址、银行信息和联系邮箱的准确性负责。',
            '运营者标识按设计匿名。你需自行保护设备、双重验证密钥和恢复码。',
          ],
        },
        {
          heading: '3. 支付与结算',
          body: [
            '银行卡支付由 Kashier 或 Paymob 处理。卡片表单由支付机构托管；MineAI Node 从不接收或存储卡号、CVV 或完整有效期。',
            '加密货币支付直接结算至结账时公布的所有者钱包。只有在通过公共 RPC 验证交易哈希后才会入账。RPC 不可达时存款保持待处理，绝不乐观入账。',
            '价格以美元标价。本地银行卡通道可按支付前显示的汇率收取等值埃及镑。你的银行可能另收货币转换或跨境费用。',
          ],
        },
        {
          heading: '4. 挖矿奖励',
          body: [
            '挖矿奖励按分配至你持仓的算力累积，并受已公布的发行计划、VIP 倍数和连续签到倍数约束。奖励不是证券、存款或收益承诺。',
            '提现需提供所选网络的有效地址；启用后还需实时双重验证码。最低提现额与网络费用会在确认前显示。',
          ],
        },
        {
          heading: '5. 可接受使用',
          body: [
            '不得利用本服务洗钱、规避制裁、欺诈支付机构、攻击平台、以损害服务的方式抓取数据，或将挖矿奖励宣传为保本投资回报。',
            '当支付机构、银行或制裁名单要求，或存在合理欺诈嫌疑时，我们可暂停持仓、拒绝支付或冻结提现。',
          ],
        },
        {
          heading: '6. 责任与适用法律',
          body: [
            '服务按“可用”状态提供。在法律允许的最大范围内，MineAI Node 不对间接损失、利润损失、链上拥堵、支付机构故障或市场波动承担责任。',
            '本条款受阿拉伯联合酋长国法律管辖。争议首先通过联系页面进行善意协商。',
          ],
        },
      ],
    },
    privacy: {
      slug: 'privacy',
      eyebrow: '法律',
      title: '隐私政策',
      intro:
        '本政策说明 MineAI Node 收集什么、为何收集、存储于何处以及如何删除。我们仅收集运行服务和结算支付所必需的最少信息。',
      sections: [
        {
          heading: '1. 我们收集的信息',
          body: [
            '在浏览器中生成的匿名运营者标识、你选择的语言、你激活的节点，以及你为提现提交的公开钱包地址。',
            'Kashier 或 Paymob 返回的支付元数据：会话或交易参考号、金额、币种和状态。我们不接收卡号。',
            '技术日志：IP 地址、用户代理、请求路径和时间戳，用于限制滥用和调查欺诈。',
          ],
        },
        {
          heading: '2. 我们绝不收集的信息',
          body: [
            '我们不索取国民身份证号、护照扫描件、个人照片或银行 IBAN。所有者结算信息属于部署密钥，绝不会在浏览器中呈现。',
            '我们不出售个人数据，也不运行第三方广告追踪器。',
          ],
        },
        {
          heading: '3. 数据存储方式',
          body: [
            '应用记录保存在启用行级安全的 Supabase Postgres 中。双重验证密钥在写入数据库前以 AES-256-GCM 加密，仅服务器角色可读取密文。',
            '卡片数据保留在支付机构。加密验证使用公开链数据和公共 RPC；绝不索取私钥。',
          ],
        },
        {
          heading: '4. 保留期限与你的权利',
          body: [
            '支付与提现参考号按会计和反欺诈规则要求的期限保留。技术日志定期轮换。清除浏览器中的运营者标识即可重置匿名挖矿状态。',
            `如需访问、更正或删除，请致信 ${LEGAL}。我们将在 30 天内回复。`,
          ],
        },
        {
          heading: '5. 处理方与传输',
          body: [
            'Kashier、Paymob、Supabase、Vercel 和公共区块链 RPC 提供方仅以提供服务为目的，作为处理方或独立控制方行事。',
            '数据离开你所在地区时，受处理方的合同保障保护。我们不会将数据传输给无合法依据接收的第三方。',
          ],
        },
        {
          heading: '6. Cookie 与本地存储',
          body: [
            '我们在本地存储中保存语言偏好和匿名运营者标识。不设置广告 Cookie。清除站点数据即可同时删除两者。',
          ],
        },
      ],
    },
    'refund-policy': {
      slug: 'refund-policy',
      eyebrow: '法律',
      title: '退款政策',
      intro:
        '本政策说明银行卡或加密货币支付何时可以撤销。它写于支付之前，而非争议之后。',
      sections: [
        {
          heading: '1. 银行卡支付',
          body: [
            '若节点从未激活或服务实质不可用，银行卡支付可在结算后 14 天内全额退款。退款经 Kashier 或 Paymob 退回原卡。',
            '节点激活且算力已消耗后，当前计费周期的未使用部分可由我们酌情按比例退款。',
          ],
        },
        {
          heading: '2. 加密货币支付',
          body: [
            '加密货币转账在链上不可逆。已核验的存款只能在资金清算后原路退回同一地址，并扣除实际支付的网络费用。',
            '发送至错误网络或低于公布最低额的存款可能无法追回。请始终从结账页面复制地址和网络。',
          ],
        },
        {
          heading: '3. 挖矿提现',
          body: [
            '排队中的提现可在广播前取消。交易一旦广播便无法召回。格式错误的地址会在广播前而非广播后被拒绝。',
          ],
        },
        {
          heading: '4. 如何申请退款',
          body: [
            `请致信 ${BILLING}，附上交易或会话参考号、节点 ID 和原因。请勿发送卡号或身份证件。`,
            '我们在两个工作日内确认，并力争十天内解决。未先联系我们而发起的拒付可能延误调查。',
          ],
        },
        {
          heading: '5. 例外',
          body: [
            '若账户被用于欺诈、规避制裁、滥用推荐计划，或拒付已由发卡行裁定，则不予退款。',
          ],
        },
      ],
    },
    contact: {
      slug: 'contact',
      eyebrow: '支持',
      title: '联系我们',
      intro:
        '通往真实团队的真实渠道。请选择与你的问题匹配的地址，以便首次即进入正确的队列。',
      sections: [
        {
          heading: '客户支持',
          body: [
            `节点激活、挖矿奖励、双重验证开通与提现状态：${SUPPORT}。`,
            '请附上匿名运营者标识（见奖励页面）和相关交易参考号。切勿发送卡号、助记词或私钥。',
          ],
        },
        {
          heading: '账单与退款',
          body: [
            `银行卡结算、发票与退款申请：${BILLING}。`,
            '请注明金额、币种、日期及结账页面显示的支付机构。我们将在两个工作日内回复。',
          ],
        },
        {
          heading: '法律与隐私',
          body: [
            `条款、数据访问与删除请求：${LEGAL}。`,
            '隐私请求将在 30 天内答复。法律通知应指明所涉文件与条款。',
          ],
        },
        {
          heading: '安全披露',
          body: [
            `请以“Security”为主题，将漏洞负责任地报告至 ${SUPPORT}。请勿针对真实资金或其他运营者的持仓进行测试。`,
            '我们认可善意报告，不会追究遵守报告所述范围的研究者。',
          ],
        },
        {
          heading: '响应时间',
          body: [
            '支持团队工作时间为周日至周四 09:00–18:00（海湾标准时间）。关键支付事件在上述时间外亦有监控。',
          ],
        },
      ],
    },
  },
};

const HI: LegalCopy = {
  nav: {
    terms: 'सेवा की शर्तें',
    privacy: 'गोपनीयता नीति',
    refund: 'धनवापसी नीति',
    contact: 'संपर्क',
  },
  common: {
    updated: 'अंतिम अद्यतन',
    effective: 'प्रभावी तिथि',
    backHome: 'अवलोकन पर लौटें',
    backStore: 'नोड स्टोर खोलें',
    supportEmail: SUPPORT,
    legalEmail: LEGAL,
    billingEmail: BILLING,
    company: 'MineAI Node',
  },
  docs: {
    terms: {
      slug: 'terms',
      eyebrow: 'कानूनी',
      title: 'सेवा की शर्तें',
      intro:
        'ये शर्तें MineAI Node, इसके नोड कैटलॉग, क्लाउड-माइनिंग टर्मिनल, मार्केट बोर्ड और भुगतान रेल के आपके उपयोग को नियंत्रित करती हैं। खाता खोलने या नोड का भुगतान करने पर आप इन्हें स्वीकार करते हैं।',
      sections: [
        {
          heading: '1. सेवा',
          body: [
            'MineAI Node विकेंद्रीकृत कंप्यूट मेश, स्थायी एजेंट झुंड, बहु-सिक्का क्लाउड-माइनिंग टर्मिनल और मार्केट-इंटेलिजेंस बोर्ड प्रदान करता है। कोई हार्डवेयर नहीं भेजा जाता और आपसे बिजली का बिल नहीं लिया जाता।',
            'कंप्यूट बाहरी एज क्षमता से किराए पर लिया जाता है। उपलब्धता लक्ष्य है, गारंटी नहीं, और रखरखाव की सूचना फील्ड नोट्स में दी जाती है।',
          ],
        },
        {
          heading: '2. पात्रता और खाते',
          body: [
            'आपकी आयु कम से कम 18 वर्ष होनी चाहिए और आप अपने क्षेत्राधिकार में अनुबंध करने में सक्षम होने चाहिए। वॉलेट पता, बैंक विवरण और संपर्क ईमेल की सटीकता की जिम्मेदारी आपकी है।',
            'ऑपरेटर आईडी डिज़ाइन से अनाम हैं। अपने डिवाइस, दो-कारक रहस्य और रिकवरी कोड की सुरक्षा आपकी जिम्मेदारी है।',
          ],
        },
        {
          heading: '3. भुगतान और निपटान',
          body: [
            'कार्ड भुगतान Kashier या Paymob द्वारा संसाधित होते हैं। कार्ड फ़ॉर्म प्रोसेसर होस्ट करता है; MineAI Node कभी कार्ड नंबर, CVV या पूर्ण समाप्ति तिथि प्राप्त या संग्रहीत नहीं करता।',
            'क्रिप्टो भुगतान सीधे चेकआउट पर प्रकाशित ओनर वॉलेट में निपटाए जाते हैं। लेन-देन हैश सार्वजनिक RPC से सत्यापित होने के बाद ही जमा श्रेय दिया जाता है। RPC अनुपलब्ध होने पर जमा लंबित रहता है; कभी अनुमान से श्रेय नहीं दिया जाता।',
            'कीमतें अमेरिकी डॉलर में हैं। स्थानीय कार्ड रेल भुगतान से पहले दिखाई गई दर पर मिस्री पाउंड में समतुल्य शुल्क ले सकते हैं। आपका बैंक अपना रूपांतरण या सीमा-पार शुल्क लगा सकता है।',
          ],
        },
        {
          heading: '4. माइनिंग पुरस्कार',
          body: [
            'माइनिंग पुरस्कार आपकी स्थिति को आवंटित हैशरेट के अनुसार अर्जित होते हैं और प्रकाशित उत्सर्जन अनुसूची, VIP गुणक और स्ट्रीक गुणक के अधीन हैं। ये प्रतिभूति, जमा या लाभ का वादा नहीं हैं।',
            'निकासी के लिए चयनित नेटवर्क का वैध पता और, नामांकन के बाद, लाइव दो-कारक कोड आवश्यक है। पुष्टि से पहले न्यूनतम और नेटवर्क शुल्क दिखाया जाता है।',
          ],
        },
        {
          heading: '5. स्वीकार्य उपयोग',
          body: [
            'आप सेवा का उपयोग धनशोधन, प्रतिबंधों की चोरी, प्रोसेसर से धोखाधड़ी, प्लेटफ़ॉर्म पर हमला, सेवा को प्रभावित करने वाली दर पर स्क्रैपिंग, या माइनिंग पुरस्कार को गारंटीकृत निवेश रिटर्न बताने के लिए नहीं कर सकते।',
            'जब प्रोसेसर, बैंक या प्रतिबंध सूची की आवश्यकता हो, या धोखाधड़ी का उचित संदेह हो, तो हम स्थिति निलंबित, भुगतान अस्वीकार या निकासी फ़्रीज़ कर सकते हैं।',
          ],
        },
        {
          heading: '6. दायित्व और लागू कानून',
          body: [
            'सेवा “जैसी उपलब्ध हो” प्रदान की जाती है। कानून द्वारा अनुमत अधिकतम सीमा तक, MineAI Node अप्रत्यक्ष हानि, खोए लाभ, चेन भीड़, प्रोसेसर डाउनटाइम या बाजार गतिविधि के लिए उत्तरदायी नहीं है।',
            'ये शर्तें संयुक्त अरब अमीरात के कानूनों द्वारा शासित हैं। विवाद पहले संपर्क पृष्ठ के माध्यम से सद्भावना वार्ता में भेजे जाते हैं।',
          ],
        },
      ],
    },
    privacy: {
      slug: 'privacy',
      eyebrow: 'कानूनी',
      title: 'गोपनीयता नीति',
      intro:
        'यह नीति बताती है कि MineAI Node क्या एकत्र करता है, क्यों, कहाँ संग्रहीत करता है और आप इसे कैसे हटा सकते हैं। हम सेवा चलाने और भुगतान निपटाने के लिए न्यूनतम आवश्यक डेटा एकत्र करते हैं।',
      sections: [
        {
          heading: '1. हम क्या एकत्र करते हैं',
          body: [
            'आपके ब्राउज़र में बनाई गई अनाम ऑपरेटर आईडी, आपकी चुनी भाषा, आपके द्वारा सक्रिय किया गया नोड और निकासी के लिए दिया गया सार्वजनिक वॉलेट पता।',
            'Kashier या Paymob द्वारा लौटाया गया भुगतान मेटाडेटा: सत्र या लेन-देन संदर्भ, राशि, मुद्रा और स्थिति। हमें कार्ड नंबर नहीं मिलते।',
            'तकनीकी लॉग: IP पता, यूज़र एजेंट, अनुरोध पथ और समय, दुरुपयोग सीमित करने और धोखाधड़ी जाँचने के लिए।',
          ],
        },
        {
          heading: '2. हम कभी क्या एकत्र नहीं करते',
          body: [
            'हम राष्ट्रीय पहचान संख्या, पासपोर्ट स्कैन, व्यक्तिगत फ़ोटो या बैंक IBAN नहीं माँगते। ओनर निपटान विवरण डिप्लॉयमेंट रहस्य हैं और ब्राउज़र में कभी नहीं दिखाए जाते।',
            'हम व्यक्तिगत डेटा नहीं बेचते और तृतीय-पक्ष विज्ञापन ट्रैकर नहीं चलाते।',
          ],
        },
        {
          heading: '3. डेटा कैसे संग्रहीत होता है',
          body: [
            'एप्लिकेशन रिकॉर्ड Supabase Postgres में Row Level Security सक्षम के साथ रहते हैं। दो-कारक रहस्य डेटाबेस तक पहुँचने से पहले AES-256-GCM से सील किए जाते हैं; सिफरटेक्स्ट केवल सर्वर भूमिका पढ़ सकती है।',
            'कार्ड डेटा प्रोसेसर के पास रहता है। क्रिप्टो सत्यापन सार्वजनिक चेन डेटा और सार्वजनिक RPC का उपयोग करता है; निजी कुंजी कभी नहीं माँगी जाती।',
          ],
        },
        {
          heading: '4. प्रतिधारण और आपके अधिकार',
          body: [
            'भुगतान और निकासी संदर्भ लेखांकन और धोखाधड़ी-रोधी नियमों की अवधि तक रखे जाते हैं। तकनीकी लॉग नियमित रूप से बदले जाते हैं। ब्राउज़र में ऑपरेटर आईडी साफ़ करके अनाम माइनिंग स्थिति रीसेट की जा सकती है।',
            `पहुँच, सुधार या विलोपन का अनुरोध करने के लिए ${LEGAL} पर लिखें। हम 30 दिनों में उत्तर देते हैं।`,
          ],
        },
        {
          heading: '5. प्रोसेसर और स्थानांतरण',
          body: [
            'Kashier, Paymob, Supabase, Vercel और सार्वजनिक ब्लॉकचेन RPC प्रदाता केवल सेवा देने के उद्देश्य से प्रोसेसर या स्वतंत्र नियंत्रक के रूप में कार्य करते हैं।',
            'जहाँ डेटा आपके क्षेत्र से बाहर जाता है, वहाँ प्रोसेसर की संविदात्मक सुरक्षा लागू होती है। हम ऐसे पक्ष को डेटा नहीं भेजते जिसके पास प्राप्त करने का वैध आधार न हो।',
          ],
        },
        {
          heading: '6. कुकीज़ और स्थानीय संग्रहण',
          body: [
            'हम आपकी भाषा प्राथमिकता और अनाम ऑपरेटर आईडी स्थानीय संग्रहण में रखते हैं। कोई विज्ञापन कुकी सेट नहीं होती। साइट डेटा साफ़ करने पर दोनों हट जाते हैं।',
          ],
        },
      ],
    },
    'refund-policy': {
      slug: 'refund-policy',
      eyebrow: 'कानूनी',
      title: 'धनवापसी नीति',
      intro:
        'यह नीति बताती है कि कार्ड या क्रिप्टो भुगतान कब उलटा जा सकता है। इसे भुगतान से पहले पढ़ने के लिए लिखा गया है, विवाद के बाद नहीं।',
      sections: [
        {
          heading: '1. कार्ड भुगतान',
          body: [
            'यदि नोड कभी सक्रिय नहीं हुआ या सेवा materially अनुपलब्ध रही, तो निपटान के 14 दिनों के भीतर कार्ड भुगतान पूर्ण रूप से वापस किया जा सकता है। धनवापसी Kashier या Paymob के माध्यम से मूल कार्ड पर लौटती है।',
            'नोड सक्रिय होने और कंप्यूट उपभोग के बाद, वर्तमान बिलिंग अवधि का अप्रयुक्त भाग हमारे विवेक से आनुपातिक रूप से वापस किया जा सकता है।',
          ],
        },
        {
          heading: '2. क्रिप्टो भुगतान',
          body: [
            'क्रिप्टो स्थानांतरण ऑन-चेन अपरिवर्तनीय हैं। सत्यापित जमा केवल उसी पते पर, धन निपटान के बाद, वास्तव में भुगतान किए गए नेटवर्क शुल्क घटाकर वापस किया जा सकता है।',
            'गलत नेटवर्क पर या प्रकाशित न्यूनतम से कम भेजा गया जमा वसूली योग्य नहीं हो सकता। चेकआउट स्क्रीन से पता और नेटवर्क हमेशा कॉपी करें।',
          ],
        },
        {
          heading: '3. माइनिंग निकासी',
          body: [
            'कतार में लगी निकासी प्रसारण से पहले रद्द की जा सकती है। लेन-देन प्रसारित होने के बाद उसे वापस नहीं बुलाया जा सकता। गलत स्वरूप वाला पता प्रसारण से पहले अस्वीकार होता है, बाद में नहीं।',
          ],
        },
        {
          heading: '4. धनवापसी कैसे माँगें',
          body: [
            `लेन-देन या सत्र संदर्भ, नोड आईडी और कारण के साथ ${BILLING} पर लिखें। कार्ड नंबर या पहचान दस्तावेज़ न भेजें।`,
            'हम दो कार्यदिवसों में पुष्टि करते हैं और दस में समाधान का लक्ष्य रखते हैं। हमसे संपर्क किए बिना शुरू किया गया चार्जबैक जाँच में देरी कर सकता है।',
          ],
        },
        {
          heading: '5. अपवाद',
          body: [
            'जहाँ खाते का उपयोग धोखाधड़ी, प्रतिबंध चोरी, रेफ़रल कार्यक्रम के दुरुपयोग या जारीकर्ता द्वारा तय चार्जबैक के लिए हुआ हो, वहाँ धनवापसी उपलब्ध नहीं है।',
          ],
        },
      ],
    },
    contact: {
      slug: 'contact',
      eyebrow: 'सहायता',
      title: 'संपर्क',
      intro:
        'वास्तविक टीम तक वास्तविक मार्ग। अपने प्रश्न से मेल खाता पता चुनें ताकि वह पहली बार में सही कतार तक पहुँचे।',
      sections: [
        {
          heading: 'ग्राहक सहायता',
          body: [
            `नोड सक्रियण, माइनिंग पुरस्कार, दो-कारक नामांकन और निकासी स्थिति: ${SUPPORT}।`,
            'अपनी अनाम ऑपरेटर आईडी (रिवॉर्ड पृष्ठ पर दिखती है) और संबंधित लेन-देन संदर्भ शामिल करें। कभी कार्ड नंबर, सीड वाक्यांश या निजी कुंजी न भेजें।',
          ],
        },
        {
          heading: 'बिलिंग और धनवापसी',
          body: [
            `कार्ड निपटान, चालान और धनवापसी अनुरोध: ${BILLING}।`,
            'राशि, मुद्रा, तिथि और चेकआउट स्क्रीन पर दिखाया गया प्रोसेसर बताएं। हम दो कार्यदिवसों में उत्तर देते हैं।',
          ],
        },
        {
          heading: 'कानूनी और गोपनीयता',
          body: [
            `शर्तें, डेटा पहुँच और विलोपन अनुरोध: ${LEGAL}।`,
            'गोपनीयता अनुरोधों का उत्तर 30 दिनों में दिया जाता है। कानूनी सूचनाओं में दस्तावेज़ और विवादित खंड स्पष्ट होना चाहिए।',
          ],
        },
        {
          heading: 'सुरक्षा प्रकटीकरण',
          body: [
            `“Security” विषय के साथ ${SUPPORT} पर जिम्मेदारी से भेद्यता की रिपोर्ट करें। लाइव धन या किसी अन्य ऑपरेटर की स्थिति पर परीक्षण न करें।`,
            'हम सद्भावना रिपोर्ट स्वीकार करते हैं और रिपोर्ट में बताए दायरे में रहने वाले शोधकर्ता का पीछा नहीं करेंगे।',
          ],
        },
        {
          heading: 'प्रतिक्रिया समय',
          body: [
            'सहायता रविवार से गुरुवार, 09:00–18:00 खाड़ी मानक समय तक उपलब्ध है। गंभीर भुगतान घटनाओं की निगरानी उस समय के बाहर भी होती है।',
          ],
        },
      ],
    },
  },
};

const COPY: Record<SupportedLanguage, LegalCopy> = {
  en: EN,
  ar: AR,
  fr: FR,
  es: ES,
  zh: ZH,
  hi: HI,
};

export function getLegalCopy(lang: SupportedLanguage): LegalCopy {
  return COPY[lang] ?? COPY[DEFAULT_LANGUAGE];
}

export const LEGAL_SLUGS: LegalSlug[] = ['terms', 'privacy', 'refund-policy', 'contact'];

export const LEGAL_UPDATED = '2026-11-16';
