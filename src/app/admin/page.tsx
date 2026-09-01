"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, ShieldAlert, Trophy, Users, Wallet } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { subscribeToAllUsers, type AppUser } from "@/lib/firebase-helpers";
import { subscribeToCompetitions, type Competition } from "@/lib/competitions";
import { subscribeToPendingClips, type Clip } from "@/lib/clips";
import { subscribeToAllOrders, type Order } from "@/lib/orders";

export default function AdminOverviewPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [pendingClips, setPendingClips] = useState<Clip[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubUsers = subscribeToAllUsers((next) => {
      setUsers(next);
      setLoading(false);
    });
    const unsubCompetitions = subscribeToCompetitions(setCompetitions);
    const unsubClips = subscribeToPendingClips(setPendingClips);
    const unsubOrders = subscribeToAllOrders(setOrders);
    return () => {
      unsubUsers();
      unsubCompetitions();
      unsubClips();
      unsubOrders();
    };
  }, []);

  const activeCompetitions = competitions.filter((c) => c.status === "Active");
  const revenue = orders.reduce((sum, o) => sum + o.amount, 0);
  const recentSignups = [...users]
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))
    .slice(0, 5);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Platform health across users, competitions, and content.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value={String(users.length)} />
        <StatCard icon={Wallet} label="Clip Sales Volume" value={`$${revenue.toFixed(2)}`} />
        <StatCard icon={Trophy} label="Active Competitions" value={String(activeCompetitions.length)} />
        <StatCard icon={ShieldAlert} label="Pending Moderation" value={String(pendingClips.length)} />
      </div>

      <SectionHeader title="Recent Signups" href="/admin/users" />
      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : recentSignups.length === 0 ? (
        <ComingSoon icon={Users} title="No users yet" text="New signups will show up here." />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentSignups.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">{u.email}</td>
                  <td className="px-4 py-3 capitalize text-slate-600 dark:text-slate-300">{u.role}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        (u.status ?? "Active") === "Active"
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                          : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                      }`}
                    >
                      {u.status ?? "Active"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <SectionHeader title="Active Competitions" href="/admin/competitions" />
      {activeCompetitions.length === 0 ? (
        <ComingSoon icon={Trophy} title="No active competitions" text="Create one from the Competitions page." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {activeCompetitions.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hosted by {c.hostName}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-600 dark:text-yellow-400">{c.prize}</span>
                <span className="text-slate-500 dark:text-slate-400">{c.entries} entries</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <SectionHeader title="Moderation Queue" href="/admin/moderation" />
      {pendingClips.length === 0 ? (
        <ComingSoon icon={ShieldAlert} title="Nothing to review" text="Pending clip uploads will show up here." />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {pendingClips.slice(0, 3).map((clip) => (
            <div
              key={clip.id}
              className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{clip.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">by {clip.creatorName}</p>
            </div>
          ))}
        </div>
      )}
      <div className="h-4" />
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 mt-10 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      <Link
        href={href}
        className="group flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-yellow-400"
      >
        View all
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
