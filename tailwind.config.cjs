/* eslint-disable */
const rtl = require('tailwindcss-rtl')

module.exports = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Vazirmatn"', 'system-ui', 'sans-serif'],
        display: ['"Vazirmatn"', 'system-ui', 'sans-serif'],
      },
      colors: {
        sand: {
          50: '#f9f5ef',
          100: '#f3ece0',
          200: '#e6d7c4',
          300: '#d6bfa5',
          400: '#c29e7b',
          500: '#b0825e',
          600: '#9b6b4c',
          700: '#7f563f',
          800: '#654637',
          900: '#513a31',
        },
        jade: {
          50: '#effaf5',
          100: '#d7f3e5',
          200: '#b1e8cf',
          300: '#7fd8b4',
          400: '#3fc18b',
          500: '#27a372',
          600: '#1e845c',
          700: '#1b684b',
          800: '#18513d',
          900: '#134234',
        },
        ember: {
          50: '#fff4eb',
          100: '#ffe4cf',
          200: '#ffcba8',
          300: '#ffa371',
          400: '#ff6d32',
          500: '#ff470a',
          600: '#e63000',
          700: '#bf2400',
          800: '#991f04',
          900: '#7c1b08',
        },
      },
      boxShadow: {
        glow: '0 20px 60px -30px rgba(39, 163, 114, 0.6)',
      },
      backgroundImage: {
        'hero-radial':
          'radial-gradient(circle at 20% 20%, rgba(63, 193, 139, 0.18), transparent 50%), radial-gradient(circle at 80% 0%, rgba(255, 109, 50, 0.18), transparent 55%)',
      },
    },
  },
  plugins: [rtl],
}
