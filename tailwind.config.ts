import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "monospace"],
        body: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        colony: {
          black: "#000000",
          dark: "#0a0a0a",
          "dark-card": "#111111",
          card: "#1a1a1a",
          border: "#1a1a1a",
          muted: "#888888",
          accent: "#FF6B00",
          "accent-bright": "#FF8C00",
          "accent-soft": "#FFA500",
          glow: "#FF6B00",
          success: "#00FF41",
          "success-soft": "#39FF14",
          danger: "#FF3333",
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "pulse-alive": "pulse-alive 2s ease-in-out infinite",
        "fade-in": "fade-in 0.5s ease-out",
        "slide-up": "slide-up 0.4s ease-out",
        "matrix-rain": "matrix-rain 20s linear infinite",
        "scan-line": "scan-line 4s linear infinite",
        "scale-in": "scale-in 0.5s ease-out forwards",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "0.6", boxShadow: "0 0 12px rgba(255, 107, 0, 0.4)" },
          "50%": { opacity: "1", boxShadow: "0 0 24px rgba(255, 107, 0, 0.6)" },
        },
        "pulse-alive": {
          "0%, 100%": { opacity: "0.8", boxShadow: "0 0 8px rgba(0, 255, 65, 0.5)" },
          "50%": { opacity: "1", boxShadow: "0 0 20px rgba(0, 255, 65, 0.8)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "matrix-rain": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
        "scan-line": {
          "0%": { top: "0%" },
          "100%": { top: "100%" },
        },
        "scale-in": {
          "0%": { transform: "scale(0)", opacity: "1" },
          "50%": { transform: "scale(1.2)" },
          "100%": { transform: "scale(1)", opacity: "0" },
        },
      },
      boxShadow: {
        "glow-orange": "0 0 20px rgba(255, 107, 0, 0.3), 0 0 40px rgba(255, 107, 0, 0.1)",
        "glow-green": "0 0 20px rgba(0, 255, 65, 0.3), 0 0 40px rgba(0, 255, 65, 0.1)",
      },
      dropShadow: {
        "glow-orange": ["0 0 15px rgba(255, 107, 0, 0.5)", "0 0 30px rgba(255, 107, 0, 0.3)"],
      },
    },
  },
  plugins: [],
};

export default config;
