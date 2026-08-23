export type SubmissionStatus = "Pending" | "Approved" | "Rejected";

export type CompetitionSubmission = {
  id: string;
  competitionId: string;
  competitionTitle: string;
  submittedBy: string;
  link: string;
  submittedAt: string;
  status: SubmissionStatus;
};

const STORAGE_KEY = "clippifi.submissions";

const seedSubmissions: CompetitionSubmission[] = [
  {
    id: "sub1",
    competitionId: "comp1",
    competitionTitle: "Summer Drop Clipping Challenge",
    submittedBy: "Alex Chen",
    link: "https://tiktok.com/@alexclips/video/9981234",
    submittedAt: "2 hours ago",
    status: "Pending",
  },
  {
    id: "sub2",
    competitionId: "comp1",
    competitionTitle: "Summer Drop Clipping Challenge",
    submittedBy: "Priya Nair",
    link: "https://tiktok.com/@priyaclips/video/9981235",
    submittedAt: "yesterday",
    status: "Approved",
  },
  {
    id: "sub3",
    competitionId: "comp5",
    competitionTitle: "Holiday Highlight Reel 2025",
    submittedBy: "Elena Ruiz",
    link: "https://youtube.com/shorts/holiday-edit-99",
    submittedAt: "3 days ago",
    status: "Approved",
  },
];

export function getSubmissions(): CompetitionSubmission[] {
  if (typeof window === "undefined") return seedSubmissions;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedSubmissions));
    return seedSubmissions;
  }
  try {
    return JSON.parse(raw) as CompetitionSubmission[];
  } catch {
    return seedSubmissions;
  }
}

export function addSubmission(input: {
  competitionId: string;
  competitionTitle: string;
  submittedBy: string;
  link: string;
}): CompetitionSubmission {
  const all = getSubmissions();
  const next: CompetitionSubmission = {
    id: `sub-${Date.now()}`,
    submittedAt: "just now",
    status: "Pending",
    ...input,
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([next, ...all]));
  return next;
}

export function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus
): CompetitionSubmission[] {
  const updated = getSubmissions().map((s) => (s.id === id ? { ...s, status } : s));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}
