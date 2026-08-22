import Link from "next/link";
import { ChevronRight, ShieldAlert, Trophy, Users, Wallet } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import { adminCompetitions, adminUsers, moderationQueue } from "@/lib/mock-data";

export default function AdminOverviewPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Admin Overview</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Platform health across users, competitions, and content.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Users} label="Total Users" value="12,480" hint="+312 this week" />
        <StatCard icon={Wallet} label="Platform Revenue" value="$284K" hint="+4.2%" />
        <StatCard icon={Trophy} label="Active Competitions" value="3" />
        <StatCard icon={ShieldAlert} label="Pending Moderation" value={String(moderationQueue.length)} />
      </div>

      <SectionHeader title="Recent Signups" href="/admin/users" />
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
            {adminUsers.slice(0, 5).map((u) => (
              <tr key={u.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{u.name}</td>
                <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">{u.email}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{u.role}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      u.status === "Active"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                        : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                    }`}
                  >
                    {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SectionHeader title="Active Competitions" href="/admin/competitions" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {adminCompetitions
          .filter((c) => c.status === "Active")
          .map((c) => (
            <div
              key={c.id}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
            >
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{c.title}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Hosted by {c.host}</p>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="font-semibold text-amber-600 dark:text-yellow-400">{c.prize}</span>
                <span className="text-slate-500 dark:text-slate-400">{c.entries} entries</span>
              </div>
            </div>
          ))}
      </div>

      <SectionHeader title="Moderation Queue" href="/admin/moderation" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {moderationQueue.slice(0, 3).map((m) => (
          <div
            key={m.id}
            className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
          >
            <p className="text-sm font-semibold text-slate-900 dark:text-white">{m.title}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              by {m.author} · {m.submitted}
            </p>
          </div>
        ))}
      </div>
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
