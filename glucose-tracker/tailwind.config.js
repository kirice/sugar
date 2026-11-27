/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#b9dffd',
          300: '#7cc4fb',
          400: '#38a6f6',
          500: '#0e88ea',
          600: '#026cc6',
          700: '#0356a0',
          800: '#084a85',
          900: '#0c3d6d',
        },
        teal2: {
          500: '#14b8a6',
        },
      },
      boxShadow: {
        card: '0 1px 3px rgba(16, 42, 67, 0.06), 0 4px 16px rgba(16, 42, 67, 0.06)',
      },
    },
  },
  plugins: [],
}
