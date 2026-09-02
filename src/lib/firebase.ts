import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// NEXT_PUBLIC_FIREBASE_API_KEY and friends come from .env.local, which is
// gitignored and never reaches a deploy platform on its own — they must be
// added as real environment variables in the hosting project's settings
// (e.g. Vercel > Project > Settings > Environment Variables). Without them,
// getAuth() throws synchronously ("auth/invalid-api-key"), and because this
// module is imported from the root layout, that crash takes down `next build`
// entirely (every page, including /_not-found, fails to prerender). The
// placeholder fallback below only prevents that hard crash so a misconfigured
// preview/build doesn't nuke the whole deploy — it does not make Firebase
// actually work. Real auth/Firestore/Storage calls still need the real values.
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn(
    "[firebase] NEXT_PUBLIC_FIREBASE_API_KEY is not set — Firebase features will not work " +
      "until the NEXT_PUBLIC_FIREBASE_* variables are configured on this deploy environment."
  );
}

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "missing-api-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "missing.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "missing-project",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "missing-app-id",
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
