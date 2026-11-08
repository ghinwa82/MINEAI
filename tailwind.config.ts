import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "#030712",
        surface: "#0b0f19",
        surfaceCard: "#111827",
        neonGreen: "#10b981",
        neonCyan: "#06b6d4",
        neonPurple: "#8b5cf6",
        neonAmber: "#f59e0b",
        borderDark: "#1f2937"
      },
      fontFamily: {
        mono: ["var(--font-geist-mono)", "Menlo", "Courier New", "monospace"],
      },
      animation: {
        "pulse-fast": "pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow-flow": "glow 3s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 15px rgba(16, 185, 129, 0.2)" },
          "100%": { boxShadow: "0 0 30px rgba(6, 182, 212, 0.6)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;