/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#FF6B00',
          light: '#FFA366',
          dark: '#CC5200'
        },
        secondary: '#111827',
        bgLight: '#FFFFFF',
        dark: '#000000',
        white: '#FFFFFF',
        customGray: {
          light: '#F3F4F6',
          DEFAULT: '#6B7280',
          dark: '#374151'
        }
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif']
      }
    }
  },
  plugins: []
};
