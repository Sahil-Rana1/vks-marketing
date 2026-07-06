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
          DEFAULT: '#F59E0B',
          light: '#FBBF24',
          dark: '#D97706'
        },
        secondary: '#111827',
        bgLight: '#F5F5F3',
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
