
module.exports = {
  content: [
    "./components*.{js,vue,ts}",
    "./layouts*.vue",
    "./pages*.vue",
    "./plugins*.{js,ts}",
    "./nuxt.config.{js,ts}",
    "./app.vue"
  ],
  theme: {
    extend: {
      fontFamily: {
        'sans': ['Crimson Text', 'serif'],
        'serif': ['Crimson Text', 'serif'],
        'crimson': ['Crimson Text', 'serif'],
        'orbitron': ['Orbitron', 'monospace']
      },
      colors: {
        'brand-blue': '#2C5282',
        'brand-blue-dark': '#1A365D',
        'brand-blue-light': '#3182CE',
        'brand-bg': '#34c5db'
      }
    },
  },
  plugins: [],
}