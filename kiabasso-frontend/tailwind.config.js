/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1558D6',
          50: '#EEF2FF',
          100: '#DBE4FF',
          200: '#BACCFF',
          300: '#8AA8FF',
          400: '#5A7FFF',
          500: '#1558D6',
          600: '#1045B0',
          700: '#0C338A',
          800: '#082264',
          900: '#04113E',
        },
        secondary: {
          DEFAULT: '#00B4D8',
          50: '#E0F7FF',
          100: '#B3EDFF',
          200: '#80E2FF',
          300: '#4DD6FF',
          400: '#26CBFF',
          500: '#00B4D8',
          600: '#0090B0',
          700: '#006C88',
          800: '#004860',
          900: '#002438',
        },
        surface: '#FFFFFF',
        background: '#F5F7FA',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        heading: ['Syne', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        card: '12px',
        full: '50%',
      },
      boxShadow: {
        subtle: '0 2px 8px rgba(21,88,214,0.08)',
        medium: '0 4px 16px rgba(21,88,214,0.12)',
      },
      spacing: {
        '4.5': '18px',
        '18': '72px',
        '88': '352px',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
