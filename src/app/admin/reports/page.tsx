import { BarChart3 } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function ReportsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Platform-wide analytics and growth trends.
      </p>
      <div className="mt-6">
        <ComingSoon
          icon={BarChart3}
          title="Analytics dashboard is on the way"
          text="Revenue trends, retention, and category breakdowns will live here."
        />
      </div>
    </div>
  );
}
