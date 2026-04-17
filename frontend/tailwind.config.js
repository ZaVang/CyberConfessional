/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // TerminalUI Color Palette
        primary: '#00FF41',     // Hacker Green
        secondary: '#FF6600',   // Amber
        tertiary: '#00BFFF',    // Cyan
        error: '#FF0040',       // Error Red
        surface: '#141414',      // Panel background
        background: '#0D0D0D',    // Terminal background
        muted: '#666666',
        border: '#333333',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        'display': ['32px', { lineHeight: '1.2', fontWeight: '700' }],
        'headline': ['24px', { lineHeight: '1.3', fontWeight: '700' }],
        'subhead': ['18px', { lineHeight: '1.4', fontWeight: '700' }],
        'body': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
        'caption': ['12px', { lineHeight: '1.5', fontWeight: '400' }],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      borderRadius: {
        none: '0px',
      },
    },
  },
  plugins: [],
}
