"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, ClipboardList, ExternalLink, Plus, X } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { subscribeToCampaignsForUser, type Campaign, type CampaignStatus } from "@/lib/firebase-helpers";
import {
  subscribeToAllCampaignSubmissions,
  updateCampaignSubmissionStatus,
  type CampaignSubmission,
} from "@/lib/campaign-submissions";

const statusStyle: Record<CampaignStatus, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  completed: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const submissionStatusStyle: Record<CampaignSubmission["status"], string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export default function MyCampaignsPage() {
  return (
    <RequireAuth area="brand">
      <MyCampaignsContent />
    </RequireAuth>
  );
}

function MyCampaignsContent() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [submissions, setSubmissions] = useState<CampaignSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToCampaignsForUser(user.id, (next) => {
      setCampaigns(next);
      setLoading(false);
    });
    const unsubSubs = subscribeToAllCampaignSubmissions(setSubmissions);
    return () => {
      unsubscribe();
      unsubSubs();
    };
  }, [user]);

  const resolve = async (id: string, status: "Approved" | "Rejected") => {
    setRowBusy((b) => ({ ...b, [id]: true }));
    try {
      await updateCampaignSubmissionStatus(id, status);
    } finally {
      setRowBusy((b) => ({ ...b, [id]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Campaigns</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Campaigns you&apos;ve posted and what streamers can see about each one.
          </p>
        </div>
        <Link
          href="/dashboard/post-job"
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-yellow-500/30 transition-transform duration-200 hover:scale-105"
        >
          <Plus className="h-4 w-4" />
          Post a Campaign
        </Link>
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="mt-6">
          <ComingSoon
            icon={ClipboardList}
            title="No campaigns yet"
            text="Once you post a campaign, it'll show up here with its status and details."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((c) => (
            <div
              key={c.id}
              className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
            >
              {c.flyerUrl ? (
                <div className="relative h-36 w-full bg-slate-100 dark:bg-white/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={c.flyerUrl} alt="" className="h-full w-full object-cover" />
                </div>
              ) : (
                <div className="flex h-36 w-full items-center justify-center bg-slate-100 dark:bg-white/5">
                  <ClipboardList className="h-8 w-8 text-slate-300 dark:text-slate-600" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-semibold text-slate-900 dark:text-white">{c.title}</p>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium capitalize ${statusStyle[c.status]}`}>
                    {c.status}
                  </span>
                </div>
                <a
                  href={c.channelLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center gap-1 text-xs text-amber-600 hover:underline dark:text-yellow-400"
                >
                  <span className="max-w-[220px] truncate">{c.channelLink}</span>
                  <ExternalLink className="h-3 w-3 shrink-0" />
                </a>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="font-semibold text-amber-600 dark:text-yellow-400">
                    ₦{c.budget.toFixed(2)} budget
                  </span>
                  {c.deadline && <span>{c.deadline}</span>}
                </div>

                {(() => {
                  const entries = submissions.filter((s) => s.campaignId === c.id);
                  if (entries.length === 0) return null;
                  return (
                    <div className="mt-3 flex flex-col gap-1.5 border-t border-slate-100 pt-3 dark:border-white/10">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        {entries.length} {entries.length === 1 ? "entry" : "entries"}
                      </p>
                      {entries.map((entry) => (
                        <div
                          key={entry.id}
                          className="flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs dark:bg-white/5"
                        >
                          <a
                            href={entry.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="min-w-0 flex-1 truncate text-slate-600 hover:underline dark:text-slate-300"
                          >
                            {entry.submittedBy}
                          </a>
                          {entry.status === "Pending" ? (
                            <div className="flex shrink-0 gap-1">
                              <button
                                onClick={() => resolve(entry.id, "Approved")}
                                disabled={rowBusy[entry.id]}
                                aria-label="Approve entry"
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform hover:scale-105 active:scale-95 disabled:opacity-60"
                              >
                                <Check className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => resolve(entry.id, "Rejected")}
                                disabled={rowBusy[entry.id]}
                                aria-label="Reject entry"
                                className="flex h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-600 transition-transform hover:scale-105 active:scale-95 disabled:opacity-60 dark:bg-red-500/10 dark:text-red-400"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ) : (
                            <span
                              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium ${submissionStatusStyle[entry.status]}`}
                            >
                              {entry.status}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
