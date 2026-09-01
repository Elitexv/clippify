// One-time bootstrap: grant a user the "admin" role directly via the
// Firebase Admin SDK, bypassing client-side security rules entirely.
//
// Usage:
//   node scripts/make-admin.mjs someone@example.com
//
// Requires a service account key. Either:
//   - Set GOOGLE_APPLICATION_CREDENTIALS to the key file's path, or
//   - Place the key at ./serviceAccountKey.json (already gitignored)
//
// Get a key from: Firebase Console -> Project Settings -> Service
// accounts -> Generate new private key. Never commit this file or
// share its contents — it grants full admin access to your project.

import { existsSync, readFileSync } from "fs";
import { initializeApp, cert, applicationDefault } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

const email = process.argv[2];
if (!email) {
  console.error("Usage: node scripts/make-admin.mjs <email>");
  process.exit(1);
}

const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || "./serviceAccountKey.json";

const app = existsSync(keyPath)
  ? initializeApp({ credential: cert(JSON.parse(readFileSync(keyPath, "utf8"))) })
  : initializeApp({ credential: applicationDefault() });

const auth = getAuth(app);
const db = getFirestore(app);

try {
  const user = await auth.getUserByEmail(email);
  await db.doc(`users/${user.uid}`).set({ role: "admin" }, { merge: true });
  console.log(`✔ ${email} (${user.uid}) is now an admin.`);
} catch (error) {
  if (error.code === "auth/user-not-found") {
    console.error(`No account exists for ${email} yet. Sign up in the app first, then re-run this script.`);
  } else {
    console.error("Failed to grant admin:", error.message ?? error);
  }
  process.exit(1);
}
