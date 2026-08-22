import type { Metadata } from "next";
import AuthShell from "@/components/auth/AuthShell";
import SignupBrandPanel from "@/components/auth/SignupBrandPanel";
import SignupForm from "@/components/auth/SignupForm";

export const metadata: Metadata = {
  title: "Create your account — Clippifi",
  description: "Join Clippifi to hire streamers, host clipping competitions, or sell your clips.",
};

export default function SignupPage() {
  return (
    <AuthShell brand={<SignupBrandPanel />}>
      <SignupForm />
    </AuthShell>
  );
}
