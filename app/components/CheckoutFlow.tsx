'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

import { useI18n } from '@/lib/i18n-provider';
import { getPlans, type MiningPlan } from '@/lib/plans';
import { sound } from '@/lib/sound-engine';
import { useUid } from '@/lib/use-uid';

/**
 * Three-step checkout: plan, rail, live.
 *
 * Step one chooses the plan and the display currency. Step two picks a payment
 * rail — the crypto rail is real and verifies a transaction hash against a
 * public RPC before anything activates; the card rails state plainly that their
 * processor keys are not installed. Step three only exists after activation, so
 * a visitor never sees a success screen for a payment that did not clear.
 */

interface CryptoNetwork {
  id: string;
  label: string;
  chain: string;
  asset: string;
  address: string;
  configured: boolean;
  explorer: string;
  minAmount: number;
}

interface DepositIntent {
  id: string;
  network: string;
  amountUsd: number;
  assetAmount: number;
  address: string;
  payUri: string;
  qrDataUrl: string;
  expiresAt: string;
}

interface RailStatus {
  rail: 'kashier' | 'paymob' | 'stripe';
  mode: 'live' | 'test' | 'sandbox';
  configured: boolean;
  detail: string;
}

interface Copy {
  eyebrow: string;
  title: string;
  lead: string;
  s1: string;
  s2: string;
  s3: string;
  planTitle: string;
  planLead: string;
  currency: string;
  total: string;
  perDay: string;
  continue: string;
  payTitle: string;
  payLead: string;
  freeNote: string;
  crypto: string;
  cryptoNote: string;
  card: string;
  cardNote: string;
  applepay: string;
  applepayNote: string;
  wallet: string;
  walletNote: string;
  fiatPending: string;
  notConfigured: string;
  network: string;
  address: string;
  amount: string;
  scan: string;
  copy: string;
  copied: string;
  openWallet: string;
  txLabel: string;
  txHint: string;
  verify: string;
  verifying: string;
  pending: string;
  activateFree: string;
  activating: string;
  successTitle: string;
  successBody: string;
  planLabel: string;
  hashLabel: string;
  freeReceipt: string;
  startMining: string;
  error: string;
  needUid: string;
  back: string;
}

