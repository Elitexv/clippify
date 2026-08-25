"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  Plus,
  ShieldCheck,
  X,
} from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import Logo from "@/components/Logo";
import ThemeToggle from "@/components/ThemeToggle";
import {
  accountCreateItems,
  accountMobileNavItems,
  accountNavItems,
  adminMobileNavItems,
  adminNavItems,
  isNavItemVisible,
  type NavItem,
} from "./nav-items";

export default function DashboardShell({
  area,
  children,
}: {
  area: "account" | "admin";
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  if (!user) return null;

  const navItems =
    area === "admin"
      ? adminNavItems
      : accountNavItems.filter((item) => isNavItemVisible(item, user.role));
  const createItems =
    area === "account"
      ? accountCreateItems.filter((item) => isNavItemVisible(item, user.role))
      : [];
  const mobileNavItems = area === "admin" ? adminMobileNavItems : accountMobileNavItems;

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0a0a0a]">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white transition-transform duration-300 dark:border-white/10 dark:bg-[#0d0d0d] lg:static lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-slate-100 px-5 dark:border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-semibold text-slate-900 dark:text-white">
              Clippifi
            </span>
          </Link>
          <button
            aria-label="Close menu"
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {area === "admin" && (
          <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg bg-yellow-50 px-3 py-2 text-xs font-medium text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400">
            <ShieldCheck className="h-3.5 w-3.5" />
            Admin console
          </div>
        )}

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} onNavigate={() => setMobileOpen(false)} />
          ))}

          {createItems.length > 0 && (
            <>
              <p className="mt-6 px-3 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
                Create
              </p>
              {createItems.map((item) => (
                <NavLink key={item.href} item={item} onNavigate={() => setMobileOpen(false)} />
              ))}
            </>
          )}
        </nav>

        <div className="border-t border-slate-100 p-4 dark:border-white/10">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-500 transition-colors hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col lg:pl-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur dark:border-white/10 dark:bg-[#0a0a0a]/95 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open menu"
              className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white lg:hidden"
              onClick={() => setMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </button>
            <p className="hidden text-sm font-medium text-slate-500 dark:text-slate-400 sm:block">
              {area === "admin" ? "Admin console" : "Dashboard"}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {area === "account" && (
              <Link
                href="/dashboard/upload"
                className="hidden items-center gap-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-3 py-1.5 text-xs font-semibold text-black shadow-sm shadow-yellow-500/30 transition-transform duration-200 hover:scale-105 sm:flex"
              >
                <Plus className="h-3.5 w-3.5" />
                Create
              </Link>
            )}

            <ThemeToggle />

            <button
              aria-label="Notifications"
              className="relative text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-amber-500" />
            </button>

            <div className="relative">
              <button
                onClick={() => setMenuOpen((v) => !v)}
                className="flex items-center gap-2 rounded-lg py-1 pl-1 pr-2 hover:bg-slate-50 dark:hover:bg-white/5"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-black">
                  {user.initials}
                </span>
                <span className="hidden text-sm font-medium text-slate-700 dark:text-slate-200 sm:block">
                  {user.name.split(" ")[0]}
                </span>
                <ChevronDown className="hidden h-3.5 w-3.5 text-slate-400 sm:block" />
              </button>

              {menuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setMenuOpen(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-2 w-48 rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#141414]">
                    <div className="px-3 py-2">
                      <p className="truncate text-sm font-medium text-slate-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                    >
                      <LogOut className="h-4 w-4" />
                      Log out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 px-4 pt-4 pb-24 sm:px-6 sm:pt-6 sm:pb-24 lg:p-8">
          {children}
        </main>
      </div>

      <MobileTabBar items={mobileNavItems} onOpenMenu={() => setMobileOpen(true)} />
    </div>
  );
}

function MobileTabBar({
  items,
  onOpenMenu,
}: {
  items: NavItem[];
  onOpenMenu: () => void;
}) {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-stretch border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur dark:border-white/10 dark:bg-[#0a0a0a]/95 lg:hidden [@media(max-height:500px)]:hidden">
      {items.map((item) => {
        const active =
          item.href === "/dashboard" || item.href === "/admin"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
              active
                ? "text-amber-600 dark:text-yellow-400"
                : "text-slate-500 dark:text-slate-400"
            }`}
          >
            <span className="relative">
              <Icon className="h-5 w-5" />
              {item.badge && (
                <span className="absolute -right-2 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-500 text-[8px] font-bold text-black">
                  {item.badge}
                </span>
              )}
            </span>
            {item.label}
          </Link>
        );
      })}
      <button
        type="button"
        onClick={onOpenMenu}
        className="flex flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-slate-500 dark:text-slate-400"
      >
        <Menu className="h-5 w-5" />
        Menu
      </button>
    </nav>
  );
}

function NavLink({
  item,
  onNavigate,
}: {
  item: NavItem;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const active =
    item.href === "/dashboard" || item.href === "/admin"
      ? pathname === item.href
      : pathname.startsWith(item.href);

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-yellow-50 text-amber-700 dark:bg-yellow-400/10 dark:text-yellow-400"
          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <Icon className="h-4 w-4" />
        {item.label}
      </span>
      {item.badge && (
        <span className="rounded-full bg-amber-500 px-1.5 py-0.5 text-[10px] font-semibold text-black">
          {item.badge}
        </span>
      )}
    </Link>
  );
}
