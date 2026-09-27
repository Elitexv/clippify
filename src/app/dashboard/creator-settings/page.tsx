"use client";

import { useEffect, useState } from "react";
import { Check, CheckCircle2, Loader2 } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import { btnPrimary, btnSecondary } from "@/lib/button-styles";
import {
  emptyPayoutDetails,
  saveCreatorPayoutDetails,
  subscribeToCreatorPayoutDetails,
  type CreatorPayoutDetails,
} from "@/lib/creator-payout";
import { disconnectTikTok, saveTikTokConnection, subscribeToTikTokConnection, type TikTokConnection } from "@/lib/tiktok";
import {
  disconnectSocial,
  saveSocialConnection,
  subscribeToSocialConnections,
  type SocialConnection,
  type SocialPlatform,
} from "@/lib/socials";

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";
const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300";

const CONNECTABLE_PLATFORMS: SocialPlatform[] = ["instagram", "reddit", "threads", "x"];

const socialMeta: Record<SocialPlatform, { name: string; monogram: string; badgeClass: string }> = {
  instagram: { name: "Instagram", monogram: "IG", badgeClass: "bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 text-white" },
  reddit: { name: "Reddit", monogram: "r/", badgeClass: "bg-orange-600 text-white" },
  threads: { name: "Threads", monogram: "@", badgeClass: "bg-black text-white dark:bg-white dark:text-black" },
  x: { name: "X", monogram: "X", badgeClass: "bg-black text-white dark:bg-white dark:text-black" },
  bluesky: { name: "Bluesky", monogram: "Bs", badgeClass: "bg-sky-500 text-white" },
};

export default function CreatorSettingsPage() {
  return (
    <RequireAuth area="creator">
      <CreatorSettingsContent />
    </RequireAuth>
  );
}