const COPY: Record<string, Copy> = {
  en: {
    eyebrow: 'Checkout', title: 'Provision your cloud plan', lead: 'Three steps. Choose the power you want, pay on a rail you trust, and the reactor arms the moment the payment is confirmed.',
    s1: 'Plan', s2: 'Payment', s3: 'Live',
    planTitle: 'Choose your power', planLead: 'Every plan mines $MINEAI at a 3× allocation bonus and can be paused at any time.',
    currency: 'Display currency', total: 'Total today', perDay: 'Estimated daily emission',
    continue: 'Continue to payment',
    payTitle: 'Choose a payment method', payLead: 'Direct crypto settles instantly at the exact plan price. Card and wallet rails open automatically once the merchant account is live.',
    freeNote: 'This plan is free. Activation is instant and needs no payment.',
    crypto: 'Direct Cryptocurrency', cryptoNote: 'USDT or BTC from any exchange or wallet. The hash is verified on-chain. 0% platform fee.',
    card: 'Credit / Debit Card', cardNote: 'Visa, Mastercard and debit cards, authorised on a hosted secure page. Card details never reach this server.',
    applepay: 'Apple Pay / Google Pay', applepayNote: 'One-tap checkout with the wallet already on your device. Nothing to type.',
    wallet: 'Mobile Wallets', walletNote: 'Settle from a mobile wallet balance in your local currency.',
    fiatPending: 'Card and wallet rails open when our merchant account is live. Direct crypto is available now at a 0% fee.',
    notConfigured: 'Not configured yet',
    network: 'Network', address: 'Deposit address', amount: 'Amount to send', scan: 'Scan to pay',
    copy: 'Copy address', copied: 'Copied', openWallet: 'Open in wallet',
    txLabel: 'Transaction hash', txHint: 'Paste the hash after you send. Activation happens only when the chain confirms it.',
    verify: 'Verify and activate', verifying: 'Checking the chain…',
    pending: 'The chain has not confirmed it yet. Nothing was activated — try again in a minute.',
    activateFree: 'Activate free plan', activating: 'Activating…',
    successTitle: 'Your reactor is armed', successBody: 'The plan is live on this browser. You can start mining right now and pause whenever you like.',
    planLabel: 'Plan', hashLabel: 'Receipt', freeReceipt: 'Free activation', startMining: 'Open the mining terminal',
    error: 'That step did not complete. Try again.', needUid: 'Preparing your operator id…', back: 'Back',
  },
  ar: {
    eyebrow: 'الدفع', title: 'فعّل خطتك السحابية', lead: 'ثلاث خطوات: اختر القوة، وادفع بطريقة تثق بها، ويعمل المفاعل فور تأكيد الدفع.',
    s1: 'الخطة', s2: 'الدفع', s3: 'مباشر',
    planTitle: 'اختر قوتك', planLead: 'كل خطة تعدّن $MINEAI بمكافأة توزيع 3× ويمكن إيقافها في أي وقت.',
    currency: 'عملة العرض', total: 'الإجمالي اليوم', perDay: 'الإصدار اليومي المتوقع',
    continue: 'المتابعة إلى الدفع',
    payTitle: 'اختر وسيلة الدفع', payLead: 'العملات الرقمية المباشرة تُسوّى فورًا بسعر الخطة. تُفتح مسارات البطاقات والمحافظ تلقائيًا عند تفعيل حساب التاجر.',
    freeNote: 'هذه الخطة مجانية. التفعيل فوري ولا يحتاج دفعًا.',
    crypto: 'عملات رقمية مباشرة', cryptoNote: 'USDT أو BTC من أي منصة أو محفظة. يُتحقق من الهاش على الشبكة. بدون رسوم منصة.',
    card: 'بطاقة ائتمان / خصم', cardNote: 'Visa وMastercard وبطاقات الخصم، تُعتمد على صفحة دفع آمنة مستضافة. بيانات البطاقة لا تصل إلى هذا الخادم.',
    applepay: 'Apple Pay / Google Pay', applepayNote: 'دفع بلمسة واحدة بالمحفظة الموجودة على جهازك، دون كتابة أي بيانات.',
    wallet: 'المحافظ المحمولة', walletNote: 'سوِّ من رصيد محفظتك المحمولة بعملتك المحلية.',
    fiatPending: 'تُفتح مسارات البطاقات والمحافظ عند تفعيل حساب التاجر. الدفع المباشر بالعملات الرقمية متاح الآن بدون رسوم.',
    notConfigured: 'غير مفعّل بعد',
    network: 'الشبكة', address: 'عنوان الإيداع', amount: 'المبلغ المطلوب إرساله', scan: 'امسح للدفع',
    copy: 'نسخ العنوان', copied: 'تم النسخ', openWallet: 'افتح في المحفظة',
    txLabel: 'هاش العملية', txHint: 'الصق الهاش بعد الإرسال. التفعيل يحدث فقط بعد تأكيد الشبكة.',
    verify: 'تحقق وفعّل', verifying: 'جارٍ التحقق من الشبكة…',
    pending: 'لم تؤكد الشبكة العملية بعد. لم يُفعّل شيء — حاول بعد دقيقة.',
    activateFree: 'تفعيل الخطة المجانية', activating: 'جارٍ التفعيل…',
    successTitle: 'مفاعلك جاهز', successBody: 'الخطة مفعّلة في هذا المتصفح. ابدأ التعدين الآن وأوقفه وقتما تشاء.',
    planLabel: 'الخطة', hashLabel: 'الإيصال', freeReceipt: 'تفعيل مجاني', startMining: 'افتح محطة التعدين',
    error: 'لم تكتمل هذه الخطوة. حاول مرة أخرى.', needUid: 'جارٍ تجهيز معرّف المشغّل…', back: 'رجوع',
  },
  fr: {
    eyebrow: 'Paiement', title: 'Activez votre offre cloud', lead: 'Trois étapes. Choisissez la puissance, payez par un canal fiable, et le réacteur s’arme dès la confirmation.',
    s1: 'Offre', s2: 'Paiement', s3: 'En ligne',
    planTitle: 'Choisissez votre puissance', planLead: 'Chaque offre mine du $MINEAI avec un bonus d’allocation de 3× et peut être mise en pause à tout moment.',
    currency: 'Devise d’affichage', total: 'Total aujourd’hui', perDay: 'Émission quotidienne estimée',
    continue: 'Passer au paiement',
    payTitle: 'Choisissez un moyen de paiement', payLead: 'La crypto directe se règle instantanément au prix exact. Les cartes et portefeuilles s’ouvrent dès que le compte marchand est actif.',
    freeNote: 'Cette offre est gratuite. L’activation est immédiate et sans paiement.',
    crypto: 'Crypto directe', cryptoNote: 'USDT ou BTC depuis n’importe quel exchange ou portefeuille. Le hash est vérifié on-chain. 0 % de frais.',
    card: 'Carte bancaire', cardNote: 'Visa, Mastercard et cartes de débit, autorisées sur une page sécurisée hébergée. Les données de carte ne touchent jamais ce serveur.',
    applepay: 'Apple Pay / Google Pay', applepayNote: 'Paiement en un geste avec le portefeuille déjà présent sur votre appareil.',
    wallet: 'Portefeuilles mobiles', walletNote: 'Réglez depuis le solde d’un portefeuille mobile dans votre devise locale.',
    fiatPending: 'Les cartes et portefeuilles s’ouvrent dès que le compte marchand est actif. La crypto directe est disponible immédiatement, sans frais.',
    notConfigured: 'Pas encore configuré',
    network: 'Réseau', address: 'Adresse de dépôt', amount: 'Montant à envoyer', scan: 'Scanner pour payer',
    copy: 'Copier l’adresse', copied: 'Copié', openWallet: 'Ouvrir dans le portefeuille',
    txLabel: 'Hash de transaction', txHint: 'Collez le hash après l’envoi. L’activation n’a lieu qu’après confirmation.',
    verify: 'Vérifier et activer', verifying: 'Vérification de la chaîne…',
    pending: 'La chaîne n’a pas encore confirmé. Rien n’a été activé — réessayez dans une minute.',
    activateFree: 'Activer l’offre gratuite', activating: 'Activation…',
    successTitle: 'Votre réacteur est armé', successBody: 'L’offre est active dans ce navigateur. Commencez à miner maintenant et mettez en pause quand vous voulez.',
    planLabel: 'Offre', hashLabel: 'Reçu', freeReceipt: 'Activation gratuite', startMining: 'Ouvrir le terminal de minage',
    error: 'Cette étape n’a pas abouti. Réessayez.', needUid: 'Préparation de votre identifiant…', back: 'Retour',
  },
  es: {
    eyebrow: 'Pago', title: 'Activa tu plan cloud', lead: 'Tres pasos. Elige la potencia, paga por un canal fiable y el reactor se arma en cuanto se confirma el pago.',
    s1: 'Plan', s2: 'Pago', s3: 'En vivo',
    planTitle: 'Elige tu potencia', planLead: 'Cada plan mina $MINEAI con un bono de asignación de 3× y puede pausarse cuando quieras.',
    currency: 'Moneda de visualización', total: 'Total hoy', perDay: 'Emisión diaria estimada',
    continue: 'Continuar al pago',
    payTitle: 'Elige un método de pago', payLead: 'La cripto directa se liquida al instante al precio exacto. Las tarjetas y carteras se abren en cuanto la cuenta de comercio esté activa.',
    freeNote: 'Este plan es gratis. La activación es inmediata y no requiere pago.',
    crypto: 'Cripto directa', cryptoNote: 'USDT o BTC desde cualquier exchange o billetera. El hash se verifica on-chain. 0 % de comisión.',
    card: 'Tarjeta de crédito / débito', cardNote: 'Visa, Mastercard y tarjetas de débito, autorizadas en una página segura alojada. Los datos de la tarjeta nunca tocan este servidor.',
    applepay: 'Apple Pay / Google Pay', applepayNote: 'Pago en un toque con la cartera que ya tienes en el dispositivo.',
    wallet: 'Carteras móviles', walletNote: 'Paga desde el saldo de una cartera móvil en tu moneda local.',
    fiatPending: 'Las tarjetas y carteras se abren cuando la cuenta de comercio esté activa. La cripto directa ya está disponible sin comisión.',
    notConfigured: 'Aún no configurado',
    network: 'Red', address: 'Dirección de depósito', amount: 'Importe a enviar', scan: 'Escanea para pagar',
    copy: 'Copiar dirección', copied: 'Copiado', openWallet: 'Abrir en la billetera',
    txLabel: 'Hash de la transacción', txHint: 'Pega el hash después de enviar. La activación solo ocurre cuando la red lo confirma.',
    verify: 'Verificar y activar', verifying: 'Comprobando la red…',
    pending: 'La red aún no lo ha confirmado. No se activó nada: inténtalo en un minuto.',
    activateFree: 'Activar plan gratis', activating: 'Activando…',
    successTitle: 'Tu reactor está armado', successBody: 'El plan está activo en este navegador. Empieza a minar ahora y pausa cuando quieras.',
    planLabel: 'Plan', hashLabel: 'Recibo', freeReceipt: 'Activación gratuita', startMining: 'Abrir el terminal de minería',
    error: 'Ese paso no se completó. Inténtalo de nuevo.', needUid: 'Preparando tu identificador…', back: 'Atrás',
  },
  zh: {
    eyebrow: '结算', title: '开通你的云算力方案', lead: '三步完成：选择算力，选择可信支付通道，付款确认后反应堆立即启动。',
    s1: '方案', s2: '支付', s3: '运行中',
    planTitle: '选择你的算力', planLead: '每个方案都以 3× 分配加成开采 $MINEAI，并可随时暂停。',
    currency: '显示货币', total: '今日合计', perDay: '预计每日产出',
    continue: '继续支付',
    payTitle: '选择支付方式', payLead: '直接加密货币按方案原价即时结算。商户账户启用后，银行卡与钱包通道会自动开放。',
    freeNote: '此方案免费，立即开通，无需付款。',
    crypto: '直接加密货币', cryptoNote: '可从任意交易所或钱包支付 USDT 或 BTC。哈希在链上核验。零平台手续费。',
    card: '信用卡 / 借记卡', cardNote: 'Visa、Mastercard 与借记卡，在托管的安全支付页面完成授权。卡信息不会经过本服务器。',
    applepay: 'Apple Pay / Google Pay', applepayNote: '用设备中已有的钱包一键付款，无需输入。',
    wallet: '移动钱包', walletNote: '以本地货币从移动钱包余额结算。',
    fiatPending: '商户账户启用后即开放银行卡与钱包通道。直接加密货币现已可用，零手续费。',
    notConfigured: '尚未配置',
    network: '网络', address: '收款地址', amount: '应付金额', scan: '扫码支付',
    copy: '复制地址', copied: '已复制', openWallet: '在钱包中打开',
    txLabel: '交易哈希', txHint: '转账后粘贴哈希。只有链上确认后才会开通。',
    verify: '核验并开通', verifying: '正在核验链上记录…',
    pending: '链上尚未确认，未开通任何方案——请一分钟后重试。',
    activateFree: '开通免费方案', activating: '正在开通…',
    successTitle: '反应堆已就绪', successBody: '方案已在此浏览器生效。现在即可开始挖矿，随时暂停。',
    planLabel: '方案', hashLabel: '凭证', freeReceipt: '免费开通', startMining: '打开挖矿终端',
    error: '该步骤未完成，请重试。', needUid: '正在准备操作员编号…', back: '返回',
  },
  hi: {
    eyebrow: 'चेकआउट', title: 'अपना क्लाउड प्लान सक्रिय करें', lead: 'तीन चरण: शक्ति चुनें, भरोसेमंद माध्यम से भुगतान करें, और भुगतान की पुष्टि होते ही रिएक्टर चालू हो जाता है।',
    s1: 'प्लान', s2: 'भुगतान', s3: 'लाइव',
    planTitle: 'अपनी शक्ति चुनें', planLead: 'हर प्लान $MINEAI को 3× आवंटन बोनस के साथ माइन करता है और कभी भी रोका जा सकता है।',
    currency: 'प्रदर्शन मुद्रा', total: 'आज कुल', perDay: 'अनुमानित दैनिक उत्पादन',
    continue: 'भुगतान पर जाएँ',
    payTitle: 'भुगतान विधि चुनें', payLead: 'सीधा क्रिप्टो सटीक प्लान मूल्य पर तुरंत निपटता है। मर्चेंट खाता सक्रिय होते ही कार्ड और वॉलेट माध्यम खुल जाते हैं।',
    freeNote: 'यह प्लान मुफ़्त है। सक्रियण तुरंत होता है और भुगतान नहीं चाहिए।',
    crypto: 'सीधा क्रिप्टो', cryptoNote: 'किसी भी एक्सचेंज या वॉलेट से USDT या BTC। हैश ऑन-चेन सत्यापित होता है। 0% प्लेटफ़ॉर्म शुल्क।',
    card: 'क्रेडिट / डेबिट कार्ड', cardNote: 'Visa, Mastercard और डेबिट कार्ड, होस्टेड सुरक्षित पेज पर अधिकृत। कार्ड विवरण इस सर्वर तक नहीं आता।',
    applepay: 'Apple Pay / Google Pay', applepayNote: 'डिवाइस में मौजूद वॉलेट से एक टैप में भुगतान, कुछ लिखने की ज़रूरत नहीं।',
    wallet: 'मोबाइल वॉलेट', walletNote: 'अपनी स्थानीय मुद्रा में मोबाइल वॉलेट बैलेंस से भुगतान करें।',
    fiatPending: 'मर्चेंट खाता सक्रिय होते ही कार्ड और वॉलेट माध्यम खुलेंगे। सीधा क्रिप्टो अभी शून्य शुल्क पर उपलब्ध है।',
    notConfigured: 'अभी कॉन्फ़िगर नहीं है',
    network: 'नेटवर्क', address: 'जमा पता', amount: 'भेजने की राशि', scan: 'भुगतान के लिए स्कैन करें',
    copy: 'पता कॉपी करें', copied: 'कॉपी हो गया', openWallet: 'वॉलेट में खोलें',
    txLabel: 'ट्रांज़ैक्शन हैश', txHint: 'भेजने के बाद हैश पेस्ट करें। सक्रियण केवल चेन पुष्टि के बाद होता है।',
    verify: 'सत्यापित करें और सक्रिय करें', verifying: 'चेन जाँची जा रही है…',
    pending: 'चेन ने अभी पुष्टि नहीं की। कुछ सक्रिय नहीं हुआ — एक मिनट बाद फिर कोशिश करें।',
    activateFree: 'मुफ़्त प्लान सक्रिय करें', activating: 'सक्रिय हो रहा है…',
    successTitle: 'आपका रिएक्टर तैयार है', successBody: 'प्लान इस ब्राउज़र पर लाइव है। अभी माइनिंग शुरू करें और जब चाहें रोकें।',
    planLabel: 'प्लान', hashLabel: 'रसीद', freeReceipt: 'मुफ़्त सक्रियण', startMining: 'माइनिंग टर्मिनल खोलें',
    error: 'वह चरण पूरा नहीं हुआ। फिर कोशिश करें।', needUid: 'आपकी ऑपरेटर आईडी तैयार हो रही है…', back: 'वापस',
  },
};

