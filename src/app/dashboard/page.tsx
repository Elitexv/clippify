"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  BadgeCheck,
  Briefcase,
  ChevronRight,
  DollarSign,
  Heart,
  Link2,
  Play,
  ShoppingBag,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import StatCard from "@/components/dashboard/StatCard";
import {
  competitions,
  featuredClips,
  recentOrders,
  trendingCreators,
} from "@/lib/mock-data";

const roleLabel: Record<string, string> = {
  brand: "Brand",
  creator: "Creator",
  both: "Brand & Creator",
  admin: "Admin",
};

export default function DashboardHome() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [joined, setJoined] = useState<Record<string, boolean>>({});

  if (!user) return null;

  const canViewBrand = user.role === "brand" || user.role === "both";
  const canViewCreator = user.role === "creator" || user.role === "both";
  const requestedView = searchParams.get("view");
  const activeView: "brand" | "creator" =
    requestedView === "brand"
      ? "brand"
      : requestedView === "creator"
        ? "creator"
        : user.role === "brand"
          ? "brand"
          : user.role === "creator"
            ? "creator"
            : "brand";

  const showBrand = (activeView === "brand" && canViewBrand) || (!canViewCreator && canViewBrand);
  const showCreator = (activeView === "creator" && canViewCreator) || (!canViewBrand && canViewCreator);

  const setRoleView = (nextView: "brand" | "creator") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("view", nextView);
    router.replace(`/dashboard?${params.toString()}`);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Welcome back, {user.name.split(" ")[0]} 👋
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {showBrand
              ? "Track campaigns, creative briefs, and brand performance."
              : "Manage clips, earnings, and creator opportunities."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {(canViewBrand || canViewCreator) && (
            <div className="inline-flex rounded-full border border-slate-200 bg-white p-1 dark:border-white/10 dark:bg-[#111]">
              {canViewBrand && (
                <button
                  type="button"
                  onClick={() => setRoleView("brand")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeView === "brand"
                      ? "bg-amber-500 text-black"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Brand view
                </button>
              )}
              {canViewCreator && (
                <button
                  type="button"
                  onClick={() => setRoleView("creator")}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                    activeView === "creator"
                      ? "bg-amber-500 text-black"
                      : "text-slate-600 dark:text-slate-300"
                  }`}
                >
                  Creator view
                </button>
              )}
            </div>
          )}
          <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400">
            {roleLabel[user.role]}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        {showBrand && (
          <PromoBanner
            icon={Briefcase}
            title="Post a Campaign"
            text="Post a campaign and get custom clips made by pro streamers."
            cta="Post a Campaign"
            href="/dashboard/post-job"
          />
        )}
        {showCreator && (
          <PromoBanner
            icon={Link2}
            title="Upload & Earn"
            text="Drop a link to your clip and connect with brands looking for creator content."
            cta="Upload Link"
            href="/dashboard/upload"
          />
        )}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={ShoppingBag}
          label={showBrand ? "Active Campaigns" : "Active Orders"}
          value="3"
          hint="+1 this week"
        />
        <StatCard icon={Heart} label="Favorites" value="18" />
        {showCreator && (
          <StatCard icon={DollarSign} label="Total Earnings" value="$1,240" hint="+$180" />
        )}
        <StatCard icon={Trophy} label="Competitions Joined" value={String(Object.values(joined).filter(Boolean).length + 2)} />
      </div>

      <SectionHeader title="Featured Clips" href="/dashboard/browse" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {featuredClips.map((clip) => (
          <div
            key={clip.id}
            className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm shadow-slate-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg dark:border-white/10 dark:bg-[#111] dark:shadow-none"
          >
            <div className="relative aspect-video">
              <Image
                src={`https://picsum.photos/seed/${clip.imageSeed}/400/240`}
                alt=""
                fill
                sizes="(min-width: 1024px) 22vw, 45vw"
                className="object-cover transition duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/20" />
              <span className="absolute left-2 top-2 rounded-md bg-black/50 px-1.5 py-0.5 text-[10px] font-medium text-white">
                {clip.duration}
              </span>
              <span className="absolute inset-0 flex items-center justify-center">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/15 backdrop-blur transition group-hover:scale-110 group-hover:bg-white/25">
                  <Play className="h-3.5 w-3.5 fill-white text-white" />
                </span>
              </span>
            </div>
            <div className="p-3">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {clip.title}
              </p>
              <div className="mt-1 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>{clip.author}</span>
                <span className="font-semibold text-amber-600 dark:text-yellow-400">{clip.price}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="Active Competitions" href="/dashboard/competitions" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {competitions
          .filter((comp) => comp.status === "Active")
          .map((comp) => (
          <div
            key={comp.id}
            className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
              <Trophy className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
              {comp.title}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Hosted by {comp.host}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-amber-600 dark:text-yellow-400">
                {comp.prize} prize
              </span>
              <span>{comp.entries} entries</span>
            </div>
            <button
              onClick={() => setJoined((j) => ({ ...j, [comp.id]: !j[comp.id] }))}
              className={`mt-4 w-full rounded-lg py-2 text-xs font-semibold transition-all duration-200 active:scale-95 ${
                joined[comp.id]
                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-400"
                  : "bg-gradient-to-r from-yellow-400 to-amber-500 text-black hover:scale-[1.02]"
              }`}
            >
              {joined[comp.id] ? "Joined ✓" : `Join · ends in ${comp.endsIn}`}
            </button>
          </div>
        ))}
      </div>

      <SectionHeader title="Trending Creators" href="/dashboard/hire" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {trendingCreators.map((c) => (
          <div
            key={c.id}
            className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm shadow-slate-100 dark:border-white/10 dark:bg-[#111] dark:shadow-none"
          >
            <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-full text-sm font-bold ${c.color}`}>
              {c.name.charAt(0)}
            </span>
            <p className="mt-2 flex items-center justify-center gap-1 text-sm font-semibold text-slate-900 dark:text-white">
              {c.name}
              <BadgeCheck className="h-3.5 w-3.5 text-sky-500" />
            </p>
            <p className="text-xs text-amber-600 dark:text-yellow-400">{c.badge}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{c.clips} clips</p>
          </div>
        ))}
      </div>

      <SectionHeader title="Recent Orders" href="/dashboard/orders" />
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
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
      <div className="h-4" />
    </div>
  );
}

function SectionHeader({ title, href }: { title: string; href: string }) {
  return (
    <div className="mb-4 mt-10 flex items-center justify-between">
      <h2 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
      <Link
        href={href}
        className="group flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-yellow-400"
      >
        View all
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function PromoBanner({
  icon: Icon,
  title,
  text,
  cta,
  href,
}: {
  icon: typeof Briefcase;
  title: string;
  text: string;
  cta: string;
  href: string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-amber-500 p-6 dark:from-[#171308] dark:to-[#0a0a0a] dark:border dark:border-yellow-400/20">
      <div>
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-black/10 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
          <Icon className="h-5 w-5" />
        </span>
        <p className="mt-3 text-base font-bold text-black dark:text-white">{title}</p>
        <p className="mt-1 text-sm text-black/70 dark:text-slate-400">{text}</p>
        <Link
          href={href}
          className="mt-4 inline-block rounded-lg bg-black px-4 py-2 text-xs font-semibold text-yellow-400 transition-transform duration-200 hover:scale-105 dark:bg-gradient-to-r dark:from-yellow-400 dark:to-amber-500 dark:text-black"
        >
          {cta}
        </Link>
      </div>
    </div>
  );
}
