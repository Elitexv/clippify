import { Play, Quote } from "lucide-react";

export default function Testimonial() {
  return (
    <section className="bg-white px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#1a1a1a] via-[#141414] to-[#0a0a0a]">
        <div className="grid grid-cols-1 items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1fr_auto] lg:gap-12 lg:p-16">
          <div>
            <Quote className="h-9 w-9 text-yellow-400/60" />
            <p className="mt-4 text-xl font-medium leading-snug text-white sm:text-2xl">
              Clippifi helped me scale my content faster than ever. The
              quality is insane!
            </p>
            <div className="mt-6 flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-black">
                JB
              </span>
              <div>
                <p className="flex items-center gap-1 text-sm font-semibold text-white">
                  Jordan Blake
                </p>
                <p className="text-xs text-slate-400">YouTuber &amp; Entrepreneur</p>
              </div>
            </div>
            <div className="mt-8 flex gap-1.5">
              <span className="h-1.5 w-6 rounded-full bg-yellow-400" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
              <span className="h-1.5 w-1.5 rounded-full bg-white/30" />
            </div>
          </div>

          <div className="relative mx-auto flex h-40 w-40 items-center justify-center rounded-full bg-gradient-to-br from-yellow-500/30 to-amber-700/30 sm:h-48 sm:w-48">
            <span className="absolute h-16 w-16 animate-ping rounded-full bg-amber-500/40" />
            <button
              type="button"
              aria-label="Play testimonial video"
              className="relative flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 shadow-lg shadow-yellow-900/50 transition-transform duration-200 hover:scale-110 active:scale-95"
            >
              <Play className="h-6 w-6 fill-black text-black" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
