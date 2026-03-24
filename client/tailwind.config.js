/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'gs-bg': '#0f172a',
        'gs-card': '#1e293b',
        'gs-teal': '#14b8a6',
        'gs-teal-dark': '#0d9488',
        'gs-text': '#f1f5f9',
        'gs-text-muted': '#94a3b8',
        'gs-success': '#22c55e',
        'gs-warning': '#f59e0b',
        'gs-danger': '#ef4444',
        'gs-border': '#334155',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
