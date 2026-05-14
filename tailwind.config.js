/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      keyframes: {
        flashGreen: {
          '0%, 40%': { backgroundColor: 'rgb(34 197 94)' },
          '100%': {},
        },
        flashRed: {
          '0%, 40%': { backgroundColor: 'rgb(239 68 68)' },
          '100%': {},
        },
        flashAmber: {
          '0%, 50%': { backgroundColor: 'rgb(245 158 11)' },
          '100%': {},
        },
      },
      animation: {
        'flash-green': 'flashGreen 380ms ease-out',
        'flash-red': 'flashRed 380ms ease-out',
        'flash-amber': 'flashAmber 480ms ease-out',
      },
    },
  },
  plugins: [],
};
