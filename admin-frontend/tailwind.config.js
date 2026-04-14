/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0e4c92', // AasanBuy Dark Blue
        secondary: '#f59c1a', // AasanBuy Bright Orange
        background: '#fffbf4', // Warm Cream Background
        accent: '#f3f4f6', 
        dark: '#1f2937',
        light: '#ffffff'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        serif: ['Playfair Display', 'serif'],
      }
    },
  },
  plugins: [],
}
