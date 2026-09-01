"use client";

import { useEffect, useState } from "react";
import { Banknote, CreditCard, Film, Heart, Landmark, Loader2, Search, X } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import { addFavorite, fetchFavoriteIds, removeFavorite, subscribeToApprovedClips, type Clip } from "@/lib/clips";
import { createOrder } from "@/lib/orders";
import {
  getPublicSettings,
  providerMeta,
  type PublicPlatformSettings,
  type ProviderId,
} from "@/lib/platform-settings";

const defaultSettings: PublicPlatformSettings = {
  campaignProcessingFee: "5",
  minCampaignBudget: "50",
  liveProviders: [],
};

const categories = ["All", "Tech", "Sports", "Motivation", "Nature", "Gaming", "Podcast"];

const providerIcon: Record<ProviderId, typeof CreditCard> = {
  stripe: CreditCard,
  paypal: Banknote,
  bank: Landmark,
};

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
  const [checkoutClip, setCheckoutClip] = useState<Clip | null>(null);

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
        Find ready-to-use clips from top creators.
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
              ? "Once a creator uploads a clip and it clears moderation, it'll show up here."
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
                  <video src={clip.videoUrl} className="h-full w-full object-cover" muted />
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
                <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{clip.creatorName}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-amber-600 dark:text-yellow-400">
                    ${clip.price.toFixed(2)}
                  </span>
                  <button
                    onClick={() => setCheckoutClip(clip)}
                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs font-semibold text-white transition-transform duration-200 hover:scale-105 active:scale-95 dark:bg-yellow-400 dark:text-black"
                  >
                    License
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {checkoutClip && user && (
        <LicenseCheckoutModal
          clip={checkoutClip}
          buyerId={user.id}
          buyerName={user.name}
          onClose={() => setCheckoutClip(null)}
        />
      )}
    </div>
  );
}

function LicenseCheckoutModal({
  clip,
  buyerId,
  buyerName,
  onClose,
}: {
  clip: Clip;
  buyerId: string;
  buyerName: string;
  onClose: () => void;
}) {
  const [settings, setSettings] = useState<PublicPlatformSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState<ProviderId | null>(null);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPublicSettings().then((s) => {
      setSettings(s);
      setLoading(false);
    });
  }, []);

  const enabledMethods = settings.liveProviders;
  const method = selectedMethod ?? enabledMethods[0] ?? null;

  const handlePay = async () => {
    setPaying(true);
    setError("");
    try {
      await createOrder({
        buyerId,
        buyerName,
        clipId: clip.id,
        clipTitle: clip.title,
        creatorId: clip.creatorId,
        amount: clip.price,
      });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed. Please try again.");
    } finally {
      setPaying(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-6 shadow-2xl dark:border-white/10 dark:bg-[#111]"
      >
        {done ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-400/10 dark:text-emerald-400">
              <Heart className="h-6 w-6" />
            </span>
            <p className="mt-3 font-semibold text-slate-900 dark:text-white">Clip licensed</p>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              &ldquo;{clip.title}&rdquo; is now in your Orders.
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
                <p className="text-xs uppercase tracking-wide text-slate-400">License clip</p>
                <p className="mt-0.5 font-semibold text-slate-900 dark:text-white">{clip.title}</p>
              </div>
              <button
                onClick={onClose}
                aria-label="Close"
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm dark:bg-white/5">
              <span className="text-slate-500 dark:text-slate-400">Total</span>
              <span className="font-bold text-amber-600 dark:text-yellow-400">${clip.price.toFixed(2)}</span>
            </div>

            {loading ? (
              <div className="mt-4 flex justify-center py-4">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : enabledMethods.length === 0 ? (
              <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600 dark:bg-red-500/10 dark:text-red-400">
                No payment providers are connected yet. Ask an admin to add API keys in Manage
                Payments.
              </p>
            ) : (
              <div className="mt-4 flex flex-col gap-2">
                {enabledMethods.map((m) => {
                  const Icon = providerIcon[m];
                  return (
                    <label
                      key={m}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        method === m
                          ? "border-yellow-400 bg-yellow-50 dark:border-yellow-400/40 dark:bg-yellow-400/5"
                          : "border-slate-200 dark:border-white/10"
                      }`}
                    >
                      <input
                        type="radio"
                        name="license-method"
                        checked={method === m}
                        onChange={() => setSelectedMethod(m)}
                        className="h-4 w-4 accent-amber-500"
                      />
                      <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <span className="text-slate-700 dark:text-slate-300">{providerMeta[m].name}</span>
                    </label>
                  );
                })}
              </div>
            )}

            {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

            <button
              onClick={handlePay}
              disabled={!method || paying || enabledMethods.length === 0}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {paying ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing…
                </>
              ) : (
                `Pay $${clip.price.toFixed(2)}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
