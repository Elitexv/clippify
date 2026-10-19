"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, ChevronRight, ExternalLink, Search } from "lucide-react";
import BudgetBar from "@/components/dashboard/BudgetBar";
import {
  subscribeToAllCampaigns,
  updateCampaignPayout,
  updateCampaignStatus,
  type Campaign,
  type CampaignStatus,
} from "@/lib/firebase-helpers";

const statusOptions: CampaignStatus[] = ["draft", "active", "completed", "cancelled"];
const filterOptions: Array<CampaignStatus | "all"> = ["all", "draft", "awaiting_payment", "active", "completed", "cancelled"];
type SortOption = "newest" | "budget-desc" | "budget-asc" | "title";

const statusStyle: Record<CampaignStatus, string> = {
  draft: "bg-slate-100 text-slate-600 dark:bg-white/10 dark:text-slate-300",
  awaiting_payment: "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400",
  active: "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400",
  completed: "bg-sky-100 text-sky-700 dark:bg-sky-400/10 dark:text-sky-400",
  cancelled: "bg-red-100 text-red-700 dark:bg-red-500/10 dark:text-red-400",
};

const inputClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white";

export default function AdminCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowBusy, setRowBusy] = useState<Record<string, boolean>>({});
  const [payoutDrafts, setPayoutDrafts] = useState<Record<string, string>>({});
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [sort, setSort] = useState<SortOption>("newest");

  useEffect(() => {
    const unsubscribe = subscribeToAllCampaigns((next) => {
      setCampaigns(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const changeStatus = async (campaign: Campaign, status: CampaignStatus) => {
    if (status === campaign.status) return;
    setRowBusy((b) => ({ ...b, [campaign.id]: true }));
    try {
      await updateCampaignStatus(campaign.id, status);
    } finally {
      setRowBusy((b) => ({ ...b, [campaign.id]: false }));
    }
  };

  const savePayout = async (campaign: Campaign) => {
    const draft = payoutDrafts[campaign.id];
    if (draft === undefined) return;
    const amount = Number(draft);
    if (!Number.isFinite(amount) || amount === campaign.payoutPerClip) return;
    setRowBusy((b) => ({ ...b, [campaign.id]: true }));
    try {
      await updateCampaignPayout(campaign.id, amount);
    } finally {
      setRowBusy((b) => ({ ...b, [campaign.id]: false }));
    }
  };

  const visibleCampaigns = useMemo(() => {
    const term = search.trim().toLowerCase();
    let list = campaigns;
    if (statusFilter !== "all") list = list.filter((c) => c.status === statusFilter);
    if (term) {
      list = list.filter(
        (c) => c.title.toLowerCase().includes(term) || c.brandName?.toLowerCase().includes(term),
      );
    }
    const sorted = [...list];
    if (sort === "budget-desc") sorted.sort((a, b) => b.budget - a.budget);
    else if (sort === "budget-asc") sorted.sort((a, b) => a.budget - b.budget);
    else if (sort === "title") sorted.sort((a, b) => a.title.localeCompare(b.title));
    return sorted;
  }, [campaigns, search, statusFilter, sort]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Campaigns</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Every campaign posted by every brand, across the platform.
      </p>

      {campaigns.length > 0 && (
        <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by campaign or brand…"
              className={`${inputClass} pl-10`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | "all")}
            className={`${inputClass} sm:w-40`}
          >
            {filterOptions.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All statuses" : s.replace("_", " ")}
              </option>
            ))}
          </select>
          <select value={sort} onChange={(e) => setSort(e.target.value as SortOption)} className={`${inputClass} sm:w-44`}>
            <option value="newest">Newest first</option>
            <option value="budget-desc">Budget: high to low</option>
            <option value="budget-asc">Budget: low to high</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : campaigns.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#111]">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
            <Briefcase className="h-6 w-6" />
          </span>
          <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No campaigns have been posted yet.</p>
        </div>
      ) : visibleCampaigns.length === 0 ? (
        <div className="mt-6 flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-16 text-center dark:border-white/10 dark:bg-[#111]">
          <p className="text-sm text-slate-500 dark:text-slate-400">No campaigns match your search or filter.</p>
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Campaign</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Brand</th>
                <th className="px-4 py-3 font-medium">Budget</th>
                <th className="hidden px-4 py-3 font-medium md:table-cell">Payout per clip</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody>
              {visibleCampaigns.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                  <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900 dark:text-white">
                    <Link href={`/admin/campaigns/${c.id}`} className="flex items-center gap-2 hover:underline">
                      <Briefcase className="h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-yellow-400" />
                      {c.title}
                    </Link>
                    {c.channelLink && (
                      <a
                        href={c.channelLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-0.5 flex items-center gap-1 text-xs font-normal text-amber-600 hover:underline dark:text-yellow-400"
                      >
                        <span className="max-w-[180px] truncate">{c.channelLink}</span>
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    )}
                  </td>
                  <td className="hidden whitespace-nowrap px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                    {c.brandName}
                  </td>
                  <td className="px-4 py-3">
                    <BudgetBar campaign={c} className="w-40" />
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <input
                      value={payoutDrafts[c.id] ?? String(c.payoutPerClip)}
                      onChange={(e) => setPayoutDrafts((d) => ({ ...d, [c.id]: e.target.value }))}
                      onBlur={() => savePayout(c)}
                      disabled={rowBusy[c.id]}
                      placeholder="e.g. 500"
                      className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 disabled:opacity-60 dark:border-white/10 dark:bg-white/5 dark:text-white"
                    />
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <select
                      value={c.status}
                      onChange={(e) => changeStatus(c, e.target.value as CampaignStatus)}
                      disabled={rowBusy[c.id] || c.status === "awaiting_payment"}
                      className={`rounded-full border-0 px-2 py-1 text-xs font-medium capitalize disabled:opacity-60 ${statusStyle[c.status]}`}
                    >
                      {c.status === "awaiting_payment" && (
                        <option value="awaiting_payment">awaiting payment</option>
                      )}
                      {statusOptions.map((s) => (
                        <option key={s} value={s} className="bg-white text-slate-900 dark:bg-[#111] dark:text-white">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/admin/campaigns/${c.id}`}
                      className="inline-flex items-center gap-0.5 text-xs font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
                    >
                      View
                      <ChevronRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <p className="mt-4 text-xs text-slate-400">
        Click &quot;View&quot; on a campaign to see its full brief, edit its details, or review its
        submissions — or review every pending clip at once from Admin &gt; Moderation.
      </p>
    </div>
  );
}
