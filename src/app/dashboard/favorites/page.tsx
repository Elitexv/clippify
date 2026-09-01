"use client";

import { useEffect, useState } from "react";
import { Heart, X } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { removeFavorite, subscribeToFavorites, type FavoriteClip } from "@/lib/clips";

export default function FavoritesPage() {
  return (
    <RequireAuth area="account">
      <FavoritesContent />
    </RequireAuth>
  );
}

function FavoritesContent() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteClip[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToFavorites(user.id, (next) => {
      setFavorites(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Favorites</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Clips you&apos;ve saved for later.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : favorites.length === 0 ? (
        <div className="mt-6">
          <ComingSoon
            icon={Heart}
            title="No favorites yet"
            text="Tap the heart icon on any clip in Browse Clips to save it here."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav) => (
            <div
              key={fav.clipId}
              className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
            >
              <div className="min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-white">{fav.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{fav.creatorName}</p>
                <p className="mt-1 text-sm font-semibold text-amber-600 dark:text-yellow-400">
                  ${fav.price.toFixed(2)}
                </p>
              </div>
              <button
                onClick={() => user && removeFavorite(user.id, fav.clipId)}
                aria-label="Remove from favorites"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-red-500 dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
