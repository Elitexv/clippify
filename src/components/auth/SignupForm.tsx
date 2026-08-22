"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, Briefcase, Clapperboard, Mail, Users } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import OAuthButtons from "./OAuthButtons";
import PasswordField from "./PasswordField";

const roles = [
  {
    id: "brand",
    label: "Brand",
    icon: Briefcase,
    text: "I want to hire streamers or run a clipping competition",
  },
  {
    id: "creator",
    label: "Creator",
    icon: Clapperboard,
    text: "I want to sell clips or join competitions",
  },
  {
    id: "both",
    label: "Both",
    icon: Users,
    text: "I want to hire and create",
  },
] as const;

export default function SignupForm() {
  const { register } = useAuth();
  const router = useRouter();

  const [role, setRole] = useState<(typeof roles)[number]["id"]>("creator");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed || !fullName.trim() || !email.trim() || !password) return;
    register({ name: fullName.trim(), email: email.trim(), role });
    router.push("/dashboard");
  };

  return (
    <div className="animate-fade-in-up">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white sm:text-3xl">
        Create your account
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
        <OAuthButtons emailLabel="Continue with Email" />
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

        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
            I am a...
          </p>
          <div className="mt-2 grid grid-cols-3 gap-3">
            {roles.map(({ id, label, icon: Icon, text }) => (
              <button
                key={id}
                type="button"
                onClick={() => setRole(id)}
                aria-pressed={role === id}
                className={`rounded-xl border p-3 text-center transition-all duration-200 ${
                  role === id
                    ? "border-amber-400 bg-yellow-50 shadow-sm dark:border-yellow-400 dark:bg-yellow-400/10"
                    : "border-slate-200 hover:border-slate-300 dark:border-white/10 dark:hover:border-white/20"
                }`}
              >
                <Icon
                  className={`mx-auto h-5 w-5 ${
                    role === id
                      ? "text-amber-600 dark:text-yellow-400"
                      : "text-slate-400"
                  }`}
                />
                <p className="mt-1.5 text-xs font-semibold text-slate-900 dark:text-white">
                  {label}
                </p>
                <p className="mt-0.5 hidden text-[10px] leading-tight text-slate-500 dark:text-slate-400 sm:block">
                  {text}
                </p>
              </button>
            ))}
          </div>
        </div>

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
          disabled={!agreed}
          className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 py-2.5 text-sm font-semibold text-black shadow-lg shadow-yellow-500/30 transition-transform duration-200 hover:scale-[1.02] hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
        >
          Create account
        </button>
      </form>
    </div>
  );
}