function CreatorSettingsContent() {
  const { user } = useAuth();

  const [payout, setPayout] = useState<CreatorPayoutDetails>(emptyPayoutDetails);
  const [payoutLoading, setPayoutLoading] = useState(true);
  const [payoutSaving, setPayoutSaving] = useState(false);
  const [payoutSaved, setPayoutSaved] = useState(false);

  const [tiktok, setTiktok] = useState<TikTokConnection | null>(null);
  const [tiktokBusy, setTiktokBusy] = useState(false);

  const [connections, setConnections] = useState<Partial<Record<SocialPlatform, SocialConnection>>>({});
  const [busyPlatform, setBusyPlatform] = useState<SocialPlatform | null>(null);
  const [messages, setMessages] = useState<Partial<Record<SocialPlatform | "tiktok", string>>>({});

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToCreatorPayoutDetails(user.id, (details) => {
      setPayout(details);
      setPayoutLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToTikTokConnection(user.id, setTiktok);
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSocialConnections(user.id, setConnections);
    return () => unsubscribe();
  }, [user]);

  // Every "Connect" button below sends the browser to a server-side OAuth route
  // (e.g. /api/reddit/authorize) that redirects back here with the tokens in a URL
  // fragment, never a query string — fragments never reach the server/logs. This is
  // the only place the raw tokens are ever visible in transit. See
  // src/app/api/_lib/social-oauth.ts for the shared redirect-building helper every
  // platform's callback route uses, and src/app/api/tiktok/callback/route.ts for
  // TikTok's (kept separate — it predates this page and uses its own storage shape).
  useEffect(() => {
    if (!user || typeof window === "undefined") return;
    const hash = window.location.hash;
    if (!hash) return;
    const params = new URLSearchParams(hash.slice(1));

    if (hash.includes("tiktok_")) {
      const error = params.get("tiktok_error");
      if (error) {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from a one-time URL fragment on mount, not derived render state
        setMessages((m) => ({ ...m, tiktok: decodeURIComponent(error) }));
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
      const accessToken = params.get("tiktok_access_token");
      const refreshToken = params.get("tiktok_refresh_token");
      const expiresIn = params.get("tiktok_expires_in");
      const openId = params.get("tiktok_open_id");
      const displayName = params.get("tiktok_display_name");
      if (accessToken && refreshToken && openId) {
        saveTikTokConnection(user.id, {
          openId,
          displayName: displayName ?? "",
          accessToken,
          refreshToken,
          expiresAt: Date.now() + Number(expiresIn ?? "0") * 1000,
          connectedAt: Date.now(),
        })
          .then(() => setMessages((m) => ({ ...m, tiktok: "TikTok account connected." })))
          .catch(() => setMessages((m) => ({ ...m, tiktok: "Connected, but couldn't save the connection. Try again." })));
        window.history.replaceState(null, "", window.location.pathname);
      }
      return;
    }

    for (const platform of CONNECTABLE_PLATFORMS) {
      if (!hash.includes(`${platform}_`)) continue;
      const error = params.get(`${platform}_error`);
      if (error) {
        setMessages((m) => ({ ...m, [platform]: decodeURIComponent(error) }));
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }
      const accessToken = params.get(`${platform}_access_token`);
      const refreshToken = params.get(`${platform}_refresh_token`) ?? "";
      const expiresIn = Number(params.get(`${platform}_expires_in`) ?? "0");
      const handle = params.get(`${platform}_handle`) ?? "";
      if (accessToken) {
        saveSocialConnection(user.id, platform, {
          handle,
          accessToken,
          refreshToken,
          expiresAt: expiresIn > 0 ? Date.now() + expiresIn * 1000 : 0,
          connectedAt: Date.now(),
        })
          .then(() => setMessages((m) => ({ ...m, [platform]: `${socialMeta[platform].name} account connected.` })))
          .catch(() => setMessages((m) => ({ ...m, [platform]: "Connected, but couldn't save the connection. Try again." })));
        window.history.replaceState(null, "", window.location.pathname);
      }
      return;
    }
  }, [user]);

  if (!user) return null;

  const handleSavePayout = async (e: React.FormEvent) => {
    e.preventDefault();
    setPayoutSaving(true);
    setPayoutSaved(false);
    try {
      await saveCreatorPayoutDetails(user.id, {
        accountName: payout.accountName.trim(),
        bankName: payout.bankName.trim(),
        accountNumber: payout.accountNumber.trim(),
        walletAddress: payout.walletAddress.trim(),
      });
      setPayoutSaved(true);
    } finally {
      setPayoutSaving(false);
    }
  };

  const handleDisconnectTikTok = async () => {
    setTiktokBusy(true);
    try {
      await disconnectTikTok(user.id);
      setMessages((m) => ({ ...m, tiktok: undefined }));
    } finally {
      setTiktokBusy(false);
    }
  };

  const handleDisconnectSocial = async (platform: SocialPlatform) => {
    setBusyPlatform(platform);
    try {
      await disconnectSocial(user.id, platform);
      setMessages((m) => ({ ...m, [platform]: undefined }));
    } finally {
      setBusyPlatform(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Creator Settings</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Set up how you get paid and connect the accounts where you post clips.
      </p>

      {/* --- Payout details --- */}
      <section className="mt-6 rounded-2xl border-2 border-slate-900 bg-white p-6 dark:border-white dark:bg-[#111]">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Payout details</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Used by admins to pay out your approved clip earnings — see your{" "}
          <a href="/dashboard/earnings" className="text-amber-600 underline dark:text-yellow-400">
            Earnings
          </a>{" "}
          page for what you&apos;re owed.
        </p>

        {payoutLoading ? (
          <div className="mt-6 flex items-center justify-center py-6">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
          </div>
        ) : (
          <form onSubmit={handleSavePayout} className="mt-4 flex flex-col gap-4">
            <div>
              <label className={labelClass}>Account holder name</label>
              <input
                value={payout.accountName}
                onChange={(e) => setPayout((p) => ({ ...p, accountName: e.target.value }))}
                placeholder="Full name on the bank account"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass}>Bank</label>
                <input
                  value={payout.bankName}
                  onChange={(e) => setPayout((p) => ({ ...p, bankName: e.target.value }))}
                  placeholder="e.g. GTBank"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Account number</label>
                <input
                  value={payout.accountNumber}
                  onChange={(e) => setPayout((p) => ({ ...p, accountNumber: e.target.value }))}
                  placeholder="0123456789"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Wallet address (USDC on Solana)</label>
              <input
                value={payout.walletAddress}
                onChange={(e) => setPayout((p) => ({ ...p, walletAddress: e.target.value }))}
                placeholder="Optional — Solana address to receive USDC instead"
                className={`${inputClass} font-mono text-xs`}
              />
              <p className="mt-1.5 text-xs text-slate-400">
                Optional alternative to bank payout — double-check this address, transfers can&apos;t be reversed.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button type="submit" disabled={payoutSaving} className={`rounded-lg px-5 py-2.5 text-sm ${btnPrimary}`}>
                {payoutSaving ? "Saving…" : "Save payout details"}
              </button>
              {payoutSaved && (
                <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600 dark:text-emerald-400">
                  <Check className="h-4 w-4" />
                  Saved
                </span>
              )}
            </div>
          </form>
        )}
      </section>

      {/* --- Social connections --- */}
      <section className="mt-6">
        <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white">Connected accounts</h2>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
          Connect the accounts you post clips from — TikTok already auto-fetches real view/like counts when you
          submit a matching link (see Campaigns).
        </p>

        <div className="mt-4 flex flex-col gap-3">
          {/* TikTok — kept on its existing lib/tiktok.ts storage, see comment above */}
          <SocialCard
            name="TikTok"
            badgeClass="bg-black text-white"
            monogram="Tt"
            connected={!!tiktok}
            handle={tiktok?.displayName}
            message={messages.tiktok}
            busy={tiktokBusy}
            onConnect="/api/tiktok/authorize"
            onDisconnect={handleDisconnectTikTok}
          />

          {CONNECTABLE_PLATFORMS.map((platform) => {
            const meta = socialMeta[platform];
            const connection = connections[platform];
            return (
              <SocialCard
                key={platform}
                name={meta.name}
                badgeClass={meta.badgeClass}
                monogram={meta.monogram}
                connected={!!connection}
                handle={connection?.handle}
                message={messages[platform]}
                busy={busyPlatform === platform}
                onConnect={`/api/${platform}/authorize`}
                onDisconnect={() => handleDisconnectSocial(platform)}
              />
            );
          })}

          {/* Bluesky uses AT Protocol OAuth, which has no client secret, mandatory
              DPoP-bound tokens, and requires a persistent server-side session store
              (cookies alone aren't enough) — a bigger infra decision than the other
              platforms needed. Shown honestly as not-yet-available rather than a
              button that doesn't work; see the wrap-up message for the tradeoff. */}
          <SocialCard
            name="Bluesky"
            badgeClass={socialMeta.bluesky.badgeClass}
            monogram={socialMeta.bluesky.monogram}
            connected={false}
            comingSoon
          />
        </div>
      </section>
    </div>
  );
}

function SocialCard({
  name,
  badgeClass,
  monogram,
  connected,
  handle,
  message,
  busy,
  onConnect,
  onDisconnect,
  comingSoon,
}: {
  name: string;
  badgeClass: string;
  monogram: string;
  connected: boolean;
  handle?: string;
  message?: string;
  busy?: boolean;
  onConnect?: string;
  onDisconnect?: () => void;
  comingSoon?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#111]">
      <div className="flex min-w-0 items-center gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${badgeClass}`}>
          {monogram}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-900 dark:text-white">{name}</p>
          <p className="truncate text-xs text-slate-500 dark:text-slate-400">
            {comingSoon
              ? "Not available yet"
              : connected
                ? `Connected${handle ? ` as ${handle}` : ""}`
                : "Not connected"}
          </p>
          {message && <p className="mt-1 text-xs text-amber-600 dark:text-yellow-400">{message}</p>}
        </div>
      </div>

      {comingSoon ? null : connected ? (
        <button
          onClick={onDisconnect}
          disabled={busy}
          className={`flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs ${btnSecondary} disabled:cursor-not-allowed disabled:opacity-60`}
        >
          {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          Disconnect
        </button>
      ) : (
        <a href={onConnect} className={`shrink-0 rounded-lg px-3 py-2 text-xs ${btnPrimary}`}>
          Connect
        </a>
      )}
    </div>
  );
}
