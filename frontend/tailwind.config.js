/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      colors: {
        page: "#F8FAFC",
        card: "#FFFFFF",
        line: "#E2E8F0",

        primary: {
          DEFAULT: "#2563EB",
          hover: "#1D4ED8",
          soft: "#EFF6FF",
        },

        secondary: "#475569",
        heading: "#0F172A",
      },

      fontFamily: {
        sans: ["Inter", "Cairo", "system-ui", "sans-serif"],
      },
    },
  },

  plugins: [],
};