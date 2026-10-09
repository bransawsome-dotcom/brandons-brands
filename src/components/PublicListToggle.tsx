"use client";

import { createPortal } from "react-dom";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";
import { SITE_URL } from "@/lib/site";

type Profile = { display_name: string; handle: string; collection_public: boolean; wishlist_public: boolean };

// "Public list" switch for the Collection and Wishlist pages. When on, anyone can see the list at
// brandonsbrands17.com/collectors/<name>/<list> and search engines can find it.
export default function PublicListToggle({ kind }: { kind: "collection" | "wishlist" }) {
  const { user, guestMode } = useAuth();
  const userId = !guestMode ? user?.id ?? null : null;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!userId || !supabase) return;
    let alive = true;
    void supabase
      .from("public_profiles")
      .select("display_name, handle, collection_public, wishlist_public")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (alive && data) setProfile(data as Profile);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  if (!userId || !profile) return null;

  const on = kind === "collection" ? profile.collection_public : profile.wishlist_public;
  const path = `/collectors/${profile.handle}/${kind}`;
  const url = `${SITE_URL}${path}`;

  const toggle = async () => {
    if (!supabase) return;
    setConfirming(false);
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.rpc("set_list_public", { p_kind: kind, p_public: !on });
    setBusy(false);
    if (err) return setError("Couldn't change this setting. Please try again.");
    setProfile({ ...profile, [kind === "collection" ? "collection_public" : "wishlist_public"]: !on });
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className={`rounded-2xl border p-4 text-left sm:max-w-sm ${on ? "border-emerald-400/30 bg-emerald-500/5" : "border-white/10 bg-black/20"}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-white">{on ? "🌐 Public" : "🔒 Private"} {kind}</p>
          <p className="mt-0.5 text-xs leading-5 text-slate-400">
            {on
              ? `Anyone can see it and search engines can find it. ${kind === "collection" ? "Each watch shows a Make an offer button" : "Each watch shows an Offer to sell button"} for visitors.`
              : `Only you can see it. Make it public to show it off and ${kind === "collection" ? "get offers to buy your watches" : "get offers from people selling the watches you want"}.`}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={`Make ${kind} public`}
          disabled={busy}
          onClick={() => (on ? toggle() : setConfirming(true))}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-50 ${on ? "bg-emerald-500" : "bg-white/15"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-6" : "left-1"}`} />
        </button>
      </div>
      {on ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <Link href={path} className="min-w-0 truncate font-semibold text-emerald-200 underline-offset-2 hover:underline">
            brandonsbrands17.com{path}
          </Link>
          <button type="button" onClick={copy} className="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 hover:bg-white/10">
            {copied ? "Copied" : "Copy link"}
          </button>
          <Link href={path} className="rounded-full border border-white/15 px-2.5 py-1 text-slate-200 hover:bg-white/10">
            See what visitors see →
          </Link>
          <a
            href={`${path}/story`}
            target="_blank"
            rel="noopener"
            title="A Story-size picture of your list to post on Instagram or TikTok"
            className="rounded-full border border-[#D9A43A]/50 px-2.5 py-1 font-semibold text-[#D9A43A] hover:bg-[#D9A43A]/10"
          >
            📲 Story card
          </a>
        </div>
      ) : null}
      <p className="mt-2 text-[11px] leading-4 text-slate-500">
        Shown as <span className="text-slate-300">{profile.display_name}</span> (change it on the{" "}
        <Link href="/account" className="text-blue-300 hover:text-blue-200">Account page</Link>). Prices you paid, dates, notes and your
        email are never public.
      </p>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}

      {confirming && typeof document !== "undefined"
        ? createPortal(
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/70 p-3 backdrop-blur-sm sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="go-public-title"
          onClick={(e) => e.target === e.currentTarget && setConfirming(false)}
        >
          <div className="w-full max-w-md rounded-[1.75rem] border border-white/10 bg-[#0B1626] p-6 text-left shadow-[0_30px_90px_rgba(0,0,0,0.6)]">
            <p className="text-xs uppercase tracking-[0.25em] text-blue-300">Make it public?</p>
            <h2 id="go-public-title" className="mt-2 text-xl font-semibold text-white">
              Your {kind} will be visible to everyone
            </h2>
            <ul className="mt-4 space-y-2.5 text-sm leading-6 text-slate-300">
              <li>🌐 Anyone can see it at <span className="break-all font-semibold text-emerald-200">brandonsbrands17.com{path}</span>.</li>
              <li>
                🔎 Search engines like Google can list it. They usually take <span className="text-white">a few days to a few weeks</span> to
                pick up new pages, so share your link to get it seen sooner.
              </li>
              {kind === "collection" ? (
                <li>💰 Each watch gets a Make an offer button. Offers come to your Inbox and email.</li>
              ) : (
                <li>🤝 Each watch gets an Offer to sell button, so people who have one can offer it to you. Offers come to your Inbox and email.</li>
              )}
              <li>
                🔒 It shows as <span className="text-white">{profile.display_name}</span>. Prices you paid, dates, notes and your email stay
                private.
              </li>
              <li>↩️ You can switch it back to private at any time.</li>
            </ul>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={toggle}
                disabled={busy}
                className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-black transition hover:bg-emerald-400 disabled:opacity-60"
              >
                Make it public
              </button>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                className="rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-slate-200 hover:bg-white/5"
              >
                Keep private
              </button>
            </div>
          </div>
        </div>,
            document.body,
          )
        : null}
    </div>
  );
}
