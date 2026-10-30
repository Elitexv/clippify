"use client";

import { Check, CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import type { ParticipationRequest, ParticipationStatus } from "@/lib/participation";

const statusStyle: Record<ParticipationStatus, { cls: string; icon: typeof CheckCircle2 }> = {
  pending: { cls: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400", icon: Loader2 },
  approved: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400", icon: CheckCircle2 },
  rejected: { cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400", icon: XCircle },
};

function requestedOn(request: ParticipationRequest) {
  const ms = request.createdAt?.toMillis();
  return ms ? new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : null;
}

// Reviewed before "Submit a Clip" ever becomes available to the creator — see
// requestToParticipate/setParticipationStatus in src/lib/participation.ts. Used on the
// brand and admin campaign detail pages.
export default function ParticipationRequestList({
  requests,
  busy,
  error,
  onResolve,
}: {
  requests: ParticipationRequest[];
  busy: Record<string, boolean>;
  error?: string;
  onResolve: (request: ParticipationRequest, status: "approved" | "rejected") => void;
}) {
  if (requests.length === 0) return null;

  return (
    <div className="flex flex-col gap-1.5">
      {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      {requests.map((request) => {
        const style = statusStyle[request.status];
        const StatusIcon = style.icon;
        const date = requestedOn(request);
        return (
          <div
            key={request.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-white/5"
          >
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="min-w-0 truncate text-slate-600 dark:text-slate-300">
                {request.creatorName}
                {date ? ` · ${date}` : ""}
              </span>
            </div>
            {request.status === "pending" ? (
              <div className="flex shrink-0 items-center gap-1">
                <button
                  onClick={() => onResolve(request, "approved")}
                  disabled={busy[request.id]}
                  aria-label="Approve request"
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform hover:scale-110 disabled:opacity-60"
                >
                  <Check className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={() => onResolve(request, "rejected")}
                  disabled={busy[request.id]}
                  aria-label="Reject request"
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
                {request.status}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
