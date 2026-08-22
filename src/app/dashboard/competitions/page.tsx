"use client";

import { useState } from "react";
import { Trophy, Users } from "lucide-react";
import { competitions } from "@/lib/mock-data";

export default function CompetitionsPage() {
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Competitions</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Join promotional clipping competitions hosted by brands and win cash prizes.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {competitions.map((comp) => (
          <div
            key={comp.id}
            className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#111] dark:shadow-none"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
              <Trophy className="h-5 w-5" />
            </span>
            <p className="mt-4 font-semibold text-slate-900 dark:text-white">{comp.title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Hosted by {comp.host}</p>

            <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
              <span className="font-bold text-amber-600 dark:text-yellow-400">{comp.prize}</span>
              <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                <Users className="h-3.5 w-3.5" />
                {comp.entries} entries
              </span>
            </div>

            <p className="mt-3 text-xs text-slate-400">Ends in {comp.endsIn}</p>

            <button
              onClick={() => setJoined((j) => ({ ...j, [comp.id]: !j[comp.id] }))}
              className={`mt-4 w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                joined[comp.id]
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                  : "bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-md shadow-yellow-500/20 hover:scale-[1.02]"
              }`}
            >
              {joined[comp.id] ? "You're in ✓" : "Join Competition"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
