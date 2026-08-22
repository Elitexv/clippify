"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/auth-context";

export default function RequireAuth({
  area,
  children,
}: {
  area: "admin" | "account";
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const isAdmin = user?.role === "admin";
  const allowed = !!user && (area === "admin" ? isAdmin : !isAdmin);

  useEffect(() => {
    if (isLoading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (area === "admin" && !isAdmin) {
      router.replace("/dashboard");
      return;
    }
    if (area === "account" && isAdmin) {
      router.replace("/admin");
    }
  }, [user, isLoading, isAdmin, area, router]);

  if (isLoading || !allowed) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0a0a0a]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
      </div>
    );
  }

  return <>{children}</>;
}
