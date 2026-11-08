import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'MineAI Node - DePIN & Autonomous AI Agent Network',
  description: 'Enterprise multi-agent autonomous DePIN platform with 6-core language engine and instant international payouts.',
  manifest: '/manifest.json'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-cyan-500 selection:text-black">
        {/* Bespoke Cinematic Animated Gradient Background Matrix */}
        <div className="fixed inset-0 -z-50 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-cyan-900/20 blur-[130px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-indigo-900/20 blur-[140px] animate-pulse" />
          <div className="absolute top-[40%] left-[30%] w-[40vw] h-[40vw] rounded-full bg-emerald-900/10 blur-[120px]" />
          {/* Subtle Cyberpunk Circuit Grid Overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30" />
        </div>
        {children}
      </body>
    </html>
  );
}