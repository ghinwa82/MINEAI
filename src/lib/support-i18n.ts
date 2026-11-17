import type { SupportedLanguage } from '@/types';

/**
 * The 24/7 support agent.
 *
 * Answers are deterministic so the assistant works on a cold serverless
 * instance with no model key and never invents a fee, a wallet or a promise.
 * Every reply is plain language in the visitor's own locale and ends by
 * pointing at a human channel for anything the bot must not decide.
 */

export type SupportIntent =
  | 'hello'
  | 'register'
  | 'mining'
  | 'plans'
  | 'payment'
  | 'withdraw'
  | 'security'
  | 'referral'
  | 'human'
  | 'fallback';

export interface SupportAnswer {
  intent: SupportIntent;
  reply: string;
  suggestions: string[];
}

type Copy = {
  title: string;
  lead: string;
  placeholder: string;
  send: string;
  thinking: string;
  disclaimer: string;
  topics: Record<'register' | 'mining' | 'plans' | 'payment' | 'withdraw' | 'security', string>;
  answers: Record<SupportIntent, string>;
  suggestions: string[];
  widget: { open: string; close: string; title: string };
  page: {
    eyebrow: string;
    title: string;
    lead: string;
    channelsTitle: string;
    channelsLead: string;
    supportLabel: string;
    billingLabel: string;
    privacyLabel: string;
    topicsTitle: string;
  };
};

