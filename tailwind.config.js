/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // CSS-var driven palette — supports light/dark theme switching
        // RGB triplets defined in index.css :root / [data-theme="light"]
        obsidian:  'rgb(var(--c-obsidian) / <alpha-value>)',
        charcoal:  'rgb(var(--c-charcoal) / <alpha-value>)',
        graphite:  'rgb(var(--c-graphite) / <alpha-value>)',
        smoke:     'rgb(var(--c-smoke)    / <alpha-value>)',
        silver:    'rgb(var(--c-silver)   / <alpha-value>)',
        pearl:     'rgb(var(--c-pearl)    / <alpha-value>)',
        champagne: 'rgb(var(--c-champagne)/ <alpha-value>)',
        gold:      'rgb(var(--c-gold)     / <alpha-value>)',
        ivory:     'rgb(var(--c-ivory)    / <alpha-value>)',
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
