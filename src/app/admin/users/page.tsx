"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { subscribeToAllUsers, setUserStatus, type AppUser } from "@/lib/firebase-helpers";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = subscribeToAllUsers((next) => {
      setUsers(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  const toggleStatus = async (u: AppUser) => {
    const next = u.status === "Suspended" ? "Active" : "Suspended";
    setBusy((b) => ({ ...b, [u.id]: true }));
    try {
      await setUserStatus(u.id, next);
    } finally {
      setBusy((b) => ({ ...b, [u.id]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Users</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        {loading ? "Loading…" : `${users.length} registered accounts across brands and creators.`}
      </p>

      <div className="relative mt-5 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-[#111] dark:text-white"
        />
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : (
        <div className="mt-5 overflow-x-auto rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Role</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Joined</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const status = u.status ?? "Active";
                return (
                  <tr key={u.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                      {u.name}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400">
                      {u.email}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 capitalize text-slate-600 dark:text-slate-300">
                      {u.role}
                    </td>
                    <td className="hidden whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          status === "Active"
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                            : "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400"
                        }`}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right">
                      <button
                        onClick={() => toggleStatus(u)}
                        disabled={busy[u.id]}
                        className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-60 ${
                          status === "Active"
                            ? "bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-500/10 dark:text-red-400"
                            : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-400/10 dark:text-emerald-400"
                        }`}
                      >
                        {status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    {users.length === 0 ? "No registered users yet." : `No users match "${query}".`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
