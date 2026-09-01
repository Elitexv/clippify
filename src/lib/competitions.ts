import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

export type CompetitionStatus = "Draft" | "Active" | "Ended";

export type Competition = {
  id: string;
  hostId: string;
  hostName: string;
  title: string;
  prize: string;
  entries: number;
  endsIn: string;
  status: CompetitionStatus;
  payout: string;
  createdAt: Timestamp | null;
};

export async function createCompetition({
  hostId,
  hostName,
  title,
  prize,
  endsIn,
  status = "Draft",
  payout = "",
}: {
  hostId: string;
  hostName: string;
  title: string;
  prize: string;
  endsIn?: string;
  status?: CompetitionStatus;
  payout?: string;
}) {
  const docRef = await addDoc(collection(db, "competitions"), {
    hostId,
    hostName,
    title,
    prize,
    entries: 0,
    endsIn: endsIn ?? "",
    status,
    payout,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export function subscribeToCompetitions(callback: (competitions: Competition[]) => void) {
  const q = query(collection(db, "competitions"), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Competition)),
    (error) => {
      console.error("Competitions listener error:", error);
      callback([]);
    },
  );
}

export function subscribeToCompetitionsForHost(hostId: string, callback: (competitions: Competition[]) => void) {
  const q = query(collection(db, "competitions"), where("hostId", "==", hostId), orderBy("createdAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Competition)),
    (error) => {
      console.error("Hosted competitions listener error:", error);
      callback([]);
    },
  );
}

export async function updateCompetitionStatus(id: string, status: CompetitionStatus) {
  await updateDoc(doc(db, "competitions", id), { status });
}

// --- Submissions (entries streamers submit to a competition) ---

export type SubmissionStatus = "Pending" | "Approved" | "Rejected";

export type CompetitionSubmission = {
  id: string;
  competitionId: string;
  competitionTitle: string;
  submittedBy: string;
  submittedByUid: string;
  link: string;
  status: SubmissionStatus;
  withdrawn: boolean;
  submittedAt: Timestamp | null;
};

export async function addSubmission(input: {
  competitionId: string;
  competitionTitle: string;
  submittedBy: string;
  submittedByUid: string;
  link: string;
}) {
  const docRef = await addDoc(collection(db, "submissions"), {
    ...input,
    status: "Pending" satisfies SubmissionStatus,
    withdrawn: false,
    submittedAt: serverTimestamp(),
  });

  await updateDoc(doc(db, "competitions", input.competitionId), {
    entries: increment(1),
  });

  return docRef.id;
}

export function subscribeToAllSubmissions(callback: (submissions: CompetitionSubmission[]) => void) {
  const q = query(collection(db, "submissions"), orderBy("submittedAt", "desc"));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CompetitionSubmission)),
    (error) => {
      console.error("Submissions listener error:", error);
      callback([]);
    },
  );
}

export function subscribeToSubmissionsForUser(uid: string, callback: (submissions: CompetitionSubmission[]) => void) {
  const q = query(collection(db, "submissions"), where("submittedByUid", "==", uid));
  return onSnapshot(
    q,
    (snap) => callback(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as CompetitionSubmission)),
    (error) => {
      console.error("User submissions listener error:", error);
      callback([]);
    },
  );
}

export async function updateSubmissionStatus(id: string, status: SubmissionStatus) {
  await updateDoc(doc(db, "submissions", id), { status });
}

export async function withdrawSubmission(id: string) {
  await updateDoc(doc(db, "submissions", id), { withdrawn: true });
}
