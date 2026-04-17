/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A237E', // Deep Indigo
          light: '#303F9F',
          dark: '#121858',
        },
        secondary: {
          DEFAULT: '#FFB300', // Luxe Gold
          light: '#FFCA28',
          dark: '#F57C00',
        },
        background: '#F4F7F9', // Silk Grey
        dark: '#121212',
        light: '#FFFFFF',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        'premium': '0 20px 50px -12px rgba(26, 35, 126, 0.08)',
      }
    },
  },
  plugins: [],
}
