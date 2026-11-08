import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MineAI Node - Autonomous AI Dropshipping & DePIN Network',
  description: 'Enterprise DePIN Infrastructure, AI Trend Scouting, and Autonomous E-Commerce Nodes',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" dir="ltr">
      <body style={{ backgroundColor: '#060913', color: '#f8fafc', margin: 0 }}>
        {children}
      </body>
    </html>
  );
}