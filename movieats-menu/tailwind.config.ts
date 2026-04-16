import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#ff3d00", // Vermelho-Laranja bem vibrante para dar fome
          hover: "#e63600",
          foreground: "#ffffff",
        },
        appetite: {
          red: "#d32f2f",
          orange: "#ff6d00",
          yellow: "#ffab00",
        },
        background: "#000000",
        foreground: "#f8fafc",
        card: {
          DEFAULT: "#0a0a0a",
          foreground: "#f8fafc",
        },
        secondary: {
          DEFAULT: "#141414",
          foreground: "#f8fafc",
        },
        muted: {
          DEFAULT: "#141414",
          foreground: "#94a3b8",
        },
        accent: {
          DEFAULT: "#111111",
          foreground: "#f8fafc",
        },
        border: "#1e293b",
      },
      borderRadius: {
        lg: "0.375rem",
        md: "0.25rem",
        sm: "0.125rem",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "ui-sans-serif", "system-ui"],
        headline: ["var(--font-manrope)", "sans-serif"],
      },
      boxShadow: {
        'premium': '0 10px 40px -10px rgba(0, 0, 0, 0.5)',
        'orange-glow': '0 0 20px -5px rgba(255, 61, 0, 0.3)',
      }
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
