"use client";

import { useState } from "react";
import { Check, ExternalLink, Plus, Trophy, X } from "lucide-react";
import { adminCompetitions, type AdminCompetition } from "@/lib/mock-data";
import {
  getSubmissions,
  updateSubmissionStatus,
  type CompetitionSubmission,
} from "@/lib/submissions";

const statusStyle: Record<string, string> = {
  Active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  Draft: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  Ended: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const submissionStatusStyle: Record<CompetitionSubmission["status"], string> = {
  Pending: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400",
  Approved: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  Rejected: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

export default function AdminCompetitionsPage() {
  const [competitions, setCompetitions] = useState<AdminCompetition[]>([...adminCompetitions]);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [host, setHost] = useState("");
  const [prize, setPrize] = useState("");
  const [submissions, setSubmissions] = useState(() => getSubmissions());

  const resolveSubmission = (id: string, status: "Approved" | "Rejected") => {
    setSubmissions(updateSubmissionStatus(id, status));
  };

  const createCompetition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !host.trim() || !prize.trim()) return;
    setCompetitions((prev) => [
      {
        id: `comp-${Date.now()}`,
        title: title.trim(),
        host: host.trim(),
        prize: prize.trim(),
        entries: 0,
        status: "Draft",
      },
      ...prev,
    ]);
    setTitle("");
    setHost("");
    setPrize("");
    setShowForm(false);
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
          onSubmit={createCompetition}
          className="animate-fade-in-up mt-5 grid grid-cols-1 gap-4 rounded-2xl border border-slate-100 bg-white p-5 dark:border-white/10 dark:bg-[#111] sm:grid-cols-3"
        >
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Title
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Fall Launch Challenge"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Host brand
            </label>
            <input
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="e.g. Nova Sportswear"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Prize pool
            </label>
            <input
              value={prize}
              onChange={(e) => setPrize(e.target.value)}
              placeholder="e.g. $3,000"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition-transform duration-200 hover:scale-[1.02] active:scale-95 dark:bg-yellow-400 dark:text-black"
            >
              Save as draft
            </button>
          </div>
        </form>
      )}

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
                  {c.host}
                </td>
                <td className="px-4 py-3 font-semibold text-amber-600 dark:text-yellow-400">
                  {c.prize}
                </td>
                <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                  {c.entries}
                </td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusStyle[c.status]}`}>
                    {c.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

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
                    <p className="text-xs">{s.submittedAt}</p>
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
                          className="flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-xs font-semibold text-white transition-transform duration-200 hover:scale-105 active:scale-95"
                        >
                          <Check className="h-3.5 w-3.5" />
                          Approve
                        </button>
                        <button
                          onClick={() => resolveSubmission(s.id, "Rejected")}
                          className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-transform duration-200 hover:scale-105 active:scale-95 dark:bg-red-500/10 dark:text-red-400"
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
