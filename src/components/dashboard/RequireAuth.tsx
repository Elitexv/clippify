"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";
import type { AppRole } from "@/lib/firebase-helpers";

const roleAccessMap: Record<"admin" | "brand" | "creator" | "account", AppRole[]> = {
  admin: ["admin"],
  brand: ["brand", "both", "admin"],
  creator: ["creator", "both", "admin"],
  account: ["brand", "creator", "both"],
};

export default function RequireAuth({
  area,
  children,
}: {
  area: "admin" | "brand" | "creator" | "account";
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const allowedRoles = roleAccessMap[area];
  const hasAccess = !!user && allowedRoles.includes(user.role);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!roleAccessMap[area].includes(user.role)) {
      router.replace(user.role === "admin" ? "/admin" : "/dashboard");
      return;
    }
    if (area === "account" && user.role === "admin") {
      router.replace("/admin");
    }
  }, [user, isLoading, area, router]);

  if (isLoading || !hasAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
          {isLoading ? "Loading your account…" : "Checking access…"}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
