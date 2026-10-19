"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Eye, Heart, ImagePlus, Link2, Loader2, Upload, X } from "lucide-react";
import { btnPrimary } from "@/lib/button-styles";
import type { Campaign } from "@/lib/firebase-helpers";
import { createClip, uploadClipThumbnail, uploadClipVideo } from "@/lib/clips";
import { createNotification } from "@/lib/notifications";
import { getPublicSettings } from "@/lib/platform-settings";
import { extractYouTubeVideoId, fetchYouTubeStats } from "@/lib/youtube";
import { fetchTikTokVideoStats, isTikTokLink } from "@/lib/tiktok";

type LinkStats = { title: string; thumbnailUrl: string; viewCount: number; likeCount: number | null };

const categories = ["Tech", "Sports", "Motivation", "Nature", "Gaming", "Podcast"];

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type Mode = "link" | "file";

// Shared by the creator's campaign browse list and the per-campaign detail page —
// both open this on "Submit a Clip", so the form, stats auto-fetch, and the
// brand-notification side effect only need to live in one place.
export default function SubmitClipModal({
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
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState(categories[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [approvedInstantly, setApprovedInstantly] = useState(false);
  const [youtubeApiKey, setYoutubeApiKey] = useState("");
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [fetchingStats, setFetchingStats] = useState(false);
  const [lastCheckedLink, setLastCheckedLink] = useState("");
  const [tiktokHint, setTiktokHint] = useState("");

  useEffect(() => {
    getPublicSettings().then((s) => setYoutubeApiKey(s.youtubeApiKey));
  }, []);

  const checkLinkForStats = async () => {
    const trimmed = link.trim();
    if (!trimmed || trimmed === lastCheckedLink) return;
    setLastCheckedLink(trimmed);

    const youtubeId = youtubeApiKey ? extractYouTubeVideoId(trimmed) : null;
    if (youtubeId) {
      setFetchingStats(true);
      try {
        const result = await fetchYouTubeStats(youtubeId, youtubeApiKey);
        setStats(result);
        if (result && !title.trim()) setTitle(result.title);
      } finally {
        setFetchingStats(false);
      }
      return;
    }

    if (isTikTokLink(trimmed)) {
      setFetchingStats(true);
      setTiktokHint("");
      try {
        const result = await fetchTikTokVideoStats(trimmed);
        setStats(result);
        if (result && !title.trim()) setTitle(result.title);
        if (!result) setTiktokHint("Couldn't find that TikTok video. Double-check the link.");
      } finally {
        setFetchingStats(false);
      }
      return;
    }

    setStats(null);
  };

  useEffect(() => {
    return () => {
      if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    };
  }, [videoPreviewUrl]);

  useEffect(() => {
    return () => {
      if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    };
  }, [thumbnailPreviewUrl]);

  const handleFileChange = (file: File | null) => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(file);
    setVideoPreviewUrl(file ? URL.createObjectURL(file) : null);
  };

  const handleThumbnailChange = (file: File | null) => {
    if (thumbnailPreviewUrl) URL.revokeObjectURL(thumbnailPreviewUrl);
    setThumbnailFile(file);
    setThumbnailPreviewUrl(file ? URL.createObjectURL(file) : null);
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
      // A creator-supplied thumbnail always wins over whatever the link's auto-fetch
      // came back with (or didn't) — it's the one thing they picked on purpose.
      const thumbnailUrl = thumbnailFile ? await uploadClipThumbnail(userId, thumbnailFile) : stats?.thumbnailUrl;
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
        payoutAtSubmission: campaign.payoutPerClip,
        viewCount: stats?.viewCount,
        likeCount: stats?.likeCount ?? undefined,
        thumbnailUrl,
      });
      createNotification({
        userId: campaign.brandId,
        type: "clip_submitted",
        title: "New clip submitted",
        body: `${userName} submitted a clip to "${campaign.title}".`,
        link: `/dashboard/campaigns/${campaign.id}`,
        campaignId: campaign.id,
      }).catch((err) => console.error("Failed to create clip-submitted notification:", err));
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
                        onChange={(e) => {
                          setLink(e.target.value);
                          setStats(null);
                          setTiktokHint("");
                        }}
                        onBlur={checkLinkForStats}
                        placeholder="https://youtube.com/watch?v=... or any clip link"
                        className={`${inputClass} mt-0 pl-10`}
                      />
                    </div>
                    {fetchingStats ? (
                      <p className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Fetching video stats…
                      </p>
                    ) : stats ? (
                      <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-slate-50 p-2 dark:bg-white/5">
                        {stats.thumbnailUrl && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={stats.thumbnailUrl} alt="" className="h-10 w-16 shrink-0 rounded object-cover" />
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                            {stats.title}
                          </p>
                          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                            <span className="flex items-center gap-1">
                              <Eye className="h-3 w-3" /> {stats.viewCount.toLocaleString()}
                            </span>
                            {stats.likeCount !== null && (
                              <span className="flex items-center gap-1">
                                <Heart className="h-3 w-3" /> {stats.likeCount.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : tiktokHint ? (
                      <p className="mt-1.5 text-[11px] text-amber-600 dark:text-yellow-400">{tiktokHint}</p>
                    ) : (
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Paste a YouTube or TikTok link to auto-fetch its view and like counts.
                      </p>
                    )}
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
                <label className={labelClass}>Thumbnail image (optional)</label>
                {thumbnailFile && thumbnailPreviewUrl ? (
                  <div className="relative mt-1.5 h-28 w-full overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={thumbnailPreviewUrl} alt="" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleThumbnailChange(null)}
                      aria-label="Remove thumbnail"
                      className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center transition-colors hover:border-yellow-400 dark:border-white/15 dark:bg-white/5">
                    <ImagePlus className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-medium text-slate-600 dark:text-slate-300">
                      Click to upload a thumbnail
                    </span>
                    <span className="text-xs text-slate-400">
                      {stats?.thumbnailUrl
                        ? "Optional — overrides the auto-fetched preview above"
                        : "PNG or JPG — shown as the preview on Browse Clips"}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleThumbnailChange(e.target.files?.[0] ?? null)}
                    />
                  </label>
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
                className={`flex items-center justify-center gap-2 rounded-lg py-2.5 text-sm ${btnPrimary}`}
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
