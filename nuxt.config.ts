export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt',
    '@vite-pwa/nuxt'
  ],
  ssr: false,
  nitro: {
    preset: 'static',
    routeRules: {}
  },
  devServer: {
    port: 3011
  },
  experimental: {
    payloadExtraction: false
  },
  routeRules: {},
  pwa: {
    registerType: 'autoUpdate',
    workbox: {
      navigateFallback: '/',
      globPatterns: ['**/*.{js,css,html,png,svg,ico}'],
    },
    client: {
      installPrompt: true,
      periodicSyncForUpdates: 20,
    },
    manifest: {
      name: 'My Affirms - Affirmations App',
      short_name: 'My Affirms',
      description: 'Stwórz, organizuj i odtwarzaj pozytywne afirmacje. Zmień swoje życie z My Affirms.',
      theme_color: '#1e40af',
      background_color: '#ffffff',
      display: 'standalone',
      orientation: 'portrait',
      scope: '/',
      start_url: '/',
      icons: [
        {
          src: 'icon-192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icon-512.png',
          sizes: '512x512',
          type: 'image/png',
        },
        {
          src: 'icon-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        }
      ]
    }
  },
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
          href: 'https:
        },
        {
          rel: 'preconnect',
          href: 'https:
          crossorigin: ''
        },
        {
          rel: 'stylesheet',
          href: 'https:
        }
      ]
    }
  }
})