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
        brand: {
          50: "#eef4ff",
          100: "#dbe7ff",
          200: "#bfd3ff",
          300: "#93b4ff",
          400: "#6089ff",
          500: "#3b62ff",
          600: "#2542f5",
          700: "#1d33dd",
          800: "#1d2db1",
          900: "#1e2c8b",
        },
        teal: {
          400: "#2dd4bf",
          500: "#14b8a6",
          600: "#0d9488",
        },
        purple: {
          500: "#8b5cf6",
          600: "#7c3aed",
        },
        ink: {
          950: "#070914",
          900: "#0b0f1f",
          800: "#101633",
          700: "#1a2244",
          600: "#2a3461",
          500: "#3a4682",
          400: "#5b67a3",
          300: "#8590bd",
          200: "#b6bfd8",
          100: "#dee3f1",
          50: "#f4f6fc",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
      },
      animation: {
        "gradient": "gradient 8s linear infinite",
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-up": "slideUp 0.4s ease-out",
      },
      keyframes: {
        gradient: {
          "0%, 100%": { "background-position": "0% 50%" },
          "50%": { "background-position": "100% 50%" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      backgroundImage: {
        "brand-gradient": "linear-gradient(135deg, #3b62ff 0%, #14b8a6 50%, #8b5cf6 100%)",
      },
    },
  },
  plugins: [],
};

export default config;
