"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, Menu, Search, X } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";

const exploreLinks = ["Find Talent", "Hire Streamers", "Collections", "Popular Creators"];
const resourceLinks = ["Creator Dashboard", "Blog", "Help Center", "API Docs"];

const navLink =
  "relative text-sm text-slate-600 hover:text-amber-600 transition-colors after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:origin-left after:scale-x-0 after:bg-amber-500 after:transition-transform after:duration-200 hover:after:scale-x-100 dark:text-slate-300 dark:hover:text-yellow-400 dark:after:bg-yellow-400";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const dashboardHref = user?.role === "admin" ? "/admin" : "/dashboard";

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-white/10 dark:bg-[#0a0a0a]/95 dark:supports-[backdrop-filter]:bg-[#0a0a0a]/80">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-2 shrink-0">
          <Logo className="h-8 w-8 transition-transform duration-200 group-hover:rotate-6" />
          <span className="text-lg font-semibold text-slate-900 dark:text-white">Clippifi</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          <NavDropdown label="Explore" items={exploreLinks} />
          <a href="#how-it-works" className={navLink}>
            How it Works
          </a>
          <a href="#pricing" className={navLink}>
            Pricing
          </a>
          <a href="#creators" className={navLink}>
            For Creators
          </a>
          <NavDropdown label="Resources" items={resourceLinks} />
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          <button
            aria-label="Search"
            className="flex h-9 w-9 items-center justify-center text-slate-500 transition-transform duration-200 hover:scale-110 hover:text-amber-600 dark:text-slate-300 dark:hover:text-yellow-400"
          >
            <Search className="h-[18px] w-[18px]" />
          </button>
          <ThemeToggle />
          {user ? (
            <Link
              href={dashboardHref}
              className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-yellow-500/30 transition-transform duration-200 hover:scale-105 hover:opacity-90 active:scale-95"
            >
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-black/10 text-[10px] font-bold">
                {user.initials}
              </span>
              Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-200 dark:hover:text-white">
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-sm font-semibold text-black shadow-sm shadow-yellow-500/30 transition-transform duration-200 hover:scale-105 hover:opacity-90 active:scale-95"
              >
                Sign up
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          <ThemeToggle />
          <button
            aria-label="Toggle menu"
            aria-expanded={open}
            className="text-slate-900 dark:text-white"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="relative block h-6 w-6">
              <Menu
                className={`absolute inset-0 h-6 w-6 transition-all duration-200 ${open ? "rotate-90 opacity-0" : "rotate-0 opacity-100"}`}
              />
              <X
                className={`absolute inset-0 h-6 w-6 transition-all duration-200 ${open ? "rotate-0 opacity-100" : "-rotate-90 opacity-0"}`}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        className={`grid overflow-hidden bg-white transition-[grid-template-rows] duration-300 ease-out dark:bg-[#0a0a0a] lg:hidden ${
          open ? "grid-rows-[1fr] border-t border-slate-200 dark:border-white/10" : "grid-rows-[0fr]"
        }`}
        aria-hidden={!open}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-4 pb-6 pt-2">
            <nav className="flex flex-col gap-1">
              <MobileGroup label="Explore" items={exploreLinks} />
              <a href="#how-it-works" className="rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white">
                How it Works
              </a>
              <a href="#pricing" className="rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white">
                Pricing
              </a>
              <a href="#creators" className="rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white">
                For Creators
              </a>
              <MobileGroup label="Resources" items={resourceLinks} />
            </nav>
            <div className="mt-4 flex items-center gap-3 border-t border-slate-200 pt-4 dark:border-white/10">
              {user ? (
                <Link
                  href={dashboardHref}
                  className="flex-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-center text-sm font-semibold text-black"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/login" className="flex-1 rounded-lg border border-slate-200 px-4 py-2 text-center text-sm text-slate-900 dark:border-white/15 dark:text-white">
                    Log in
                  </Link>
                  <Link
                    href="/signup"
                    className="flex-1 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-4 py-2 text-center text-sm font-semibold text-black"
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function NavDropdown({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="group relative">
      <button className="flex items-center gap-1 text-sm text-slate-600 hover:text-amber-600 dark:text-slate-300 dark:hover:text-yellow-400">
        {label}
        <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />
      </button>
      <div className="invisible absolute left-1/2 top-full z-50 w-52 -translate-x-1/2 translate-y-1 rounded-xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl shadow-slate-200/60 transition-all duration-200 group-hover:visible group-hover:translate-y-2 group-hover:opacity-100 dark:border-white/10 dark:bg-[#141414] dark:shadow-black/40">
        {items.map((item) => (
          <a
            key={item}
            href="#"
            className="block rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

function MobileGroup({ label, items }: { label: string; items: string[] }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-md px-2 py-2 text-sm text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-white/5 dark:hover:text-white"
      >
        {label}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>
      <div
        className={`grid overflow-hidden transition-[grid-template-rows] duration-200 ease-out ${expanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="ml-3 min-h-0 flex flex-col border-l border-slate-200 pl-3 dark:border-white/10">
          {items.map((item) => (
            <a key={item} href="#" className="rounded-md px-2 py-2 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white">
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
