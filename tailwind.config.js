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
        primary: "#104338", // Deep Teal/Green from Logo
        secondary: "#F16700", // Specific Orange requested (#F16700)
        accent: "#166E5E", // Lighter Teal for accents
        lightBg: "#f0fdf9", // Very light mint/white
        darkBg: "#0a2b24", // Darker Deep Green for sidebars
        surface: "#ffffff",
        surfaceMuted: "#f9fafb",
        borderSoft: "#e5e7eb",
        success: "#16a34a",
        danger: "#dc2626",
        warning: "#f97316",
        saPrimary: "#073F3A",
        saAccent: "#33675C",
      },
      fontFamily: {
        urdu: ["AlQalam", "Noto Nastaliq Urdu", "serif"],
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
