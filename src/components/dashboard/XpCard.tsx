"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { subscribeToMyXp, xpProgress } from "@/lib/xp";

export default function XpCard({ uid }: { uid: string }) {
  const [xp, setXp] = useState(0);

  useEffect(() => {
    return subscribeToMyXp(uid, setXp);
  }, [uid]);

  const { level, xpIntoLevel, xpForNextLevel, pct } = xpProgress(xp);

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none">
      <div className="flex items-center justify-between">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
          <Trophy className="h-5 w-5" />
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">{xp.toLocaleString()} XP</span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900 dark:text-white">Level {level}</p>
      <p className="text-sm text-slate-500 dark:text-slate-400">Earned by participating in campaigns</p>
      <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-white/10">
        <div className="h-full rounded-full bg-amber-500 dark:bg-yellow-400" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400">
        {xpIntoLevel} / {xpForNextLevel} XP to Level {level + 1}
      </p>
    </div>
  );
}
