export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const { userId, email, plan } = body
    
    if (!userId || !email || !plan) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing required fields: userId, email, plan'
      })
    }
    
    // Konfiguracja planów
    const plans = {
      premium_monthly: {
        priceId: config.paddlePremiumMonthlyPriceId,
        name: 'MyAffirms Premium - Miesięczny',
        description: '300k znaków premium + 1.2M znaków standard miesięcznie'
      }
    }
    
    const selectedPlan = plans[plan]
    if (!selectedPlan) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid plan selected'
      })
    }
    
    // W przypadku Paddle, zwracamy ID ceny - checkout zostanie obsłużony po stronie klienta
    return {
      success: true,
      data: {
        priceId: selectedPlan.priceId,
        planName: selectedPlan.name,
        planDescription: selectedPlan.description
      }
    }
    
  } catch (error) {
    console.error('Create checkout error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Internal server error'
    })
  }
})