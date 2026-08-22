import { Quote, ShoppingBag, Trophy, Users } from "lucide-react";

const stats = [
  { icon: Users, value: "10K+", label: "Talented creators" },
  { icon: Trophy, value: "500+", label: "Competitions hosted" },
  { icon: ShoppingBag, value: "250K+", label: "Clips delivered" },
];

export default function SignupBrandPanel() {
  return (
    <div>
      <h2 className="text-3xl font-bold leading-tight text-black dark:text-white xl:text-4xl">
        Join{" "}
        <span className="text-black dark:bg-gradient-to-r dark:from-yellow-300 dark:to-amber-400 dark:bg-clip-text dark:text-transparent">
          Clippifi
        </span>{" "}
        today
      </h2>
      <p className="mt-3 max-w-sm text-sm text-black/70 dark:text-slate-400">
        Hire editors, host clipping competitions, or sell your clips to
        brands worldwide.
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {stats.map(({ icon: Icon, value, label }) => (
          <div key={label} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-black/10 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
              <Icon className="h-4 w-4" />
            </span>
            <p className="text-sm text-black dark:text-white">
              <span className="font-bold">{value}</span>{" "}
              <span className="text-black/60 dark:text-slate-400">{label}</span>
            </p>
          </div>
        ))}
      </div>

      <div className="mt-10 hidden max-w-sm rounded-2xl bg-black/10 p-5 backdrop-blur dark:bg-white/5 xl:block">
        <Quote className="h-6 w-6 text-black/40 dark:text-yellow-400/60" />
        <p className="mt-2 text-sm font-medium text-black dark:text-white">
          &ldquo;Clippifi helped me find amazing clips and editors that save
          me hours of work!&rdquo;
        </p>
        <div className="mt-3 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-xs font-bold text-yellow-400 dark:bg-yellow-400 dark:text-black">
            AM
          </span>
          <div>
            <p className="text-xs font-semibold text-black dark:text-white">Alex M.</p>
            <p className="text-[11px] text-black/60 dark:text-slate-400">Content Creator</p>
          </div>
        </div>
      </div>
    </div>
  );
}
