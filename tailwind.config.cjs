/* eslint-disable */
const rtl = require("tailwindcss-rtl");

module.exports = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Vazirmatn"', "system-ui", "sans-serif"],
        display: ['"Vazirmatn"', "system-ui", "sans-serif"],
      },
      colors: {
        // Primary: Deep Indigo
        ink: {
          50: "#f0f2f8",
          100: "#dde2ef",
          200: "#bcc5df",
          300: "#94a1ca",
          400: "#6b78af",
          500: "#4f5c98",
          600: "#3d4880",
          700: "#333c68",
          800: "#2c3356",
          900: "#1a1f38",
          950: "#0f1221",
        },
        // Accent: Warm Gold
        gold: {
          50: "#fefcf3",
          100: "#fdf6de",
          200: "#fbecbd",
          300: "#f7dc8c",
          400: "#f2c654",
          500: "#ecae2a",
          600: "#d68f1b",
          700: "#b26d18",
          800: "#91551b",
          900: "#774619",
        },
        // Success: Persian Turquoise
        turq: {
          50: "#effcfb",
          100: "#d5f6f5",
          200: "#b0eeec",
          300: "#78e1df",
          400: "#40c9c9",
          500: "#24abac",
          600: "#1f8a8e",
          700: "#1f6f73",
          800: "#205a5e",
          900: "#1f4a4e",
        },
        // Error: Rose
        rose: {
          50: "#fff1f3",
          100: "#ffe0e4",
          200: "#ffc6cf",
          300: "#ff9dac",
          400: "#ff6480",
          500: "#f93a5a",
          600: "#e61743",
          700: "#c20f37",
          800: "#a11034",
          900: "#891332",
        },
        // Neutral: Warm Stone
        stone: {
          50: "#fafaf9",
          100: "#f5f4f2",
          200: "#e8e6e3",
          300: "#d6d2cd",
          400: "#b9b3ab",
          500: "#9f978d",
          600: "#8a8177",
          700: "#726a62",
          800: "#5f5953",
          900: "#514c47",
          950: "#2a2724",
        },
        // Legacy aliases for compatibility
        sand: {
          50: "#fafaf9",
          100: "#f5f4f2",
          200: "#e8e6e3",
          300: "#d6d2cd",
          400: "#b9b3ab",
          500: "#9f978d",
          600: "#8a8177",
          700: "#726a62",
          800: "#5f5953",
          900: "#514c47",
        },
        jade: {
          50: "#effcfb",
          100: "#d5f6f5",
          200: "#b0eeec",
          300: "#78e1df",
          400: "#40c9c9",
          500: "#24abac",
          600: "#1f8a8e",
          700: "#1f6f73",
          800: "#205a5e",
          900: "#1f4a4e",
        },
        ember: {
          50: "#fff1f3",
          100: "#ffe0e4",
          200: "#ffc6cf",
          300: "#ff9dac",
          400: "#ff6480",
          500: "#f93a5a",
          600: "#e61743",
          700: "#c20f37",
          800: "#a11034",
          900: "#891332",
        },
      },
      boxShadow: {
        glow: "0 20px 60px -30px rgba(236, 174, 42, 0.5)",
        "glow-turq": "0 20px 60px -30px rgba(36, 171, 172, 0.5)",
        "glow-rose": "0 20px 60px -30px rgba(249, 58, 90, 0.4)",
        "inner-glow": "inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
        card: "0 4px 24px -4px rgba(26, 31, 56, 0.08), 0 0 0 1px rgba(26, 31, 56, 0.05)",
        "card-hover":
          "0 8px 40px -8px rgba(26, 31, 56, 0.12), 0 0 0 1px rgba(26, 31, 56, 0.08)",
        "card-dark":
          "0 4px 24px -4px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05)",
        "card-dark-hover":
          "0 8px 40px -8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08)",
      },
      backgroundImage: {
        "hero-gradient":
          "linear-gradient(135deg, #f0f2f8 0%, #fafaf9 50%, #fefcf3 100%)",
        "hero-gradient-dark":
          "linear-gradient(135deg, #0f1221 0%, #1a1f38 50%, #2c3356 100%)",
        "glow-radial":
          "radial-gradient(circle at 50% 0%, rgba(236, 174, 42, 0.15), transparent 60%)",
        "glow-radial-turq":
          "radial-gradient(circle at 50% 0%, rgba(36, 171, 172, 0.15), transparent 60%)",
        "mesh-gradient": `
          radial-gradient(at 27% 37%, rgba(236, 174, 42, 0.15) 0px, transparent 50%),
          radial-gradient(at 97% 21%, rgba(36, 171, 172, 0.12) 0px, transparent 50%),
          radial-gradient(at 52% 99%, rgba(79, 92, 152, 0.12) 0px, transparent 50%),
          radial-gradient(at 10% 29%, rgba(249, 58, 90, 0.08) 0px, transparent 50%)
        `,
        "mesh-gradient-dark": `
          radial-gradient(at 27% 37%, rgba(236, 174, 42, 0.1) 0px, transparent 50%),
          radial-gradient(at 97% 21%, rgba(36, 171, 172, 0.08) 0px, transparent 50%),
          radial-gradient(at 52% 99%, rgba(79, 92, 152, 0.15) 0px, transparent 50%),
          radial-gradient(at 10% 29%, rgba(249, 58, 90, 0.05) 0px, transparent 50%)
        `,
      },
      animation: {
        "fade-in-up": "fadeInUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in-scale": "fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-in-right":
          "slideInRight 0.6s cubic-bezier(0.16, 1, 0.3, 1) both",
        float: "float 3s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        shimmer: "shimmer 2s linear infinite",
        "rotate-slow": "rotate-slow 20s linear infinite",
        "check-draw":
          "check-draw 0.4s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards",
      },
      keyframes: {
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInScale: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px -5px var(--gold-400)" },
          "50%": { boxShadow: "0 0 40px -5px var(--gold-400)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "rotate-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "check-draw": {
          "0%": { strokeDashoffset: "24" },
          "100%": { strokeDashoffset: "0" },
        },
      },
      transitionTimingFunction: {
        "out-expo": "cubic-bezier(0.16, 1, 0.3, 1)",
        "out-back": "cubic-bezier(0.34, 1.56, 0.64, 1)",
        "in-out-quint": "cubic-bezier(0.83, 0, 0.17, 1)",
      },
    },
  },
  plugins: [rtl],
};
