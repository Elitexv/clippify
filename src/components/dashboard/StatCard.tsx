import type { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md dark:border-white/10 dark:bg-[#111] dark:shadow-none">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
          <Icon className="h-5 w-5" />
        </span>
        {hint && (
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {hint}
          </span>
        )}
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">{label}</p>
    </div>
  );
}
