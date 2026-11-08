'use client';

import React, { useState } from 'react';

// Product Catalog Interface
interface DropshipNode {
  id: string;
  nameEn: string;
  nameAr: string;
  tier: string;
  computePower: string;
  priceUsd: number;
  periodEn: string;
  periodAr: string;
  descriptionEn: string;
  descriptionAr: string;
  featuresEn: string[];
  featuresAr: string[];
  roiEstimate: string;
  badgeEn: string;
  badgeAr: string;
}

export default function StorePage() {
  const [lang, setLang] = useState<'ar' | 'en'>('ar');
  const [activeNodes, setActiveNodes] = useState<Record<string, boolean>>({
    'node-1': true,
  });
  const [activationNotice, setActivationNotice] = useState<string | null>(null);

  const isAr = lang === 'ar';

  const products: DropshipNode[] = [
    {
      id: 'node-1',
      nameEn: 'NexusPulse AI - Viral Trend & Supplier Scout',
      nameAr: 'عقدة NexusPulse AI - المستكشف الآلي للترندات والموردين',
      tier: 'GENESIS TIER',
      computePower: '850 TFLOPS Neural Engine',
      priceUsd: 149,
      periodEn: '/ month',
      periodAr: '/ شهرياً',
      descriptionEn:
        'Autonomous scraping agent that detects breakout e-commerce products across TikTok, Instagram, and Meta Ads before they saturate.',
      descriptionAr:
        'وكيل ذكاء اصطناعي مستقل يقوم بمسح وتحليل المنتجات الفيروسية الرابحة عبر تيك توك وإعلانات ميتا بدقة قبل وصولها لمرحلة التشبع.',
      featuresEn: [
        'Real-time TikTok & Meta Ad Spy Scanner',
        'Direct CJ & AliExpress API Cost Arbitrage',
        'Automated High-Converting Creative Generator',
        'Strix AI Anti-Saturation Defensive Engine',
      ],
      featuresAr: [
        'ماسح تجسس حي لإعلانات تيك توك وميتا 24/7',
        'موازنة أسعار فورية مع واجهات CJ و AliExpress',
        'توليد آلي لإعلانات الفيديو والنصوص التسويقية',
        'درع Strix AI الدفاعي لمنع تشبع السوق',
      ],
      roiEstimate: '+320% Avg. Scaled ROAS',
      badgeEn: 'POPULAR CHOICE',
      badgeAr: 'الأكثر طلباً',
    },
    {
      id: 'node-2',
      nameEn: 'OmniCartel AI - Multi-Store Hyper-Fulfillment Node',
      nameAr: 'عقدة OmniCartel AI - إدارة وتوريد المتاجر المتعددة الآلي',
      tier: 'ENTERPRISE DEPIN',
      computePower: '1.8 PFLOPS Multi-Cluster',
      priceUsd: 349,
      periodEn: '/ month',
      periodAr: '/ شهرياً',
      descriptionEn:
        'Fully decentralized fulfillment and customer resolution core capable of managing 10+ Shopify and WooCommerce pipelines on auto-pilot.',
      descriptionAr:
        'نواة إدارة التوريد وخدمة العملاء اللامركزية القادرة على إدارة أكثر من 10 متاجر Shopify و WooCommerce ذاتياً دون أي تدخل يدوي.',
      featuresEn: [
        'Zero-Touch Automated Supplier Order Dispatch',
        '30-Language Contextual AI Customer Agent',
        'Real-time Dynamic Profit Margin Modulation',
        'Chargeback & Fraud Shield Protection',
      ],
      featuresAr: [
        'إرسال طلبيات الموردين تلقائياً بدون تدخل بشري',
        'وكيل دعم عملاء ذكي بـ 30 لغة عالمية على مدار الساعة',
        'تعديل ديناميكي لنسب الربح وفق تقلبات العملات',
        'حماية متطورة من الاحتيال واسترجاع الأموال',
      ],
      roiEstimate: '99.94% Auto-Order Accuracy',
      badgeEn: 'HIGH REVENUE YIELD',
      badgeAr: 'عائد أرباح فائق',
    },
    {
      id: 'node-3',
      nameEn: 'QuantumDrop AI - Sovereign Autonomous Master Node',
      nameAr: 'عقدة QuantumDrop AI - الماستر نود السيادية المستقلة',
      tier: 'SOVEREIGN MASTER',
      computePower: '4.2 PFLOPS DePIN Cluster',
      priceUsd: 799,
      periodEn: 'Lifetime Access',
      periodAr: 'وصول دائم مدى الحياة',
      descriptionEn:
        'The definitive DePIN master node. Runs full localized inventory arbitrage, multi-channel ad scaling, and direct fiat Stripe/Crypto cashout routes.',
      descriptionAr:
        'أقوى عقدة رئيسية في شبكة DePIN. تنفذ موازنة المخزون وتكبير الحملات الإعلانية مع مسارات سحب بنكية مباشرة عبر Stripe والعملات الرقمية.',
      featuresEn: [
        'Full DePIN Network Computing Power Share',
        'Integrated CoinGecko & Stripe Instant Cashout',
        'Multi-Vendor Dropshipping Matrix Synchronization',
        'VIP Growth Hacking Agent & 2x XP Multiplier',
      ],
      featuresAr: [
        'حصة مباشرة من قوة حوسبة شبكة DePIN العالمية',
        'سحب نقدي لحظي عبر Stripe والعملات الرقمية',
        'مزامنة معقدة متعددة الموردين مع بوابات التوزيع',
        'وكيل النمو التسويقي المضاعف مع نقاط XP مضاعفة',
      ],
      roiEstimate: 'Max Compute Hashrate Mining',
      badgeEn: 'ULTIMATE COMPUTE',
      badgeAr: 'القوة القصوى',
    },
  ];

  const handleToggleNode = (id: string, name: string) => {
    setActiveNodes((prev) => {
      const updated = !prev[id];
      const newState = { ...prev, [id]: updated };
      
      const message = updated
        ? isAr
          ? `تم تفعيل ${name} بنجاح! بدأ الوكيل في معالجة بيانات التوريد.`
          : `Activated ${name}! Autonomous Dropshipping Agent is now online.`
        : isAr
          ? `تم إيقاف ${name} مؤقتاً.`
          : `Deactivated ${name}.`;

      setActivationNotice(message);
      setTimeout(() => setActivationNotice(null), 4500);

      return newState;
    });
  };

  return (
    <div
      dir={isAr ? 'rtl' : 'ltr'}
      style={{
        backgroundColor: '#060a12',
        minHeight: '100vh',
        color: '#f8fafc',
        fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: '0',
        margin: '0',
        boxSizing: 'border-box',
      }}
    >
      {/* Top Embedded Navigation Bar */}
      <header
        style={{
          borderBottom: '1px solid #1e293b',
          backgroundColor: 'rgba(10, 15, 29, 0.95)',
          padding: '16px 32px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 4px 20px rgba(0, 255, 136, 0.05)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #00ff88 0%, #00b4d8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(0, 255, 136, 0.4)',
              fontWeight: '900',
              color: '#000000',
              fontSize: '20px',
            }}
          >
            ⚡
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '20px',
                  fontWeight: '800',
                  letterSpacing: '0.5px',
                  color: '#ffffff',
                }}
              >
                MineAI
              </span>
              <span
                style={{
                  backgroundColor: '#003820',
                  color: '#00ff88',
                  border: '1px solid #00ff88',
                  padding: '2px 8px',
                  borderRadius: '999px',
                  fontSize: '11px',
                  fontWeight: '700',
                  letterSpacing: '0.5px',
                }}
              >
                DEPIN STORE v2.5
              </span>
            </div>
            <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#94a3b8' }}>
              {isAr
                ? 'سوق عقد الدروبشيبينغ وحوسبة الذكاء الاصطناعي المستقلة'
                : 'Autonomous AI Dropshipping & DePIN Compute Marketplace'}
            </p>
          </div>
        </div>

        {/* Action Controls & Language Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Language Selection Bar */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#0f172a',
              border: '1px solid #334155',
              borderRadius: '10px',
              padding: '4px',
            }}
          >
            <button
              onClick={() => setLang('ar')}
              style={{
                backgroundColor: isAr ? '#00ff88' : 'transparent',
                color: isAr ? '#000000' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              العربية (RTL)
            </button>
            <button
              onClick={() => setLang('en')}
              style={{
                backgroundColor: !isAr ? '#00ff88' : 'transparent',
                color: !isAr ? '#000000' : '#94a3b8',
                border: 'none',
                padding: '6px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              English (LTR)
            </button>
          </div>

          <a
            href="/"
            style={{
              textDecoration: 'none',
              backgroundColor: '#1e293b',
              color: '#38bdf8',
              border: '1px solid #0284c7',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              display: 'inline-block',
            }}
          >
            {isAr ? '← العودة للوحة التعدين' : 'Mining Node Dashboard →'}
          </a>
        </div>
      </header>

      {/* Real-time Notification Banner */}
      {activationNotice && (
        <div
          style={{
            maxWidth: '1200px',
            margin: '20px auto 0 auto',
            padding: '14px 24px',
            borderRadius: '12px',
            backgroundColor: '#042f1a',
            border: '1px solid #00ff88',
            color: '#a7f3d0',
            fontSize: '14px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 0 25px rgba(0, 255, 136, 0.25)',
          }}
        >
          <span style={{ fontSize: '18px' }}>🚀</span>
          <span>{activationNotice}</span>
        </div>
      )}

      {/* Main Container */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '40px 24px 80px 24px' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div
            style={{
              display: 'inline-block',
              padding: '6px 16px',
              borderRadius: '999px',
              backgroundColor: 'rgba(0, 255, 136, 0.08)',
              border: '1px solid rgba(0, 255, 136, 0.3)',
              color: '#00ff88',
              fontSize: '12px',
              fontWeight: '800',
              letterSpacing: '1px',
              marginBottom: '16px',
            }}
          >
            {isAr ? 'تكنولوجيا الحوسبة اللامركزية للتجارة الإلكترونية' : 'DEPIN AUTONOMOUS COMMERCE ARCHITECTURE'}
          </div>
          <h1
            style={{
              fontSize: '38px',
              fontWeight: '900',
              margin: '0 0 16px 0',
              color: '#ffffff',
              letterSpacing: '-0.5px',
              lineHeight: '1.2',
            }}
          >
            {isAr ? 'امتلك عقدة دروبشيبينغ تعمل ذاتياً بالكامل' : 'Deploy Autonomous AI Dropshipping Nodes'}
          </h1>
          <p
            style={{
              fontSize: '16px',
              color: '#94a3b8',
              maxWidth: '720px',
              margin: '0 auto',
              lineHeight: '1.6',
            }}
          >
            {isAr
              ? 'اربط قوة حوسبة شبكة DePIN مع متاجر التجارة الإلكترونية لأتمتة التجسس على الإعلانات، وموازنة أسعار الموردين، وإرسال الطلبيات في الوقت الحقيقي وبصفر مجهود يدوي.'
              : 'Fuse raw DePIN compute clusters with e-commerce pipelines to automate ad spying, supplier margin arbitrage, and real-time customer fulfillment on total auto-pilot.'}
          </p>
        </div>

        {/* 3 Hardcoded Real Dropshipping AI Node Cards */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
            gap: '28px',
          }}
        >
          {products.map((node) => {
            const isNodeActive = !!activeNodes[node.id];

            return (
              <div
                key={node.id}
                style={{
                  backgroundColor: '#0c1322',
                  border: isNodeActive ? '1.5px solid #00ff88' : '1px solid #1e293b',
                  borderRadius: '20px',
                  padding: '32px 28px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isNodeActive
                    ? '0 0 35px rgba(0, 255, 136, 0.15)'
                    : '0 10px 30px rgba(0, 0, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                }}
              >
                {/* Header Tag */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '16px',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      letterSpacing: '1px',
                      color: '#00e5ff',
                      backgroundColor: 'rgba(0, 229, 255, 0.1)',
                      border: '1px solid rgba(0, 229, 255, 0.3)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    {node.tier}
                  </span>
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '800',
                      color: '#00ff88',
                      backgroundColor: '#002917',
                      border: '1px solid #00ff88',
                      padding: '4px 10px',
                      borderRadius: '999px',
                    }}
                  >
                    {isAr ? node.badgeAr : node.badgeEn}
                  </span>
                </div>

                {/* Node Title & Specs */}
                <div>
                  <h3
                    style={{
                      fontSize: '20px',
                      fontWeight: '800',
                      margin: '0 0 10px 0',
                      color: '#ffffff',
                      lineHeight: '1.3',
                    }}
                  >
                    {isAr ? node.nameAr : node.nameEn}
                  </h3>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      marginBottom: '16px',
                    }}
                  >
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: isNodeActive ? '#00ff88' : '#eab308',
                        boxShadow: isNodeActive ? '0 0 10px #00ff88' : 'none',
                      }}
                    />
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: isNodeActive ? '#00ff88' : '#facc15',
                        fontFamily: 'monospace',
                      }}
                    >
                      {node.computePower}
                    </span>
                  </div>

                  <p
                    style={{
                      fontSize: '13px',
                      color: '#94a3b8',
                      lineHeight: '1.6',
                      margin: '0 0 24px 0',
                      minHeight: '62px',
                    }}
                  >
                    {isAr ? node.descriptionAr : node.descriptionEn}
                  </p>

                  {/* Pricing Display */}
                  <div
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: '#070b14',
                      border: '1px solid #172554',
                      marginBottom: '24px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '34px',
                          fontWeight: '900',
                          color: '#00ff88',
                          fontFamily: 'monospace',
                        }}
                      >
                        ${node.priceUsd}
                      </span>
                      <span style={{ fontSize: '13px', color: '#64748b', fontWeight: '600' }}>
                        USD {isAr ? node.periodAr : node.periodEn}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: '#38bdf8',
                        fontWeight: '600',
                      }}
                    >
                      📊 {node.roiEstimate}
                    </div>
                  </div>

                  {/* Features Bullet Points */}
                  <div style={{ marginBottom: '28px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: '700',
                        color: '#cbd5e1',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '12px',
                      }}
                    >
                      {isAr ? 'القدرات البرمجية للعقدة:' : 'Included Agent Capabilities:'}
                    </div>
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '10px',
                      }}
                    >
                      {(isAr ? node.featuresAr : node.featuresEn).map((feature, idx) => (
                        <li
                          key={idx}
                          style={{
                            fontSize: '13px',
                            color: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                            lineHeight: '1.4',
                          }}
                        >
                          <span style={{ color: '#00ff88', fontWeight: 'bold' }}>✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Interactive Action Button */}
                <button
                  onClick={() =>
                    handleToggleNode(node.id, isAr ? node.nameAr : node.nameEn)
                  }
                  style={{
                    width: '100%',
                    padding: '14px 20px',
                    borderRadius: '12px',
                    border: 'none',
                    fontWeight: '800',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    transition: 'all 0.2s ease',
                    backgroundColor: isNodeActive ? '#042f1a' : '#00ff88',
                    color: isNodeActive ? '#00ff88' : '#000000',
                    boxShadow: isNodeActive
                      ? 'inset 0 0 12px rgba(0, 255, 136, 0.4)'
                      : '0 0 25px rgba(0, 255, 136, 0.35)',
                  }}
                >
                  <span>{isNodeActive ? '●' : '⚡'}</span>
                  <span>
                    {isNodeActive
                      ? isAr
                        ? 'العقدة قيد العمل والمزامنة'
                        : 'Node Online & Processing'
                      : isAr
                        ? 'تفعيل وتشغيل العقدة فوراً'
                        : 'Activate Node Now'}
                  </span>
                </button>
              </div>
            );
          })}
        </div>

        {/* Security & Strix AI Verification Footer Badge */}
        <div
          style={{
            marginTop: '56px',
            padding: '24px',
            borderRadius: '16px',
            backgroundColor: '#090e1a',
            border: '1px solid #1e293b',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '8px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#00e5ff', fontWeight: '700', fontSize: '14px' }}>
            <span>🛡️</span>
            <span>{isAr ? 'محمي بواسطة بروتوكول Strix AI الدفاعي' : 'Secured by Strix AI Defensive Penetration Filter'}</span>
          </div>
          <p style={{ margin: 0, fontSize: '12px', color: '#64748b', maxWidth: '640px' }}>
            {isAr
              ? 'تتم جميع المعاملات وتوصيل الموردين مع تشفير صفري التسريب لمفاتيح API وربط سحابي آلي مع بوابات الدفع العالمية بدون أي تضارب أو انقطاع في الخدمة.'
              : 'All node transactions and supplier API triggers execute under zero-leak tokenized encryption. Fully compliant with Vercel serverless deployment.'}
          </p>
        </div>
      </main>
    </div>
  );
}