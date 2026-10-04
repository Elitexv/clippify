import { cert, getApps, initializeApp, type ServiceAccount } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// Server-only. The service account lives in FIREBASE_SERVICE_ACCOUNT_JSON (no
// NEXT_PUBLIC_ prefix) and bypasses Firestore security rules — only the webhook and
// checkout routes import this, and they check authorization themselves.
function app() {
  const existing = getApps()[0];
  if (existing) return existing;
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON isn't set.");
  return initializeApp({ credential: cert(JSON.parse(raw) as ServiceAccount) });
}

export function adminDb() {
  return getFirestore(app());
}

export function adminAuth() {
  return getAuth(app());
}
