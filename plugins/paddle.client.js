import { initializePaddle } from '@paddle/paddle-js'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  
  const paddle = await initializePaddle({
    environment: config.public.paddleEnvironment || 'sandbox',
    seller: config.public.paddleSellerId,
    checkout: {
      settings: {
        displayMode: 'overlay',
        theme: 'light',
        locale: 'pl'
      }
    }
  })

  return {
    provide: {
      paddle
    }
  }
})