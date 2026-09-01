"use client";

import { useEffect, useState } from "react";
import { Check, Film, ShieldCheck, X } from "lucide-react";
import { setClipStatus, subscribeToPendingClips, type Clip } from "@/lib/clips";

export default function ModerationPage() {
  const [queue, setQueue] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [resolved, setResolved] = useState<{ title: string; action: "Approved" | "Rejected" }[]>([]);
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = subscribeToPendingClips((next) => {
      setQueue(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const resolve = async (clip: Clip, action: "Approved" | "Rejected") => {
    setBusy((b) => ({ ...b, [clip.id]: true }));
    try {
      await setClipStatus(clip.id, action === "Approved" ? "approved" : "rejected");
      setResolved((prev) => [{ title: clip.title, action }, ...prev].slice(0, 5));
    } finally {
      setBusy((b) => ({ ...b, [clip.id]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Moderation Queue</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Review clips submitted by creators before they go live.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : queue.length === 0 ? (
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
          {queue.map((clip) => (
            <div
              key={clip.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
            >
              <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                {clip.videoUrl ? (
                  <video src={clip.videoUrl} controls className="h-full w-full object-cover" />
                ) : (
                  <Film className="h-8 w-8 text-white/30" />
                )}
              </div>
              <div className="p-4">
                <p className="font-semibold text-slate-900 dark:text-white">{clip.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  by {clip.creatorName} · {clip.category} · ${clip.price.toFixed(2)}
                </p>
                {clip.link && (
                  <a
                    href={clip.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 block truncate text-xs text-amber-600 hover:underline dark:text-yellow-400"
                  >
                    {clip.link}
                  </a>
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => resolve(clip, "Approved")}
                    disabled={busy[clip.id]}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-emerald-500 py-2 text-xs font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Approve
                  </button>
                  <button
                    onClick={() => resolve(clip, "Rejected")}
                    disabled={busy[clip.id]}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2 text-xs font-semibold text-red-600 transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60 dark:bg-red-500/10 dark:text-red-400"
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
