"use client";

import { useState } from "react";
import { CheckCircle2, Trophy, Users, Wallet } from "lucide-react";
import { competitions } from "@/lib/mock-data";

type EntryState = "none" | "joined" | "withdrawn";

export default function CompetitionsPage() {
  const [entries, setEntries] = useState<Record<string, EntryState>>({
    // Seeded as already participated so the post-competition withdraw flow is visible.
    comp5: "joined",
  });

  const toggleJoin = (id: string) =>
    setEntries((e) => ({ ...e, [id]: e[id] === "joined" ? "none" : "joined" }));

  const withdraw = (id: string) =>
    setEntries((e) => ({ ...e, [id]: "withdrawn" }));

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Competitions</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Join promotional clipping competitions hosted by brands and win cash prizes.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {competitions.map((comp) => {
          const state = entries[comp.id] ?? "none";
          const ended = comp.status === "Ended";

          return (
            <div
              key={comp.id}
              className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#111] dark:shadow-none"
            >
              <div className="flex items-center justify-between">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
                  <Trophy className="h-5 w-5" />
                </span>
                {ended && (
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500 dark:bg-white/10 dark:text-slate-400">
                    Ended
                  </span>
                )}
              </div>
              <p className="mt-4 font-semibold text-slate-900 dark:text-white">{comp.title}</p>
              <p className="text-sm text-slate-500 dark:text-slate-400">Hosted by {comp.host}</p>

              <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
                <span className="font-bold text-amber-600 dark:text-yellow-400">{comp.prize}</span>
                <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                  <Users className="h-3.5 w-3.5" />
                  {comp.entries} entries
                </span>
              </div>

              {ended ? (
                <>
                  {state === "joined" && (
                    <p className="mt-3 text-xs text-slate-400">
                      You participated in this competition
                    </p>
                  )}
                  {state === "withdrawn" ? (
                    <button
                      disabled
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-100 py-2.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Withdrawn
                    </button>
                  ) : state === "joined" ? (
                    <button
                      onClick={() => withdraw(comp.id)}
                      className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                    >
                      <Wallet className="h-4 w-4" />
                      Withdraw {comp.payout}
                    </button>
                  ) : (
                    <button
                      disabled
                      className="mt-4 w-full cursor-not-allowed rounded-lg bg-slate-100 py-2.5 text-sm font-semibold text-slate-400 dark:bg-white/5 dark:text-slate-500"
                    >
                      Competition ended
                    </button>
                  )}
                </>
              ) : (
                <>
                  <p className="mt-3 text-xs text-slate-400">Ends in {comp.endsIn}</p>
                  <button
                    onClick={() => toggleJoin(comp.id)}
                    className={`mt-4 w-full rounded-lg py-2.5 text-sm font-semibold transition-all duration-200 active:scale-95 ${
                      state === "joined"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                        : "bg-gradient-to-r from-yellow-400 to-amber-500 text-black shadow-md shadow-yellow-500/20 hover:scale-[1.02]"
                    }`}
                  >
                    {state === "joined" ? "You're in ✓" : "Join Competition"}
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
