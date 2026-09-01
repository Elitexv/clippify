"use client";

import { useEffect, useState } from "react";
import { collection, getCountFromServer, getDocs } from "firebase/firestore";
import { BarChart3, DollarSign, Film, ShoppingBag, Trophy, Users } from "lucide-react";
import { db } from "@/lib/firebase";
import StatCard from "@/components/dashboard/StatCard";

type Counts = {
  users: number;
  clips: number;
  campaigns: number;
  competitions: number;
  orders: number;
  revenue: number;
};

export default function ReportsPage() {
  const [counts, setCounts] = useState<Counts | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [users, clips, campaigns, competitions, ordersSnap] = await Promise.all([
        getCountFromServer(collection(db, "users")),
        getCountFromServer(collection(db, "clips")),
        getCountFromServer(collection(db, "campaigns")),
        getCountFromServer(collection(db, "competitions")),
        getDocs(collection(db, "orders")),
      ]);

      if (cancelled) return;

      const revenue = ordersSnap.docs.reduce((sum, d) => sum + (d.data().amount ?? 0), 0);

      setCounts({
        users: users.data().count,
        clips: clips.data().count,
        campaigns: campaigns.data().count,
        competitions: competitions.data().count,
        orders: ordersSnap.size,
        revenue,
      });
    }

    load().catch((error) => {
      console.error("Failed to load report counts:", error);
      if (!cancelled) setCounts({ users: 0, clips: 0, campaigns: 0, competitions: 0, orders: 0, revenue: 0 });
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
        <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-3">
          <StatCard icon={Users} label="Total Users" value={String(counts.users)} />
          <StatCard icon={Film} label="Clips Listed" value={String(counts.clips)} />
          <StatCard icon={ShoppingBag} label="Campaigns Posted" value={String(counts.campaigns)} />
          <StatCard icon={Trophy} label="Competitions Hosted" value={String(counts.competitions)} />
          <StatCard icon={BarChart3} label="Orders" value={String(counts.orders)} />
          <StatCard icon={DollarSign} label="Clip Sales Volume" value={`$${counts.revenue.toFixed(2)}`} />
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-white/10 dark:bg-[#111] dark:text-slate-400">
        Trend charts and category breakdowns are a natural next step once there&apos;s enough
        historical data to chart.
      </div>
    </div>
  );
}
