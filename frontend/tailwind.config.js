import colors from 'tailwindcss/colors';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        // Warm greys everywhere instead of the cool default slate.
        slate: colors.stone,
        // Soft peach accent (primary buttons, highlights).
        brand: {
          50: '#FFF8EE', 100: '#FFEFD8', 200: '#FFE2B8', 300: '#FFD199', 400: '#FFC47E',
          500: '#F5AE5B', 600: '#E39538', 700: '#A9661B', 800: '#7A4710', 900: '#4A2B0A',
        },
        // Page background and hairlines.
        cream: { 50: '#FCFAF6', 100: '#F6F2EA', 200: '#ECE6D9', 300: '#DED5C3' },
        // Near-black for strong text and active states.
        ink: { DEFAULT: '#1C1B19', soft: '#3A3835' },
        sunny: '#FFE08A',
      },
      fontFamily: { sans: ['"DM Sans"', 'system-ui', 'sans-serif'] },
      borderRadius: { '4xl': '2rem' },
      boxShadow: {
        soft: '0 1px 2px rgba(28,27,25,0.04), 0 8px 24px -12px rgba(28,27,25,0.12)',
        float: '0 2px 4px rgba(28,27,25,0.04), 0 24px 48px -20px rgba(28,27,25,0.18)',
      },
    },
  },
  plugins: [],
};
