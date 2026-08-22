import { Users } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function HireStreamersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hire Streamers</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Post a job and get matched with vetted streamers.
      </p>
      <div className="mt-6">
        <ComingSoon
          icon={Users}
          title="Streamer marketplace is on the way"
          text="Soon you'll be able to browse streamer profiles, compare rates, and post jobs directly from here."
        />
      </div>
    </div>
  );
}
