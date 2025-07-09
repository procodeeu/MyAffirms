// Firebase initialization utilities
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { firebaseConfig } from './config.js'

let app = null
let auth = null
let db = null
let storage = null

export const initializeFirebase = () => {
  if (!app) {
    app = initializeApp(firebaseConfig)
    auth = getAuth(app)
    db = getFirestore(app)
    storage = getStorage(app)
  }
  
  return { app, auth, db, storage }
}

export const getFirebaseServices = () => {
  if (!app) {
    initializeFirebase()
  }
  
  return { app, auth, db, storage }
}