import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import LoginBrandPanel from "@/components/auth/LoginBrandPanel";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Log in — Clippifi",
  description: "Log in to your Clippifi account.",
};

export default function LoginPage() {
  return (
    <AuthShell brand={<LoginBrandPanel />}>
      <LoginForm />
    </AuthShell>
  );
}
