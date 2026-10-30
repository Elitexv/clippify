import { collection, doc, onSnapshot, query, serverTimestamp, setDoc, Timestamp, updateDoc, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { createNotification } from "@/lib/notifications";

// A creator can't submit a clip to a campaign until the brand approves a participation
// request first — see /dashboard/competitions (creator) and the campaign detail pages
// (brand/admin review). One doc per creator-campaign pair, keyed by a deterministic id
// (not addDoc's random one) specifically so firestore.rules's clips create rule can
// look the matching request up directly via get() rather than a query it can't express
// — this is what makes the gate a real server-side enforcement, not just a hidden
// button a client could route around by writing to `clips` directly.
export type ParticipationStatus = "pending" | "approved" | "rejected";

export type ParticipationRequest = {
  id: string;
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorName: string;
  status: ParticipationStatus;
  createdAt: Timestamp | null;
};

export function participationRequestId(campaignId: string, creatorId: string) {
  return `${campaignId}_${creatorId}`;
}

function byCreatedAtDesc<T extends { createdAt: Timestamp | null }>(items: T[]): T[] {
  return [...items].sort((a, b) => (b.createdAt?.toMillis() ?? 0) - (a.createdAt?.toMillis() ?? 0));
}

export async function requestToParticipate({
  campaignId,
  campaignTitle,
  creatorId,
  creatorName,
  brandId,
}: {
  campaignId: string;
  campaignTitle: string;
  creatorId: string;
  creatorName: string;
  brandId: string;
}) {
  const requestId = participationRequestId(campaignId, creatorId);
  await setDoc(doc(db, "participationRequests", requestId), {
    campaignId,
    campaignTitle,
    creatorId,
    creatorName,
    status: "pending",
    createdAt: serverTimestamp(),
  });
  createNotification({
    userId: brandId,
    type: "participation_requested",
    title: "New participation request",
    body: `${creatorName} wants to join "${campaignTitle}".`,
    link: `/dashboard/campaigns/${campaignId}`,
    campaignId,
    requestId,
  }).catch((error) => console.error("Failed to create participation-requested notification:", error));
}

export function subscribeToParticipationForCreator(
  creatorId: string,
  callback: (requests: ParticipationRequest[]) => void,
) {
  const q = query(collection(db, "participationRequests"), where("creatorId", "==", creatorId));
  return onSnapshot(
    q,
    (snap) => callback(byCreatedAtDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ParticipationRequest))),
    (error) => {
      console.error("Participation requests (creator) listener error:", error);
      callback([]);
    },
  );
}

export function subscribeToParticipationForCampaign(
  campaignId: string,
  callback: (requests: ParticipationRequest[]) => void,
) {
  const q = query(collection(db, "participationRequests"), where("campaignId", "==", campaignId));
  return onSnapshot(
    q,
    (snap) => callback(byCreatedAtDesc(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ParticipationRequest))),
    (error) => {
      console.error("Participation requests (campaign) listener error:", error);
      callback([]);
    },
  );
}

export async function setParticipationStatus(request: ParticipationRequest, status: "approved" | "rejected") {
  await updateDoc(doc(db, "participationRequests", request.id), { status });
  createNotification({
    userId: request.creatorId,
    type: status === "approved" ? "participation_approved" : "participation_rejected",
    title: status === "approved" ? "Request approved" : "Request declined",
    body:
      status === "approved"
        ? `You're approved to submit a clip to "${request.campaignTitle}".`
        : `Your request to join "${request.campaignTitle}" wasn't approved.`,
    link: `/dashboard/competitions/${request.campaignId}`,
    campaignId: request.campaignId,
    requestId: request.id,
  }).catch((error) => console.error("Failed to create participation-resolved notification:", error));
}
