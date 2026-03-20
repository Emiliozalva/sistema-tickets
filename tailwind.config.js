/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'amarillo-pastel': '#FFFDE7',
        'amarillo-vivo': '#FFDB00',
        'amarillo-hover': '#FFEF8A',
      }
    },
  },
  plugins: [],
}