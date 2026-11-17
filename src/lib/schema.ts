import type { SupportedLanguage } from '@/types';
import type { NodePlan } from '@/lib/catalog';
import type { FaqEntry } from '@/lib/i18n';

/**
 * Structured data builders.
 *
 * Every payload is assembled from the same canonical records the pages render
 * from, so the machine-readable layer can never disagree with the visible
 * content.
 */

export function siteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, '');
  return 'https://mineai-node.vercel.app';
}

export function absoluteUrl(path: string): string {
  const base = siteUrl();
  return path.startsWith('http') ? path : `${base}${path.startsWith('/') ? path : `/${path}`}`;
}

export const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${siteUrl()}/#organization`,
  name: 'MineAI Node',
  legalName: 'MineAI Node',
  url: siteUrl(),
  logo: {
    '@type': 'ImageObject',
    url: absoluteUrl('/icon.svg'),
    width: 512,
    height: 512,
  },
  description:
    'MineAI Node operates a decentralised compute mesh whose resident agent workforce handles trend scouting, order fulfilment and international settlement.',
  sameAs: [],
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@mineai.network',
      availableLanguage: ['en', 'ar', 'fr', 'es', 'zh', 'hi'],
    },
  ],
};

export function webSiteSchema(lang: SupportedLanguage): Record<string, unknown> {
  return {
    '@type': 'WebSite',
    '@id': `${siteUrl()}/#website`,
    url: siteUrl(),
    name: 'MineAI Node',
    inLanguage: lang,
    publisher: { '@id': `${siteUrl()}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl()}/store?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function softwareApplicationSchema(): Record<string, unknown> {
  return {
    '@type': 'SoftwareApplication',
    '@id': `${siteUrl()}/#software`,
    name: 'MineAI Node',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: siteUrl(),
    description:
      'Autonomous DePIN compute with a resident multi-agent workforce for product intelligence, fulfilment and cross-border settlement.',
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: '149',
      highPrice: '799',
      offerCount: '3',
    },
    featureList: [
      'Trend scouting agent swarm',
      'Autonomous multi-store fulfilment',
      'Stripe Connect and crypto settlement',
      'Six-language operator interface',
    ],
  };
}

export function productSchema(plan: NodePlan): Record<string, unknown> {
  return {
    '@type': 'Product',
    '@id': `${siteUrl()}/store#${plan.id}`,
    name: plan.name,
    description: plan.description,
    sku: plan.id,
    brand: { '@type': 'Brand', name: 'MineAI' },
    category: 'DePIN compute node',
    url: absoluteUrl(`/store/${plan.canonicalName.toLowerCase().replace(/\s+/g, '-')}`),
    inLanguage: 'en',
    offers: {
      '@type': 'Offer',
      url: absoluteUrl('/store'),
      priceCurrency: 'USD',
      price: plan.priceUsd.toFixed(2),
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: { '@id': `${siteUrl()}/#organization` },
    },
  };
}

/**
 * $MINEAI identity.
 *
 * The offer is marked `PreOrder` because the token is not listed on a DEX yet;
 * once `NEXT_PUBLIC_MINEAI_DEX_URL` is present the markets page links to the
 * pool and this flag should be revisited.
 */
export function tokenSchema(priceUsd = 4.85): Record<string, unknown> {
  return {
    '@type': 'Product',
    '@id': `${siteUrl()}/markets#mineai`,
    name: 'Mine AI',
    alternateName: '$MINEAI',
    description:
      'Utility token behind the MineAI compute mesh: fixed supply, deflationary burn and staking pools on BEP-20 and ERC-20.',
    brand: { '@type': 'Brand', name: 'MineAI' },
    category: 'Utility token',
    url: absoluteUrl('/markets'),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: priceUsd.toFixed(2),
      availability: 'https://schema.org/PreOrder',
      seller: { '@id': `${siteUrl()}/#organization` },
    },
  };
}

export function faqSchema(items: FaqEntry[]): Record<string, unknown> {
  return {
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

/**
 * $MINEAI as a financial product.
 *
 * Separate from `tokenSchema` (a Product offer) because search engines index
 * the two differently: FinancialProduct carries the provider, the fee
 * specification and the risk-bearing identity of the issuer.
 */
export function financialProductSchema(priceUsd = 4.85): Record<string, unknown> {
  return {
    '@type': 'FinancialProduct',
    '@id': `${siteUrl()}/#mineai-financial`,
    name: '$MINEAI utility token',
    description:
      'Fixed-supply utility token that meters cloud-mining yield, VIP staking multipliers and referral settlement across the MineAI Node compute mesh.',
    category: 'Digital asset',
    url: absoluteUrl('/markets'),
    provider: { '@id': `${siteUrl()}/#organization` },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: priceUsd.toFixed(2),
      availability: 'https://schema.org/PreOrder',
      seller: { '@id': `${siteUrl()}/#organization` },
    },
    feesAndCommissionsSpecification:
      '0% platform fee on direct multi-chain USDT and BTC settlement. Card rails settle through Kashier or Paymob at the displayed rate.',
    interestRate: 0,
  };
}

export function breadcrumbSchema(trail: Array<{ name: string; path: string }>): Record<string, unknown> {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((crumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

export function itemListSchema(plans: NodePlan[]): Record<string, unknown> {
  return {
    '@type': 'ItemList',
    name: 'MineAI node catalogue',
    numberOfItems: plans.length,
    itemListElement: plans.map((plan, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: absoluteUrl(`/store/${plan.canonicalName.toLowerCase().replace(/\s+/g, '-')}`),
      name: plan.name,
    })),
  };
}
