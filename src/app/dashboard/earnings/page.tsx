import { DollarSign, ShoppingBag, Trophy } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";

export default function EarningsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Track income from clip sales and competition winnings.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={DollarSign} label="Total Earnings" value="$1,240" hint="+$180 this week" />
        <StatCard icon={ShoppingBag} label="Clips Sold" value="87" />
        <StatCard icon={Trophy} label="Competition Winnings" value="$300" />
      </div>

      <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-[#111]">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Detailed payout history and withdrawal options are coming soon.
        </p>
      </div>
    </div>
  );
}
