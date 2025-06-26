export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@nuxtjs/i18n'
    // '@vite-pwa/nuxt' - temporarily disabled
  ],
  ssr: false,
  devServer: {
    port: 3000
  },
  experimental: {
    payloadExtraction: false
  },
  routeRules: {},
  
  app: {
    baseURL: '/',
    head: {
      link: [
        {
          rel: 'icon',
          type: 'image/x-icon',
          href: '/favicon.ico'
        },
        {
          rel: 'manifest',
          href: '/manifest.webmanifest'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com'
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Crimson+Text:ital,wght@0,400;0,600;0,700;1,400;1,600;1,700&family=Poppins:wght@300;400;500;600;700&display=swap'
        }
      ]
    }
  },
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'pl'],
    strategy: 'prefix_except_default'
  }
})