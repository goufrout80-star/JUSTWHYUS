/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        teal:        '#2BDBA4',
        'teal-light':'#5EEDC4',
        coral:       '#FF5C38',
        cream:       '#F0EBD8',
        void:        '#080808',
        ink:         '#0D1A14',
      },
      fontFamily: {
        sans:    ['Inter', 'sans-serif'],
        brand:   ['CurvedPixel', 'sans-serif'],
        italic:  ['Italiana', 'serif'],
      },
    },
  },
  plugins: [],
}
