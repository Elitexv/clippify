"use client";

import { useEffect, useState } from "react";
import { ShoppingBag } from "lucide-react";
import RequireAuth from "@/components/dashboard/RequireAuth";
import { useAuth } from "@/lib/auth/auth-context";
import ComingSoon from "@/components/dashboard/ComingSoon";
import { subscribeToOrdersForUser, type Order } from "@/lib/orders";

export default function OrdersPage() {
  return (
    <RequireAuth area="brand">
      <OrdersContent />
    </RequireAuth>
  );
}

function OrdersContent() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsubscribe = subscribeToOrdersForUser(user.id, (next) => {
      setOrders(next);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [user]);

  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Orders</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Clips you&apos;ve licensed from creators.
      </p>

      {loading ? (
        <div className="mt-6 flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-6">
          <ComingSoon
            icon={ShoppingBag}
            title="No orders yet"
            text="Clips you license from Browse Clips will show up here."
          />
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400 dark:border-white/10">
                <th className="px-4 py-3 font-medium">Clip</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="hidden px-4 py-3 font-medium sm:table-cell">Date</th>
                <th className="px-4 py-3 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-slate-50 last:border-0 dark:border-white/5">
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{o.clipTitle}</td>
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
                  <td className="hidden px-4 py-3 text-slate-500 dark:text-slate-400 sm:table-cell">
                    {o.createdAt ? o.createdAt.toDate().toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                    ${o.amount.toFixed(2)}
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
