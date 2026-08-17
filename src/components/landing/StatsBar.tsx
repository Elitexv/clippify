import { Bookmark, ShoppingCart, ShoppingBag, Sparkles } from "lucide-react";
import CountUp from "./CountUp";

const stats = [
  { icon: Bookmark, value: "250K+", label: "Premium Clips" },
  { icon: ShoppingCart, value: "25K+", label: "Talented Clippers" },
  { icon: ShoppingBag, value: "10K+", label: "Happy Buyers" },
  { icon: Sparkles, value: "$2M+", label: "Paid to Creators" },
];

export default function StatsBar() {
  return (
    <section>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-6 rounded-2xl bg-white px-6 py-8 shadow-xl sm:grid-cols-4 sm:gap-4 sm:px-10">
          {stats.map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-black transition-transform duration-200 hover:scale-110 hover:rotate-6">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <CountUp value={value} />
                <p className="text-xs text-slate-500 sm:text-sm">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
