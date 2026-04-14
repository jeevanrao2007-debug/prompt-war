import { getApp, getApps, initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import {
  addDoc,
  collection,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from 'firebase/firestore'
import { getDatabase, onValue, ref, set } from 'firebase/database'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
}

const requiredFirebaseKeys = [
  'apiKey',
  'authDomain',
  'projectId',
  'appId',
  'databaseURL',
]

export const isFirebaseConfigured = requiredFirebaseKeys.every(
  (key) => Boolean(firebaseConfig[key])
)

if (!isFirebaseConfigured) {
  const missingKeys = requiredFirebaseKeys.filter((key) => !firebaseConfig[key])
  console.warn('⚠️  Firebase not fully configured. Missing keys:', missingKeys);
}

const app = isFirebaseConfigured
  ? getApps().length
    ? getApp()
    : initializeApp(firebaseConfig)
  : null

export const firestore = app ? getFirestore(app) : null
export const realtimeDb = app ? getDatabase(app) : null
export const auth = app ? getAuth(app) : null

export const writeCrowdData = (zone, value) => {
  if (!realtimeDb) {
    return Promise.reject(new Error('Firebase is not configured'))
  }

  const zoneRef = ref(realtimeDb, `crowd/${zone}`)
  return set(zoneRef, value)
}

export const listenToCrowdData = (callback) => {
  if (!realtimeDb) {
    callback({})
    return () => {}
  }

  const crowdRef = ref(realtimeDb, 'crowd')
  return onValue(crowdRef, (snapshot) => {
    callback(snapshot.val() || {})
  })
}

export const writeAdminAlert = (message) => {
  if (!realtimeDb) {
    return Promise.reject(new Error('Firebase is not configured'))
  }

  const alertRef = ref(realtimeDb, 'alerts/latest')
  const payload = {
    id: Date.now(),
    message,
  }

  return set(alertRef, payload)
}

export const listenToAdminAlert = (callback) => {
  if (!realtimeDb) {
    callback(null)
    return () => {}
  }

  const alertRef = ref(realtimeDb, 'alerts/latest')
  return onValue(alertRef, (snapshot) => {
    callback(snapshot.val())
  })
}

export const saveAlertToFirestore = (message, level) => {
  if (!firestore) {
    return Promise.reject(new Error('Firebase is not configured'))
  }

  const alertsRef = collection(firestore, 'alerts')
  return addDoc(alertsRef, {
    message,
    level,
    timestamp: serverTimestamp(),
  })
}

export const listenToRecentAlerts = (callback) => {
  if (!firestore) {
    callback([])
    return () => {}
  }

  const alertsRef = collection(firestore, 'alerts')
  const recentAlertsQuery = query(alertsRef, orderBy('timestamp', 'desc'), limit(5))

  return onSnapshot(recentAlertsQuery, (snapshot) => {
    const data = snapshot.docs.map((doc) => {
      const payload = doc.data()
      return {
        id: doc.id,
        message: payload.message,
        level: payload.level,
        timestamp: payload.timestamp,
      }
    })

    callback(data)
  })
}
