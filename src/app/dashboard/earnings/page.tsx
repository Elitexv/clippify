"use client";

import { useEffect, useState } from "react";
import { DollarSign, Film } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import StatCard from "@/components/dashboard/StatCard";
import { subscribeToClipsForUser, type Clip } from "@/lib/clips";

export default function EarningsPage() {
  return (
    <RequireAuth area="creator">
      <EarningsContent />
    </RequireAuth>
  );
}

function EarningsContent() {
  const { user } = useAuth();
  const [myClips, setMyClips] = useState<Clip[]>([]);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToClipsForUser(user.id, setMyClips);
    return () => unsubscribe();
  }, [user]);

  const paidClips = myClips.filter(
    (c) => c.status === "approved" && (c.payoutAtSubmission ?? 0) > 0,
  );
  const totalEarnings = paidClips.reduce((sum, c) => sum + (c.payoutAtSubmission ?? 0), 0);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Earnings</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        What you&apos;ve earned from clips approved on brand campaigns.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={DollarSign} label="Total Earnings" value={`₦${totalEarnings.toFixed(2)}`} />
        <StatCard icon={Film} label="Paid Clips" value={String(paidClips.length)} />
      </div>

      {paidClips.length === 0 ? (
        <div className="mt-8 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center dark:border-white/10 dark:bg-[#111]">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Get a clip approved on a paying campaign to start seeing earnings here.
          </p>
        </div>
      ) : (
        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Clip</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Campaign</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {paidClips.map((clip) => (
                <tr key={clip.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{clip.title}</td>
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                    {clip.campaignTitle ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                    ₦{(clip.payoutAtSubmission ?? 0).toFixed(2)}
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
