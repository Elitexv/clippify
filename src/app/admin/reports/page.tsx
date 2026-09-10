"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer } from "firebase/firestore";
import { BarChart3, Film, ShoppingBag, Trophy, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import StatCard from "@/components/dashboard/StatCard";

type Counts = {
  users: number;
  clips: number;
  campaigns: number;
  competitions: number;
};

export default function ReportsPage() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [users, clips, campaigns, competitions] = await Promise.all([
        getCountFromServer(collection(db, "users")),
        getCountFromServer(collection(db, "clips")),
        getCountFromServer(collection(db, "campaigns")),
        getCountFromServer(collection(db, "competitions")),
      ]);

      if (cancelled) return;

      setCounts({
        users: users.data().count,
        clips: clips.data().count,
        campaigns: campaigns.data().count,
        competitions: competitions.data().count,
      });
    }

    load().catch((error) => {
      console.error("Failed to load report counts:", error);
      if (!cancelled) setCounts({ users: 0, clips: 0, campaigns: 0, competitions: 0 });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Platform-wide totals, pulled live from Firestore.
      </p>

      {!counts ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard icon={Users} label="Total Users" value={String(counts.users)} />
          <StatCard icon={Film} label="Clips Submitted" value={String(counts.clips)} />
          <StatCard icon={ShoppingBag} label="Campaigns Posted" value={String(counts.campaigns)} />
          <StatCard icon={Trophy} label="Contests Hosted" value={String(counts.competitions)} />
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
        <BarChart3 className="h-3.5 w-3.5" />
        Payment transaction totals live on the Transactions page.
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-[#111] dark:text-slate-400">
        Trend charts and category breakdowns are a natural next step once there&apos;s enough
        historical data to chart.
      </div>
    </div>
  );
}
