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
          DEFAULT: '#0D9488', // Deep teal
          light: '#14B8A6',
          dark: '#0F766E',
        },
        accent: {
          DEFAULT: '#F97316', // Coral
          light: '#FB923C',
          dark: '#EA580C',
        },
        background: '#F8FAFC',
        surface: '#FFFFFF',
      },
      fontFamily: {
        sans: ['DM Sans', 'sans-serif'],
        heading: ['Playfair Display', 'serif'],
      },
    },
  },
  plugins: [],
}
