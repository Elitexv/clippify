"use client";

import { Check, CheckCircle2, Eye, Heart, Loader2, X, XCircle } from "lucide-react";
import type { Clip, ClipStatus } from "@/lib/clips";

const clipStatusStyle: Record<ClipStatus, { cls: string; icon: typeof CheckCircle2 }> = {
  pending: { cls: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400", icon: Loader2 },
  approved: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400", icon: CheckCircle2 },
  rejected: { cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400", icon: XCircle },
};

// Shared by every place a brand or admin reviews a campaign's submitted clips
// (dashboard/campaigns list + detail, admin/campaigns detail) so the approve/reject
// row markup and budget-aware setClipStatus() error handling only live in one place.
export default function ClipApprovalList({
  clips,
  busy,
  error,
  onResolve,
}: {
  clips: Clip[];
  busy: Record<string, boolean>;
  error?: string;
  onResolve: (clip: Clip, status: "approved" | "rejected") => void;
}) {
  if (clips.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {clips.map((entry) => {
        const style = clipStatusStyle[entry.status];
        const StatusIcon = style.icon;
        const href = entry.videoUrl || entry.link;
        return (
          <div
            key={entry.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-white/5"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="min-w-0 truncate text-slate-600 hover:underline dark:text-slate-300"
                >
                  {entry.creatorName} — {entry.title}
                </a>
              ) : (
                <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">
                  {entry.creatorName} — {entry.title}
                </span>
              )}
              {(entry.viewCount !== undefined || entry.likeCount !== undefined) && (
                <span className="flex shrink-0 items-center gap-2 text-slate-400">
                  {entry.viewCount !== undefined && (
                    <span className="flex items-center gap-0.5">
                      <Eye className="h-3 w-3" /> {entry.viewCount.toLocaleString()}
                    </span>
                  )}
                  {entry.likeCount !== undefined && (
                    <span className="flex items-center gap-0.5">
                      <Heart className="h-3 w-3" /> {entry.likeCount.toLocaleString()}
                    </span>
                  )}
                </span>
              )}
            </div>
            {entry.status === "pending" ? (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onResolve(entry, "approved")}
                  disabled={busy[entry.id]}
                  aria-label="Approve clip"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform hover:scale-110 disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onResolve(entry, "rejected")}
                  disabled={busy[entry.id]}
                  aria-label="Reject clip"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600 transition-transform hover:scale-110 disabled:opacity-60 dark:bg-red-500/10 dark:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <span
                className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${style.cls}`}
              >
                <StatusIcon className="h-3 w-3" />
                {entry.status}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
