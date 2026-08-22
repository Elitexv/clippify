import type { LucideIcon } from "lucide-react";

export default function ComingSoon({
  icon: Icon,
  title,
  text,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-[#111]">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
        <Icon className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
        {title}
      </h2>
      <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
        {text}
      </p>
      <span className="mt-4 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500 dark:bg-white/5 dark:text-slate-400">
        Coming soon
      </span>
    </div>
  );
}
