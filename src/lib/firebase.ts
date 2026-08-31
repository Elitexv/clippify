import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const alreadyInitialized = getApps().length > 0;
const app = alreadyInitialized ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
// Firestore's default WebChannel transport can hang indefinitely (no error, no
// resolve) behind proxies, VPNs, and some sandboxed/CI networks. Auto-detecting
// long-polling falls back automatically when the streaming transport doesn't work,
// with no effect in normal environments.
export const db = alreadyInitialized
  ? getFirestore(app)
  : initializeFirestore(app, { experimentalForceLongPolling: true });
export const storage = getStorage(app);

export default app;
