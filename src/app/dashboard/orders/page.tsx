import { recentOrders } from "@/lib/mock-data";

export default function OrdersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Orders</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Track clips you&apos;ve purchased and jobs you&apos;ve posted.
      </p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
              <th className="px-4 py-3 font-medium">Order</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="hidden px-4 py-3 font-medium sm:table-cell">Date</th>
              <th className="px-4 py-3 text-right font-medium">Amount</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{o.clip}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      o.status === "Delivered"
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                        : "bg-amber-100 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400"
                    }`}
                  >
                    {o.status}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">{o.date}</td>
                <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">{o.amount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
