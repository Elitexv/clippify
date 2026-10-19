"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck } from "lucide-react";
import { useAuth } from "@/lib/auth/auth-context";
import {
  markAllNotificationsRead,
  markNotificationRead,
  subscribeToNotifications,
  type AppNotification,
} from "@/lib/notifications";

function timeAgo(ms: number | undefined) {
  if (!ms) return "";
  const diff = Date.now() - ms;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);

  useEffect(() => {
    if (!user) return;
    return subscribeToNotifications(user.id, setItems);
  }, [user]);

  if (!user) return null;

  const unread = items.filter((n) => !n.read);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white"
      >
        <Bell className="h-5 w-5" />
        {unread.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-500 px-1 text-[10px] font-bold text-black">
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 max-h-96 w-80 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl dark:border-white/10 dark:bg-[#141414]">
            <div className="flex items-center justify-between px-3 py-2">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">Notifications</p>
              {unread.length > 0 && (
                <button
                  onClick={() => markAllNotificationsRead(unread.map((n) => n.id)).catch(console.error)}
                  className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:underline dark:text-yellow-400"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Mark all read
                </button>
              )}
            </div>
            <div className="my-1 h-px bg-slate-100 dark:bg-white/10" />
            {items.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-slate-400">No notifications yet.</p>
            ) : (
              items.map((n) => (
                <Link
                  key={n.id}
                  href={n.link || "#"}
                  onClick={() => {
                    setOpen(false);
                    if (!n.read) markNotificationRead(n.id).catch(console.error);
                  }}
                  className={`block rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-white/5 ${
                    n.read ? "" : "bg-yellow-50 dark:bg-yellow-400/5"
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-slate-900 dark:text-white">{n.title}</p>
                    <span className="shrink-0 text-[10px] text-slate-400">{timeAgo(n.createdAt?.toMillis())}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">{n.body}</p>
                </Link>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
