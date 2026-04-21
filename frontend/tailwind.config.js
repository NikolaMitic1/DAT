/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'dat-dark': '#0d1117',
        'dat-border': '#1c2333',
        'dat-surface': '#111827',
        'dat-header': '#0f172a',
      },
      fontFamily: {
        outfit: ['Outfit', 'sans-serif'],
        bebas: ['"Bebas Neue"', 'cursive'],
      },
    },
  },
  plugins: [],
}

