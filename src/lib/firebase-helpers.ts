import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  getDocs,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  OAuthProvider,
  fetchSignInMethodsForEmail,
  type User,
} from "firebase/auth";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "@/lib/firebase";
import { getPublicSettings } from "@/lib/platform-settings";

export type AppRole = "brand" | "creator" | "both" | "admin";

export type AccountStatus = "Active" | "Suspended";

export type AppUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AppRole;
  initials: string;
  status?: AccountStatus;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const chars = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return chars.join("") || "?";
};

export const AUTH_NO_SUCH_ACCOUNT_MESSAGE = "Incorrect email or password.";

function getAuthErrorMessage(error: unknown): string {
  const code =
    typeof error === "object" && error !== null && "code" in error
      ? String((error as { code: unknown }).code)
      : "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return AUTH_NO_SUCH_ACCOUNT_MESSAGE;
    case "auth/invalid-email":
      return "That email address doesn't look right.";
    case "auth/user-disabled":
      return "This account has been disabled. Contact support for help.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists. Please sign in instead.";
    case "auth/weak-password":
      return "Please choose a stronger password (at least 6 characters).";
    case "auth/network-request-failed":
      return "Network error. Check your connection and try again.";
    case "auth/popup-closed-by-user":
      return "Sign-in was cancelled.";
    default:
      return error instanceof Error ? error.message : "Something went wrong. Please try again.";
  }
}

