import { Briefcase, Clapperboard, Sparkle, Star } from "lucide-react";

const audiences = [
  {
    icon: Clapperboard,
    iconBg: "bg-yellow-100 text-black",
    title: "Content Creators",
    text: "Find viral-ready clips to save time and boost your content.",
  },
  {
    icon: Star,
    iconBg: "bg-amber-100 text-amber-600",
    title: "Brands & Marketers",
    text: "Access premium clips or hire editors for your campaigns.",
  },
  {
    icon: Briefcase,
    iconBg: "bg-sky-100 text-sky-600",
    title: "Businesses",
    text: "Get engaging content that connects with your audience.",
  },
  {
    icon: Sparkle,
    iconBg: "bg-emerald-100 text-emerald-600",
    title: "Editors & Clippers",
    text: "Monetize your skills and build your creator brand.",
  },
];

export default function ForEveryone() {
  return (
    <section className="bg-slate-50 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-slate-900 sm:text-4xl">
            For <span className="text-amber-600">Everyone</span>
          </h2>
          <p className="mt-3 text-slate-500">
            Whether you&apos;re a content creator, brand, or business — Clippifi has you covered.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {audiences.map(({ icon: Icon, iconBg, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl bg-white p-6 shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
            >
              <span
                className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110 ${iconBg}`}
              >
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm text-slate-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
