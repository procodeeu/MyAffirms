import admin from 'firebase-admin'
import crypto from 'crypto'

// Inicjalizuj Firebase Admin SDK
if (!admin.apps.length) {
  const serviceAccount = {
    projectId: process.env.FIREBASE_PROJECT_ID || 'my-affirms',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  }
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.projectId
  })
}

const db = admin.firestore()

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Pobierz surowe dane webhook
    const body = await readRawBody(event)
    const signature = getHeader(event, 'paddle-signature')
    
    if (!signature) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Missing Paddle signature'
      })
    }
    
    // Weryfikuj webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', config.paddleWebhookSecret)
      .update(body)
      .digest('hex')
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid webhook signature'
      })
    }
    
    const webhookData = JSON.parse(body.toString())
    const { event_type, data } = webhookData
    
    console.log('Paddle webhook received:', event_type)
    
    switch (event_type) {
      case 'subscription.created':
        await handleSubscriptionCreated(data)
        break
        
      case 'subscription.updated':
        await handleSubscriptionUpdated(data)
        break
        
      case 'subscription.canceled':
        await handleSubscriptionCanceled(data)
        break
        
      case 'transaction.completed':
        await handleTransactionCompleted(data)
        break
        
      case 'transaction.payment_failed':
        await handlePaymentFailed(data)
        break
        
      default:
        console.log('Unhandled webhook event:', event_type)
    }
    
    return { success: true }
    
  } catch (error) {
    console.error('Paddle webhook error:', error)
    throw createError({
      statusCode: error.statusCode || 500,
      statusMessage: error.statusMessage || 'Webhook processing failed'
    })
  }
})

async function handleSubscriptionCreated(data) {
  const { id, customer_id, custom_data, status, next_billed_at, recurring_transaction_details } = data
  
  if (!custom_data?.userId) {
    console.error('No userId in custom_data for subscription:', id)
    return
  }
  
  try {
    await db.collection('subscriptions').doc(custom_data.userId).set({
      paddle_subscription_id: id,
      customer_id: customer_id,
      status: status,
      plan_id: 'premium_monthly',
      next_billed_at: admin.firestore.Timestamp.fromDate(new Date(next_billed_at)),
      amount: recurring_transaction_details.total_amount,
      currency: recurring_transaction_details.currency_code,
      created_at: admin.firestore.FieldValue.serverTimestamp(),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    })
    
    console.log('Subscription created in Firestore:', id)
  } catch (error) {
    console.error('Error creating subscription in Firestore:', error)
  }
}

async function handleSubscriptionUpdated(data) {
  const { id, status, next_billed_at, custom_data } = data
  
  if (!custom_data?.userId) {
    console.error('No userId in custom_data for subscription update:', id)
    return
  }
  
  try {
    await db.collection('subscriptions').doc(custom_data.userId).update({
      status: status,
      next_billed_at: admin.firestore.Timestamp.fromDate(new Date(next_billed_at)),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    })
    
    console.log('Subscription updated in Firestore:', id)
  } catch (error) {
    console.error('Error updating subscription in Firestore:', error)
  }
}

async function handleSubscriptionCanceled(data) {
  const { id, status, canceled_at, custom_data } = data
  
  if (!custom_data?.userId) {
    console.error('No userId in custom_data for subscription cancellation:', id)
    return
  }
  
  try {
    await db.collection('subscriptions').doc(custom_data.userId).update({
      status: 'canceled',
      canceled_at: admin.firestore.Timestamp.fromDate(new Date(canceled_at)),
      updated_at: admin.firestore.FieldValue.serverTimestamp()
    })
    
    console.log('Subscription canceled in Firestore:', id)
  } catch (error) {
    console.error('Error canceling subscription in Firestore:', error)
  }
}

async function handleTransactionCompleted(data) {
  const { id, subscription_id, total, currency_code, billed_at } = data
  
  try {
    await db.collection('transactions').add({
      paddle_transaction_id: id,
      subscription_id: subscription_id,
      amount: total,
      currency: currency_code,
      status: 'completed',
      billed_at: admin.firestore.Timestamp.fromDate(new Date(billed_at)),
      created_at: admin.firestore.FieldValue.serverTimestamp()
    })
    
    console.log('Transaction completed in Firestore:', id)
  } catch (error) {
    console.error('Error recording transaction in Firestore:', error)
  }
}

async function handlePaymentFailed(data) {
  const { id, subscription_id } = data
  
  try {
    await db.collection('transactions').add({
      paddle_transaction_id: id,
      subscription_id: subscription_id,
      status: 'failed',
      created_at: admin.firestore.FieldValue.serverTimestamp()
    })
    
    console.log('Payment failed recorded in Firestore:', id)
  } catch (error) {
    console.error('Error recording failed transaction in Firestore:', error)
  }
}