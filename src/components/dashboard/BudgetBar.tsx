import { campaignSpend, type Campaign } from "@/lib/firebase-helpers";

export default function BudgetBar({ campaign, className = "" }: { campaign: Campaign; className?: string }) {
  const { spent, remaining, pct } = campaignSpend(campaign);

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
        <span>₦{spent.toFixed(2)} spent</span>
        <span>₦{remaining.toFixed(2)} left</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-amber-500 dark:bg-yellow-400" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
