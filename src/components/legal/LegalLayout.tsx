import type { ReactNode } from "react";
import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";

export default function LegalLayout({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Navbar />
      <main className="flex-1 bg-white dark:bg-[#0a0a0a]">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-600 dark:text-yellow-400">
            Legal
          </p>
          <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Last updated: {updated}</p>

          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-yellow-400/20 dark:bg-yellow-400/5 dark:text-yellow-200">
            This document is provided as a good-faith starting point for Clippifi and is not a
            substitute for advice from a licensed lawyer. Have it reviewed by legal counsel
            qualified in your jurisdiction before relying on it as a binding agreement.
          </div>

          <div className="legal-content mt-4">{children}</div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
