"use client";

import { useEffect, useState } from "react";
import { Check, ExternalLink, Loader2, Plus, Trophy, X } from "lucide-react";
import { subscribeToAllUsers, type AppUser } from "@/lib/firebase-helpers";
import {
  createCompetition,
  subscribeToAllSubmissions,
  subscribeToCompetitions,
  updateCompetitionStatus,
  updateSubmissionStatus,
  type Competition,
  type CompetitionStatus,
  type CompetitionSubmission,
} from "@/lib/competitions";

const statusStyle: Record<CompetitionStatus, string> = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  Draft: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  Ended: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const submissionStatusStyle: Record<CompetitionSubmission["status"], string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const inputClass =
  "mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [submissions, setSubmissions] = useState<CompetitionSubmission[]>([]);
  const [brands, setBrands] = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [hostId, setHostId] = useState("");
  const [prize, setPrize] = useState("");
  const [endsIn, setEndsIn] = useState("");
  const [creating, setCreating] = useState(false);
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const unsubComps = subscribeToCompetitions((next) => {
      setCompetitions(next);
      setLoading(false);
    });
    const unsubSubs = subscribeToAllSubmissions(setSubmissions);
    const unsubUsers = subscribeToAllUsers((users) =>
      setBrands(users.filter((u) => u.role === "brand" || u.role === "both"))
    );
    return () => {
      unsubComps();
      unsubSubs();
      unsubUsers();
    };
  }, []);

  const resolveSubmission = async (id: string, status: "Approved" | "Rejected") => {
    setRowBusy((b) => ({ ...b, [id]: true }));
    try {
      await updateSubmissionStatus(id, status);
    } finally {
      setRowBusy((b) => ({ ...b, [id]: false }));
    }
  };

  const toggleCompetitionStatus = async (comp: Competition) => {
    const next: CompetitionStatus =
      comp.status === "Draft" ? "Active" : comp.status === "Active" ? "Ended" : "Active";
    setRowBusy((b) => ({ ...b, [comp.id]: true }));
    try {
      await updateCompetitionStatus(comp.id, next);
    } finally {
      setRowBusy((b) => ({ ...b, [comp.id]: false }));
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const host = brands.find((b) => b.id === hostId);
    if (!title.trim() || !host || !prize.trim()) return;

    setCreating(true);
    try {
      await createCompetition({
        hostId: host.id,
        hostName: host.name,
        title: title.trim(),
        prize: prize.trim(),
        endsIn: endsIn.trim(),
        status: "Draft",
      });
      setTitle("");
      setHostId("");
      setPrize("");
      setEndsIn("");
      setShowForm(false);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Competitions</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage promotional clipping competitions across the platform.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-yellow-500/30 transition-transform duration-200 hover:scale-105"
        >
          {showForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {showForm ? "Cancel" : "Create Competition"}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleCreate}
          className="animate-fade-in-up mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-5 dark:border-white/10 dark:bg-[#111] sm:grid-cols-2"
        >
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fall Launch Challenge"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Host brand</label>
            <select value={hostId} onChange={(e) => setHostId(e.target.value)} className={inputClass}>
              <option value="">
                {brands.length === 0 ? "No brand accounts yet" : "Select a brand account…"}
              </option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Prize pool</label>
            <input
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              placeholder="e.g. $3,000"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Ends in</label>
            <input
              value={endsIn}
              onChange={(e) => setEndsIn(e.target.value)}
              placeholder="e.g. 14 days"
              className={inputClass}
            />
          </div>
          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={creating || !hostId}
              className="flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-yellow-400 dark:text-black"
            >
              {creating && <Loader2 className="h-4 w-4 animate-spin" />}
              Save as draft
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : competitions.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#111]">
          <p className="text-sm text-slate-500 dark:text-slate-400">No competitions yet.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Competition</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Host</th>
                <th className="px-4 py-3 font-medium">Prize</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Entries</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {competitions.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    <span className="flex items-center gap-2">
                      <Trophy className="h-3.5 w-3.5 text-amber-500 dark:text-yellow-400" />
                      {c.title}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                    {c.hostName}
                  </td>
                  <td className="px-4 py-3 font-semibold text-amber-600 dark:text-yellow-400">{c.prize}</td>
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                    {c.entries}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleCompetitionStatus(c)}
                      disabled={rowBusy[c.id]}
                      className={`rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-60 ${statusStyle[c.status]}`}
                    >
                      {c.status}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mb-4 mt-10">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Link Submissions</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Clip links streamers have submitted as entries, across every event.
        </p>
      </div>

      {submissions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#111]">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            No clip links have been submitted yet.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Streamer</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Link</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">
                    {s.competitionTitle}
                  </td>
                  <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                    {s.submittedBy}
                    <p className="text-xs">
                      {s.submittedAt ? s.submittedAt.toDate().toLocaleDateString() : "—"}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <a
                      href={s.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-amber-600 hover:underline dark:text-yellow-400"
                    >
                      <span className="max-w-[200px] truncate">{s.link}</span>
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${submissionStatusStyle[s.status]}`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {s.status === "Pending" ? (
                      <div className="flex gap-2">
                        <button
                          onClick={() => resolveSubmission(s.id, "Approved")}
                          disabled={rowBusy[s.id]}
                          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-transform duration-200 hover:scale-105 active:scale-95 disabled:opacity-60"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => resolveSubmission(s.id, "Rejected")}
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
}
