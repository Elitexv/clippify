import { Briefcase, Clapperboard, Sparkle, Star } from "lucide-react";

const audiences = [
  {
    icon: Clapperboard,
    iconBg: "bg-yellow-100 text-black",
    iconBgDark: "dark:bg-yellow-400/10 dark:text-yellow-400",
    title: "Content Creators",
    text: "Find viral-ready clips to save time and boost your content.",
  },
  {
    icon: Star,
    iconBg: "bg-amber-100 text-amber-600",
    iconBgDark: "dark:bg-amber-400/10 dark:text-amber-400",
    title: "Brands & Marketers",
    text: "Access premium clips or hire streamers for your campaigns.",
  },
  {
    icon: Briefcase,
    iconBg: "bg-sky-100 text-sky-600",
    iconBgDark: "dark:bg-sky-400/10 dark:text-sky-400",
    title: "Businesses",
    text: "Get engaging content that connects with your audience.",
  },
  {
    icon: Sparkle,
    iconBg: "bg-emerald-100 text-emerald-600",
    iconBgDark: "dark:bg-emerald-400/10 dark:text-emerald-400",
    title: "Streamers & Clippers",
    text: "Monetize your skills and build your creator brand.",
  },
];

export default function ForEveryone() {
  return (
    <section className="bg-slate-50 py-20 dark:bg-[#0a0a0a]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl dark:text-white">
            For <span className="text-amber-600 dark:text-yellow-400">Everyone</span>
          </h2>
          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Whether you&apos;re a content creator, brand, or business — Clippifi has you covered.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map(({ icon: Icon, iconBg, iconBgDark, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl bg-white p-6 shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-[#111] dark:shadow-none"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg} ${iconBgDark}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">{title}</h3>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
