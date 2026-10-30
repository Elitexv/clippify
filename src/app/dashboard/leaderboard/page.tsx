"use client";

import { useEffect, useState } from "react";
import { Medal, Trophy } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import EmptyState from "@/components/dashboard/EmptyState";
import { useAuth } from "@/lib/auth/auth-context";
import { subscribeToLeaderboard, levelForXp, type LeaderboardEntry } from "@/lib/xp";

const rankBadgeClass: Record<number, string> = {
  1: "bg-yellow-400 text-black",
  2: "bg-slate-300 text-black",
  3: "bg-amber-600 text-white",
};

export default function LeaderboardPage() {
  return (
    <RequireAuth area="creator">
      <LeaderboardContent />
    </RequireAuth>
  );
}

function LeaderboardContent() {
  const { user } = useAuth();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return subscribeToLeaderboard((next) => {
      setEntries(next);
      setLoading(false);
    });
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="font-display text-2xl font-bold text-slate-900 dark:text-white">Leaderboard</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Top creators by XP — earned by requesting to participate in campaigns and getting clips
        approved.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : entries.length === 0 ? (
        <div className="mt-6">
          <EmptyState icon={Trophy} title="No XP earned yet" text="Request to participate in a campaign to get on the board." />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {entries.map((entry, i) => {
            const rank = i + 1;
            const isMe = entry.id === user?.id;
            return (
              <div
                key={entry.id}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 ${
                  isMe
                    ? "border-yellow-400 bg-yellow-50 dark:border-yellow-400/40 dark:bg-yellow-400/5"
                    : "border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]"
                }`}
              >
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    rankBadgeClass[rank] ?? "bg-slate-100 text-slate-500 dark:bg-white/10 dark:text-slate-400"
                  }`}
                >
                  {rank <= 3 ? <Medal className="h-4 w-4" /> : rank}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                  {entry.initials}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                    {entry.name}
                    {isMe && <span className="ml-1.5 text-xs text-amber-600 dark:text-yellow-400">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Level {levelForXp(entry.xp)}</p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-amber-600 dark:text-yellow-400">
                  {entry.xp.toLocaleString()} XP
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
