import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        suco: {
          // Primary — deep wine/burgundy
          plum:   "#85184F",
          plum2:  "#9E1F5E",
          rose:   "#B82870",
          // Accent — golden amber
          gold:   "#C49540",
          gold2:  "#D4A850",
          tan:    "#B8936A",
          // Backgrounds — warm cream
          cream:  "#EDE0D4",
          beige:  "#E2CEBC",
          card:   "#D8C4AC",
          border: "#C8AE94",
          // Text
          dark:   "#2D0A1A",
          mid:    "#6B3040",
          muted:  "#9B6070",
          // Legacy aliases (keep components working)
          dark2:  "#2D0A1A",
          gray:   "#DDD0BE",
          green:  "#85184F",   // remapped → plum
          lime:   "#9E1F5E",
          bright: "#B82870",
          berry:  "#C49540",
          pink:   "#D4A850",
          amber:  "#B8936A",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      animation: {
        "pulse-plum":  "pulsePlum 1.5s ease-in-out infinite",
        "float":       "float 3s ease-in-out infinite",
        "spin-slow":   "spin 8s linear infinite",
        "bounce-in":   "bounceIn 0.5s cubic-bezier(0.36, 0.07, 0.19, 0.97)",
        "slide-up":    "slideUp 0.4s ease-out",
        "shake":       "shake 0.5s ease-in-out",
        "glow":        "glow 2s ease-in-out infinite",
        "countdown":   "countdown 1s linear",
        // keep old name for Timer component
        "pulse-green": "pulsePlum 1.5s ease-in-out infinite",
      },
      keyframes: {
        pulsePlum: {
          "0%, 100%": { boxShadow: "0 0 0 0 rgba(133,24,79,0.35)" },
          "50%":      { boxShadow: "0 0 0 12px rgba(133,24,79,0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%":      { transform: "translateY(-10px)" },
        },
        bounceIn: {
          "0%":   { transform: "scale(0.3)", opacity: "0" },
          "50%":  { transform: "scale(1.1)" },
          "70%":  { transform: "scale(0.9)" },
          "100%": { transform: "scale(1)",   opacity: "1" },
        },
        slideUp: {
          "0%":   { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)",    opacity: "1" },
        },
        shake: {
          "0%, 100%": { transform: "translateX(0)" },
          "20%":      { transform: "translateX(-8px)" },
          "40%":      { transform: "translateX(8px)" },
          "60%":      { transform: "translateX(-4px)" },
          "80%":      { transform: "translateX(4px)" },
        },
        glow: {
          "0%, 100%": { textShadow: "0 0 8px rgba(133,24,79,0.4)" },
          "50%":      { textShadow: "0 0 20px rgba(133,24,79,0.9), 0 0 40px rgba(196,149,64,0.4)" },
        },
        countdown: {
          "0%":   { strokeDashoffset: "0" },
          "100%": { strokeDashoffset: "283" },
        },
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "suco-bg":    "radial-gradient(ellipse at top, #e8d5c2 0%, #EDE0D4 60%)",
        "card-shine": "linear-gradient(135deg, rgba(133,24,79,0.07) 0%, rgba(0,0,0,0) 60%)",
      },
    },
  },
  plugins: [],
};
export default config;
