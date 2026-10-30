import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type NotificationType =
  | "clip_submitted"
  | "clip_approved"
  | "clip_rejected"
  | "budget_exhausted"
  | "participation_requested"
  | "participation_approved"
  | "participation_rejected";

export type AppNotification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string;
  campaignId?: string;
  clipId?: string;
  requestId?: string;
  read: boolean;
  createdAt: Timestamp | null;
};

export async function createNotification({
  userId,
  type,
  title,
  body,
  link,
  campaignId,
  clipId,
  requestId,
}: Omit<AppNotification, "id" | "read" | "createdAt">) {
  await addDoc(collection(db, "notifications"), {
    userId,
    type,
    title,
    body,
    link,
    ...(campaignId ? { campaignId } : {}),
    ...(clipId ? { clipId } : {}),
    ...(requestId ? { requestId } : {}),
    read: false,
    createdAt: serverTimestamp(),
  });
}

// Sorted and capped client-side (rather than a Firestore orderBy+limit alongside the
// where below) for the same reason as clips.ts's byCreatedAtDesc: avoids depending on
// a composite index, which would otherwise fail this query outright.
export function subscribeToNotifications(userId: string, callback: (notifications: AppNotification[]) => void) {
  const q = query(collection(db, "notifications"), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snap) => {
      const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }) as AppNotification);
      items.sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
      callback(items.slice(0, 30));
    },
    (error) => {
      console.error("Notifications listener error:", error);
      callback([]);
    },
  );
}

export async function markNotificationRead(id: string) {
  await updateDoc(doc(db, "notifications", id), { read: true });
}

export async function markAllNotificationsRead(ids: string[]) {
  if (ids.length === 0) return;
  const batch = writeBatch(db);
  ids.forEach((id) => batch.update(doc(db, "notifications", id), { read: true }));
  await batch.commit();
}