const FX: Record<string, number> = { USD: 1, EGP: 48.65, EUR: 0.92, SAR: 3.75, AED: 3.67 };
const CURRENCIES = ['USD', 'EGP', 'EUR', 'SAR', 'AED'] as const;

function money(usd: number, currency: string): string {
  const value = usd * (FX[currency] ?? 1);
  const digits = currency === 'USD' || currency === 'EUR' ? 2 : 0;
  return `${value.toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })} ${currency}`;
}

export default function CheckoutFlow({ initialPlan }: { initialPlan?: string }) {
  const { lang, href } = useI18n();
  const copy = COPY[lang] ?? COPY.en;
  const uid = useUid();
  const reduce = useReducedMotion();

  const plans = useMemo(() => getPlans(lang), [lang]);
  const [slug, setSlug] = useState(initialPlan ?? plans[0]?.slug ?? 'genesis-free-cloud');
  const plan: MiningPlan & { text: (typeof plans)[number]['text'] } =
    plans.find((entry) => entry.slug === slug) ?? plans[0];

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [currency, setCurrency] = useState<(typeof CURRENCIES)[number]>('USD');
  const [rail, setRail] = useState<'crypto' | 'card' | 'applepay' | 'wallet'>('crypto');
  const [rails, setRails] = useState<RailStatus[]>([]);
  const [networks, setNetworks] = useState<CryptoNetwork[]>([]);
  const [network, setNetwork] = useState('');
  const [intent, setIntent] = useState<DepositIntent | null>(null);
  const [txHash, setTxHash] = useState('');
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [receipt, setReceipt] = useState<{ planName: string; hashrateMhs: number; hash: string | null } | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch('/api/payments/checkout', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
      fetch('/api/payments/crypto', { cache: 'no-store' }).then((r) => (r.ok ? r.json() : null)),
    ])
      .then(([fiat, crypto]) => {
        if (cancelled) return;
        if (fiat?.rails) setRails(fiat.rails as RailStatus[]);
        if (crypto?.networks) {
          const list = (crypto.networks as CryptoNetwork[]).filter((entry) => entry.configured);
          setNetworks(list);
          if (list[0]) setNetwork(list[0].id);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedNetwork = networks.find((entry) => entry.id === network) ?? null;
  /** Any fiat rail the server reports as armed — labelled institutionally. */
  const fiatArmed = rails.some((entry) => entry.configured);
  const isFree = plan.priceUsd <= 0;

  useEffect(() => {
    setIntent(null);
    setTxHash('');
  }, [network, slug]);

  const createIntent = useCallback(async () => {
    if (!selectedNetwork) return;
    setBusy('intent');
    setError(null);
    sound.click();
    try {
      const response = await fetch('/api/payments/crypto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'intent', network: selectedNetwork.id, amountUsd: plan.priceUsd }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        intent?: DepositIntent;
        error?: string;
      };
      if (!response.ok || !payload.intent) {
        setError(payload.error ?? copy.error);
        sound.error();
        return;
      }
      setIntent(payload.intent);
      sound.coin();
    } catch {
      setError(copy.error);
      sound.error();
    } finally {
      setBusy(null);
    }
  }, [selectedNetwork, plan.priceUsd, copy.error]);

  const activate = useCallback(
    async (kind: 'free' | 'crypto') => {
      if (!uid) {
        setError(copy.needUid);
        return;
      }
      setBusy('activate');
      setError(null);
      sound.click();
      try {
        const response = await fetch('/api/checkout/activate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            plan: plan.slug,
            uid,
            // Fiat rails never reach activation: only a confirmed on-chain hash
            // or a free plan arms the reactor from this screen.
            rail: kind === 'free' ? 'crypto' : 'crypto',
            network: kind === 'free' ? undefined : network,
            txHash: kind === 'free' ? undefined : txHash.trim(),
          }),
        });
        const payload = (await response.json().catch(() => ({}))) as {
          ok?: boolean;
          error?: string;
          pending?: boolean;
          plan?: { name: string; hashrateMhs: number };
          verdict?: { state: string; detail: string };
        };

        if (payload.ok && payload.plan) {
          setReceipt({
            planName: payload.plan.name,
            hashrateMhs: payload.plan.hashrateMhs,
            hash: kind === 'free' ? null : txHash.trim(),
          });
          setStep(3);
          sound.claim();
          return;
        }
        if (response.status === 202) {
          setError(`${copy.pending} ${payload.verdict?.detail ?? ''}`.trim());
          sound.error();
          return;
        }
        setError(payload.error ?? copy.error);
        sound.error();
      } catch {
        setError(copy.error);
        sound.error();
      } finally {
        setBusy(null);
      }
    },
    [uid, plan.slug, network, txHash, copy],
  );

  const copyAddress = async () => {
    if (!intent) return;
    try {
      await navigator.clipboard.writeText(intent.address);
      setCopied(true);
      sound.coin();
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl py-8">
      <header className="max-w-2xl">
        <p className="mx-eyebrow">{copy.eyebrow}</p>
        <h1 className="mx-display mt-5 !text-[clamp(2rem,4vw,3.1rem)]">{copy.title}</h1>
        <p className="mx-lede mt-4">{copy.lead}</p>
      </header>

      <ol className="mt-8 flex items-center gap-2 text-[0.68rem] font-semibold tracking-[0.12em] uppercase">
        {([copy.s1, copy.s2, copy.s3] as const).map((label, index) => {
          const index3 = (index + 1) as 1 | 2 | 3;
          const active = step === index3;
          const done = step > index3;
          return (
            <li key={label} className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border text-[0.62rem] ${
                  active
                    ? 'border-amber bg-amber/15 text-amber'
                    : done
                      ? 'border-mint/50 bg-mint/10 text-mint'
                      : 'border-white/12 text-ink-faint'
                }`}
              >
                {done ? '✓' : index3}
              </span>
              <span className={active ? 'text-ink' : 'text-ink-faint'}>{label}</span>
              {index < 2 ? <span className="mx-1 h-px w-6 bg-white/10" aria-hidden /> : null}
            </li>
          );
        })}
      </ol>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          <motion.section
            key="step1"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-8 grid gap-5"
          >
            <div className="rounded-2xl border border-white/8 bg-[#080d18] p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-ink">{copy.planTitle}</h2>
              <p className="mt-1 text-[0.8rem] text-ink-mute">{copy.planLead}</p>
              <div className="mt-5 grid gap-3 md:grid-cols-3">
                {plans.map((entry) => {
                  const active = entry.slug === slug;
                  return (
                    <button
                      key={entry.slug}
                      type="button"
                      onClick={() => {
                        setSlug(entry.slug);
                        sound.click();
                      }}
                      aria-pressed={active}
                      className={`rounded-xl border p-4 text-start transition ${
                        active
                          ? 'border-amber/60 bg-amber/[0.07] shadow-[0_0_0_1px_rgba(212,175,55,0.25)]'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                      }`}
                    >
                      <span className="block text-[0.66rem] tracking-[0.12em] text-ink-faint uppercase">
                        {entry.text.tier}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-ink">{entry.text.name}</span>
                      <span className="mx-numeric mt-2 block text-lg font-bold text-amber">
                        {entry.priceUsd === 0 ? '0' : money(entry.priceUsd, currency)}
                      </span>
                      <span className="mt-1 block text-[0.7rem] text-ink-faint">
                        {entry.hashrateMhs.toLocaleString('en-US')} MH/s · {entry.multiplier.toFixed(1)}×
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 rounded-2xl border border-white/8 bg-[#070c17] p-5 sm:grid-cols-[1fr_auto] sm:items-end sm:p-6">
              <div>
                <label htmlFor="checkout-currency" className="block text-[0.68rem] tracking-[0.12em] text-ink-faint uppercase">
                  {copy.currency}
                </label>
                <select
                  id="checkout-currency"
                  value={currency}
                  onChange={(event) => setCurrency(event.target.value as (typeof CURRENCIES)[number])}
                  className="mt-2 w-full max-w-[12rem] rounded-xl border border-white/12 bg-[#04060d] px-3 py-2.5 text-sm text-ink outline-none focus:border-cyan/50"
                >
                  {CURRENCIES.map((code) => (
                    <option key={code} value={code}>
                      {code}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-start sm:text-end">
                <p className="text-[0.66rem] tracking-[0.12em] text-ink-faint uppercase">{copy.total}</p>
                <p className="mx-numeric mt-1 text-2xl font-bold text-amber">
                  {plan.priceUsd === 0 ? money(0, currency) : money(plan.priceUsd, currency)}
                </p>
                <p className="mt-1 text-[0.7rem] text-ink-faint">
                  {copy.perDay}: ${(plan.hashrateMhs * 0.0335232).toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => {
                  setStep(2);
                  sound.click();
                }}
                className="mx-btn"
              >
                {copy.continue} →
              </button>
            </div>
          </motion.section>
        ) : step === 2 ? (
          <motion.section
            key="step2"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35 }}
            className="mt-8 grid gap-5"
          >
            <div className="rounded-2xl border border-white/8 bg-[#080d18] p-5 sm:p-6">
              <h2 className="text-sm font-semibold text-ink">{copy.payTitle}</h2>
              <p className="mt-1 text-[0.8rem] text-ink-mute">{copy.payLead}</p>

              {isFree ? (
                <div className="mt-5 rounded-xl border border-mint/30 bg-mint/[0.06] p-4">
                  <p className="text-[0.82rem] text-mint">{copy.freeNote}</p>
                  <button
                    type="button"
                    onClick={() => void activate('free')}
                    disabled={busy === 'activate' || !uid}
                    className="mx-btn mt-4"
                  >
                    {busy === 'activate' ? copy.activating : copy.activateFree}
                  </button>
                </div>
              ) : (
                <>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {(
                      [
                        { id: 'crypto' as const, label: copy.crypto, note: copy.cryptoNote },
                        { id: 'card' as const, label: copy.card, note: copy.cardNote },
                        { id: 'applepay' as const, label: copy.applepay, note: copy.applepayNote },
                        { id: 'wallet' as const, label: copy.wallet, note: copy.walletNote },
                      ]
                    ).map((method) => {
                      const selected = rail === method.id;
                      const instant = method.id === 'crypto';
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => {
                            setRail(method.id);
                            setError(null);
                            sound.click();
                          }}
                          aria-pressed={selected}
                          className={`rounded-xl border p-4 text-start transition ${
                            selected
                              ? instant
                                ? 'border-cyan/60 bg-cyan/[0.07]'
                                : 'border-amber/45 bg-amber/[0.05]'
                              : 'border-white/10 bg-white/[0.02] hover:border-white/25'
                          }`}
                        >
                          <span className="flex items-center justify-between gap-2 text-[0.8rem] font-semibold text-ink">
                            {method.label}
                            <span
                              className={`rounded-full px-2 py-0.5 text-[0.56rem] uppercase tracking-[0.08em] ${
                                instant || fiatArmed ? 'bg-mint/15 text-mint' : 'bg-white/8 text-ink-faint'
                              }`}
                            >
                              {instant ? '0%' : fiatArmed ? 'Live' : copy.notConfigured}
                            </span>
                          </span>
                          <span className="mt-1 block text-[0.68rem] leading-snug text-ink-faint">{method.note}</span>
                        </button>
                      );
                    })}
                  </div>

                  {rail === 'crypto' ? (
                    <div className="mt-6 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
                      <div>
                        <p className="text-[0.66rem] tracking-[0.12em] text-ink-faint uppercase">{copy.network}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {networks.length === 0 ? (
                            <p className="text-[0.78rem] text-ink-faint">{copy.notConfigured}</p>
                          ) : (
                            networks.map((entry) => (
                              <button
                                key={entry.id}
                                type="button"
                                onClick={() => {
                                  setNetwork(entry.id);
                                  sound.click();
                                }}
                                aria-pressed={entry.id === network}
                                className={`rounded-lg border px-3 py-1.5 text-[0.72rem] font-medium transition ${
                                  entry.id === network
                                    ? 'border-cyan/60 bg-cyan/10 text-cyan'
                                    : 'border-white/10 text-ink-mute hover:border-white/25'
                                }`}
                              >
                                {entry.label}
                              </button>
                            ))
                          )}
                        </div>

                        {intent ? (
                          <div className="mt-5 space-y-4 rounded-xl border border-white/10 bg-[#04060d]/70 p-4">
                            <div className="flex items-center justify-between gap-3">
                              <div>
                                <p className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{copy.amount}</p>
                                <p className="mx-numeric mt-1 text-lg font-bold text-amber">
                                  {intent.assetAmount} {selectedNetwork?.asset}
                                </p>
                                <p className="text-[0.68rem] text-ink-faint">${intent.amountUsd.toFixed(2)}</p>
                              </div>
                              <img
                                src={intent.qrDataUrl}
                                alt={copy.scan}
                                width={116}
                                height={116}
                                className="rounded-lg border border-white/10 bg-white p-1"
                              />
                            </div>
                            <div>
                              <p className="text-[0.62rem] tracking-[0.12em] text-ink-faint uppercase">{copy.address}</p>
                              <code className="mt-1 block break-all rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-[0.72rem] text-ink-soft">
                                {intent.address}
                              </code>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <button type="button" onClick={copyAddress} className="mx-btn-quiet !px-3 !py-1.5 !text-[0.7rem]">
                                  {copied ? copy.copied : copy.copy}
                                </button>
                                {selectedNetwork ? (
                                  <a
                                    href={intent.payUri}
                                    className="mx-btn-quiet !px-3 !py-1.5 !text-[0.7rem]"
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    {copy.openWallet}
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void createIntent()}
                            disabled={busy === 'intent' || !selectedNetwork}
                            className="mx-btn mt-5"
                          >
                            {busy === 'intent' ? copy.verifying : copy.continue}
                          </button>
                        )}
                      </div>

                      <div className="rounded-xl border border-white/10 bg-[#04060d]/70 p-4">
                        <label htmlFor="checkout-tx" className="block text-[0.66rem] tracking-[0.12em] text-ink-faint uppercase">
                          {copy.txLabel}
                        </label>
                        <input
                          id="checkout-tx"
                          value={txHash}
                          onChange={(event) => setTxHash(event.target.value.trim())}
                          placeholder="0x…"
                          autoComplete="off"
                          className="mt-2 w-full rounded-xl border border-white/12 bg-[#04060d] px-3 py-2.5 font-mono text-[0.76rem] text-ink outline-none focus:border-cyan/50"
                        />
                        <p className="mt-2 text-[0.68rem] leading-relaxed text-ink-faint">{copy.txHint}</p>
                        <button
                          type="button"
                          onClick={() => void activate('crypto')}
                          disabled={busy === 'activate' || !txHash || !uid}
                          className="mx-btn mt-4 w-full justify-center"
                        >
                          {busy === 'activate' ? copy.verifying : copy.verify}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-6 rounded-xl border border-amber/25 bg-amber/[0.05] p-4">
                      <p className="text-[0.8rem] leading-relaxed text-ink-mute">{copy.fiatPending}</p>
                      <button
                        type="button"
                        onClick={() => {
                          setRail('crypto');
                          sound.click();
                        }}
                        className="mx-btn-quiet mt-3 !px-3 !py-1.5 !text-[0.72rem]"
                      >
                        {copy.crypto} →
                      </button>
                    </div>
                  )}
                </>
              )}

              {error ? (
                <p className="mt-4 rounded-xl border border-rose-400/35 bg-rose-400/10 px-4 py-3 text-[0.8rem] text-rose-200">
                  {error}
                </p>
              ) : null}
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setError(null);
                  sound.click();
                }}
                className="mx-btn-quiet"
              >
                ← {copy.back}
              </button>
              <span className="text-[0.72rem] text-ink-faint">
                {plan.text.name} · {money(plan.priceUsd, currency)}
              </span>
            </div>
          </motion.section>
        ) : (
          <motion.section
            key="step3"
            initial={reduce ? false : { opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 overflow-hidden rounded-[1.5rem] border border-mint/30 bg-[linear-gradient(140deg,rgba(52,211,153,0.12),rgba(4,6,13,0.92))] p-6 sm:p-8"
          >
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full border border-mint/40 bg-mint/10 text-2xl text-mint">
              ✓
            </div>
            <h2 className="mt-5 text-center text-xl font-bold text-ink">{copy.successTitle}</h2>
            <p className="mx-auto mt-2 max-w-lg text-center text-[0.84rem] leading-relaxed text-ink-mute">
              {copy.successBody}
            </p>
            <dl className="mx-auto mt-6 grid max-w-md gap-3 text-[0.8rem]">
              <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-2">
                <dt className="text-ink-faint">{copy.planLabel}</dt>
                <dd className="font-semibold text-ink">
                  {receipt?.planName ?? plan.text.name} · {receipt?.hashrateMhs ?? plan.hashrateMhs} MH/s
                </dd>
              </div>
              <div className="flex items-center justify-between gap-4">
                <dt className="text-ink-faint">{copy.hashLabel}</dt>
                <dd className="max-w-[60%] truncate font-mono text-[0.72rem] text-ink-soft">
                  {receipt?.hash ?? copy.freeReceipt}
                </dd>
              </div>
            </dl>
            <div className="mt-7 flex flex-wrap justify-center gap-3">
              <Link href={href('/mining')} className="mx-btn">
                {copy.startMining} →
              </Link>
              <Link href={href('/store')} className="mx-btn-quiet">
                {copy.s1}
              </Link>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  );
}
