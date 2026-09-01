"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Link2, Loader2, Upload, X } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import { createClip, uploadClipVideo } from "@/lib/clips";
import { parseCurrency } from "@/lib/platform-settings";

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

export default function UploadPage() {
  return (
    <RequireAuth area="account">
      <UploadPageContent />
    </RequireAuth>
  );
}

function UploadPageContent() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("link");
  const [title, setTitle] = useState("");
  const [link, setLink] = useState("");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState(categories[0]);
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

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
    if (!title.trim() || !hasSource || !price.trim() || !user) {
      setError("Fill in the clip title, price, and a link or video file.");
      return;
    }

    setSubmitting(true);
    try {
      const videoUrl = mode === "file" && videoFile ? await uploadClipVideo(user.id, videoFile) : "";
      await createClip({
        creatorId: user.id,
        creatorName: user.name,
        title: title.trim(),
        category,
        price: parseCurrency(price),
        link: mode === "link" ? link.trim() : "",
        videoUrl,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not submit the clip. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const submitAnother = () => {
    setTitle("");
    setLink("");
    handleFileChange(null);
    setPrice("");
    setCategory(categories[0]);
    setError("");
    setSubmitted(false);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Upload Link</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Already posted your clip on TikTok, YouTube, or Instagram? Drop the link — or upload the
        video file directly if it&apos;s not live anywhere yet.
      </p>

      {submitted ? (
        <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-emerald-200 bg-emerald-50 px-6 py-14 text-center dark:border-emerald-400/20 dark:bg-emerald-400/5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
            <CheckCircle2 className="h-6 w-6" />
          </span>
          <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
            {mode === "link" ? "Link submitted for review" : "Video uploaded for review"}
          </h2>
          <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
            &ldquo;{title}&rdquo; is in the moderation queue. Once approved, it&apos;ll list on
            Browse Clips for buyers to find.
          </p>
          <button
            onClick={submitAnother}
            className="mt-5 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95 dark:bg-yellow-400 dark:text-black"
          >
            Submit another clip
          </button>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="mt-6 flex flex-col gap-5 rounded-2xl border border-slate-100 bg-white p-6 dark:border-white/10 dark:bg-[#111]"
        >
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
                <p className="mt-1.5 text-xs text-slate-400">
                  Paste the public link from TikTok, YouTube Shorts, Instagram Reels, or wherever
                  it&apos;s posted.
                </p>
              </div>
            ) : (
              <div className="mt-3">
                <label className={labelClass}>Video file</label>
                {videoFile ? (
                  <div className="mt-1.5 overflow-hidden rounded-lg border border-slate-200 dark:border-white/10">
                    {videoPreviewUrl && (
                      <video src={videoPreviewUrl} controls className="max-h-56 w-full bg-black" />
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
                  <label className="mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center transition-colors hover:border-yellow-400 dark:border-white/15 dark:bg-white/5">
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

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className={labelClass}>Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={inputClass}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Price</label>
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="e.g. $12"
                className={inputClass}
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {mode === "link" ? "Submitting…" : "Uploading…"}
              </>
            ) : mode === "link" ? (
              "Submit link"
            ) : (
              "Upload video"
            )}
          </button>
        </form>
      )}
    </div>
  );
}
