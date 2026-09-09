import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type CampaignSubmissionStatus = "Pending" | "Approved" | "Rejected";

export type CampaignSubmission = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  submittedBy: string;
  submittedByUid: string;
  link: string;
  status: CampaignSubmissionStatus;
  withdrawn: boolean;
  submittedAt: Timestamp | null;
};

export async function addCampaignSubmission(input: {
  campaignId: string;
  campaignTitle: string;
  submittedBy: string;
  submittedByUid: string;
  link: string;
}) {
  const docRef = await addDoc(collection(db, "campaign_submissions"), {
    ...input,
    status: "Pending" satisfies CampaignSubmissionStatus,
    withdrawn: false,
    submittedAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToAllCampaignSubmissions(callback: (submissions: CampaignSubmission[]) => void) {
  const q = query(collection(db, "campaign_submissions"), orderBy("submittedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CampaignSubmission)),
    (error) => {
      console.error("Campaign submissions listener error:", error);
      callback([]);
    },
  );
}

export function subscribeToCampaignSubmissionsForUser(uid: string, callback: (submissions: CampaignSubmission[]) => void) {
  const q = query(collection(db, "campaign_submissions"), where("submittedByUid", "==", uid));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CampaignSubmission)),
    (error) => {
      console.error("User campaign submissions listener error:", error);
      callback([]);
    },
  );
}

export async function updateCampaignSubmissionStatus(id: string, status: CampaignSubmissionStatus) {
  await updateDoc(doc(db, "campaign_submissions", id), { status });
}

export async function withdrawCampaignSubmission(id: string) {
  await updateDoc(doc(db, "campaign_submissions", id), { withdrawn: true });
}
