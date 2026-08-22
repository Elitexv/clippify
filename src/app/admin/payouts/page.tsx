import { DollarSign, Wallet } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

const pendingPayouts = [
  { id: "p1", name: "EditWizard", amount: "$420", method: "Bank transfer", status: "Pending" },
  { id: "p2", name: "QuickCut Pro", amount: "$180", method: "PayPal", status: "Pending" },
  { id: "p3", name: "Nova Clips", amount: "$95", method: "Bank transfer", status: "Scheduled" },
];

export default function PayoutsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Payouts</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Review and release creator earnings.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={Wallet} label="Pending Payouts" value="$695" />
        <StatCard icon={DollarSign} label="Paid This Month" value="$18.2K" hint="+6.1%" />
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
              <th className="px-4 py-3 font-medium">Creator</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Method</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {pendingPayouts.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{p.name}</td>
                <td className="px-4 py-3 font-semibold text-amber-600 dark:text-yellow-400">{p.amount}</td>
                <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                  {p.method}
                </td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400">
                    {p.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
