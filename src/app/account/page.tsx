"use client";

import { useEffect, useState } from "react";
import { clearGuestStorageData, loadCollectionData, loadWishlistData } from "@/lib/storage";
import { useRequireAuth } from "@/components/AuthProvider";
import TextMessageSettings from "@/components/TextMessageSettings";
import PriceAlertEmailSetting from "@/components/PriceAlertEmailSetting";
import ChangePassword from "@/components/ChangePassword";
import { forumName, saveForumName } from "@/lib/forum";
import { accountName, saveAccountName } from "@/lib/account";
import EditableNameRow from "@/components/EditableNameRow";
import ListPrivacyStatus from "@/components/ListPrivacyStatus";

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
    <div className="mx-auto w-full max-w-7xl px-0 py-4 sm:px-6 sm:py-14 lg:px-16">
      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[320px_1fr]">
        <section className="rounded-md border border-hairline bg-surface p-6 shadow-[0_10px_30px_rgba(27,42,65,0.08)] backdrop-blur-xl sm:p-8">
          <div className="flex flex-col items-center gap-5 text-center sm:gap-6">
            <div className="flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br from-gold/10 via-surface to-surface shadow-[0_10px_30px_rgba(27,42,65,0.08)]">
              <span className="text-3xl font-semibold text-ink sm:text-4xl">{initials}</span>
            </div>
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Account</p>
              <h1 className="mt-3 break-all text-3xl font-semibold text-ink">{loading ? "" : displayName}</h1>
              {registered ? (
                <p className="mt-2 text-sm text-muted">
                  Registered member{memberSince ? ` since ${memberSince}` : ""}
                </p>
              ) : null}
            </div>
            <p className="text-sm leading-6 text-ink/80">
              {registered && user
                ? <ListPrivacyStatus userId={user.id} />
                : "You're browsing as a guest. Create an account to keep your collection and wishlist safe across devices."}
            </p>
          </div>
        </section>

        <section className="rounded-md border border-hairline bg-surface p-4 shadow-[0_10px_30px_rgba(27,42,65,0.08)] backdrop-blur-xl sm:p-8">
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-6">
            <div className="rounded-md border border-hairline bg-surface p-5 sm:p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Total Watches</p>
              <p className="mt-4 text-5xl font-semibold text-ink">{watchCount}</p>
              <p className="mt-3 text-sm text-muted">A refined record of your luxury timepieces.</p>
            </div>
            <div className="rounded-md border border-hairline bg-surface p-5 sm:p-6">
              <p className="text-sm uppercase tracking-[0.3em] text-gold">Wishlist</p>
              <p className="mt-4 text-5xl font-semibold text-ink">{wishlistCount}</p>
              <p className="mt-3 text-sm text-muted">Dream pieces you plan to acquire next.</p>
            </div>
          </div>

          <div className="mt-6 rounded-md border border-hairline bg-surface p-4 sm:mt-8 sm:p-6">
            <h2 className="text-lg font-semibold text-ink">Settings</h2>
            <div className="mt-4 space-y-4 text-sm text-ink/80">
              {registered ? (
                <>
                  <EditableNameRow
                    label="Name or customer number"
                    hint="Shown on your account and in public searches"
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
              <div className="flex flex-col gap-1 rounded-md bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="font-medium text-ink">Email</span>
                <span className="min-w-0 break-words sm:text-right [overflow-wrap:anywhere]">{user?.email ?? "—"}</span>
              </div>
              <div className="flex flex-col gap-1 rounded-md bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <span className="font-medium text-ink">User ID</span>
                <span className="min-w-0 break-all text-xs sm:text-right">{user?.id ?? "—"}</span>
              </div>
              <ChangePassword />
              <div className="flex items-center justify-between rounded-md bg-surface px-4 py-3">
                <span className="font-medium text-ink">Auth</span>
                <button
                  type="button"
                  onClick={signOut}
                  className="rounded-full bg-navy px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep"
                >
                  Logout
                </button>
              </div>
              <PriceAlertEmailSetting />
              <PriceAlertEmailSetting
                metaKey="offer_email"
                title="💰 Offer emails"
                description="When someone makes an offer on a watch in your public collection, it always shows in your Inbox. Also email me at"
              />
              <TextMessageSettings />
              {guestMode ? (
                <div className="flex items-center justify-between rounded-md bg-surface px-4 py-3">
                  <span className="font-medium text-ink">Guest Data</span>
                  <button
                    type="button"
                    onClick={() => {
                      clearGuestStorageData();
                      setMessage("Guest collection and wishlist cleared for this device.");
                      setWatchCount(0);
                      setWishlistCount(0);
                    }}
                    className="rounded-full border border-hairline bg-raised px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-surface"
                  >
                    Clear Guest Data
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {message ? <p className="mt-6 rounded-md bg-surface px-4 py-3 text-sm text-amber-800">{message}</p> : null}
        </section>
      </div>
    </div>
  );
}
