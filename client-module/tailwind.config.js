/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        paper: '#F4F3EE',
        ink: '#1C2321',
        ledger: {
          50: '#EEF2EC',
          100: '#D9E2D4',
          400: '#5A7C5E',
          600: '#3C5A40',
          700: '#2C4630',
        },
        stamp: {
          open: '#2C4630',
          progress: '#A8641E',
          completed: '#1F4E6B',
          cancelled: '#8C2F2F',
        },
        rule: '#D8D4C7',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        body: ['"IBM Plex Sans"', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
    },
  },
  plugins: [],
}
