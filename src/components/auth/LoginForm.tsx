"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Mail, ShieldCheck, User } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import OAuthButtons from "./OAuthButtons";
import PasswordField from "./PasswordField";

export default function LoginForm() {
  const { login, loginAs } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  const goToDashboard = (role: string) => {
    router.push(role === "admin" ? "/admin" : "/dashboard");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const result = login(email, password);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError("");
    goToDashboard(result.user.role);
  };

  const handleDemo = (id: string) => {
    const user = loginAs(id);
    if (user) goToDashboard(user.role);
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
        Log in
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          className="font-medium text-amber-600 hover:text-amber-700 dark:text-yellow-400 dark:hover:text-yellow-300"
        >
          Sign up
        </Link>
      </p>

      <div className="mt-5 rounded-xl border border-dashed border-amber-300 bg-yellow-50 p-3 dark:border-yellow-400/30 dark:bg-yellow-400/5">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-yellow-400">
          Demo accounts
        </p>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={() => handleDemo("test-user")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-transform duration-200 hover:scale-[1.02] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <User className="h-3.5 w-3.5" />
            Continue as Test User
          </button>
          <button
            type="button"
            onClick={() => handleDemo("test-brand")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-transform duration-200 hover:scale-[1.02] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <Briefcase className="h-3.5 w-3.5" />
            Continue as Test Brand
          </button>
          <button
            type="button"
            onClick={() => handleDemo("test-admin")}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-amber-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-transform duration-200 hover:scale-[1.02] dark:border-white/10 dark:bg-white/5 dark:text-slate-200"
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            Continue as Test Admin
          </button>
        </div>
      </div>

      <div className="mt-6">
        <OAuthButtons emailLabel="Continue with Email link" />
      </div>

      <div className="my-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
        <span className="text-xs text-slate-400">or</span>
        <div className="h-px flex-1 bg-slate-200 dark:bg-white/10" />
      </div>

      <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
        <div>
          <label
            htmlFor="email"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email address
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-yellow-400"
            />
          </div>
        </div>

        <PasswordField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChange={setPassword}
          action={
            <Link
              href="#"
              className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-yellow-400 dark:hover:text-yellow-300"
            >
              Forgot password?
            </Link>
          }
        />

        {error && (
          <p className="-mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <label className="flex select-none items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 accent-amber-500 focus:ring-yellow-400 dark:border-white/20 dark:bg-white/5"
          />
          Remember me
        </label>

        <button
          type="submit"
          className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-lg shadow-yellow-500/30 transition-transform duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98]"
        >
          Log in
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-slate-500 dark:text-slate-500">
        By logging in, you agree to our{" "}
        <Link href="#" className="text-amber-600 hover:underline dark:text-yellow-400">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="#" className="text-amber-600 hover:underline dark:text-yellow-400">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
