"use client";

import { Check, CheckCircle2, ExternalLink, Eye, Film, Heart, Loader2, X, XCircle } from "lucide-react";
import type { Clip, ClipStatus } from "@/lib/clips";

const statusStyle: Record<ClipStatus, { cls: string; icon: typeof CheckCircle2 }> = {
  pending: { cls: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400", icon: Loader2 },
  approved: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400", icon: CheckCircle2 },
  rejected: { cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400", icon: XCircle },
};

function submittedOn(clip: Clip) {
  const ms = clip.createdAt?.toMillis();
  return ms ? new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null;
}

// The full review view for a campaign's participants (one card per submitted clip) —
// used on the brand and admin campaign detail pages, where a brand/admin actually
// decides whether to approve a clip rather than just glancing at a count. Unlike the
// compact ClipApprovalList (used on the list pages for a quick glance), this shows the
// actual video/thumbnail, category, and submission date so there's enough to review
// before approving.
export default function CampaignParticipants({
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
    <div className="flex flex-col gap-3">
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
      {clips.map((clip) => {
        const style = statusStyle[clip.status];
        const StatusIcon = style.icon;
        const href = clip.videoUrl || clip.link;
        const date = submittedOn(clip);

        return (
          <div
            key={clip.id}
            className="overflow-hidden rounded-xl border border-slate-100 bg-white dark:border-white/10 dark:bg-white/[0.02]"
          >
            <div className="flex gap-3 p-3">
              <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg bg-slate-900">
                {clip.videoUrl ? (
                  <video src={clip.videoUrl} controls className="h-full w-full object-cover" />
                ) : clip.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={clip.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Film className="h-6 w-6 text-white/30" />
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{clip.creatorName}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">
                      {clip.title} · {clip.category}
                      {date ? ` · ${date}` : ""}
                    </p>
                  </div>
                  <span
                    className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium capitalize ${style.cls}`}
                  >
                    <StatusIcon className="h-3 w-3" />
                    {clip.status}
                  </span>
                </div>

                {href && (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1.5 flex items-center gap-1 text-xs text-amber-600 hover:underline dark:text-yellow-400"
                  >
                    <span className="max-w-[260px] truncate">{href}</span>
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}

                {(clip.viewCount !== undefined || clip.likeCount !== undefined) && (
                  <div className="mt-1.5 flex items-center gap-3 text-xs text-slate-400">
                    {clip.viewCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {clip.viewCount.toLocaleString()}
                      </span>
                    )}
                    {clip.likeCount !== undefined && (
                      <span className="flex items-center gap-1">
                        <Heart className="h-3 w-3" /> {clip.likeCount.toLocaleString()}
                      </span>
                    )}
                  </div>
                )}

                {clip.status === "pending" && (
                  <div className="mt-2.5 flex gap-2">
                    <button
                      onClick={() => onResolve(clip, "approved")}
                      disabled={busy[clip.id]}
                      className="flex items-center gap-1.5 rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white transition-transform hover:scale-[1.03] disabled:opacity-60"
                    >
                      <Check className="h-3.5 w-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => onResolve(clip, "rejected")}
                      disabled={busy[clip.id]}
                      className="flex items-center gap-1.5 rounded-lg bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 transition-transform hover:scale-[1.03] disabled:opacity-60 dark:bg-red-500/10 dark:text-red-400"
                    >
                      <X className="h-3.5 w-3.5" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
