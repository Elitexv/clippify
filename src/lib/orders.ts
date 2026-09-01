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
  createdAt: Timestamp | null;
};

export async function createOrder({
  buyerId,
  buyerName,
  clipId,
  clipTitle,
  creatorId,
  amount,
}: {
  buyerId: string;
  buyerName: string;
  clipId: string;
  clipTitle: string;
  creatorId: string;
  amount: number;
}) {
  const docRef = await addDoc(collection(db, "orders"), {
    buyerId,
    buyerName,
    clipId,
    clipTitle,
    creatorId,
    amount,
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

export function subscribeToOrdersForCreator(creatorId: string, callback: (orders: Order[]) => void) {
  const q = query(collection(db, "orders"), where("creatorId", "==", creatorId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)),
    (error) => {
      console.error("Creator orders listener error:", error);
      callback([]);
    },
  );
}

export function subscribeToOrdersForUser(userId: string, callback: (orders: Order[]) => void) {
  const q = query(collection(db, "orders"), where("buyerId", "==", userId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Order)),
    (error) => {
      console.error("Orders listener error:", error);
      callback([]);
    },
  );
}
