import type { Metadata } from 'next';

/**
 * The deployment console is an owner tool, not a marketing page. It is excluded
 * from the index here and disallowed in `robots.ts`, so a crawler that ignores
 * one signal still meets the other.
 */
export const metadata: Metadata = {
  title: 'Contract deployment console — MineAI',
  description: 'Owner-only browser deployment for the $MINEAI token contract.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
