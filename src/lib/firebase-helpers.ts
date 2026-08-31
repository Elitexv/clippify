import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  onSnapshot,
  Timestamp,
} from "firebase/firestore";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
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

export type AppRole = "brand" | "creator" | "both" | "admin";

export type AppUser = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: AppRole;
  initials: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export const getInitials = (name: string) => {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const chars = parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? "");
  return chars.join("") || "?";
};

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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await setDoc(doc(db, "users", uid), profile, { merge: true });
  return profile;
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
  const methods = await fetchSignInMethodsForEmail(auth, email.trim());
  if (methods.length > 0) {
    throw new Error("An account with this email already exists. Please sign in instead.");
  }

  const credential = await createUserWithEmailAndPassword(auth, email.trim(), password);
  const user = credential.user;
  return createFirebaseUserProfile({
    uid: user.uid,
    name,
    username,
    email: email.trim(),
    role,
  });
}

export function createUserProfileFromFirebaseUser(firebaseUser: User, fallbackRole: AppRole = "creator") {
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  } satisfies AppUser;
}

export async function ensureUserProfile(firebaseUser: User, fallbackRole: AppRole = "creator") {
  try {
    const snapshot = await getDoc(doc(db, "users", firebaseUser.uid));
    if (snapshot.exists()) {
      return { id: snapshot.id, ...snapshot.data() } as AppUser;
    }
  } catch {
    // Firestore profile reads can fail while the client is offline; fall back to the
    // authenticated user profile instead of surfacing the offline document error.
  }

  return createUserProfileFromFirebaseUser(firebaseUser, fallbackRole);
}

export async function loginWithFirebase(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return ensureUserProfile(credential.user, "creator");
}

export async function signInWithOAuth(providerName: "google" | "apple") {
  const provider =
    providerName === "google"
      ? new GoogleAuthProvider()
      : new OAuthProvider("apple.com");

  const credential = await signInWithPopup(auth, provider);
  return ensureUserProfile(credential.user, "creator");
}

export async function logoutFromFirebase() {
  await signOut(auth);
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
  const campaignsQuery = query(
    collection(db, "campaigns"),
    where("brandId", "==", userId),
    orderBy("createdAt", "desc"),
  );

  return onSnapshot(
    campaignsQuery,
    (snapshot) => {
      const campaigns = snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Campaign);
      callback(campaigns);
    },
    (error) => {
      console.error("Campaign listener error:", error);
      callback([]);
    },
  );
}

export function subscribeToAuth(callback: (user: AppUser | null, firebaseUser: User | null) => void) {
  let profileUnsubscribe: (() => void) | undefined;

  const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
    if (profileUnsubscribe) {
      profileUnsubscribe();
      profileUnsubscribe = undefined;
    }

    if (!firebaseUser) {
      callback(null, null);
      return;
    }

    callback(createUserProfileFromFirebaseUser(firebaseUser, "creator"), firebaseUser);

    profileUnsubscribe = subscribeToUserProfile(firebaseUser.uid, (userProfile) => {
      callback(userProfile ?? createUserProfileFromFirebaseUser(firebaseUser, "creator"), firebaseUser);
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
  title: string;
  channelLink: string;
  brief: string;
  budget: number;
  deadline: string;
  flyerUrl: string;
  status: CampaignStatus;
  createdAt: Timestamp | null;
};

export async function createCampaign({
  brandId,
  title,
  channelLink,
  brief,
  budget,
  deadline,
  flyerUrl,
  status = "draft",
}: {
  brandId: string;
  title: string;
  channelLink: string;
  brief?: string;
  budget: number;
  deadline?: string;
  flyerUrl?: string;
  status?: CampaignStatus;
}) {
  const docRef = await addDoc(collection(db, "campaigns"), {
    brandId,
    title,
    channelLink,
    brief: brief ?? "",
    budget,
    deadline: deadline ?? "",
    flyerUrl: flyerUrl ?? "",
    status,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

export async function fetchCampaignsForUser(userId: string): Promise<Campaign[]> {
  const q = query(
    collection(db, "campaigns"),
    where("brandId", "==", userId),
    orderBy("createdAt", "desc"),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }) as Campaign);
}
