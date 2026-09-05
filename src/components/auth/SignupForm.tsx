"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, AtSign, Briefcase, Clapperboard, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import OAuthButtons from "./OAuthButtons";
import PasswordField from "./PasswordField";

const roles = [
  {
    id: "brand",
    label: "Brand",
    icon: Briefcase,
    text: "Hire streamers, post campaigns, and run clipping competitions",
  },
  {
    id: "creator",
    label: "Creator",
    icon: Clapperboard,
    text: "Sell clips, join competitions, and earn from your content",
  },
] as const;

type RoleId = (typeof roles)[number]["id"];

export default function SignupForm() {
  const { register, signInWithGoogle, signInWithApple, getDashboardRoute } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<"role" | "details">("role");
  const [role, setRole] = useState<RoleId | null>(null);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [oauthBusy, setOauthBusy] = useState(false);

  const chooseRole = (id: RoleId) => {
    setRole(id);
    setError("");
    setStep("details");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role || !agreed || !fullName.trim() || !email.trim() || !password || submitting) return;

    setSubmitting(true);
    setError("");
    try {
      const user = await register({
        name: fullName.trim(),
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });
      router.push(getDashboardRoute(user.role));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Account creation failed.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOAuth = async (provider: "google" | "apple") => {
    if (!role || oauthBusy) return;
    setOauthBusy(true);
    setError("");
    try {
      const signIn = provider === "google" ? signInWithGoogle : signInWithApple;
      const result = await signIn(role);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(getDashboardRoute(result.user.role));
    } finally {
      setOauthBusy(false);
    }
  };

  if (step === "role" || !role) {
    return (
      <div className="animate-fade-in-up">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
          How will you use Clippifi?
        </h1>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-amber-600 hover:text-amber-700 dark:text-yellow-400 dark:hover:text-yellow-300"
          >
            Log in
          </Link>
        </p>

        <div className="mt-6 flex flex-col gap-4">
          {roles.map(({ id, label, icon: Icon, text }) => (
            <button
              key={id}
              type="button"
              onClick={() => chooseRole(id)}
              className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:shadow-lg hover:shadow-amber-500/10 dark:border-white/10 dark:bg-white/5 dark:hover:border-yellow-400"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-yellow-100 text-black dark:bg-yellow-400/10 dark:text-yellow-400">
                <Icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block font-semibold text-slate-900 dark:text-white">
                  {label}
                </span>
                <span className="mt-0.5 block text-sm text-slate-500 dark:text-slate-400">
                  {text}
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const roleMeta = roles.find((r) => r.id === role)!;

  return (
    <div className="animate-fade-in-up">
      <button
        type="button"
        onClick={() => {
          setStep("role");
          setError("");
        }}
        className="flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back
      </button>

      <h1 className="mt-3 text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
        Create your {roleMeta.label.toLowerCase()} account
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-amber-600 hover:text-amber-700 dark:text-yellow-400 dark:hover:text-yellow-300"
        >
          Log in
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="fullname"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Full name
            </label>
            <input
              id="fullname"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Enter your full name"
              className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-yellow-400"
            />
          </div>
          <div>
            <label
              htmlFor="username"
              className="text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Username
            </label>
            <div className="relative mt-1.5">
              <AtSign className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-yellow-400 focus:outline-none focus:ring-2 focus:ring-yellow-400/30 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:border-yellow-400"
              />
            </div>
          </div>
        </div>

        <div>
          <label
            htmlFor="signup-email"
            className="text-sm font-medium text-slate-700 dark:text-slate-300"
          >
            Email address
          </label>
          <div className="relative mt-1.5">
            <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              id="signup-email"
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
          placeholder="Create a password"
          hint="Min. 8 characters with a mix of letters, numbers & symbols"
          value={password}
          onChange={setPassword}
        />

        {error && (
          <p className="-mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}

        <label className="flex select-none items-start gap-2 text-sm text-slate-600 dark:text-slate-400">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 accent-amber-500 focus:ring-yellow-400 dark:border-white/20 dark:bg-white/5"
          />
          <span>
            I agree to the{" "}
            <Link href="#" className="text-amber-600 hover:underline dark:text-yellow-400">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="#" className="text-amber-600 hover:underline dark:text-yellow-400">
              Privacy Policy
            </Link>
          </span>
        </label>

        <button
          type="submit"
          disabled={!agreed || submitting}
          className="flex items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-lg shadow-yellow-500/30 transition-transform duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
      </form>
    </div>
  );
}
