/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal:  '#2BDBA4',
        'teal-light': '#5EEDC4',
        cream: '#F0EBD8',
        dark:  '#080808',
        'dark-2': '#0D0D0D',
        ink:   '#0D1A14',
      },
      fontFamily: {
        display: ['"Bebas Neue"', 'sans-serif'],
        body: ['"Space Grotesk"', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
