import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import {
  getAuth,
  setPersistence,
  indexedDBLocalPersistence,
  browserSessionPersistence,
  browserLocalPersistence,
} from 'firebase/auth';
import { getStorage } from 'firebase/storage';
import { Capacitor } from '@capacitor/core';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

// Standard Firestore – no multi-tab locking so all tabs get instant WebSocket
export const db = getFirestore(app);

export const auth = getAuth(app);

/**
 * Auth persistence strategy:
 *  - Native (Android/iOS): Use indexedDBLocalPersistence.
 *    Unlike sessionStorage, IndexedDB survives across the storage-partition
 *    boundary between the Capacitor WebView and the Chrome Custom Tab that
 *    Firebase opens for OAuth — this eliminates the "missing initial state" crash.
 *  - Web DEV: browserSessionPersistence so two localhost tabs can hold
 *    separate accounts (admin + customer) without overwriting each other.
 *  - Web PROD: browserLocalPersistence – user stays logged in across tabs.
 */
if (Capacitor.isNativePlatform()) {
  setPersistence(auth, indexedDBLocalPersistence).catch(console.error);
} else {
  setPersistence(
    auth,
    import.meta.env.DEV ? browserSessionPersistence : browserLocalPersistence,
  ).catch(console.error);
}

export const storage = getStorage(app);


