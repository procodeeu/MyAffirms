
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
        'sans': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        'serif': ['Crimson Text', 'Georgia', 'Times New Roman', 'serif'],
        'crimson': ['Crimson Text', 'Georgia', 'Times New Roman', 'serif'],
        'poppins': ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
        'orbitron': ['Orbitron', 'monospace']
      },
      colors: {
        'brand-blue': '#2C5282',
        'brand-blue-dark': '#1A365D',
        'brand-blue-light': '#3182CE',
        'brand-bg': '#34c5db',
        'pastel': {
          'violet': '#f3e6f6',
          'purple': '#f5e3f0',
          'purple-2': '#f6e7ed',
          'rose': '#f2e5e8',
          'cinereous': '#e8ded7',
          'khaki': '#f2eedd',
          'khaki-2': '#f7f3df',
          'dun': '#fdfae5',
          'vanilla': '#fffce4'
        }
      },
      boxShadow: {
        'soft': '0 2px 10px -2px rgba(0, 0, 0, 0.1)',
        'soft-lg': '0 4px 20px -4px rgba(0, 0, 0, 0.15)',
        'pastel': '0 4px 16px rgba(243, 230, 246, 0.4)',
        'button': '0 2px 8px rgba(0, 0, 0, 0.1)',
        'button-hover': '0 4px 16px rgba(0, 0, 0, 0.15)'
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem'
      },
      borderRadius: {
        'xl': '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem'
      },
      scale: {
        '102': '1.02'
      },
      backgroundImage: {
        'pastel-gradient': 'linear-gradient(135deg, #f3e6f6, #f5e3f0, #f6e7ed, #f2e5e8, #e8ded7, #f2eedd, #f7f3df, #fdfae5, #fffce4)',
        'soft-gradient': 'linear-gradient(135deg, #f3e6f6 0%, #f7f3df 50%, #fffce4 100%)',
        'calm-gradient': 'linear-gradient(to bottom right, #f5e3f0, #f2eedd)',
        'zen-gradient': 'linear-gradient(45deg, #f6e7ed, #e8ded7, #fdfae5)'
      }
    },
  },
  plugins: [],
}