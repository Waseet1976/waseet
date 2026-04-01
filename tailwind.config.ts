import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          DEFAULT: "#C9973A",
          light: "#E5B85C",
          dark: "#A67A28",
          pale: "#FAF0D7",
        },
        sand: {
          DEFAULT: "#F5EFE0",
          dark: "#EDE4CC",
          light: "#FAF7F0",
        },
        obsidian: {
          DEFAULT: "#0F0F0E",
          light: "#1A1A18",
        },
        charcoal: {
          DEFAULT: "#1C1C1A",
          light: "#2C2C2A",
          muted: "#3C3C3A",
        },
        ink:  "#3D3D38",
        mist: "#8A8A80",
        fog:  "#B8B8B0",
        success: {
          DEFAULT: "#3A8A5A",
          light: "#4CAF73",
          dark: "#2E6E47",
          bg: "#F0FBF4",
        },
        danger: {
          DEFAULT: "#C93A3A",
          light: "#E54D4D",
          dark: "#A62E2E",
          bg: "#FFF0F0",
        },
        warning: {
          DEFAULT: "#C97A3A",
          light: "#E5974D",
          bg: "#FFF8F0",
        },
        violet: {
          DEFAULT: "#635BFF",
          light:   "#8680FF",
          dark:    "#4C45E0",
          bg:      "#F0EFFF",
        },
        cream: {
          DEFAULT: "#faf8f5",
          dark:    "#f2ede6",
        },
      },
      fontFamily: {
        sans:     ["var(--font-sora)", "system-ui", "sans-serif"],
        sora:     ["var(--font-sora)", "system-ui", "sans-serif"],
        lora:     ["var(--font-lora)", "Georgia", "serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
        arabic:   ["Cairo", "Noto Sans Arabic", "sans-serif"],
      },
      backgroundImage: {
        "gradient-waseet": "linear-gradient(135deg, #0F0F0E 0%, #1C1C1A 50%, #2C2C2A 100%)",
        "gradient-gold": "linear-gradient(135deg, #C9973A 0%, #E5B85C 100%)",
        "gradient-sand": "linear-gradient(135deg, #F5EFE0 0%, #FAF7F0 100%)",
      },
      boxShadow: {
        gold: "0 4px 24px rgba(201, 151, 58, 0.25)",
        "gold-lg": "0 8px 40px rgba(201, 151, 58, 0.35)",
        card: "0 2px 16px rgba(15, 15, 14, 0.08)",
        "card-lg": "0 8px 32px rgba(15, 15, 14, 0.12)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      animation: {
        "fade-in": "fadeIn 0.3s ease-in-out",
        "slide-up": "slideUp 0.3s ease-out",
        "slide-down": "slideDown 0.3s ease-out",
        shimmer: "shimmer 1.5s infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        slideDown: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
  darkMode: "class",
};

export default config;
