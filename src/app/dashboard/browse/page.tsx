"use client";

import { useEffect, useState } from "react";
import { Film, Heart, Search } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import { addFavorite, fetchFavoriteIds, removeFavorite, subscribeToApprovedClips, type Clip } from "@/lib/clips";

const categories = ["All", "Tech", "Sports", "Motivation", "Nature", "Gaming", "Podcast"];

export default function BrowseClipsPage() {
  return (
    <RequireAuth area="account">
      <BrowseClipsContent />
    </RequireAuth>
  );
}

function BrowseClipsContent() {
  const { user } = useAuth();
  const [active, setActive] = useState("All");
  const [search, setSearch] = useState("");
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    const unsubscribe = subscribeToApprovedClips((next) => {
      setClips(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchFavoriteIds(user.id).then(setFavoriteIds);
  }, [user]);

  const toggleFavorite = async (clip: Clip) => {
    if (!user) return;
    const isFavorite = favoriteIds.has(clip.id);
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFavorite) next.delete(clip.id);
      else next.add(clip.id);
      return next;
    });
    try {
      if (isFavorite) await removeFavorite(user.id, clip.id);
      else await addFavorite(user.id, clip);
    } catch {
      // revert optimistic update on failure
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFavorite) next.add(clip.id);
        else next.delete(clip.id);
        return next;
      });
    }
  };

  const filtered = clips.filter((clip) => {
    const matchesCategory = active === "All" || clip.category === active;
    const matchesSearch =
      !search.trim() ||
      clip.title.toLowerCase().includes(search.toLowerCase()) ||
      clip.creatorName.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Browse Clips</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        See what clippers have submitted for campaigns across the platform.
      </p>

      <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clips, creators, categories..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-[#111] dark:text-white"
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              active === cat
                ? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-white/5 dark:text-slate-300 dark:hover:bg-white/10"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-10 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#111]">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
            <Film className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm font-medium text-slate-900 dark:text-white">
            {clips.length === 0 ? "No clips have been approved yet" : "No clips match your filters"}
          </p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {clips.length === 0
              ? "Once a creator submits a clip for a campaign and it clears moderation, it'll show up here."
              : "Try a different category or search term."}
          </p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {filtered.map((clip) => (
            <div
              key={clip.id}
              className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#111] dark:shadow-none"
            >
              <div className="relative flex aspect-video items-center justify-center bg-gradient-to-br from-slate-800 to-slate-950">
                {clip.videoUrl ? (
                  <video src={clip.videoUrl} className="h-full w-full object-cover" muted controls />
                ) : (
                  <Film className="h-8 w-8 text-white/30" />
                )}
                <button
                  onClick={() => toggleFavorite(clip)}
                  aria-label={favoriteIds.has(clip.id) ? "Remove from favorites" : "Add to favorites"}
                  className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 backdrop-blur transition-transform hover:scale-110"
                >
                  <Heart
                    className={`h-3.5 w-3.5 ${favoriteIds.has(clip.id) ? "fill-red-500 text-red-500" : "text-white"}`}
                  />
                </button>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {clip.title}
                </p>
                <div className="mt-0.5 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span className="truncate">{clip.creatorName}</span>
                  <span className="shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    {clip.category}
                  </span>
                </div>
                {clip.campaignTitle && (
                  <p className="mt-1 truncate text-[11px] text-amber-600 dark:text-yellow-400">
                    For: {clip.campaignTitle}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
