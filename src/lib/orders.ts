import { addDoc, collection, onSnapshot, orderBy, query, serverTimestamp, Timestamp, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type OrderStatus = "Processing" | "Delivered";

export type Order = {
  id: string;
  buyerId: string;
  buyerName: string;
  clipId: string;
  clipTitle: string;
  creatorId: string;
  amount: number;
  status: OrderStatus;
  paymentProvider?: string;
  paymentReference?: string;
  createdAt: Timestamp | null;
};

export async function createOrder({
  buyerId,
  buyerName,
  clipId,
  clipTitle,
  creatorId,
  amount,
  paymentProvider,
  paymentReference,
}: {
  buyerId: string;
  buyerName: string;
  clipId: string;
  clipTitle: string;
  creatorId: string;
  amount: number;
  paymentProvider?: string;
  paymentReference?: string;
}) {
  const docRef = await addDoc(collection(db, "orders"), {
    buyerId,
    buyerName,
    clipId,
    clipTitle,
    creatorId,
    amount,
    ...(paymentProvider ? { paymentProvider } : {}),
    ...(paymentReference ? { paymentReference } : {}),
    status: "Delivered" satisfies OrderStatus,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToAllOrders(callback: (orders: Order[]) => void) {
  const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)),
    (error) => {
      console.error("All orders listener error:", error);
      callback([]);
    },
  );
}

// Sorted client-side rather than via Firestore `orderBy` alongside the `where` below,
// so these don't depend on a composite index being created in the Firebase console.
function byCreatedAtDesc(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

export function subscribeToOrdersForCreator(creatorId: string, callback: (orders: Order[]) => void) {
  const q = query(collection(db, "orders"), where("creatorId", "==", creatorId));
  return onSnapshot(
    q,
    (snap) => callback(byCreatedAtDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order))),
    (error) => {
      console.error("Creator orders listener error:", error);
      callback([]);
    },
  );
}

export function subscribeToOrdersForUser(userId: string, callback: (orders: Order[]) => void) {
  const q = query(collection(db, "orders"), where("buyerId", "==", userId));
  return onSnapshot(
    q,
    (snap) => callback(byCreatedAtDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order))),
    (error) => {
      console.error("Orders listener error:", error);
      callback([]);
    },
  );
}
