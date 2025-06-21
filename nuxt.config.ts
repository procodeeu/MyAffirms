export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: [
    '@nuxtjs/tailwindcss',
    '@pinia/nuxt'
  ],
  ssr: true,
  devServer: {
    port: 3011
  },
  app: {
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