"use client";

import { useEffect, useState } from "react";
import { Eye, Heart, Loader2, X } from "lucide-react";
import { fetchMyTikTokVideos, type MyTikTokVideo } from "@/lib/tiktok";

// Opened from SubmitClipModal when the creator has a real TikTok connection (see
// src/lib/socials.ts) — lets them pick one of their own videos instead of pasting a
// link, with official view/like counts straight from the Display API.
export default function TikTokVideoPicker({
  accessToken,
  onSelect,
  onClose,
}: {
  accessToken: string;
  onSelect: (video: MyTikTokVideo) => void;
  onClose: () => void;
}) {
  const [videos, setVideos] = useState<MyTikTokVideo[] | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchMyTikTokVideos(accessToken).then((result) => {
      if (!result) setError("Couldn't load your TikTok videos. Try again.");
      else setVideos(result.videos);
    });
  }, [accessToken]);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="max-h-[80vh] w-full max-w-md overflow-y-auto rounded-2xl border border-slate-100 bg-white p-4 shadow-2xl dark:border-white/10 dark:bg-[#111]"
      >
        <div className="flex items-center justify-between">
          <p className="font-semibold text-slate-900 dark:text-white">Choose a TikTok video</p>
          <button onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3">
          {error ? (
            <p className="py-6 text-center text-sm text-red-600 dark:text-red-400">{error}</p>
          ) : videos === null ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
            </div>
          ) : videos.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-400">No videos found on your TikTok account.</p>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              {videos.map((video) => (
                <button
                  key={video.id}
                  type="button"
                  onClick={() => onSelect(video)}
                  className="overflow-hidden rounded-lg border border-slate-200 text-left transition-colors hover:border-yellow-400 dark:border-white/10"
                >
                  <div className="relative aspect-[9/16] bg-slate-900">
                    {video.thumbnailUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={video.thumbnailUrl} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-1.5">
                    <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
                      {video.title || "Untitled"}
                    </p>
                    <div className="mt-0.5 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="flex items-center gap-0.5">
                        <Eye className="h-2.5 w-2.5" />
                        {video.viewCount.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="h-2.5 w-2.5" />
                        {video.likeCount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
