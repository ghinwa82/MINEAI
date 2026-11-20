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
        background: "#050507",
        surface: "#0A0A0E",
        surfaceCard: "#101016",
        champagne: "#E2C275",
        champagneHi: "#FFF1C1",
        champagneDeep: "#B68D3A",
        imperialEmerald: "#10B981",
        emeraldHi: "#34D399",
        ivory: "#FAF8F5",
        borderDark: "#2E2818"
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
          "100%": { boxShadow: "0 0 30px rgba(226, 194, 117, 0.6)" },
        },
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;