const COPY: Record<SupportedLanguage, Copy> = {
  en: {
    title: '24/7 support assistant',
    lead: 'Ask anything about signing up, mining, plans, payments or withdrawals. Answers are in simple words, any time of day.',
    placeholder: 'Type your question',
    send: 'Send',
    thinking: 'Thinking',
    disclaimer: 'This assistant explains how the platform works. It never asks for a password, a seed phrase, a card number or a private key.',
    topics: {
      register: 'Create an account',
      mining: 'How mining works',
      plans: 'Plans and prices',
      payment: 'Pay by card or crypto',
      withdraw: 'Withdraw to wallet',
      security: 'Password and 2FA',
    },
    answers: {
      hello:
        'Hello. I can help you sign up, start mining, choose a plan, pay, withdraw, or secure your account. What would you like to do first?',
      register:
        'Creating an account takes a minute. Open Register, enter your email and a password of at least 8 characters, then confirm the six-digit code shown on screen. No documents are needed to start on the free plan.',
      mining:
        'Cloud mining means our servers do the work, so you use no electricity and no hardware. Your dashboard shows your speed in MH/s, the coins you mined and the USD value. You can split your power across $MINEAI, BTC, ETH, SOL, BNB, TON, DOGE and LTC.',
      plans:
        'There are five plans: Genesis is free forever, Node v1 is $29.99, Pro v2 is $99.99 and most popular, Elite v3 is $299.99, and Sovereign v4 is $799.99. Each paid plan adds more cloud power and a higher $MINEAI bonus. The home page calculator shows a daily estimate before you pay.',
      payment:
        'You can pay by Visa or Mastercard through Kashier or Paymob in USD or EGP, or send crypto directly to the wallet shown at checkout with a 0% platform fee. Card data stays with the payment provider. Your plan unlocks after the payment is confirmed.',
      withdraw:
        'Open the mining dashboard, choose the coin and network, paste your own wallet address, then confirm. Every payout moves from Pending to Processing to Sent, and the final step shows the on-chain transaction hash you can check in a block explorer.',
      security:
        'Use a long password you do not reuse elsewhere, and turn on two-factor authentication in the security page. Five wrong logins lock the account for 15 minutes. We never ask for your password, seed phrase or private key, and support will never request them.',
      referral:
        'Open Rewards and copy your invite link. When a friend joins, you earn a share of their rewards. The share rises as you invite more people: Bronze 5%, Silver 8%, Gold 12% and Diamond 15%.',
      human:
        'If you need a person, write to support@mineai.network with your operator id. Billing goes to billing@mineai.network and privacy requests to legal@mineai.network. Never include a password, seed phrase or card number.',
      fallback:
        'I did not catch that. You can ask about creating an account, how mining works, plans and prices, paying by card or crypto, withdrawing to your wallet, or password and 2FA.',
    },
    suggestions: ['Create an account', 'How mining works', 'Withdraw to wallet'],
    widget: { open: 'Need help?', close: 'Close help', title: '24/7 help' },
    page: {
      eyebrow: 'Help centre',
      title: 'We are here any time of day',
      lead: 'Ask the assistant about signing up, mining, plans, payments or withdrawals. It answers in simple words, in your language, at any hour.',
      channelsTitle: 'Talk to a person',
      channelsLead:
        'For anything the assistant cannot decide — a payment, a refund or your account — write to the right inbox. Never send a password, a seed phrase or a card number.',
      supportLabel: 'General help',
      billingLabel: 'Billing and refunds',
      privacyLabel: 'Privacy requests',
      topicsTitle: 'What you can ask',
    },
  },
  ar: {
    title: 'مساعد الدعم على مدار الساعة',
    lead: 'اسأل عن التسجيل أو التعدين أو الخطط أو الدفع أو السحب. الإجابات بكلمات بسيطة في أي وقت.',
    placeholder: 'اكتب سؤالك',
    send: 'إرسال',
    thinking: 'جارٍ التفكير',
    disclaimer: 'هذا المساعد يشرح كيف تعمل المنصة فقط. لا يطلب كلمة مرور أو عبارة استرداد أو رقم بطاقة أو مفتاحًا خاصًا.',
    topics: {
      register: 'إنشاء حساب',
      mining: 'كيف يعمل التعدين',
      plans: 'الخطط والأسعار',
      payment: 'الدفع بالبطاقة أو العملات',
      withdraw: 'السحب إلى المحفظة',
      security: 'كلمة المرور والتحقق بخطوتين',
    },
    answers: {
      hello:
        'مرحبًا. أستطيع مساعدتك في التسجيل أو بدء التعدين أو اختيار خطة أو الدفع أو السحب أو تأمين حسابك. ما الذي تريد فعله أولًا؟',
      register:
        'إنشاء الحساب يستغرق دقيقة. افتح صفحة التسجيل، أدخل بريدك وكلمة مرور من 8 أحرف على الأقل، ثم أكّد الرمز المكوّن من ستة أرقام الظاهر على الشاشة. لا تحتاج إلى أي مستندات للبدء بالخطة المجانية.',
      mining:
        'التعدين السحابي يعني أن خوادمنا تقوم بالعمل، فلا تستهلك كهرباء ولا أجهزة. لوحتك تعرض سرعتك بوحدة MH/s والعملات التي عدّنتها وقيمتها بالدولار. يمكنك توزيع قوتك بين $MINEAI وBTC وETH وSOL وBNB وTON وDOGE وLTC.',
      plans:
        'هناك خمس خطط: Genesis مجانية دائمًا، وNode v1 بسعر 29.99 دولارًا، وPro v2 بسعر 99.99 دولارًا وهي الأكثر اختيارًا، وElite v3 بسعر 299.99 دولارًا، وSovereign v4 بسعر 799.99 دولارًا. كل خطة مدفوعة تضيف قوة سحابية أكبر ومكافأة $MINEAI أعلى. حاسبة الصفحة الرئيسية تعرض تقديرًا يوميًا قبل الدفع.',
      payment:
        'يمكنك الدفع ببطاقة Visa أو Mastercard عبر Kashier أو Paymob بالدولار أو الجنيه المصري، أو إرسال العملات الرقمية مباشرة إلى المحفظة المعروضة عند الدفع بدون رسوم منصة. بيانات البطاقة تبقى لدى مزوّد الدفع. تُفتح خطتك بعد تأكيد الدفع.',
      withdraw:
        'افتح لوحة التعدين، اختر العملة والشبكة، والصق عنوان محفظتك الشخصية، ثم أكّد. كل عملية سحب تنتقل من قيد الانتظار إلى قيد المعالجة إلى تم الإرسال، وتظهر في الخطوة الأخيرة بصمة المعاملة على الشبكة لتتحقق منها في مستكشف الكتل.',
      security:
        'استخدم كلمة مرور طويلة لا تعيد استخدامها في مكان آخر، وفعّل التحقق بخطوتين من صفحة الأمان. خمس محاولات دخول خاطئة تقفل الحساب 15 دقيقة. لا نطلب كلمة المرور أو عبارة الاسترداد أو المفتاح الخاص أبدًا، ولن يطلبها الدعم.',
      referral:
        'افتح صفحة المكافآت وانسخ رابط الدعوة. عندما ينضم صديق تكسب نسبة من مكافآته. ترتفع النسبة كلما دعوت أكثر: برونزي 5%، فضي 8%، ذهبي 12%، ماسي 15%.',
      human:
        'إذا احتجت إلى شخص، اكتب إلى support@mineai.network مع معرّف المشغّل. الفواتير إلى billing@mineai.network وطلبات الخصوصية إلى legal@mineai.network. لا تُدرج كلمة مرور أو عبارة استرداد أو رقم بطاقة.',
      fallback:
        'لم أفهم ذلك. يمكنك السؤال عن إنشاء حساب، أو كيف يعمل التعدين، أو الخطط والأسعار، أو الدفع بالبطاقة أو العملات، أو السحب إلى محفظتك، أو كلمة المرور والتحقق بخطوتين.',
    },
    suggestions: ['إنشاء حساب', 'كيف يعمل التعدين', 'السحب إلى المحفظة'],
    widget: { open: 'تحتاج مساعدة؟', close: 'إغلاق المساعدة', title: 'مساعدة على مدار الساعة' },
    page: {
      eyebrow: 'مركز المساعدة',
      title: 'نحن هنا في أي وقت',
      lead: 'اسأل المساعد عن التسجيل أو التعدين أو الخطط أو الدفع أو السحب. يجيب بكلمات بسيطة وبلغتك وفي أي ساعة.',
      channelsTitle: 'تحدث إلى شخص',
      channelsLead:
        'لأي أمر لا يستطيع المساعد حسمه — دفعة أو استرداد أو حسابك — اكتب إلى البريد المناسب. لا ترسل كلمة مرور أو عبارة استرداد أو رقم بطاقة.',
      supportLabel: 'مساعدة عامة',
      billingLabel: 'الفواتير والاسترداد',
      privacyLabel: 'طلبات الخصوصية',
      topicsTitle: 'ما يمكنك السؤال عنه',
    },
  },
  fr: {
    title: 'Assistant d’aide 24 h/24',
    lead: 'Posez une question sur l’inscription, le minage, les offres, le paiement ou le retrait. Des réponses simples, à toute heure.',
    placeholder: 'Écrivez votre question',
    send: 'Envoyer',
    thinking: 'Réflexion',
    disclaimer: 'Cet assistant explique le fonctionnement de la plateforme. Il ne demande jamais de mot de passe, de phrase de récupération, de numéro de carte ni de clé privée.',
    topics: {
      register: 'Créer un compte',
      mining: 'Comment ça marche',
      plans: 'Offres et prix',
      payment: 'Payer par carte ou crypto',
      withdraw: 'Retirer vers un portefeuille',
      security: 'Mot de passe et 2FA',
    },
    answers: {
      hello:
        'Bonjour. Je peux vous aider à vous inscrire, démarrer le minage, choisir une offre, payer, retirer, ou sécuriser votre compte. Que voulez-vous faire en premier ?',
      register:
        'Créer un compte prend une minute. Ouvrez Inscription, saisissez votre email et un mot de passe d’au moins 8 caractères, puis confirmez le code à six chiffres affiché. Aucun document n’est demandé pour l’offre gratuite.',
      mining:
        'Le minage cloud signifie que nos serveurs travaillent : pas d’électricité ni de matériel chez vous. Votre tableau de bord affiche la vitesse en MH/s, les pièces minées et leur valeur en USD. Vous pouvez répartir votre puissance entre $MINEAI, BTC, ETH, SOL, BNB, TON, DOGE et LTC.',
      plans:
        'Il y a cinq offres : Genesis est gratuite à vie, Node v1 coûte 29,99 $, Pro v2 coûte 99,99 $ et est la plus choisie, Elite v3 coûte 299,99 $ et Sovereign v4 coûte 799,99 $. Chaque offre payante ajoute de la puissance cloud et un bonus $MINEAI plus élevé. Le calculateur de l’accueil montre une estimation avant paiement.',
      payment:
        'Vous pouvez payer par Visa ou Mastercard via Kashier ou Paymob en USD ou EGP, ou envoyer de la crypto directement au portefeuille affiché au paiement avec 0 % de frais de plateforme. Les données de carte restent chez le prestataire. Votre offre s’active après confirmation.',
      withdraw:
        'Ouvrez le tableau de minage, choisissez la pièce et le réseau, collez votre propre adresse, puis confirmez. Chaque retrait passe de En attente à En traitement à Envoyé, et la dernière étape affiche le hash de transaction à vérifier dans un explorateur.',
      security:
        'Utilisez un mot de passe long et unique, et activez la double authentification depuis la page sécurité. Cinq échecs de connexion bloquent le compte 15 minutes. Nous ne demandons jamais mot de passe, phrase de récupération ni clé privée, et le support non plus.',
      referral:
        'Ouvrez Récompenses et copiez votre lien d’invitation. Quand un ami s’inscrit, vous gagnez une part de ses récompenses. La part augmente avec les invitations : Bronze 5 %, Argent 8 %, Or 12 %, Diamant 15 %.',
      human:
        'Pour joindre une personne, écrivez à support@mineai.network avec votre identifiant. La facturation va à billing@mineai.network et la confidentialité à legal@mineai.network. N’incluez jamais mot de passe, phrase de récupération ou numéro de carte.',
      fallback:
        'Je n’ai pas compris. Vous pouvez demander comment créer un compte, comment fonctionne le minage, les offres et prix, le paiement par carte ou crypto, le retrait vers votre portefeuille, ou le mot de passe et la 2FA.',
    },
    suggestions: ['Créer un compte', 'Comment ça marche', 'Retirer vers un portefeuille'],
    widget: { open: 'Besoin d’aide ?', close: 'Fermer l’aide', title: 'Aide 24 h/24' },
    page: {
      eyebrow: 'Centre d’aide',
      title: 'Nous sommes là à toute heure',
      lead: 'Interrogez l’assistant sur l’inscription, le minage, les offres, le paiement ou les retraits. Il répond simplement, dans votre langue, à toute heure.',
      channelsTitle: 'Parler à une personne',
      channelsLead:
        'Pour ce que l’assistant ne peut pas décider — un paiement, un remboursement ou votre compte — écrivez à la bonne adresse. N’envoyez jamais mot de passe, phrase de récupération ni numéro de carte.',
      supportLabel: 'Aide générale',
      billingLabel: 'Facturation et remboursements',
      privacyLabel: 'Demandes de confidentialité',
      topicsTitle: 'Ce que vous pouvez demander',
    },
  },
  es: {
    title: 'Asistente de ayuda 24/7',
    lead: 'Pregunta sobre el registro, la minería, los planes, los pagos o los retiros. Respuestas sencillas a cualquier hora.',
    placeholder: 'Escribe tu pregunta',
    send: 'Enviar',
    thinking: 'Pensando',
    disclaimer: 'Este asistente explica cómo funciona la plataforma. Nunca pide contraseña, frase de recuperación, número de tarjeta ni clave privada.',
    topics: {
      register: 'Crear una cuenta',
      mining: 'Cómo funciona',
      plans: 'Planes y precios',
      payment: 'Pagar con tarjeta o cripto',
      withdraw: 'Retirar a la cartera',
      security: 'Contraseña y 2FA',
    },
    answers: {
      hello:
        'Hola. Puedo ayudarte a registrarte, empezar a minar, elegir un plan, pagar, retirar o proteger tu cuenta. ¿Qué quieres hacer primero?',
      register:
        'Crear una cuenta tarda un minuto. Abre Registro, escribe tu correo y una contraseña de al menos 8 caracteres, y confirma el código de seis dígitos que aparece en pantalla. No necesitas documentos para el plan gratis.',
      mining:
        'La minería en la nube significa que nuestros servidores trabajan: no usas electricidad ni equipos. Tu panel muestra la velocidad en MH/s, las monedas minadas y su valor en USD. Puedes repartir tu potencia entre $MINEAI, BTC, ETH, SOL, BNB, TON, DOGE y LTC.',
      plans:
        'Hay cinco planes: Genesis es gratis para siempre, Node v1 cuesta $29.99, Pro v2 cuesta $99.99 y es el más elegido, Elite v3 cuesta $299.99 y Sovereign v4 cuesta $799.99. Cada plan de pago añade más potencia y un bono $MINEAI mayor. La calculadora de la página principal muestra una estimación antes de pagar.',
      payment:
        'Puedes pagar con Visa o Mastercard mediante Kashier o Paymob en USD o EGP, o enviar cripto directamente a la cartera que se muestra al pagar con 0% de comisión. Los datos de la tarjeta se quedan con el proveedor. Tu plan se activa al confirmar el pago.',
      withdraw:
        'Abre el panel de minería, elige la moneda y la red, pega tu propia dirección de cartera y confirma. Cada retiro pasa de Pendiente a Procesando a Enviado, y el último paso muestra el hash de la transacción para revisarlo en un explorador.',
      security:
        'Usa una contraseña larga que no reutilices y activa la verificación en dos pasos en la página de seguridad. Cinco intentos fallidos bloquean la cuenta 15 minutos. Nunca pedimos contraseña, frase de recuperación ni clave privada, y el soporte tampoco.',
      referral:
        'Abre Recompensas y copia tu enlace de invitación. Cuando un amigo se une, ganas una parte de sus recompensas. La parte sube con más invitaciones: Bronce 5%, Plata 8%, Oro 12%, Diamante 15%.',
      human:
        'Si necesitas a una persona, escribe a support@mineai.network con tu identificador. Facturación va a billing@mineai.network y privacidad a legal@mineai.network. Nunca incluyas contraseña, frase de recuperación ni número de tarjeta.',
      fallback:
        'No lo entendí. Puedes preguntar cómo crear una cuenta, cómo funciona la minería, planes y precios, pagar con tarjeta o cripto, retirar a tu cartera, o contraseña y 2FA.',
    },
    suggestions: ['Crear una cuenta', 'Cómo funciona', 'Retirar a la cartera'],
    widget: { open: '¿Necesitas ayuda?', close: 'Cerrar ayuda', title: 'Ayuda 24/7' },
    page: {
      eyebrow: 'Centro de ayuda',
      title: 'Estamos aquí a cualquier hora',
      lead: 'Pregunta al asistente por el registro, la minería, los planes, los pagos o los retiros. Responde con palabras sencillas, en tu idioma y a cualquier hora.',
      channelsTitle: 'Hablar con una persona',
      channelsLead:
        'Para lo que el asistente no puede decidir —un pago, un reembolso o tu cuenta— escribe al buzón correcto. Nunca envíes contraseña, frase de recuperación ni número de tarjeta.',
      supportLabel: 'Ayuda general',
      billingLabel: 'Facturación y reembolsos',
      privacyLabel: 'Solicitudes de privacidad',
      topicsTitle: 'Qué puedes preguntar',
    },
  },
  zh: {
    title: '24/7 在线帮助',
    lead: '可以询问注册、挖矿、套餐、支付或提现。全天候用简单的话回答。',
    placeholder: '输入你的问题',
    send: '发送',
    thinking: '正在思考',
    disclaimer: '本助手只解释平台如何运作，绝不会索要密码、助记词、卡号或私钥。',
    topics: {
      register: '创建账户',
      mining: '挖矿如何运作',
      plans: '套餐与价格',
      payment: '用卡或加密货币支付',
      withdraw: '提现到钱包',
      security: '密码与两步验证',
    },
    answers: {
      hello:
        '你好。我可以帮你注册、开始挖矿、选择套餐、付款、提现或保护账户。你想先做哪一件？',
      register:
        '创建账户只需一分钟。打开注册页，填写邮箱和至少 8 位的密码，然后确认屏幕上显示的六位验证码。开始使用免费套餐不需要任何证件。',
      mining:
        '云挖矿就是由我们的服务器来完成计算，你不耗电、不需设备。面板会用 MH/s 显示你的速度、已挖到的币和美元价值。你可以把算力分配到 $MINEAI、BTC、ETH、SOL、BNB、TON、DOGE 和 LTC。',
      plans:
        '共有五个套餐：Genesis 永久免费，Node v1 为 29.99 美元，Pro v2 为 99.99 美元且最受欢迎，Elite v3 为 299.99 美元，Sovereign v4 为 799.99 美元。每个付费套餐都会增加云算力和更高的 $MINEAI 奖励。首页计算器会在付款前给出每日估算。',
      payment:
        '你可以通过 Kashier 或 Paymob 用 Visa 或 Mastercard 以美元或埃镑支付，也可以直接向结账页显示的钱包发送加密货币，平台费用为 0%。卡信息由支付服务商保存。付款确认后套餐即开通。',
      withdraw:
        '打开挖矿面板，选择币种和网络，粘贴你自己的钱包地址并确认。每笔提现都会从待处理变为处理中，再变为已发送，最后一步会显示链上交易哈希，可在区块浏览器中查看。',
      security:
        '请使用不重复的长密码，并在安全页面开启两步验证。连续五次登录失败会锁定账户 15 分钟。我们绝不会索要密码、助记词或私钥，客服也不会。',
      referral:
        '打开奖励页面并复制邀请链接。朋友加入后，你可以获得其奖励的一部分。邀请越多比例越高：青铜 5%、白银 8%、黄金 12%、钻石 15%。',
      human:
        '如需人工服务，请写信到 support@mineai.network 并附上你的操作员编号。账单问题发到 billing@mineai.network，隐私请求发到 legal@mineai.network。切勿附上密码、助记词或卡号。',
      fallback:
        '我没有理解。你可以问如何创建账户、挖矿如何运作、套餐与价格、用卡或加密货币支付、提现到钱包，或密码与两步验证。',
    },
    suggestions: ['创建账户', '挖矿如何运作', '提现到钱包'],
    widget: { open: '需要帮助？', close: '关闭帮助', title: '24/7 帮助' },
    page: {
      eyebrow: '帮助中心',
      title: '我们随时都在',
      lead: '可以询问注册、挖矿、套餐、支付或提现。助手会用简单的话、你的语言，在任何时间回答。',
      channelsTitle: '联系人工',
      channelsLead:
        '遇到助手无法决定的事——付款、退款或你的账户——请写信到对应邮箱。切勿发送密码、助记词或卡号。',
      supportLabel: '一般帮助',
      billingLabel: '账单与退款',
      privacyLabel: '隐私请求',
      topicsTitle: '你可以问什么',
    },
  },
  hi: {
    title: '24/7 सहायता सहायक',
    lead: 'साइन-अप, माइनिंग, प्लान, भुगतान या निकासी के बारे में पूछें। किसी भी समय आसान शब्दों में जवाब।',
    placeholder: 'अपना सवाल लिखें',
    send: 'भेजें',
    thinking: 'सोच रहा है',
    disclaimer: 'यह सहायक केवल बताता है कि प्लेटफ़ॉर्म कैसे काम करता है। यह कभी पासवर्ड, रिकवरी वाक्यांश, कार्ड नंबर या निजी कुंजी नहीं मांगता।',
    topics: {
      register: 'खाता बनाएँ',
      mining: 'माइनिंग कैसे काम करती है',
      plans: 'प्लान और कीमतें',
      payment: 'कार्ड या क्रिप्टो से भुगतान',
      withdraw: 'वॉलेट में निकासी',
      security: 'पासवर्ड और 2FA',
    },
    answers: {
      hello:
        'नमस्ते। मैं पंजीकरण, माइनिंग शुरू करने, प्लान चुनने, भुगतान, निकासी या खाता सुरक्षित करने में मदद कर सकता हूँ। आप पहले क्या करना चाहेंगे?',
      register:
        'खाता बनाने में एक मिनट लगता है। पंजीकरण खोलें, अपना ईमेल और कम से कम 8 अक्षरों का पासवर्ड डालें, फिर स्क्रीन पर दिखने वाला छह अंकों का कोड पुष्टि करें। मुफ़्त प्लान शुरू करने के लिए कोई दस्तावेज़ नहीं चाहिए।',
      mining:
        'क्लाउड माइनिंग का मतलब है कि काम हमारे सर्वर करते हैं, इसलिए आपको बिजली या उपकरण नहीं चाहिए। आपका डैशबोर्ड MH/s में गति, माइन किए गए सिक्के और उनकी USD कीमत दिखाता है। आप अपनी पावर $MINEAI, BTC, ETH, SOL, BNB, TON, DOGE और LTC में बाँट सकते हैं।',
      plans:
        'पाँच प्लान हैं: Genesis हमेशा मुफ़्त, Node v1 $29.99, Pro v2 $99.99 और सबसे लोकप्रिय, Elite v3 $299.99, और Sovereign v4 $799.99। हर सशुल्क प्लान अधिक क्लाउड पावर और अधिक $MINEAI बोनस देता है। होम पेज का कैलकुलेटर भुगतान से पहले दैनिक अनुमान दिखाता है।',
      payment:
        'आप Kashier या Paymob से Visa या Mastercard द्वारा USD या EGP में भुगतान कर सकते हैं, या चेकआउट पर दिखाए गए वॉलेट में सीधे क्रिप्टो भेज सकते हैं, जिस पर 0% प्लेटफ़ॉर्म शुल्क है। कार्ड डेटा भुगतान प्रदाता के पास रहता है। भुगतान की पुष्टि के बाद प्लान खुल जाता है।',
      withdraw:
        'माइनिंग डैशबोर्ड खोलें, सिक्का और नेटवर्क चुनें, अपना वॉलेट पता चिपकाएँ और पुष्टि करें। हर निकासी प्रतीक्षारत से प्रोसेसिंग से भेजे गए तक जाती है, और अंतिम चरण में चेन पर txHash दिखता है जिसे ब्लॉक एक्सप्लोरर में देख सकते हैं।',
      security:
        'ऐसा लंबा पासवर्ड रखें जिसे आप कहीं और दोबारा नहीं लगाते, और सुरक्षा पेज से दो-चरणीय सत्यापन चालू करें। पाँच गलत लॉगिन पर खाता 15 मिनट के लिए बंद हो जाता है। हम कभी पासवर्ड, रिकवरी वाक्यांश या निजी कुंजी नहीं मांगते, और सहायता भी नहीं मांगेगी।',
      referral:
        'रिवॉर्ड्स खोलें और अपना आमंत्रण लिंक कॉपी करें। मित्र जुड़ने पर आपको उसके इनाम का हिस्सा मिलता है। ज़्यादा आमंत्रण पर हिस्सा बढ़ता है: ब्रॉन्ज़ 5%, सिल्वर 8%, गोल्ड 12%, डायमंड 15%.',
      human:
        'किसी व्यक्ति से बात करनी हो तो अपने ऑपरेटर आईडी के साथ support@mineai.network पर लिखें। बिलिंग के लिए billing@mineai.network और गोपनीयता के लिए legal@mineai.network। पासवर्ड, रिकवरी वाक्यांश या कार्ड नंबर कभी न भेजें।',
      fallback:
        'मैं समझ नहीं पाया। आप खाता बनाने, माइनिंग कैसे काम करती है, प्लान और कीमतें, कार्ड या क्रिप्टो से भुगतान, वॉलेट में निकासी, या पासवर्ड और 2FA के बारे में पूछ सकते हैं।',
    },
    suggestions: ['खाता बनाएँ', 'माइनिंग कैसे काम करती है', 'वॉलेट में निकासी'],
    widget: { open: 'मदद चाहिए?', close: 'मदद बंद करें', title: '24/7 सहायता' },
    page: {
      eyebrow: 'सहायता केंद्र',
      title: 'हम हर समय उपलब्ध हैं',
      lead: 'सहायक से पंजीकरण, माइनिंग, प्लान, भुगतान या निकासी के बारे में पूछें। यह आसान शब्दों में, आपकी भाषा में, किसी भी समय जवाब देता है।',
      channelsTitle: 'किसी व्यक्ति से बात करें',
      channelsLead:
        'जो बात सहायक तय नहीं कर सकता — भुगतान, रिफ़ंड या आपका खाता — उसके लिए सही पते पर लिखें। पासवर्ड, रिकवरी वाक्यांश या कार्ड नंबर कभी न भेजें।',
      supportLabel: 'सामान्य सहायता',
      billingLabel: 'बिलिंग और रिफ़ंड',
      privacyLabel: 'गोपनीयता अनुरोध',
      topicsTitle: 'आप क्या पूछ सकते हैं',
    },
  },
};

