"use client";

import { useEffect, useMemo, useState } from "react";
import { DollarSign, Wallet } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { subscribeToAllUsers, type AppUser } from "@/lib/firebase-helpers";
import { subscribeToAllOrders, type Order } from "@/lib/orders";
import { subscribeToAllSubmissions, subscribeToCompetitions, type Competition, type CompetitionSubmission } from "@/lib/competitions";
import { parseCurrency } from "@/lib/platform-settings";

export default function PayoutsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<CompetitionSubmission[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [users, setUsers] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubOrders = subscribeToAllOrders((next) => {
      setOrders(next);
      setLoading(false);
    });
    const unsubSubs = subscribeToAllSubmissions(setSubmissions);
    const unsubComps = subscribeToCompetitions(setCompetitions);
    const unsubUsers = subscribeToAllUsers(setUsers);
    return () => {
      unsubOrders();
      unsubSubs();
      unsubComps();
      unsubUsers();
    };
  }, []);

  const payouts = useMemo(() => {
    const totals = new Map<string, number>();
    for (const o of orders) {
      totals.set(o.creatorId, (totals.get(o.creatorId) ?? 0) + o.amount);
    }
    for (const s of submissions.filter((s) => s.withdrawn)) {
      const comp = competitions.find((c) => c.id === s.competitionId);
      const amount = parseCurrency(comp?.payout ?? "0");
      totals.set(s.submittedByUid, (totals.get(s.submittedByUid) ?? 0) + amount);
    }
    return [...totals.entries()]
      .map(([creatorId, amount]) => ({
        creatorId,
        name: users.find((u) => u.id === creatorId)?.name ?? "Unknown creator",
        amount,
      }))
      .filter((p) => p.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [orders, submissions, competitions, users]);

  const pendingTotal = payouts.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payouts</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        What creators and streamers have earned from clip sales and competition winnings.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={Wallet} label="Pending Payouts" value={`$${pendingTotal.toFixed(2)}`} />
        <StatCard icon={DollarSign} label="Creators Owed" value={String(payouts.length)} />
      </div>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : payouts.length === 0 ? (
        <div className="mt-6">
          <ComingSoon
            icon={Wallet}
            title="No payouts owed"
            text="Once creators sell clips or withdraw competition winnings, they'll show up here."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Creator</th>
                <th className="px-4 py-3 font-medium">Amount</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {payouts.map((p) => (
                <tr key={p.creatorId} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                  <td className="px-4 py-3 font-semibold text-amber-600 dark:text-yellow-400">
                    ${p.amount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3">
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400">
                      Pending
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
