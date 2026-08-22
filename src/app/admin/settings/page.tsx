import { Settings } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function AdminSettingsPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Platform configuration, fees, and moderation rules.
      </p>
      <div className="mt-6">
        <ComingSoon
          icon={Settings}
          title="Platform settings are on the way"
          text="Commission rates, payout schedules, and moderation policies will live here."
        />
      </div>
    </div>
  );
}
