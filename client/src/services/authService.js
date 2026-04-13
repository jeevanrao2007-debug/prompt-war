import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { auth } from './firebaseService'

export const ADMIN_EMAIL = 'admin@promptwars.com'

export const setupAuthPersistence = async () => {
  if (!auth) {
    return
  }

  await setPersistence(auth, browserLocalPersistence)
}

export const signup = (email, password) => {
  if (!auth) {
    return Promise.reject(new Error('Firebase auth is not configured'))
  }

  return createUserWithEmailAndPassword(auth, email, password)
}

export const login = (email, password) => {
  if (!auth) {
    return Promise.reject(new Error('Firebase auth is not configured'))
  }

  return signInWithEmailAndPassword(auth, email, password)
}

export const logout = () => {
  if (!auth) {
    return Promise.reject(new Error('Firebase auth is not configured'))
  }

  return signOut(auth)
}

export const listenToAuthState = (callback) => {
  if (!auth) {
    callback(null)
    return () => {}
  }

  return onAuthStateChanged(auth, callback)
}

export const isAdminUser = (user) => {
  return Boolean(user?.email) && user.email.toLowerCase() === ADMIN_EMAIL
}
