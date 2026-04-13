/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0e4c92',
        secondary: '#f59c1a',
        success: '#2aa44b',
        background: '#fcfcfc',
        dark: '#333333',
        light: '#ffffff'
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
