/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#f16700",
        secondary: "#33675C",
        accent: "#0ea5e9",
        lightBg: "#f3f4f6",
        darkBg: "#020617",
        surface: "#ffffff",
        surfaceMuted: "#f9fafb",
        borderSoft: "#e5e7eb",
        success: "#16a34a",
        danger: "#dc2626",
        warning: "#f97316",
        brandTeal: "#33675C",
        brandForest: "#073F3A",
        touchWhite: "#FFFFFF",
      },
      fontFamily: {
        urdu: [
          "AlQalam Taj Nastaleeq",
          "Noto Nastaliq Urdu",
          "Jameel Noori Nastaleeq",
          "system-ui",
          "sans-serif",
        ],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: 0, transform: "translateY(8px)" },
          "100%": { opacity: 1, transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.45s ease-out both",
      },
    },
  },
  plugins: [],
};
