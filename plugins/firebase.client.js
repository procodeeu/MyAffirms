import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: "AIzaSyDvZ62BbURaJVZ_8Isbe7TP4gm9wEaFl-I",
  authDomain: "my-affirms.firebaseapp.com",
  projectId: "my-affirms",
  storageBucket: "my-affirms.firebasestorage.app",
  messagingSenderId: "412277074951",
  appId: "1:412277074951:web:ab420afef6df959698cea2",
  measurementId: "G-V2YKSNSRS2"
}

const devFirebaseConfig = {
  apiKey: "demo-api-key",
  authDomain: "demo-project.firebaseapp.com",
  projectId: "demo-project",
  storageBucket: "demo-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "demo-app-id"
}

export default defineNuxtPlugin(async () => {
  if (process.server) {
    return {
      provide: {
        firebase: {
          app: null,
          auth: null,
          db: null,
          analytics: null
        }
      }
    }
  }

  if (typeof window === 'undefined') {
    return {
      provide: {
        firebase: {
          app: null,
          auth: null,
          db: null,
          analytics: null
        }
      }
    }
  }
  
  try {

    if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
      throw new Error('Firebase config is incomplete')
    }

    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)
    let analytics = null
    try {
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
      if (!isLocalhost && window.location.protocol === 'https:') {
        analytics = getAnalytics(app)
        } else {
        }
    } catch (analyticsError) {
      }
    
    return {
      provide: {
        firebase: {
          app,
          auth,
          db,
          analytics
        }
      }
    }
  } catch (error) {
    return {
      provide: {
        firebase: {
          app: null,
          auth: null,
          db: null,
          analytics: null
        }
      }
    }
  }
})