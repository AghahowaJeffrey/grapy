/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        chartreuse: {
          50: "#f7fee7",
          100: "#ecfccb",
          200: "#d9f99d",
          300: "#bef264", // This is your primary "Grape" color
          400: "#a3e635",
          500: "#84cc16",
          600: "#65a30d",
          700: "#4d7c0f",
          800: "#3f6212",
          900: "#365314",
          950: "#1a2e05"
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        onest: ["Onest", "sans-serif"]
      }
    }
  },
  plugins: []
};
