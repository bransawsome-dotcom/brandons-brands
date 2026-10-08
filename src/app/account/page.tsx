"use client";

import { useEffect, useState } from "react";
import { clearGuestStorageData, loadCollectionData, loadWishlistData } from "@/lib/storage";
import { useRequireAuth } from "@/components/AuthProvider";
import TextMessageSettings from "@/components/TextMessageSettings";
import { forumName, saveForumName } from "@/lib/forum";
import { accountName, saveAccountName } from "@/lib/account";
import EditableNameRow from "@/components/EditableNameRow";

export default function AccountPage() {
  const [watchCount, setWatchCount] = useState<number>(0);
  const [wishlistCount, setWishlistCount] = useState<number>(0);
  const [message, setMessage] = useState<string | null>(null);
  const { user, loading, guestMode, signOut } = useRequireAuth();
  const registered = Boolean(user) && !guestMode;
  // Registered members see the name or customer number they chose (or the start of their email); guests see "Guest Collector".
  const displayName = registered ? accountName(user) || (user?.email ?? "").split("@")[0] || "Member" : "Guest Collector";
  const initials = registered
    ? displayName
        .split(/[\s._-]+/)
        .filter(Boolean)
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "BB"
    : "BB";
  const memberSince = registered && user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : null;

  useEffect(() => {
    if (loading) return;

    const userId = user?.id ?? null;

    loadCollectionData(userId).then((collection) => setWatchCount(collection.length));
    loadWishlistData(userId).then((wishlist) => setWishlistCount(wishlist.length));
  }, [loading, user?.id]);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-16">
      <div className="grid gap-8 lg:grid-cols-[320px_1fr]">
        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 via-slate-800 to-slate-900 shadow-[0_20px_60px_rgba(30,58,138,0.35)]">
              <span className="text-4xl font-semibold text-white">{initials}</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Account</p>
              <h1 className="mt-3 break-all text-3xl font-semibold text-white">{loading ? "" : displayName}</h1>
              {registered ? (
                <p className="mt-2 text-sm text-slate-400">
                  Registered member{memberSince ? ` since ${memberSince}` : ""}
                </p>
              ) : null}
            </div>
            <p className="text-sm leading-6 text-slate-300">
              {registered
                ? "Your collection and wishlist are private to your account."
                : "You're browsing as a guest. Create an account to keep your collection and wishlist safe across devices."}
            </p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Total Watches</p>
              <p className="mt-4 text-5xl font-semibold text-white">{watchCount}</p>
              <p className="mt-3 text-sm text-slate-400">A refined record of your luxury timepieces.</p>
            </div>
            <div className="rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Wishlist</p>
              <p className="mt-4 text-5xl font-semibold text-white">{wishlistCount}</p>
              <p className="mt-3 text-sm text-slate-400">Dream pieces you plan to acquire next.</p>
            </div>
          </div>

          <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
            <h2 className="text-lg font-semibold text-white">Settings</h2>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              {registered ? (
                <>
                  <EditableNameRow
                    label="Name or customer number"
                    hint="Shown on your account"
                    value={accountName(user)}
                    emptyText="Not set"
                    placeholder="e.g. Jane Smith or customer #1042"
                    onSave={saveAccountName}
                  />
                  <EditableNameRow
                    label="Forum name"
                    hint="Shown on your forum posts"
                    value={forumName(user)}
                    emptyText="Not set"
                    placeholder="e.g. SubmarinerSteve"
                    onSave={async (name) => {
                      await saveForumName(name);
                    }}
                  />
                </>
              ) : null}
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-white/5 px-4 py-3">
                <span className="font-medium text-white">Email</span>
                <span className="min-w-0 break-all text-right">{user?.email ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between gap-4 rounded-3xl bg-white/5 px-4 py-3">
                <span className="font-medium text-white">User ID</span>
                <span className="min-w-0 break-all text-right text-xs">{user?.id ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between rounded-3xl bg-white/5 px-4 py-3">
                <span className="font-medium text-white">Auth</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full bg-[#D9A43A] px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-black transition hover:bg-[#e1b54a]"
                >
                  Logout
                </button>
              </div>
              <TextMessageSettings />
              {guestMode ? (
                <div className="flex items-center justify-between rounded-3xl bg-white/5 px-4 py-3">
                  <span className="font-medium text-white">Guest Data</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearGuestStorageData();
                      setMessage("Guest collection and wishlist cleared for this device.");
                      setWatchCount(0);
                      setWishlistCount(0);
                    }}
                    className="rounded-full border border-white/10 bg-slate-900/70 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-white transition hover:bg-slate-800"
                  >
                    Clear Guest Data
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {message ? <p className="mt-6 rounded-3xl bg-white/5 px-4 py-3 text-sm text-amber-300">{message}</p> : null}
        </section>
      </div>
    </div>
  );
}
