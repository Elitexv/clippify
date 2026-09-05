"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import AuthShell from "@/components/auth/AuthShell";
import LoginBrandPanel from "@/components/auth/LoginBrandPanel";
import LoginForm from "@/components/auth/LoginForm";
import { useAuth } from "@/lib/auth/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, getDashboardRoute } = useAuth();

  useEffect(() => {
    if (user) {
      router.replace(getDashboardRoute(user.role));
    }
  }, [router, user, getDashboardRoute]);

  if (user) return null;

  return (
    <AuthShell brand={<LoginBrandPanel />}>
      <LoginForm />
    </AuthShell>
  );
}
