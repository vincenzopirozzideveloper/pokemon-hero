/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  safelist: [
    { pattern: /^bg-poke-/ },
    { pattern: /^text-poke-/ },
    { pattern: /^border-poke-/ },
  ],
  theme: {
    extend: {
      colors: {
        // Pokemon palette — to be refined
        'poke-red':     '#E3350D',
        'poke-red-dark':'#B02A0A',
        'poke-blue':    '#224A9A',
        'poke-yellow':  '#FFCB05',
        'poke-black':   '#000000',
        'poke-white':   '#FFFFFF',
        'poke-gray':    '#1A1A2E',
        'poke-gray-mid':'#2D2D44',
      },
    },
  },
  plugins: [],
}