const KEYWORDS: Array<{ intent: SupportIntent; words: string[] }> = [
  {
    intent: 'security',
    words: ['2fa', 'password', 'passcode', 'security', 'lock', 'locked', 'mot de passe', 'sécurité', 'contraseña', 'seguridad', '密码', '安全', '验证码', 'पासवर्ड', 'सुरक्षा', 'كلمة المرور', 'أمان', 'التحقق'],
  },
  {
    intent: 'withdraw',
    words: ['withdraw', 'payout', 'cash out', 'wallet', 'retrait', 'portefeuille', 'retirar', 'cartera', 'billetera', '提现', '钱包', 'निकासी', 'वॉलेट', 'سحب', 'محفظة'],
  },
  {
    intent: 'payment',
    words: ['pay', 'payment', 'card', 'visa', 'mastercard', 'kashier', 'paymob', 'crypto', 'payer', 'carte', 'pagar', 'tarjeta', '支付', '卡', 'भुगतान', 'कार्ड', 'دفع', 'بطاقة', 'الدفع'],
  },
  {
    intent: 'plans',
    words: ['plan', 'price', 'cost', 'tier', 'offre', 'prix', 'tarif', 'plan', 'precio', '套餐', '价格', 'प्लान', 'कीमत', 'خطة', 'سعر', 'الخطط'],
  },
  {
    intent: 'mining',
    words: ['mine', 'mining', 'hashrate', 'miner', 'minage', 'mineur', 'minería', 'mineria', 'minar', 'minero', '挖矿', '算力', 'माइनिंग', 'खनन', 'تعدين', 'التعدين'],
  },
  {
    intent: 'register',
    words: ['register', 'sign up', 'signup', 'account', 'create', 'inscription', 'compte', 'registro', 'cuenta', '注册', '账户', 'पंजीकरण', 'खाता', 'تسجيل', 'حساب'],
  },
  {
    intent: 'referral',
    words: ['referral', 'invite', 'friend', 'affiliate', 'parrainage', 'ami', 'referido', 'amigo', '推荐', '邀请', 'रेफ़रल', 'दोस्त', 'إحالة', 'دعوة', 'صديق'],
  },
  {
    intent: 'human',
    words: ['human', 'agent', 'person', 'email', 'contact', 'humain', 'correo', '人工', '联系', 'मानव', 'संपर्क', 'بشري', 'بريد'],
  },
];

export function supportCopy(lang: SupportedLanguage): Copy {
  return COPY[lang] ?? COPY.en;
}

export function answerFor(message: string, lang: SupportedLanguage): SupportAnswer {
  const copy = supportCopy(lang);
  const text = message.toLowerCase().trim();

  if (!text) {
    return { intent: 'hello', reply: copy.answers.hello, suggestions: copy.suggestions };
  }

  for (const entry of KEYWORDS) {
    if (entry.words.some((word) => text.includes(word))) {
      return { intent: entry.intent, reply: copy.answers[entry.intent], suggestions: copy.suggestions };
    }
  }

  if (/^(hi|hello|hey|salam|bonjour|hola|你好|नमस्ते|مرحبا|أهلا)\b/.test(text)) {
    return { intent: 'hello', reply: copy.answers.hello, suggestions: copy.suggestions };
  }

  return { intent: 'fallback', reply: copy.answers.fallback, suggestions: copy.suggestions };
}
