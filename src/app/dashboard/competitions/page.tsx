"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Briefcase,
  CheckCircle2,
  Link2,
  Loader2,
  Trophy,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { subscribeToActiveCampaigns, type Campaign } from "@/lib/firebase-helpers";
import { createClip, subscribeToClipsForUser, uploadClipVideo, type Clip, type ClipStatus } from "@/lib/clips";
import { getPublicSettings } from "@/lib/platform-settings";

const categories = ["Tech", "Sports", "Motivation", "Nature", "Gaming", "Podcast"];

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

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

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campaigns</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Browse open clipping campaigns posted by brands and submit a clip to participate — once
        approved, it also lists on Browse Clips.
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
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#111] dark:shadow-none"
              >
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

                <div className="p-6">
                  <p className="font-semibold text-slate-900 dark:text-white">{campaign.title}</p>
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
                      className={`mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg py-2.5 text-center text-sm font-semibold ${badge.cls}`}
                    >
                      <BadgeIcon className="h-4 w-4" />
                      {badge.label}
                    </span>
                  ) : (
                    <button
                      onClick={() => setActiveCampaign(campaign)}
                      className="mt-4 w-full rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
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

type Mode = "link" | "file";

function SubmitClipModal({
  campaign,
  userId,
  userName,
  onClose,
}: {
  campaign: Campaign;
  userId: string;
  userName: string;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<Mode>("link");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState(categories[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [approvedInstantly, setApprovedInstantly] = useState(false);

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  const handleFileChange = (file: File | null) => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(file);
    setVideoPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const hasSource = mode === "link" ? link.trim() : !!videoFile;
    if (!title.trim() || !hasSource) {
      setError("Fill in the clip title and a link or video file.");
      return;
    }

    setSubmitting(true);
    try {
      const { autoModeration } = await getPublicSettings();
      const videoUrl = mode === "file" && videoFile ? await uploadClipVideo(userId, videoFile) : "";
      await createClip({
        creatorId: userId,
        creatorName: userName,
        title: title.trim(),
        category,
        link: mode === "link" ? link.trim() : "",
        videoUrl,
        status: autoModeration ? "approved" : "pending",
        campaignId: campaign.id,
        campaignTitle: campaign.title,
      });
      setApprovedInstantly(autoModeration);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the clip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#111]"
      >
        {done ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" />
            </span>
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">
              {approvedInstantly ? "Clip is live" : "Submitted for review"}
            </p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {approvedInstantly
                ? `"${title}" is approved and already listed on Browse Clips.`
                : `"${title}" is in the moderation queue for "${campaign.title}".`}
            </p>
            <button
              onClick={onClose}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white dark:bg-yellow-400 dark:text-black"
            >
              Done
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-400">Submit a clip</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">{campaign.title}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
              <div>
                <label className={labelClass}>Clip title</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Game-Winning Shot!"
                  className={inputClass}
                />
              </div>

              <div>
                <div className="inline-flex rounded-lg border border-slate-200 p-1 dark:border-white/10">
                  <button
                    type="button"
                    onClick={() => setMode("link")}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      mode === "link"
                        ? "bg-slate-900 text-white dark:bg-yellow-400 dark:text-black"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Paste a link
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("file")}
                    className={`rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
                      mode === "file"
                        ? "bg-slate-900 text-white dark:bg-yellow-400 dark:text-black"
                        : "text-slate-500 dark:text-slate-400"
                    }`}
                  >
                    Upload video file
                  </button>
                </div>

                {mode === "link" ? (
                  <div className="mt-3">
                    <label className={labelClass}>Link to your clip</label>
                    <div className="relative mt-1.5">
                      <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        placeholder="https://tiktok.com/@you/video/..."
                        className={`${inputClass} mt-0 pl-10`}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <label className={labelClass}>Video file</label>
                    {videoFile ? (
                      <div className="mt-1.5 overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
                        {videoPreviewUrl && (
                          <video src={videoPreviewUrl} controls className="max-h-44 w-full bg-black" />
                        )}
                        <div className="flex items-center justify-between px-3 py-2">
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                              {videoFile.name}
                            </p>
                            <p className="text-xs text-slate-400">{formatBytes(videoFile.size)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleFileChange(null)}
                            aria-label="Remove video"
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-white/10"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition-colors hover:border-yellow-400 dark:border-white/15 dark:bg-white/5">
                        <Upload className="h-6 w-6 text-slate-400" />
                        <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                          Click to upload a video
                        </span>
                        <span className="text-xs text-slate-400">MP4, MOV, or WebM</span>
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
                        />
                      </label>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Entry
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
