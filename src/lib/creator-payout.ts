import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type CreatorPayoutDetails = {
  accountName: string;
  bankName: string;
  accountNumber: string;
  walletAddress: string;
  updatedAt: number;
};

export const emptyPayoutDetails: CreatorPayoutDetails = {
  accountName: "",
  bankName: "",
  accountNumber: "",
  walletAddress: "",
  updatedAt: 0,
};

function payoutDoc(uid: string) {
  return doc(db, "users", uid, "payout", "details");
}

export async function getCreatorPayoutDetails(uid: string): Promise<CreatorPayoutDetails> {
  const snap = await getDoc(payoutDoc(uid));
  return snap.exists() ? { ...emptyPayoutDetails, ...(snap.data() as Partial<CreatorPayoutDetails>) } : emptyPayoutDetails;
}

export function subscribeToCreatorPayoutDetails(uid: string, callback: (details: CreatorPayoutDetails) => void) {
  return onSnapshot(
    payoutDoc(uid),
    (snap) => callback(snap.exists() ? { ...emptyPayoutDetails, ...(snap.data() as Partial<CreatorPayoutDetails>) } : emptyPayoutDetails),
    (error) => {
      console.error("Payout details listener error:", error);
      callback(emptyPayoutDetails);
    },
  );
}

export async function saveCreatorPayoutDetails(uid: string, details: Omit<CreatorPayoutDetails, "updatedAt">) {
  await setDoc(payoutDoc(uid), { ...details, updatedAt: Date.now() });
}
