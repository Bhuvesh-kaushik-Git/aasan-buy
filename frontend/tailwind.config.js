/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#7a8234', // FNP Olive Green
        secondary: '#008e36', // FNP Emerald Green
        success: '#008e36',
        accent: '#bec49e', // FNP Light Olive (Checkout buttons)
        background: '#ffffff',
        dark: '#111111',
        light: '#f5f5f5'
      },
      fontFamily: {
        sans: ['Montserrat', 'Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
