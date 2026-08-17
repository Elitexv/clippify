import Image from "next/image";
import { BadgeCheck, ChevronRight, Eye, Heart, Play } from "lucide-react";

const clips = [
  {
    duration: "00:45",
    title: "Future of AI, Explained",
    author: "Nova Clips",
    imageSeed: "clip-tech-server-room",
    views: "12.4K",
    likes: "245",
    price: "$12",
  },
  {
    duration: "00:32",
    title: "Game-Winning Shot!",
    author: "Hoop Clips",
    imageSeed: "clip-basketball-action",
    views: "8.7K",
    likes: "198",
    price: "$9",
  },
  {
    duration: "00:28",
    title: "Motivation is Everything",
    author: "Focus Edits",
    imageSeed: "clip-sunrise-run",
    views: "15.2K",
    likes: "312",
    price: "$11",
  },
  {
    duration: "00:59",
    title: "Breathtaking Nature",
    author: "Nature Clips",
    imageSeed: "clip-forest-waterfall",
    views: "6.3K",
    likes: "162",
    price: "$8",
  },
];

export default function PopularClips() {
  return (
    <section id="clips" className="bg-white py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Popular Clips</h2>
          <a
            href="#"
            className="group flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            View all clips{" "}
            <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
          </a>
        </div>

        <div className="mt-8 -mx-4 flex snap-x gap-5 overflow-x-auto px-4 pb-2 no-scrollbar sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-4">
          {clips.map((clip) => (
            <div
              key={clip.title}
              className="group w-64 shrink-0 snap-start overflow-hidden rounded-2xl border border-slate-100 shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:w-auto"
            >
              <div className="relative flex aspect-video items-center justify-center bg-slate-900">
                <Image
                  src={`https://picsum.photos/seed/${clip.imageSeed}/640/360`}
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 25vw, (min-width: 640px) 45vw, 256px"
                  className="object-cover transition duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/25" />
                <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[11px] font-medium text-white">
                  {clip.duration}
                </span>
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-emerald-400" />
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-white/15 backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:bg-white/25">
                  <Play className="h-4 w-4 fill-white text-white" />
                </span>
              </div>
              <div className="p-4">
                <h3 className="truncate font-semibold text-slate-900">{clip.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-slate-500">
                  {clip.author}
                  <BadgeCheck className="h-3.5 w-3.5 text-sky-500" />
                </p>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <Eye className="h-3.5 w-3.5" /> {clip.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" /> {clip.likes}
                    </span>
                  </span>
                  <span className="font-semibold text-amber-600">{clip.price}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
