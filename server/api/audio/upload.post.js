import { getApps, initializeApp, cert } from 'firebase-admin/app'
import { getStorage } from 'firebase-admin/storage'
import { getFirestore } from 'firebase-admin/firestore'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { affirmationId, audioContent, userId, voiceId, characterCount } = body

  console.log('Audio upload request:', { affirmationId, userId, voiceId, characterCount, hasAudio: !!audioContent })

  if (!affirmationId || !audioContent || !userId) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields: affirmationId, audioContent, userId'
    })
  }

  try {
    // Initialize Firebase Admin (if not already initialized)
    const config = useRuntimeConfig()
    console.log('Firebase config:', { 
      projectId: config.firebaseProjectId,
      hasClientEmail: !!config.firebaseClientEmail,
      hasPrivateKey: !!config.firebasePrivateKey,
      clientEmailPrefix: config.firebaseClientEmail?.substring(0, 20) + '...',
      existingApps: getApps().length
    })
    
    let app
    if (getApps().length === 0) {
      console.log('Initializing new Firebase Admin app...')
      app = initializeApp({
        credential: cert({
          projectId: config.firebaseProjectId || 'my-affirms',
          clientEmail: config.firebaseClientEmail,
          privateKey: config.firebasePrivateKey?.replace(/\\n/g, '\n')
        }),
        storageBucket: `${config.firebaseProjectId || 'my-affirms'}.appspot.com`
      })
    } else {
      console.log('Using existing Firebase Admin app - but it may not have storage bucket configured')
      app = getApps()[0]
    }

    const storage = getStorage(app)
    const firestore = getFirestore(app)

    // Create filename
    const filename = `${affirmationId}_${Date.now()}.mp3`
    const filePath = `audio/${userId}/${filename}`

    // Convert base64 to buffer
    const audioBuffer = Buffer.from(audioContent, 'base64')

    // Upload to Firebase Storage - try different bucket name formats
    const possibleBuckets = [
      `${config.firebaseProjectId || 'my-affirms'}.firebasestorage.app`,
      `${config.firebaseProjectId || 'my-affirms'}.appspot.com`
    ]
    
    console.log('Trying bucket names:', possibleBuckets)
    
    // Try the new format first
    const bucketName = possibleBuckets[0]
    console.log('Using bucket:', bucketName)
    const bucket = storage.bucket(bucketName)
    const file = bucket.file(filePath)

    await file.save(audioBuffer, {
      metadata: {
        contentType: 'audio/mpeg',
        metadata: {
          affirmationId,
          userId,
          voiceId: voiceId || 'unknown',
          uploadedAt: new Date().toISOString()
        }
      }
    })

    // Make file public readable
    await file.makePublic()

    // Get download URL
    const downloadURL = `https://storage.googleapis.com/${bucket.name}/${filePath}`

    // Save metadata to Firestore
    const isPremiumVoice = voiceId?.includes('Neural') || voiceId?.includes('Premium')
    const voiceType = isPremiumVoice ? 'premium' : 'standard'

    const audioDoc = {
      affirmation_id: affirmationId,
      user_id: userId,
      filename: filename,
      download_url: downloadURL,
      voice_id: voiceId || 'unknown',
      voice_type: voiceType,
      character_count: characterCount || 0,
      created_at: new Date()
    }

    await firestore.collection('affirmation_audio').doc(affirmationId).set(audioDoc)

    console.log('Audio uploaded successfully:', { filename, downloadURL, voiceType })

    return {
      success: true,
      filename,
      downloadURL,
      voiceType,
      characterCount
    }

  } catch (error) {
    console.error('Audio upload error:', error)
    throw createError({
      statusCode: 500,
      statusMessage: `Audio upload failed: ${error.message}`
    })
  }
})