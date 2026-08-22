export const featuredClips = [
  {
    id: "c1",
    title: "Future of AI, Explained",
    author: "Nova Clips",
    imageSeed: "clip-tech-server-room",
    price: "$12",
    duration: "00:45",
  },
  {
    id: "c2",
    title: "Game-Winning Shot!",
    author: "Hoop Clips",
    imageSeed: "clip-basketball-action",
    price: "$9",
    duration: "00:32",
  },
  {
    id: "c3",
    title: "Motivation is Everything",
    author: "Focus Edits",
    imageSeed: "clip-sunrise-run",
    price: "$11",
    duration: "00:28",
  },
  {
    id: "c4",
    title: "Breathtaking Nature",
    author: "Nature Clips",
    imageSeed: "clip-forest-waterfall",
    price: "$8",
    duration: "00:59",
  },
] as const;

export type Competition = {
  id: string;
  title: string;
  host: string;
  prize: string;
  entries: number;
  endsIn: string;
  status: "Active" | "Ended";
  payout?: string;
};

export const competitions: Competition[] = [
  {
    id: "comp1",
    title: "Summer Drop Clipping Challenge",
    host: "Nova Sportswear",
    prize: "$5,000",
    entries: 214,
    endsIn: "4 days",
    status: "Active",
  },
  {
    id: "comp2",
    title: "Best Gaming Highlight Reel",
    host: "PixelPlay Studios",
    prize: "$2,500",
    entries: 132,
    endsIn: "9 days",
    status: "Active",
  },
  {
    id: "comp3",
    title: "Podcast Moments Remix",
    host: "Focus Media Co.",
    prize: "$1,200",
    entries: 76,
    endsIn: "12 days",
    status: "Active",
  },
  {
    id: "comp5",
    title: "Holiday Highlight Reel 2025",
    host: "Nova Sportswear",
    prize: "$4,000",
    entries: 341,
    endsIn: "Ended",
    status: "Ended",
    payout: "$150",
  },
];

export const trendingCreators = [
  { id: "u1", name: "EditWizard", badge: "Top Rated", clips: "1.2K", color: "bg-amber-500 text-black" },
  { id: "u2", name: "QuickCut Pro", badge: "Top Rated", clips: "986", color: "bg-slate-800 text-white" },
  { id: "u3", name: "Slice & Dice", badge: "Trending", clips: "754", color: "bg-orange-500 text-white" },
  { id: "u4", name: "FrameFlow", badge: "Rising Star", clips: "632", color: "bg-sky-500 text-white" },
] as const;

export const recentOrders = [
  { id: "o1", clip: "Future of AI, Explained", status: "Delivered", date: "Aug 12, 2026", amount: "$12" },
  { id: "o2", clip: "Motivation is Everything", status: "Processing", date: "Aug 15, 2026", amount: "$11" },
  { id: "o3", clip: "Breathtaking Nature", status: "Delivered", date: "Aug 9, 2026", amount: "$8" },
] as const;

export const adminUsers = [
  { id: "1", name: "Jamie Rivera", email: "creator@clippifi.test", role: "Both", joined: "Jul 2, 2026", status: "Active" },
  { id: "2", name: "Alex Chen", email: "alex@nova.com", role: "Brand", joined: "Jul 8, 2026", status: "Active" },
  { id: "3", name: "Priya Nair", email: "priya.clips@gmail.com", role: "Creator", joined: "Jul 14, 2026", status: "Active" },
  { id: "4", name: "Marcus Webb", email: "marcus.w@studio.io", role: "Creator", joined: "Jul 20, 2026", status: "Suspended" },
  { id: "5", name: "Nova Sportswear", email: "partnerships@novasport.com", role: "Brand", joined: "Aug 1, 2026", status: "Active" },
  { id: "6", name: "Elena Ruiz", email: "elena.edits@gmail.com", role: "Creator", joined: "Aug 5, 2026", status: "Active" },
] as const;

export type AdminCompetition = {
  id: string;
  title: string;
  host: string;
  prize: string;
  entries: number;
  status: "Active" | "Draft" | "Ended";
};

export const adminCompetitions: AdminCompetition[] = [
  { id: "comp1", title: "Summer Drop Clipping Challenge", host: "Nova Sportswear", prize: "$5,000", entries: 214, status: "Active" },
  { id: "comp2", title: "Best Gaming Highlight Reel", host: "PixelPlay Studios", prize: "$2,500", entries: 132, status: "Active" },
  { id: "comp3", title: "Podcast Moments Remix", host: "Focus Media Co.", prize: "$1,200", entries: 76, status: "Active" },
  { id: "comp4", title: "Spring Launch Teasers", host: "Orbit Apparel", prize: "$3,000", entries: 0, status: "Draft" },
  { id: "comp5", title: "Holiday Highlight Reel 2025", host: "Nova Sportswear", prize: "$4,000", entries: 341, status: "Ended" },
];

export const moderationQueue = [
  { id: "m1", title: "Insane Dunk Compilation", author: "Hoop Clips", imageSeed: "mod-basketball", submitted: "2 hours ago" },
  { id: "m2", title: "Late Night Coding Vibes", author: "Focus Edits", imageSeed: "mod-coding-desk", submitted: "5 hours ago" },
  { id: "m3", title: "City Skyline Timelapse", author: "Nature Clips", imageSeed: "mod-city-skyline", submitted: "yesterday" },
  { id: "m4", title: "Street Food Highlights", author: "Nova Clips", imageSeed: "mod-street-food", submitted: "yesterday" },
] as const;
