/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        cyan: {
          400: '#00F0FF',
          500: '#00D1FF',
          900: '#00313E',
          950: '#001A24',
        },
        red: {
          400: '#FF003C',
          500: '#D10031',
          950: '#2A000A',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}
