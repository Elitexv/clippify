"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginBrandPanel from "@/components/auth/LoginBrandPanel";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/lib/auth/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading, getDashboardRoute } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getDashboardRoute(user.role));
    }
  }, [isLoading, router, user, getDashboardRoute]);

  if (isLoading) {
    return (
      <AuthShell brand={<LoginBrandPanel />}>
        <div className="flex min-h-[320px] items-center justify-center">
          <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-amber-500 dark:border-white/10 dark:border-t-yellow-400" />
            Loading your account…
          </div>
        </div>
      </AuthShell>
    );
  }

  if (user) return null;

  return (
    <AuthShell brand={<LoginBrandPanel />}>
      <LoginForm />
    </AuthShell>
  );
}
