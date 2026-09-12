"use client";

import Link from "next/link";
import {
  Briefcase,
  ClipboardList,
  DollarSign,
  Heart,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  Trophy,
  Users,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import ThemeToggle from "@/components/ThemeToggle";

const roleLabel: Record<string, string> = {
  brand: "Brand",
  creator: "Creator",
  both: "Brand & Creator",
  admin: "Admin",
};

type QuickLink = { label: string; href: string; icon: LucideIcon };

export default function ProfileContent() {
  const { user, logout } = useAuth();

  if (!user) return null;

  const links: QuickLink[] = [];
  if (user.role === "admin") {
    links.push(
      { label: "Admin Overview", href: "/admin", icon: LayoutDashboard },
      { label: "Settings", href: "/admin/settings", icon: Settings },
    );
  } else {
    if (user.role === "brand" || user.role === "both") {
      links.push(
        { label: "My Campaigns", href: "/dashboard/campaigns", icon: ClipboardList },
        { label: "Post a Campaign", href: "/dashboard/post-job", icon: Briefcase },
        { label: "Hire Streamers", href: "/dashboard/hire", icon: Users },
      );
    }
    if (user.role === "creator" || user.role === "both") {
      links.push(
        { label: "Campaigns", href: "/dashboard/competitions", icon: Trophy },
        { label: "Earnings", href: "/dashboard/earnings", icon: DollarSign },
      );
    }
    links.push({ label: "Favorites", href: "/dashboard/favorites", icon: Heart });
  }

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Profile</h1>

      <div className="mt-5 flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-6 text-center dark:border-white/10 dark:bg-[#111]">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-500 text-xl font-bold text-black">
          {user.initials}
        </span>
        <p className="mt-3 text-lg font-semibold text-slate-900 dark:text-white">{user.name}</p>
        <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
        <span className="mt-2 flex items-center gap-1 rounded-full bg-yellow-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400">
          {user.role === "admin" && <ShieldCheck className="h-3 w-3" />}
          {roleLabel[user.role]}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-4 dark:border-white/10 dark:bg-[#111]">
        <div>
          <p className="text-sm font-medium text-slate-900 dark:text-white">Appearance</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Switch between light and dark mode.</p>
        </div>
        <ThemeToggle className="border border-slate-200 dark:border-white/10" />
      </div>

      {links.length > 0 && (
        <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100 bg-white dark:border-white/10 dark:bg-[#111]">
          {links.map((link, i) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-white/5 ${
                  i > 0 ? "border-t border-slate-100 dark:border-white/10" : ""
                }`}
              >
                <Icon className="h-4 w-4 text-slate-400" />
                {link.label}
              </Link>
            );
          })}
        </div>
      )}

      <button
        onClick={() => logout()}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-red-100 bg-white py-3.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 dark:border-red-500/20 dark:bg-[#111] dark:text-red-400 dark:hover:bg-red-500/10"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </button>
    </div>
  );
}
