import { initializePaddle } from '@paddle/paddle-js'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()
  
  // Sprawdź czy seller ID jest dostępny
  const sellerId = config.public.paddleSellerId
  if (!sellerId) {
    console.log('Paddle Seller ID not configured, skipping Paddle initialization')
    return {
      provide: {
        paddle: null
      }
    }
  }
  
  try {
    const paddle = await initializePaddle({
      environment: config.public.paddleEnvironment || 'sandbox',
      seller: parseInt(sellerId), // Konwertuj na liczbę
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
  } catch (error) {
    console.error('Failed to initialize Paddle:', error)
    return {
      provide: {
        paddle: null
      }
    }
  }
})