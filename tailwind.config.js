/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Harmonious dark color scheme
        brand: {
          50: '#f5f7ff',
          100: '#ebf0ff',
          200: '#dbe4ff',
          300: '#c2d1ff',
          400: '#9db4ff',
          500: '#6366f1', // Indigo 500
          600: '#4f46e5', // Indigo 600
          700: '#4338ca', // Indigo 700
          800: '#3730a3',
          900: '#312e81',
          950: '#1e1b4b',
        },
        darkBg: '#0b0f19', // Sleek dark blue-black
        cardBg: 'rgba(17, 24, 39, 0.7)', // Translucent glass slate
        cardHoverBg: 'rgba(31, 41, 55, 0.8)',
        borderBg: 'rgba(255, 255, 255, 0.08)',
        glow: 'rgba(99, 102, 241, 0.15)',
      },
      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        glassSm: '0 4px 16px 0 rgba(0, 0, 0, 0.25)',
        glow: '0 0 20px 2px rgba(99, 102, 241, 0.25)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
