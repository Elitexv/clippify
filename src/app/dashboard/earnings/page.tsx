"use client";

import { useEffect, useState } from "react";
import { DollarSign, ShoppingBag, Trophy } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import StatCard from "@/components/dashboard/StatCard";
import { subscribeToOrdersForCreator, type Order } from "@/lib/orders";
import { subscribeToCompetitions, subscribeToSubmissionsForUser, type Competition, type CompetitionSubmission } from "@/lib/competitions";
import { parseCurrency } from "@/lib/platform-settings";

export default function EarningsPage() {
  return (
    <RequireAuth area="creator">
      <EarningsContent />
    </RequireAuth>
  );
}

function EarningsContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [submissions, setSubmissions] = useState<CompetitionSubmission[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubOrders = subscribeToOrdersForCreator(user.id, setOrders);
    const unsubSubs = subscribeToSubmissionsForUser(user.id, setSubmissions);
    const unsubComps = subscribeToCompetitions(setCompetitions);
    return () => {
      unsubOrders();
      unsubSubs();
      unsubComps();
    };
  }, [user]);

  const clipEarnings = orders.reduce((sum, o) => sum + o.amount, 0);
  const withdrawnSubmissions = submissions.filter((s) => s.withdrawn);
  const competitionWinnings = withdrawnSubmissions.reduce((sum, s) => {
    const comp = competitions.find((c) => c.id === s.competitionId);
    return sum + parseCurrency(comp?.payout ?? "0");
  }, 0);
  const totalEarnings = clipEarnings + competitionWinnings;

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Your clipping balance from licensed clips, plus what you&apos;ve won and withdrawn from
        competitions.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={DollarSign} label="Clipping Balance" value={`$${totalEarnings.toFixed(2)}`} />
        <StatCard icon={ShoppingBag} label="Clips Sold" value={String(orders.length)} />
        <StatCard icon={Trophy} label="Competition Winnings" value={`$${competitionWinnings.toFixed(2)}`} />
      </div>

      {orders.length === 0 && withdrawnSubmissions.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-[#111]">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            License a clip or win a competition to start seeing earnings here.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Clip</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{o.clipTitle}</td>
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                    {o.createdAt ? o.createdAt.toDate().toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                    ${o.amount.toFixed(2)}
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
