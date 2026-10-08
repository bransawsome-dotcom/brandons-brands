"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import { timeAgo } from "@/lib/forum";
import {
  INBOX_CHANGED,
  listNotifications,
  markNotificationsRead,
  unreadCounts,
  watchInbox,
  type Notification,
} from "@/lib/inbox";

// Inbox icon shown at the top of every page for logged-in members, with an unread count
// and a quick look at the latest notifications.
export default function InboxBell() {
  const { user, guestMode } = useAuth();
  const userId = !guestMode ? user?.id ?? null : null;
  const router = useRouter();
  const pathname = usePathname();
  const [counts, setCounts] = useState({ notifications: 0, messages: 0 });
  const [open, setOpen] = useState(false);
  const [recent, setRecent] = useState<Notification[] | null>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  const refresh = useCallback(async () => {
    if (!userId) return;
    setCounts(await unreadCounts(userId));
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    void refresh();
    const stop = watchInbox(userId, () => void refresh());
    const onChange = () => void refresh();
    window.addEventListener(INBOX_CHANGED, onChange);
    // Also re-check when the member comes back to the tab.
    window.addEventListener("focus", onChange);
    return () => {
      stop();
      window.removeEventListener(INBOX_CHANGED, onChange);
      window.removeEventListener("focus", onChange);
    };
  }, [userId, refresh]);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", esc);
    };
  }, [open]);

  if (!userId) return null;

  const total = counts.notifications + counts.messages;

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next) {
      try {
        setRecent(await listNotifications(userId, 5));
      } catch {
        setRecent([]);
      }
    }
  };

  const openNotification = async (n: Notification) => {
    if (!n.read_at) await markNotificationsRead([n.id]).catch(() => {});
    setOpen(false);
    if (n.link && /^https?:\/\//.test(n.link)) window.open(n.link, "_blank", "noopener");
    else router.push(n.link || "/inbox");
  };

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={toggle}
        aria-label={total ? `Inbox, ${total} unread` : "Inbox"}
        aria-expanded={open}
        className={`relative flex h-10 w-10 items-center justify-center rounded-full border transition ${
          pathname?.startsWith("/inbox") ? "border-blue-400/30 bg-blue-500/20 text-blue-200" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
        }`}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M22 12h-6l-2 3h-4l-2-3H2" />
          <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
        </svg>
        {total ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#D9A43A] px-1 text-[11px] font-bold text-black">
            {total > 99 ? "99+" : total}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/95 text-left shadow-[0_20px_60px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <p className="text-sm font-semibold text-white">Inbox</p>
            <Link href="/inbox?folder=messages" onClick={() => setOpen(false)} className="text-xs text-slate-300 hover:text-white">
              Messages{counts.messages ? <span className="ml-1 rounded-full bg-[#D9A43A] px-1.5 text-[10px] font-bold text-black">{counts.messages}</span> : null}
            </Link>
          </div>
          <ul className="max-h-80 overflow-y-auto">
            {recent === null ? (
              <li className="px-4 py-6 text-center text-sm text-slate-400">Loading…</li>
            ) : !recent.length ? (
              <li className="px-4 py-6 text-center text-sm text-slate-400">No notifications yet.</li>
            ) : (
              recent.map((n) => (
                <li key={n.id}>
                  <button type="button" onClick={() => openNotification(n)} className="flex w-full gap-3 px-4 py-3 text-left hover:bg-white/5">
                    <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${n.read_at ? "bg-transparent" : "bg-[#D9A43A]"}`} />
                    <span className="min-w-0">
                      <span className={`block text-sm ${n.read_at ? "text-slate-300" : "font-semibold text-white"}`}>{n.title}</span>
                      {n.body ? <span className="mt-0.5 block truncate text-xs text-slate-400">{n.body}</span> : null}
                      <span className="mt-0.5 block text-[11px] text-slate-500">{timeAgo(n.created_at)}</span>
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
          <Link href="/inbox" onClick={() => setOpen(false)} className="block border-t border-white/10 px-4 py-3 text-center text-sm font-semibold text-[#D9A43A] hover:bg-white/5">
            Open inbox
          </Link>
        </div>
      ) : null}
    </div>
  );
}
