"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, Mail, X } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import { AUTH_NO_SUCH_ACCOUNT_MESSAGE } from "@/lib/firebase-helpers";
import OAuthButtons from "./OAuthButtons";
import PasswordField from "./PasswordField";

export default function LoginForm() {
  const { login, signInWithGoogle, signInWithApple, isLoading, getDashboardRoute, sendPasswordReset } = useAuth();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  const goToDashboard = (role: string) => {
    router.push(getDashboardRoute(role as "brand" | "creator" | "both" | "admin"));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const result = await login(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setError("");
      goToDashboard(result.user.role);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    if (isLoading || oauthBusy) return;
    setOauthBusy(true);
    setError("");
    try {
      const signIn = provider === "google" ? signInWithGoogle : signInWithApple;
      const result = await signIn();
      if (!result.ok) {
        setError(result.error);
        return;
      }
      goToDashboard(result.user.role);
    } finally {
      setOauthBusy(false);
    }
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

      <div className="mt-6">
        <OAuthButtons
          disabled={oauthBusy}
          onGoogle={() => handleOAuth("google")}
          onApple={() => handleOAuth("apple")}
        />
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
            <button
              type="button"
              onClick={() => setForgotOpen(true)}
              className="text-xs font-medium text-amber-600 hover:text-amber-700 dark:text-yellow-400 dark:hover:text-yellow-300"
            >
              Forgot password?
            </button>
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
          disabled={isLoading || isSubmitting}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-lg shadow-yellow-500/30 transition-transform duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Logging in…" : "Log in"}
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

      {forgotOpen && (
        <ForgotPasswordModal
          initialEmail={email}
          onClose={() => setForgotOpen(false)}
          onSend={sendPasswordReset}
        />
      )}
    </div>
  );
}

function ForgotPasswordModal({
  initialEmail,
  onClose,
  onSend,
}: {
  initialEmail: string;
  onClose: () => void;
  onSend: (email: string) => Promise<{ ok: true } | { ok: false; error: string }>;
}) {
  const [resetEmail, setResetEmail] = useState(initialEmail);
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim() || status === "sending") return;

    setStatus("sending");
    const result = await onSend(resetEmail.trim());
    if (result.ok || result.error === AUTH_NO_SUCH_ACCOUNT_MESSAGE) {
      // Don't reveal whether an account exists for this email — show the same
      // confirmation either way.
      setStatus("sent");
    } else {
      setError(result.error);
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl dark:bg-[#141414]">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Reset your password
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {status === "sent" ? (
          <>
            <p className="mt-4 text-sm text-slate-600 dark:text-slate-300">
              If an account exists for <span className="font-medium">{resetEmail}</span>, we&apos;ve
              sent a link to reset the password.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-5 w-full rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black transition-transform duration-200 hover:scale-[1.02]"
            >
              Done
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Enter the email on your account and we&apos;ll send you a link to reset your
              password.
            </p>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                autoFocus
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-yellow-400"
              />
            </div>
            {status === "error" && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
            <button
              type="submit"
              disabled={status === "sending"}
              className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black transition-transform duration-200 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" && <Loader2 className="h-4 w-4 animate-spin" />}
              Send reset link
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
