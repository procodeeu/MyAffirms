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

  const isDev = process.env.NODE_ENV === 'development'

  const activeConfig = isDev ? devFirebaseConfig : firebaseConfig

  const app = initializeApp(activeConfig)

  const auth = getAuth(app)
  const db = getFirestore(app)

  if (isDev) {
    try {
      
      connectAuthEmulator(auth, 'http:

      connectFirestoreEmulator(db, 'localhost', 8080)
    } catch (error) {
      
      }
  }

  let analytics = null
  if (!isDev) {
    analytics = getAnalytics(app)
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
})