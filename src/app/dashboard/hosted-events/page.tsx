"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Megaphone, Trophy, Users, X } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import ComingSoon from "@/components/dashboard/ComingSoon";
import {
  subscribeToAllSubmissions,
  subscribeToCompetitionsForHost,
  updateSubmissionStatus,
  type Competition,
  type CompetitionSubmission,
} from "@/lib/competitions";

const statusStyle: Record<CompetitionSubmission["status"], string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export default function HostedEventsPage() {
  return (
    <RequireAuth area="brand">
      <HostedEventsContent />
    </RequireAuth>
  );
}

function HostedEventsContent() {
  const { user } = useAuth();
  const [hostedCompetitions, setHostedCompetitions] = useState<Competition[]>([]);
  const [submissions, setSubmissions] = useState<CompetitionSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!user) return;
    const unsubComps = subscribeToCompetitionsForHost(user.id, (next) => {
      setHostedCompetitions(next);
      setLoading(false);
    });
    const unsubSubs = subscribeToAllSubmissions(setSubmissions);
    return () => {
      unsubComps();
      unsubSubs();
    };
  }, [user]);

  const resolve = async (id: string, status: "Approved" | "Rejected") => {
    setRowBusy((b) => ({ ...b, [id]: true }));
    try {
      await updateSubmissionStatus(id, status);
    } finally {
      setRowBusy((b) => ({ ...b, [id]: false }));
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hosted Events</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Competitions you&apos;re hosting and the clip links streamers have submitted.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : hostedCompetitions.length === 0 ? (
        <div className="mt-6">
          <ComingSoon
            icon={Megaphone}
            title="You're not hosting any events yet"
            text="Ask an admin to create a clipping competition for your brand account to see entries here."
          />
        </div>
      ) : (
        <div className="mt-6 flex flex-col gap-8">
          {hostedCompetitions.map((comp) => {
            const entries = submissions.filter((s) => s.competitionId === comp.id);

            return (
              <div key={comp.id}>
                <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white p-5 dark:border-white/10 dark:bg-[#111]">
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
                      <Trophy className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{comp.title}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {comp.status} · {comp.prize} prize
                      </p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-white/5 dark:text-slate-300">
                    <Users className="h-3.5 w-3.5" />
                    {entries.length} link {entries.length === 1 ? "submission" : "submissions"}
                  </span>
                </div>

                {entries.length === 0 ? (
                  <p className="mt-3 px-1 text-sm text-slate-400">
                    No clip links submitted for this event yet.
                  </p>
                ) : (
                  <div className="mt-3 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                          <th className="px-4 py-3 font-medium">Streamer</th>
                          <th className="px-4 py-3 font-medium">Link</th>
                          <th className="px-4 py-3 font-medium">Status</th>
                          <th className="px-4 py-3 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((s) => (
                          <tr key={s.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                              {s.submittedBy}
                              <p className="text-xs font-normal text-slate-400">
                                {s.submittedAt ? s.submittedAt.toDate().toLocaleDateString() : "—"}
                              </p>
                            </td>
                            <td className="px-4 py-3">
                              <a
                                href={s.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-amber-600 hover:underline dark:text-yellow-400"
                              >
                                <span className="max-w-[220px] truncate">{s.link}</span>
                                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                              </a>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[s.status]}`}>
                                {s.status}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              {s.status === "Pending" ? (
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => resolve(s.id, "Approved")}
                                    disabled={rowBusy[s.id]}
                                    className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    Approve
                                  </button>
                                  <button
                                    onClick={() => resolve(s.id, "Rejected")}
                                    disabled={rowBusy[s.id]}
                                    className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-60 dark:bg-red-500/10 dark:text-red-400"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                    Reject
                                  </button>
                                </div>
                              ) : (
                                <span className="text-xs text-slate-400">Reviewed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
