"use client";

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
              ? `Anyone can see it and search engines can find it${kind === "collection" ? ". People can make offers on your watches" : ""}.`
              : `Only you can see it. Make it public to show it off${kind === "collection" ? " and get offers" : ""}.`}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={`Make ${kind} public`}
          disabled={busy}
          onClick={toggle}
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
        </div>
      ) : null}
      <p className="mt-2 text-[11px] leading-4 text-slate-500">
        Shown as <span className="text-slate-300">{profile.display_name}</span> (change it on the{" "}
        <Link href="/account" className="text-blue-300 hover:text-blue-200">Account page</Link>). Prices you paid, dates, notes and your
        email are never public.
      </p>
      {error ? <p className="mt-2 text-xs text-rose-300">{error}</p> : null}
    </div>
  );
}
