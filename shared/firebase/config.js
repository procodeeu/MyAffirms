// Firebase configuration for My Affirms
export const firebaseConfig = {
  // This will be populated from environment variables
  // in each app (web-app, mobile-app)
  apiKey: process.env.FIREBASE_API_KEY || '',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.FIREBASE_PROJECT_ID || 'my-affirms',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.FIREBASE_APP_ID || ''
}

// Firebase collections names
export const COLLECTIONS = {
  PROJECTS: 'projects',
  GROUPS: 'groups', 
  AFFIRMATION_AUDIO: 'affirmation_audio',
  SUBSCRIPTIONS: 'subscriptions',
  USAGE_TRACKING: 'usage_tracking',
  USER_PROFILES: 'user_profiles'
}

// Firebase Storage paths
export const STORAGE_PATHS = {
  AUDIO: 'audio',
  USER_AUDIO: (userId) => `audio/${userId}`,
  AFFIRMATION_AUDIO: (userId, affirmationId) => `audio/${userId}/${affirmationId}`
}