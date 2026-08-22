import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

export default function AuthShell({
  brand,
  children,
}: {
  brand: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-yellow-400 to-amber-500 p-10 dark:from-[#0a0a0a] dark:to-[#0a0a0a] lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div
          className="pointer-events-none absolute -right-32 -top-32 hidden h-80 w-80 rounded-full bg-yellow-400/20 blur-[100px] dark:block"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-24 left-0 hidden h-64 w-64 rounded-full bg-amber-500/10 blur-[100px] dark:block"
          aria-hidden
        />

        <Link href="/" className="relative z-10 flex items-center gap-2">
          <Logo className="h-9 w-9" />
          <span className="text-lg font-bold text-black dark:text-white">Clippifi</span>
        </Link>

        <div className="relative z-10">{brand}</div>

        <p className="relative z-10 text-xs text-black/50 dark:text-slate-500">
          © 2026 Clippifi. All rights reserved.
        </p>
      </div>

      <div className="relative flex items-center justify-center bg-white px-4 py-12 dark:bg-[#0a0a0a] sm:px-6 lg:px-12">
        <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2 lg:hidden">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">Clippifi</span>
          </Link>
          {children}
        </div>
      </div>
    </div>
  );
}
