"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, CheckCircle2, Eye, Heart, Loader2, Search, XCircle } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { btnPrimary } from "@/lib/button-styles";
import { useAuth } from "@/lib/auth/auth-context";
import EmptyState from "@/components/dashboard/EmptyState";
import BudgetBar from "@/components/dashboard/BudgetBar";
import SubmitClipModal from "@/components/dashboard/SubmitClipModal";
import { subscribeToActiveCampaigns, type Campaign } from "@/lib/firebase-helpers";
import { subscribeToClipsForUser, type Clip, type ClipStatus } from "@/lib/clips";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";

type SortOption = "newest" | "budget-desc" | "budget-asc";

const statusBadge: Record<ClipStatus, { icon: typeof CheckCircle2; cls: string; label: string }> = {
  pending: {
    icon: Loader2,
    cls: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400",
    label: "Entry submitted",
  },
  approved: {
    icon: CheckCircle2,
    cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
    label: "Approved — live on Browse Clips",
  },
  rejected: {
    icon: XCircle,
    cls: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
    label: "Rejected",
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
  const [myClips, setMyClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    const unsubscribe = subscribeToActiveCampaigns((next) => {
      setCampaigns(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToClipsForUser(user.id, setMyClips);
    return () => unsubscribe();
  }, [user]);

  const submissionFor = (campaignId: string) =>
    myClips.find((c) => c.campaignId === campaignId);

  const visibleCampaigns = useMemo(() => {
    const term = search.trim().toLowerCase();
    const filtered = term
      ? campaigns.filter(
          (c) => c.title.toLowerCase().includes(term) || c.brandName?.toLowerCase().includes(term),
        )
      : campaigns;
    const sorted = [...filtered];
    if (sort === "budget-desc") sorted.sort((a, b) => b.budget - a.budget);
    else if (sort === "budget-asc") sorted.sort((a, b) => a.budget - b.budget);
    return sorted;
  }, [campaigns, search, sort]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Campaigns</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Browse open clipping campaigns posted by brands and submit a clip to participate — once
        approved, it also lists on Browse Clips.
      </p>

      {campaigns.length > 0 && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns by title or brand…"
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className={`${inputClass} sm:w-48`}
          >
            <option value="newest">Newest first</option>
            <option value="budget-desc">Budget: high to low</option>
            <option value="budget-asc">Budget: low to high</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            icon={Briefcase}
            title="No open campaigns yet"
            text="Brands post campaigns from Post a Campaign. Check back soon."
          />
        </div>
      ) : visibleCampaigns.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Search} title="No matching campaigns" text="Try a different search." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visibleCampaigns.map((campaign) => {
            const submission = submissionFor(campaign.id);
            const badge = submission ? statusBadge[submission.status] : null;
            const BadgeIcon = badge?.icon;

            return (
              <div
                key={campaign.id}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#111] dark:shadow-none"
              >
                <Link href={`/dashboard/competitions/${campaign.id}`}>
                  {campaign.flyerUrl ? (
                    <div className="relative h-32 w-full bg-slate-100 dark:bg-white/5">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={campaign.flyerUrl} alt="" className="h-full w-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-32 w-full items-center justify-center bg-gradient-to-br from-yellow-400/20 to-amber-500/20 dark:from-yellow-400/10 dark:to-amber-500/10">
                      <Briefcase className="h-8 w-8 text-amber-500/60 dark:text-yellow-400/40" />
                    </div>
                  )}
                </Link>

                <div className="p-6">
                  <Link href={`/dashboard/competitions/${campaign.id}`} className="hover:underline">
                    <p className="font-semibold text-slate-900 dark:text-white">{campaign.title}</p>
                  </Link>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Posted by {campaign.brandName || "a brand"}
                  </p>
                  {campaign.brief && (
                    <p className="mt-2 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
                      {campaign.brief}
                    </p>
                  )}

                  <BudgetBar campaign={campaign} className="mt-4" />
                  {campaign.deadline && (
                    <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Deadline: {campaign.deadline}</p>
                  )}

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
                    <>
                      <span
                        className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-center text-sm font-semibold ${badge.cls}`}
                      >
                        <BadgeIcon className="h-4 w-4" />
                        {badge.label}
                      </span>
                      {(submission.viewCount !== undefined || submission.likeCount !== undefined) && (
                        <div className="mt-2 flex items-center justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                          {submission.viewCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Eye className="h-3.5 w-3.5" /> {submission.viewCount.toLocaleString()} views
                            </span>
                          )}
                          {submission.likeCount !== undefined && (
                            <span className="flex items-center gap-1">
                              <Heart className="h-3.5 w-3.5" /> {submission.likeCount.toLocaleString()} likes
                            </span>
                          )}
                        </div>
                      )}
                    </>
                  ) : (
                    <button
                      onClick={() => setActiveCampaign(campaign)}
                      className={`mt-4 w-full rounded-lg py-2.5 text-sm ${btnPrimary}`}
                    >
                      Submit a Clip
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeCampaign && user && (
        <SubmitClipModal
          campaign={activeCampaign}
          userId={user.id}
          userName={user.name}
          onClose={() => setActiveCampaign(null)}
        />
      )}
    </div>
  );
}
