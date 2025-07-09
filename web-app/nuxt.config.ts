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
    locales: [
      { code: 'en', file: 'en.json' },
      { code: 'pl', file: 'pl.json' },
      { code: 'de', file: 'de.json' }
    ],
    lazy: true,
    langDir: 'locales',
    strategy: 'prefix_except_default',
    fallbackLocale: 'en'
  },
  
  runtimeConfig: {
    // Private keys (only available on server-side)
    firebaseProjectId: process.env.FIREBASE_PROJECT_ID || 'my-affirms',
    firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY,
    paddleApiKey: process.env.PADDLE_API_KEY,
    paddleWebhookSecret: process.env.PADDLE_WEBHOOK_SECRET,
    paddlePremiumMonthlyPriceId: process.env.PADDLE_PREMIUM_MONTHLY_PRICE_ID,
    
    // Public keys (exposed to client-side)
    public: {
      paddleEnvironment: process.env.PADDLE_ENVIRONMENT || 'sandbox',
      paddleSellerId: process.env.PADDLE_SELLER_ID
    }
  }
})