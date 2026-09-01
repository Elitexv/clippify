import Link from "next/link";
import { Briefcase, Users } from "lucide-react";

export default function HireStreamersPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Hire Streamers</h1>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Post a job and get matched with vetted streamers.
      </p>
      <div className="mt-6 flex flex-col items-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-20 text-center dark:border-white/10 dark:bg-[#111]">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
          <Users className="h-6 w-6" />
        </span>
        <h2 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
          Hiring happens through campaigns
        </h2>
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Post a campaign with your channel link and budget — streamers browse open campaigns
          and submit clip entries directly.
        </p>
        <Link
          href="/dashboard/post-job"
          className="mt-5 flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-yellow-500/30 transition-transform duration-200 hover:scale-105"
        >
          <Briefcase className="h-4 w-4" />
          Post a Campaign
        </Link>
      </div>
    </div>
  );
}
