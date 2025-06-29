import admin from 'firebase-admin'

// Initialize Firebase Admin if not already initialized
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID
  })
}

const db = admin.firestore()

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const body = await readBody(event)
    const { subscriptionId } = body

    if (!subscriptionId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Subscription ID is required'
      })
    }

    // Get subscription from Firestore
    const subscriptionRef = db.collection('subscriptions').doc(subscriptionId)
    const subscriptionDoc = await subscriptionRef.get()

    if (!subscriptionDoc.exists) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Subscription not found'
      })
    }

    const subscriptionData = subscriptionDoc.data()

    // Call Paddle API to cancel subscription
    const paddleResponse = await $fetch(`https://${config.public.paddleEnvironment === 'sandbox' ? 'sandbox-' : ''}api.paddle.com/subscriptions/${subscriptionData.paddle_subscription_id}/cancel`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.paddleApiKey}`,
        'Content-Type': 'application/json'
      },
      body: {
        effective_from: 'next_billing_period'
      }
    })

    // Update subscription status in Firestore
    await subscriptionRef.update({
      status: 'cancelled',
      cancelled_at: new Date(),
      updated_at: new Date()
    })

    return {
      success: true,
      message: 'Subscription cancelled successfully'
    }

  } catch (error) {
    console.error('Error cancelling subscription:', error)
    
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.message || 'Failed to cancel subscription'
    })
  }
})