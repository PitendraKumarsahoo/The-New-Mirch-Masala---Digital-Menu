import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';

export const firebaseConfig = {
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'celtic-truth-d5jvd',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:905353162661:web:3792fbf601c583111d424c',
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDoG5GYhJj5dIBLzwCqHDub1RxLXIi9sO0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'celtic-truth-d5jvd.firebaseapp.com',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'celtic-truth-d5jvd.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '905353162661',
};

export const FIRESTORE_DATABASE_ID =
  import.meta.env.VITE_FIREBASE_DATABASE_ID ||
  'ai-studio-thenewmirchmasal-6c66668c-0d7f-4e9e-bbb4-555986a2603a';

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore
let firestoreDb: Firestore;
try {
  firestoreDb = FIRESTORE_DATABASE_ID ? getFirestore(app, FIRESTORE_DATABASE_ID) : getFirestore(app);
} catch (error) {
  console.warn('[Firebase] Falling back to default database:', error);
  firestoreDb = getFirestore(app);
}

export const db: Firestore = firestoreDb;

// Initialize Firebase Authentication
export const auth: Auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
