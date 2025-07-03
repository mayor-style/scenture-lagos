/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E5D3C8', // Nude primary color
          dark: '#C4B0A2',
          light: '#F2E9E4',
        },
        secondary: {
          DEFAULT: '#2D2D2D', // Deep charcoal
          light: '#4A4A4A',
        },
        accent: {
          DEFAULT: '#D4AF37', // Muted gold
          light: '#E6C76E',
        },
        cream: '#F5F5F0',
        background: '#FAF7F2',
      },
      fontFamily: {
        heading: ['Playfair Display', 'serif'],
        body: ['Montserrat', 'sans-serif'],
      },
    },
  },
  plugins: [],
};