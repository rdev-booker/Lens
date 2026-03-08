/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — deep obsidian + warm champagne gold
        obsidian:  '#0A0A0A',
        charcoal:  '#1C1C1E',
        graphite:  '#2C2C2E',
        smoke:     '#6E6E73',
        silver:    '#AEAEB2',
        pearl:     '#F2F2F7',
        champagne: '#C9A96E',
        gold:      '#A67C52',
        ivory:     '#FAF7F2',
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans:    ['"DM Sans"', 'system-ui', 'sans-serif'],
        mono:    ['"DM Mono"', 'monospace'],
      },
      letterSpacing: {
        widest2: '0.25em',
        widest3: '0.35em',
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms',
      },
    },
  },
  plugins: [],
}
