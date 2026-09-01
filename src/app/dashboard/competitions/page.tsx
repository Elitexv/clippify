"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Link2, Loader2, Trophy, Users, Wallet } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import ComingSoon from "@/components/dashboard/ComingSoon";
import {
  addSubmission,
  subscribeToCompetitions,
  subscribeToSubmissionsForUser,
  withdrawSubmission,
  type Competition,
  type CompetitionSubmission,
} from "@/lib/competitions";

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";

export default function CompetitionsPage() {
  return (
    <RequireAuth area="account">
      <CompetitionsContent />
    </RequireAuth>
  );
}

function CompetitionsContent() {
  const { user } = useAuth();
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [mySubmissions, setMySubmissions] = useState<CompetitionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [entering, setEntering] = useState<Record<string, boolean>>({});
  const [links, setLinks] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubscribe = subscribeToCompetitions((next) => {
      setCompetitions(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToSubmissionsForUser(user.id, setMySubmissions);
    return () => unsubscribe();
  }, [user]);

  const submissionFor = (competitionId: string) =>
    mySubmissions.find((s) => s.competitionId === competitionId);

  const submitEntry = async (comp: Competition) => {
    const link = (links[comp.id] ?? "").trim();
    if (!link || !user) return;
    setBusy((b) => ({ ...b, [comp.id]: true }));
    try {
      await addSubmission({
        competitionId: comp.id,
        competitionTitle: comp.title,
        submittedBy: user.name,
        submittedByUid: user.id,
        link,
      });
      setEntering((e) => ({ ...e, [comp.id]: false }));
    } finally {
      setBusy((b) => ({ ...b, [comp.id]: false }));
    }
  };

  const handleWithdraw = async (submissionId: string) => {
    setBusy((b) => ({ ...b, [submissionId]: true }));
    try {
      await withdrawSubmission(submissionId);
    } finally {
      setBusy((b) => ({ ...b, [submissionId]: false }));
    }
  };

  const visible = competitions.filter((c) => c.status !== "Draft");

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Competitions</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Join promotional clipping competitions hosted by brands and win cash prizes.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-6">
          <ComingSoon
            icon={Trophy}
            title="No competitions yet"
            text="Brands can host a competition from the admin console. Check back soon."
          />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((comp) => {
            const ended = comp.status === "Ended";
            const submission = submissionFor(comp.id);
            const isBusy = busy[comp.id] || (submission && busy[submission.id]);

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
                <p className="text-sm text-slate-500 dark:text-slate-400">Hosted by {comp.hostName}</p>

                <div className="mt-4 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-sm dark:bg-white/5">
                  <span className="font-bold text-amber-600 dark:text-yellow-400">{comp.prize}</span>
                  <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                    <Users className="h-3.5 w-3.5" />
                    {comp.entries} entries
                  </span>
                </div>

                {ended ? (
                  <>
                    {submission && !submission.withdrawn && (
                      <p className="mt-3 text-xs text-slate-400">
                        You participated in this competition
                      </p>
                    )}
                    {submission?.withdrawn ? (
                      <button
                        disabled
                        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-100 py-2.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Withdrawn
                      </button>
                    ) : submission?.status === "Approved" ? (
                      <button
                        onClick={() => handleWithdraw(submission.id)}
                        disabled={isBusy}
                        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-emerald-400 to-emerald-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-emerald-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                      >
                        {isBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wallet className="h-4 w-4" />}
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
                    <p className="mt-3 text-xs text-slate-400">Ends in {comp.endsIn || "soon"}</p>

                    {submission ? (
                      <button
                        disabled
                        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-100 py-2.5 text-sm font-semibold text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Entry submitted
                      </button>
                    ) : entering[comp.id] ? (
                      <div className="mt-4">
                        <div className="relative">
                          <Link2 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            autoFocus
                            type="url"
                            value={links[comp.id] ?? ""}
                            onChange={(e) => setLinks((l) => ({ ...l, [comp.id]: e.target.value }))}
                            placeholder="Link to your clip entry"
                            className={inputClass}
                          />
                        </div>
                        <div className="mt-2 flex gap-2">
                          <button
                            onClick={() => submitEntry(comp)}
                            disabled={busy[comp.id]}
                            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                          >
                            {busy[comp.id] && <Loader2 className="h-4 w-4 animate-spin" />}
                            Submit Entry
                          </button>
                          <button
                            onClick={() => setEntering((e) => ({ ...e, [comp.id]: false }))}
                            className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-50 dark:border-white/10 dark:text-slate-400 dark:hover:bg-white/5"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setEntering((e) => ({ ...e, [comp.id]: true }))}
                        className="mt-4 w-full rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-md shadow-yellow-500/20 transition-all duration-200 hover:scale-[1.02] active:scale-95"
                      >
                        Join Competition
                      </button>
                    )}
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
