"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle2, Link2, Loader2, Trophy, XCircle } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { subscribeToActiveCampaigns, type Campaign } from "@/lib/firebase-helpers";
import {
  addCampaignSubmission,
  subscribeToCampaignSubmissionsForUser,
  type CampaignSubmission,
} from "@/lib/campaign-submissions";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";

const statusBadge: Record<CampaignSubmission["status"], { icon: typeof CheckCircle2; cls: string }> = {
  Pending: {
    icon: Loader2,
    cls: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400",
  },
  Approved: {
    icon: CheckCircle2,
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  },
  Rejected: {
    icon: XCircle,
    cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
  },
};

export default function CreatorCampaignsPage() {
  return (
    <RequireAuth area="creator">
      <CreatorCampaignsContent />
    </RequireAuth>
  );
}

function CreatorCampaignsContent() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [mySubmissions, setMySubmissions] = useState<CampaignSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState<Record<string, boolean>>({});
  const [links, setLinks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = subscribeToActiveCampaigns((next) => {
      setCampaigns(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToCampaignSubmissionsForUser(user.id, setMySubmissions);
    return () => unsubscribe();
  }, [user]);

  const submissionFor = (campaignId: string) =>
    mySubmissions.find((s) => s.campaignId === campaignId);

  const submitEntry = async (campaign: Campaign) => {
    const link = (links[campaign.id] ?? "").trim();
    if (!link || !user) return;
    setBusy((b) => ({ ...b, [campaign.id]: true }));
    try {
      await addCampaignSubmission({
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        submittedBy: user.name,
        submittedByUid: user.id,
        link,
      });
      setEntering((e) => ({ ...e, [campaign.id]: false }));
    } finally {
      setBusy((b) => ({ ...b, [campaign.id]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campaigns</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Browse open clipping campaigns posted by brands and submit your clip to participate.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="mt-6">
          <ComingSoon
            icon={Briefcase}
            title="No open campaigns yet"
            text="Brands post campaigns from Post a Campaign. Check back soon."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {campaigns.map((campaign) => {
            const submission = submissionFor(campaign.id);
            const badge = submission ? statusBadge[submission.status] : null;
            const BadgeIcon = badge?.icon;

            return (
              <div
                key={campaign.id}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#111] dark:shadow-none"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
                  <Briefcase className="h-5 w-5" />
                </span>
                <p className="mt-4 font-semibold text-slate-900 dark:text-white">{campaign.title}</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Posted by {campaign.brandName || "a brand"}
                </p>
                {campaign.brief && (
                  <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                    {campaign.brief}
                  </p>
                )}

                <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
                  <span className="font-bold text-amber-600 dark:text-yellow-400">
                    ₦{campaign.budget.toFixed(2)} budget
                  </span>
                  {campaign.deadline && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {campaign.deadline}
                    </span>
                  )}
                </div>

                {campaign.channelLink && (
                  <a
                    href={campaign.channelLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 block truncate text-xs text-amber-600 hover:underline dark:text-yellow-400"
                  >
                    {campaign.channelLink}
                  </a>
                )}

                {submission && badge && BadgeIcon ? (
                  <span
                    className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-sm font-semibold ${badge.cls}`}
                  >
                    <BadgeIcon className="h-4 w-4" />
                    {submission.status === "Pending" ? "Entry submitted" : submission.status}
                  </span>
                ) : entering[campaign.id] ? (
                  <div className="mt-4">
                    <div className="relative">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        autoFocus
                        type="url"
                        value={links[campaign.id] ?? ""}
                        onChange={(e) => setLinks((l) => ({ ...l, [campaign.id]: e.target.value }))}
                        placeholder="Link to your clip entry"
                        className={inputClass}
                      />
                    </div>
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => submitEntry(campaign)}
                        disabled={busy[campaign.id]}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                      >
                        {busy[campaign.id] && <Loader2 className="h-4 w-4 animate-spin" />}
                        Submit Entry
                      </button>
                      <button
                        onClick={() => setEntering((e) => ({ ...e, [campaign.id]: false }))}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setEntering((e) => ({ ...e, [campaign.id]: true }))}
                    className="mt-4 w-full rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                  >
                    Submit a Clip
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex items-center justify-between rounded-2xl border border-dashed border-slate-200 bg-white p-5 dark:border-white/10 dark:bg-[#111]">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
            <Trophy className="h-5 w-5" />
          </span>
          <div>
            <p className="text-sm font-semibold text-slate-900 dark:text-white">
              Looking for prize contests instead?
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Join admin-hosted clipping contests and win cash prizes.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/contests"
          className="shrink-0 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/5"
        >
          View Contests
        </Link>
      </div>
    </div>
  );
}
