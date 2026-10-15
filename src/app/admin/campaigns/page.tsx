"use client";

import { Fragment, useEffect, useState } from "react";
import { Briefcase, Check, CheckCircle2, ChevronDown, ExternalLink, Eye, Heart, Loader2, X, XCircle } from "lucide-react";
import {
  subscribeToAllCampaigns,
  updateCampaignPayout,
  updateCampaignStatus,
  type Campaign,
  type CampaignStatus,
} from "@/lib/firebase-helpers";
import { setClipStatus, subscribeToClipsForCampaign, type Clip, type ClipStatus } from "@/lib/clips";

const statusOptions: CampaignStatus[] = ["draft", "active", "completed", "cancelled"];

const statusStyle: Record<CampaignStatus, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  awaiting_payment: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  completed: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const clipStatusStyle: Record<ClipStatus, { cls: string; icon: typeof CheckCircle2 }> = {
  pending: { cls: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400", icon: Loader2 },
  approved: { cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400", icon: CheckCircle2 },
  rejected: { cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400", icon: XCircle },
};

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [payoutDrafts, setPayoutDrafts] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [entries, setEntries] = useState<Clip[]>([]);

  useEffect(() => {
    const unsubscribe = subscribeToAllCampaigns((next) => {
      setCampaigns(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Only subscribed once a campaign is actually expanded — this page can list every
  // campaign on the platform, and there's no reason to hold a live clips listener
  // open for every single one just to show a submission count.
  useEffect(() => {
    if (!expandedId) return;
    const unsubscribe = subscribeToClipsForCampaign(expandedId, setEntries);
    return () => unsubscribe();
  }, [expandedId]);

  const resolveClip = async (clipId: string, status: "approved" | "rejected") => {
    setRowBusy((b) => ({ ...b, [clipId]: true }));
    try {
      await setClipStatus(clipId, status);
    } finally {
      setRowBusy((b) => ({ ...b, [clipId]: false }));
    }
  };

  const changeStatus = async (campaign: Campaign, status: CampaignStatus) => {
    if (status === campaign.status) return;
    setRowBusy((b) => ({ ...b, [campaign.id]: true }));
    try {
      await updateCampaignStatus(campaign.id, status);
    } finally {
      setRowBusy((b) => ({ ...b, [campaign.id]: false }));
    }
  };

  const savePayout = async (campaign: Campaign) => {
    const draft = payoutDrafts[campaign.id];
    if (draft === undefined) return;
    const amount = Number(draft);
    if (!Number.isFinite(amount) || amount === campaign.payoutPerClip) return;
    setRowBusy((b) => ({ ...b, [campaign.id]: true }));
    try {
      await updateCampaignPayout(campaign.id, amount);
    } finally {
      setRowBusy((b) => ({ ...b, [campaign.id]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campaigns</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Every campaign posted by every brand, across the platform.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#111]">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
            <Briefcase className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No campaigns have been posted yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Brand</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="px-4 py-3 font-medium">Payout per clip</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Submissions</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <Fragment key={c.id}>
                <tr className="border-b border-slate-50 last:border-0 dark:border-white/5">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-yellow-400" />
                      {c.title}
                    </div>
                    {c.channelLink && (
                      <a
                        href={c.channelLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 flex items-center gap-1 text-xs font-normal text-amber-600 hover:underline dark:text-yellow-400"
                      >
                        <span className="max-w-[180px] truncate">{c.channelLink}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                    {c.brandName}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-semibold text-amber-600 dark:text-yellow-400">
                    ₦{c.budget.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      value={payoutDrafts[c.id] ?? String(c.payoutPerClip)}
                      onChange={(e) => setPayoutDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                      onBlur={() => savePayout(c)}
                      disabled={rowBusy[c.id]}
                      placeholder="e.g. 500"
                      className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => changeStatus(c, e.target.value as CampaignStatus)}
                      disabled={rowBusy[c.id] || c.status === "awaiting_payment"}
                      className={`rounded-full border-0 px-2 py-1 text-xs font-medium capitalize disabled:opacity-60 ${statusStyle[c.status]}`}
                    >
                      {c.status === "awaiting_payment" && (
                        <option value="awaiting_payment">awaiting payment</option>
                      )}
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="bg-white text-slate-900 dark:bg-[#111] dark:text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <button
                      onClick={() => setExpandedId(expandedId === c.id ? null : c.id)}
                      className="flex items-center gap-1 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                      View
                      <ChevronDown className={`h-3.5 w-3.5 transition-transform ${expandedId === c.id ? "rotate-180" : ""}`} />
                    </button>
                  </td>
                </tr>
                {expandedId === c.id && (
                  <tr className="border-b border-slate-50 bg-slate-50 last:border-0 dark:border-white/5 dark:bg-white/[0.02]">
                    <td colSpan={5} className="px-4 py-3">
                      {entries.length === 0 ? (
                        <p className="py-2 text-xs text-slate-400">No clips submitted to this campaign yet.</p>
                      ) : (
                        <div className="flex flex-col gap-1.5">
                          {entries.map((entry) => {
                            const style = clipStatusStyle[entry.status];
                            const StatusIcon = style.icon;
                            const href = entry.videoUrl || entry.link;
                            return (
                              <div
                                key={entry.id}
                                className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-white px-3 py-2 text-xs dark:bg-[#111]"
                              >
                                <div className="flex min-w-0 flex-1 items-center gap-2">
                                  {href ? (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="min-w-0 truncate font-medium text-slate-700 hover:underline dark:text-slate-200"
                                    >
                                      {entry.creatorName} — {entry.title}
                                    </a>
                                  ) : (
                                    <span className="min-w-0 truncate font-medium text-slate-700 dark:text-slate-200">
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
                                      onClick={() => resolveClip(entry.id, "approved")}
                                      disabled={rowBusy[entry.id]}
                                      aria-label="Approve clip"
                                      className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white transition-transform hover:scale-110 disabled:opacity-60"
                                    >
                                      <Check className="h-3.5 w-3.5" />
                                    </button>
                                    <button
                                      onClick={() => resolveClip(entry.id, "rejected")}
                                      disabled={rowBusy[entry.id]}
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
                      )}
                    </td>
                  </tr>
                )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Click &quot;View&quot; on a campaign to see its submissions, or review every pending clip
        at once from Admin &gt; Moderation.
      </p>
    </div>
  );
}
