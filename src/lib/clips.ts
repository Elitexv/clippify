import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { db, storage } from "@/lib/firebase";

export type ClipStatus = "pending" | "approved" | "rejected";

export type Clip = {
  id: string;
  creatorId: string;
  creatorName: string;
  title: string;
  category: string;
  price: number;
  link: string;
  videoUrl: string;
  status: ClipStatus;
  createdAt: Timestamp | null;
};

export async function uploadClipVideo(creatorId: string, file: File): Promise<string> {
  const path = `clips/${creatorId}/${Date.now()}-${file.name}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function createClip({
  creatorId,
  creatorName,
  title,
  category,
  price,
  link = "",
  videoUrl = "",
}: {
  creatorId: string;
  creatorName: string;
  title: string;
  category: string;
  price: number;
  link?: string;
  videoUrl?: string;
}) {
  const docRef = await addDoc(collection(db, "clips"), {
    creatorId,
    creatorName,
    title,
    category,
    price,
    link,
    videoUrl,
    status: "pending" satisfies ClipStatus,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToApprovedClips(callback: (clips: Clip[]) => void) {
  const q = query(collection(db, "clips"), where("status", "==", "approved"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Clip)),
    (error) => {
      console.error("Approved clips listener error:", error);
      callback([]);
    },
  );
}

export function subscribeToPendingClips(callback: (clips: Clip[]) => void) {
  const q = query(collection(db, "clips"), where("status", "==", "pending"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Clip)),
    (error) => {
      console.error("Pending clips listener error:", error);
      callback([]);
    },
  );
}

export function subscribeToClipsForUser(userId: string, callback: (clips: Clip[]) => void) {
  const q = query(collection(db, "clips"), where("creatorId", "==", userId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Clip)),
    (error) => {
      console.error("Creator clips listener error:", error);
      callback([]);
    },
  );
}

export async function setClipStatus(clipId: string, status: ClipStatus) {
  await updateDoc(doc(db, "clips", clipId), { status });
}

export type FavoriteClip = {
  clipId: string;
  title: string;
  price: number;
  creatorName: string;
  addedAt: Timestamp | null;
};

export async function addFavorite(userId: string, clip: Pick<Clip, "id" | "title" | "price" | "creatorName">) {
  await setDoc(doc(db, "users", userId, "favorites", clip.id), {
    clipId: clip.id,
    title: clip.title,
    price: clip.price,
    creatorName: clip.creatorName,
    addedAt: serverTimestamp(),
  });
}

export async function removeFavorite(userId: string, clipId: string) {
  await deleteDoc(doc(db, "users", userId, "favorites", clipId));
}

export function subscribeToFavorites(userId: string, callback: (favorites: FavoriteClip[]) => void) {
  const q = query(collection(db, "users", userId, "favorites"), orderBy("addedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => d.data() as FavoriteClip)),
    (error) => {
      console.error("Favorites listener error:", error);
      callback([]);
    },
  );
}

export async function fetchFavoriteIds(userId: string): Promise<Set<string>> {
  const snap = await getDocs(collection(db, "users", userId, "favorites"));
  return new Set(snap.docs.map((d) => d.id));
}