export async function createFirebaseUserProfile({
  uid,
  name,
  username,
  email,
  role,
}: {
  uid: string;
  name: string;
  username: string;
  email: string;
  role: AppRole;
}) {
  const profile: AppUser = {
    id: uid,
    name,
    username: username || name.toLowerCase().replace(/\s+/g, ""),
    email,
    role,
    initials: getInitials(name),
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", uid), profile, { merge: true });
  return profile;
}

// Non-admin accounts can never be created mid-maintenance (a brand-new signup can
// never be admin anyway), and an existing non-admin can't log in until it's lifted —
// admins stay unaffected so there's always a way to turn maintenance mode back off.
async function assertNotBlockedByMaintenance(role: AppRole) {
  if (role === "admin") return;
  const { maintenanceMode } = await getPublicSettings();
  if (maintenanceMode) {
    throw new Error("Clippifi is currently undergoing maintenance. Please check back soon.");
  }
}

export async function registerWithFirebase({
  name,
  username,
  email,
  password,
  role,
}: {
  name: string;
  username: string;
  email: string;
  password: string;
  role: AppRole;
}) {
  await assertNotBlockedByMaintenance(role);

  let methods: string[];
  try {
    methods = await fetchSignInMethodsForEmail(auth, email.trim());
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
  if (methods.length > 0) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  let credential;
  try {
    credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }

  const user = credential.user;
  try {
    return await createFirebaseUserProfile({
      uid: user.uid,
      name,
      username,
      email: email.trim(),
      role,
    });
  } catch {
    // Auth account was created but the Firestore profile write failed (e.g. Firestore
    // isn't provisioned yet). Don't leave the caller with a raw Firestore error — the
    // next successful login will self-heal the missing profile via ensureUserProfile().
    throw new Error(
      "Your account was created, but we couldn't finish setting up your profile. Please try logging in — we'll finish setup automatically.",
    );
  }
}

export function createUserProfileFromFirebaseUser(firebaseUser: User, fallbackRole: AppRole = "creator"): AppUser {
  const displayName = firebaseUser.displayName?.trim() || "New User";
  const email = firebaseUser.email || "";
  const username = (firebaseUser.displayName || email.split("@")[0] || "user")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "")
    .slice(0, 24) || "user";

  return {
    id: firebaseUser.uid,
    name: displayName,
    username,
    email,
    role: fallbackRole,
    initials: getInitials(displayName),
    status: "Active",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function ensureUserProfile(firebaseUser: User, fallbackRole: AppRole = "creator") {
  try {
    const snapshot = await getDoc(doc(db, "users", firebaseUser.uid));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as AppUser;
    }

    // Auth account exists but its profile doc was never written (e.g. Firestore was
    // unreachable at signup time). Self-heal by persisting a fallback profile now so
    // the account isn't permanently missing its Firestore doc.
    const fallback = createUserProfileFromFirebaseUser(firebaseUser, fallbackRole);
    await setDoc(doc(db, "users", firebaseUser.uid), fallback, { merge: true });
    return fallback;
  } catch {
    // Firestore can still fail here (offline, still disabled, etc.) — fall back to the
    // authenticated user profile instead of surfacing the raw Firestore error.
    return createUserProfileFromFirebaseUser(firebaseUser, fallbackRole);
  }
}

export async function loginWithFirebase(email: string, password: string) {
  let credential;
  try {
    credential = await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
  const profile = await ensureUserProfile(credential.user, "creator");
  if (profile.status === "Suspended") {
    await signOut(auth);
    throw new Error("This account has been suspended. Contact support for help.");
  }
  try {
    await assertNotBlockedByMaintenance(profile.role);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
  return profile;
}

export async function signInWithOAuth(providerName: "google" | "apple", role: AppRole = "creator") {
  const provider =
    providerName === "google"
      ? new GoogleAuthProvider()
      : new OAuthProvider("apple.com");

  let credential;
  try {
    credential = await signInWithPopup(auth, provider);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
  // `role` only takes effect for a brand-new account (ensureUserProfile only uses the
  // fallback role when no profile doc exists yet) — a returning user keeps their real role.
  const profile = await ensureUserProfile(credential.user, role);
  try {
    await assertNotBlockedByMaintenance(profile.role);
  } catch (error) {
    await signOut(auth);
    throw error;
  }
  return profile;
}

export async function logoutFromFirebase() {
  await signOut(auth);
}

export async function requestPasswordReset(email: string) {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    throw new Error(getAuthErrorMessage(error));
  }
}

export function subscribeToUserProfile(uid: string, callback: (user: AppUser | null) => void) {
  return onSnapshot(
    doc(db, "users", uid),
    (snapshot) => {
      callback(snapshot.exists() ? ({ id: snapshot.id, ...snapshot.data() } as AppUser) : null);
    },
    (error) => {
      console.error("User profile listener error:", error);
      callback(null);
    },
  );
}

export function subscribeToCampaignsForUser(userId: string, callback: (campaigns: Campaign[]) => void) {
  // Sorted client-side rather than via Firestore `orderBy` alongside the `where`
  // below, so this doesn't depend on a composite index existing in the console.
  const campaignsQuery = query(collection(db, "campaigns"), where("brandId", "==", userId));

  return onSnapshot(
    campaignsQuery,
    (snapshot) => {
      const campaigns = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Campaign);
      campaigns.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      callback(campaigns);
    },
    (error) => {
      console.error("Campaign listener error:", error);
      callback([]);
    },
  );
}

// `isSynthetic: true` means this profile is a guessed default (role defaults to
// "creator"), not one actually read from Firestore — either because the profile doc
// hasn't been read yet, or because it doesn't exist. A caller that already has a real
// (non-synthetic) profile for the same uid — e.g. from a register()/login() call that
// just awaited the Firestore write/read directly — should ignore a synthetic update
// for that uid rather than let it clobber the real role. This matters right after
// signup: the profile doc write and this listener's first "doc doesn't exist yet"
// snapshot are two independent in-flight requests with no guaranteed ordering.
export function subscribeToAuth(
  callback: (user: AppUser | null, firebaseUser: User | null, isSynthetic: boolean) => void,
) {
  let profileUnsubscribe: (() => void) | undefined;

  const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (profileUnsubscribe) {
      profileUnsubscribe();
      profileUnsubscribe = undefined;
    }

    if (!firebaseUser) {
      callback(null, null, false);
      return;
    }

    callback(createUserProfileFromFirebaseUser(firebaseUser, "creator"), firebaseUser, true);

    profileUnsubscribe = subscribeToUserProfile(firebaseUser.uid, (userProfile) => {
      if (userProfile) {
        callback(userProfile, firebaseUser, false);
      } else {
        callback(createUserProfileFromFirebaseUser(firebaseUser, "creator"), firebaseUser, true);
      }
    });
  });

  return () => {
    authUnsubscribe();
    if (profileUnsubscribe) profileUnsubscribe();
  };
}

export async function uploadCampaignFlyer(brandId: string, file: File): Promise<string> {
  const path = `campaign-flyers/${brandId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export type CampaignStatus = "draft" | "active" | "completed" | "cancelled";

export type Campaign = {
  id: string;
  brandId: string;
  brandName: string;
  title: string;
  channelLink: string;
  brief: string;
  budget: number;
  deadline: string;
  flyerUrl: string;
  status: CampaignStatus;
  paymentProvider?: string;
  paymentReference?: string;
  createdAt: Timestamp | null;
};

export async function createCampaign({
  brandId,
  brandName,
  title,
  channelLink,
  brief,
  budget,
  deadline,
  flyerUrl,
  status = "draft",
  paymentProvider,
  paymentReference,
}: {
  brandId: string;
  brandName: string;
  title: string;
  channelLink: string;
  brief?: string;
  budget: number;
  deadline?: string;
  flyerUrl?: string;
  status?: CampaignStatus;
  paymentProvider?: string;
  paymentReference?: string;
}) {
  const docRef = await addDoc(collection(db, "campaigns"), {
    brandId,
    brandName,
    title,
    channelLink,
    brief: brief ?? "",
    budget,
    deadline: deadline ?? "",
    flyerUrl: flyerUrl ?? "",
    status,
    ...(paymentProvider ? { paymentProvider } : {}),
    ...(paymentReference ? { paymentReference } : {}),
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function fetchCampaignsForUser(userId: string): Promise<Campaign[]> {
  const q = query(collection(db, "campaigns"), where("brandId", "==", userId));
  const snapshot = await getDocs(q);
  const campaigns = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Campaign);
  campaigns.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
  return campaigns;
}

// For creators browsing open campaigns to submit clips to (see /dashboard/competitions,
// now repurposed as the creator-facing campaigns feed).
export function subscribeToActiveCampaigns(callback: (campaigns: Campaign[]) => void) {
  const q = query(collection(db, "campaigns"), where("status", "==", "active"));
  return onSnapshot(
    q,
    (snap) => {
      const campaigns = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Campaign);
      campaigns.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      callback(campaigns);
    },
    (error) => {
      console.error("Active campaigns listener error:", error);
      callback([]);
    },
  );
}

// --- Admin: platform-wide user management ---

export function subscribeToAllUsers(callback: (users: AppUser[]) => void) {
  return onSnapshot(
    collection(db, "users"),
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppUser)),
    (error) => {
      console.error("Users listener error:", error);
      callback([]);
    },
  );
}

export async function setUserStatus(uid: string, status: AccountStatus) {
  await setDoc(doc(db, "users", uid), { status, updatedAt: new Date().toISOString() }, { merge: true });
}

export async function setUserRole(uid: string, role: AppRole) {
  await setDoc(doc(db, "users", uid), { role, updatedAt: new Date().toISOString() }, { merge: true });
}
