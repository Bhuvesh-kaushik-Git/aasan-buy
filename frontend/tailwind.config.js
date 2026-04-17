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
          DEFAULT: '#FFB300', // Luxe Gold (Amber 600)
          light: '#FFCA28',
          dark: '#F57C00',
        },
        'cta-buy': '#EB5757', // Coral Red (Conversion focused)
        background: '#F4F7F9', // Silk Grey (Premium off-white)
        dark: '#121212',
        light: '#FFFFFF',
        glass: 'rgba(255, 255, 255, 0.7)',
      },
      fontFamily: {
        heading: ['Outfit', 'sans-serif'],
        sans: ['Inter', 'sans-serif'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
        '3xl': '24px',
        '4xl': '32px',
      },
      boxShadow: {
        soft: '0 4px 20px -2px rgba(0, 0, 0, 0.04)',
        premium: '0 20px 50px -12px rgba(26, 35, 126, 0.08)',
        glass: '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
      },
      backgroundImage: {
        'luxe-gradient': 'linear-gradient(135deg, #1A237E 0%, #303F9F 100%)',
        'gold-gradient': 'linear-gradient(135deg, #FFB300 0%, #FFD54F 100%)',
      }
    },
  },
  plugins: [],
}
