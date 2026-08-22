"use client";

import Image from "next/image";
import { useState } from "react";
import { BadgeCheck, Play, Search } from "lucide-react";
import { featuredClips } from "@/lib/mock-data";

const categories = ["All", "Tech", "Sports", "Motivation", "Nature", "Gaming", "Podcast"];

export default function BrowseClipsPage() {
  const [active, setActive] = useState("All");

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Clips</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Find ready-to-use clips from top creators.
      </p>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search clips, creators, categories..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-[#111] dark:text-white"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active === cat
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[...featuredClips, ...featuredClips].map((clip, i) => (
          <div
            key={`${clip.id}-${i}`}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#111] dark:shadow-none"
          >
            <div className="relative aspect-video">
              <Image
                src={`https://picsum.photos/seed/${clip.imageSeed}-${i}/400/240`}
                alt=""
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {clip.duration}
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:scale-110 group-hover:bg-white/25">
                  <Play className="h-3.5 w-3.5 fill-white text-white" />
                </span>
              </span>
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {clip.title}
              </p>
              <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                {clip.author}
                <BadgeCheck className="h-3 w-3 text-sky-500" />
              </p>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-amber-600 dark:text-yellow-400">
                  {clip.price}
                </span>
                <button className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition-transform duration-200 hover:scale-105 active:scale-95 dark:bg-yellow-400 dark:text-black">
                  Buy
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
