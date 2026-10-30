"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Briefcase, CheckCircle2, Clock, Eye, Heart, Link2, Loader2, XCircle } from "lucide-react";
import EmptyState from "@/components/dashboard/EmptyState";
import BudgetBar from "@/components/dashboard/BudgetBar";
import SubmitClipModal from "@/components/dashboard/SubmitClipModal";
import { btnPrimary } from "@/lib/button-styles";
import { useAuth } from "@/lib/auth/auth-context";
import { subscribeToCampaign, type Campaign } from "@/lib/firebase-helpers";
import { subscribeToClipsForUser, type Clip, type ClipStatus } from "@/lib/clips";
import { requestToParticipate, subscribeToParticipationForCreator, type ParticipationRequest } from "@/lib/participation";

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

export default function CreatorCampaignDetailContent() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [campaign, setCampaign] = useState<Campaign | null | undefined>(undefined);
  const [myClips, setMyClips] = useState<Clip[]>([]);
  const [myRequests, setMyRequests] = useState<ParticipationRequest[]>([]);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    return subscribeToCampaign(id, setCampaign);
  }, [id]);

  useEffect(() => {
    if (!user) return;
    return subscribeToClipsForUser(user.id, setMyClips);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return subscribeToParticipationForCreator(user.id, setMyRequests);
  }, [user]);

  if (campaign === undefined) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="mx-auto max-w-2xl">
        <EmptyState icon={Briefcase} title="Campaign not found" text="It may have been removed or isn't open anymore." />
        <Link href="/dashboard/competitions" className="mt-4 flex items-center gap-1.5 text-sm text-amber-600 hover:underline dark:text-yellow-400">
          <ArrowLeft className="h-4 w-4" /> Back to Campaigns
        </Link>
      </div>
    );
  }

  const submission = myClips.find((c) => c.campaignId === campaign.id);
  const badge = submission ? statusBadge[submission.status] : null;
  const BadgeIcon = badge?.icon;
  const participationRequest = myRequests.find((r) => r.campaignId === campaign.id);

  const handleRequest = async () => {
    if (!user) return;
    setRequesting(true);
    try {
      await requestToParticipate({
        campaignId: campaign.id,
        campaignTitle: campaign.title,
        creatorId: user.id,
        creatorName: user.name,
        brandId: campaign.brandId,
      });
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl">
      <Link href="/dashboard/competitions" className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
        <ArrowLeft className="h-4 w-4" /> Back to Campaigns
      </Link>

      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
        {campaign.flyerUrl ? (
          <div className="relative h-48 w-full bg-slate-100 dark:bg-white/5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={campaign.flyerUrl} alt="" className="h-full w-full object-cover" />
          </div>
        ) : (
          <div className="flex h-48 w-full items-center justify-center bg-gradient-to-br from-yellow-400/20 to-amber-500/20 dark:from-yellow-400/10 dark:to-amber-500/10">
            <Briefcase className="h-10 w-10 text-amber-500/60 dark:text-yellow-400/40" />
          </div>
        )}

        <div className="p-6">
          <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">{campaign.title}</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Posted by {campaign.brandName || "a brand"}</p>

          {campaign.channelLink && (
            <a
              href={campaign.channelLink}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 flex items-center gap-1.5 text-sm text-amber-600 hover:underline dark:text-yellow-400"
            >
              <Link2 className="h-3.5 w-3.5" />
              {campaign.channelLink}
            </a>
          )}

          {campaign.brief && (
            <p className="mt-4 whitespace-pre-wrap text-sm text-slate-600 dark:text-slate-300">{campaign.brief}</p>
          )}

          <div className="mt-5 rounded-xl bg-slate-50 p-4 dark:bg-white/5">
            <BudgetBar campaign={campaign} />
            <div className="mt-3 flex items-center justify-between text-sm">
              <span className="text-slate-500 dark:text-slate-400">Payout per approved clip</span>
              <span className="font-semibold text-amber-600 dark:text-yellow-400">₦{campaign.payoutPerClip.toFixed(2)}</span>
            </div>
            {campaign.deadline && (
              <div className="mt-1.5 flex items-center justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Deadline</span>
                <span className="text-slate-700 dark:text-slate-300">{campaign.deadline}</span>
              </div>
            )}
          </div>

          {submission && badge && BadgeIcon ? (
            <>
              <span
                className={`mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-center text-sm font-semibold ${badge.cls}`}
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
          ) : participationRequest?.status === "approved" ? (
            <button onClick={() => setSubmitOpen(true)} className={`mt-5 w-full rounded-lg py-2.5 text-sm ${btnPrimary}`}>
              Submit a Clip
            </button>
          ) : participationRequest?.status === "pending" ? (
            <span className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-100 py-2.5 text-center text-sm font-semibold text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400">
              <Clock className="h-4 w-4" />
              Request pending review
            </span>
          ) : participationRequest?.status === "rejected" ? (
            <span className="mt-5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-red-50 py-2.5 text-center text-sm font-semibold text-red-600 dark:bg-red-500/10 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              Request declined
            </span>
          ) : (
            <button
              onClick={handleRequest}
              disabled={requesting}
              className={`mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm ${btnPrimary}`}
            >
              {requesting && <Loader2 className="h-4 w-4 animate-spin" />}
              Request to Participate
            </button>
          )}
        </div>
      </div>

      {submitOpen && user && (
        <SubmitClipModal campaign={campaign} userId={user.id} userName={user.name} onClose={() => setSubmitOpen(false)} />
      )}
    </div>
  );
}
