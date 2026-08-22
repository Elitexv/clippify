import { Briefcase } from "lucide-react";
import ComingSoon from "@/components/dashboard/ComingSoon";

export default function PostJobPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Post a Job</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Describe what you need and get proposals from streamers.
      </p>
      <div className="mt-6">
        <ComingSoon
          icon={Briefcase}
          title="Job posting is on the way"
          text="A guided form for briefs, budget, and deadlines will live here."
        />
      </div>
    </div>
  );
}
