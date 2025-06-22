export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
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
  app: {
    baseURL: '/',
    head: {
      link: [
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