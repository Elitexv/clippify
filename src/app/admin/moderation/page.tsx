"use client";

import Image from "next/image";
import { useState } from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { moderationQueue } from "@/lib/mock-data";

export default function ModerationPage() {
  const [queue, setQueue] = useState([...moderationQueue]);
  const [resolved, setResolved] = useState<{ title: string; action: "Approved" | "Rejected" }[]>([]);

  const resolve = (id: string, action: "Approved" | "Rejected") => {
    const item = queue.find((q) => q.id === id);
    if (!item) return;
    setQueue((prev) => prev.filter((q) => q.id !== id));
    setResolved((prev) => [{ title: item.title, action }, ...prev].slice(0, 5));
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Moderation Queue</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Review clips submitted by creators before they go live.
      </p>

      {queue.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#111]">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
            You&apos;re all caught up
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            No clips are waiting for review right now.
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {queue.map((m) => (
            <div
              key={m.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
            >
              <div className="relative aspect-video">
                <Image
                  src={`https://picsum.photos/seed/${m.imageSeed}/500/280`}
                  alt=""
                  fill
                  sizes="(min-width: 640px) 45vw, 90vw"
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-slate-900 dark:text-white">{m.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  by {m.author} · submitted {m.submitted}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => resolve(m.id, "Approved")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => resolve(m.id, "Rejected")}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-600 transition-transform duration-200 hover:scale-[1.02] active:scale-95 dark:bg-red-500/10 dark:text-red-400"
                  >
                    <X className="h-3.5 w-3.5" />
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div className="mt-8">
          <h2 className="text-sm font-semibold text-slate-500 dark:text-slate-400">
            Recently reviewed
          </h2>
          <ul className="mt-2 space-y-1.5">
            {resolved.map((r, i) => (
              <li
                key={i}
                className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/5"
              >
                <span className="text-slate-700 dark:text-slate-300">{r.title}</span>
                <span
                  className={
                    r.action === "Approved"
                      ? "text-xs font-medium text-emerald-600 dark:text-emerald-400"
                      : "text-xs font-medium text-red-600 dark:text-red-400"
                  }
                >
                  {r.action}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
