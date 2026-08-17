import { BadgeCheck, ChevronRight } from "lucide-react";

const creators = [
  { name: "EditWizard", badge: "Top Rated", clips: "1.2K", followers: "38.6K", color: "bg-amber-500 text-black" },
  { name: "QuickCut Pro", badge: "Top Rated", clips: "986", followers: "21.4K", color: "bg-slate-800 text-white" },
  { name: "Slice & Dice", badge: "Trending", clips: "754", followers: "17.2K", color: "bg-orange-500 text-white" },
  { name: "FrameFlow", badge: "Rising Star", clips: "632", followers: "15.8K", color: "bg-sky-500 text-white" },
  { name: "Reel Architects", badge: "Top Rated", clips: "512", followers: "9.7K", color: "bg-slate-600 text-white" },
];

const badgeColor: Record<string, string> = {
  "Top Rated": "text-amber-600",
  Trending: "text-orange-600",
  "Rising Star": "text-sky-600",
};

export default function TopCreators() {
  return (
    <section id="creators" className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Top Clipper Creators</h2>
          <a
            href="#"
            className="group flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            View leaderboard{" "}
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mt-8 -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-5">
          {creators.map((c) => (
            <div
              key={c.name}
              className="group w-48 shrink-0 snap-start rounded-2xl bg-white p-5 text-center shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-auto"
            >
              <span
                className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full text-lg font-bold transition-transform duration-300 group-hover:scale-110 ${c.color}`}
              >
                {c.name.charAt(0)}
              </span>
              <p className="mt-3 flex items-center justify-center gap-1 text-sm font-semibold text-slate-900">
                {c.name}
                <BadgeCheck className="h-4 w-4 text-sky-500" />
              </p>
              <p className={`mt-0.5 text-xs font-medium ${badgeColor[c.badge]}`}>{c.badge}</p>
              <p className="mt-2 text-xs text-slate-500">{c.clips} clips</p>
              <p className="text-xs text-slate-500">{c.followers} followers</p>
              <button className="mt-4 w-full rounded-lg bg-yellow-100 py-2 text-xs font-semibold text-black transition-all duration-200 hover:scale-[1.03] hover:bg-yellow-200 active:scale-95">
                + Follow
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
