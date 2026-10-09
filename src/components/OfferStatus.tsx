"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import supabase from "@/lib/supabaseClient";

type Profile = { handle: string; collection_public: boolean; wishlist_public: boolean };

// One lookup per page, shared by every watch card.
let cached: { userId: string; promise: Promise<Profile | null> } | null = null;
function loadProfile(userId: string): Promise<Profile | null> {
  if (cached?.userId === userId) return cached.promise;
  const promise = (async () => {
    if (!supabase) return null;
    const { data } = await supabase.from("public_profiles").select("handle, collection_public, wishlist_public").eq("user_id", userId).maybeSingle();
    return (data as Profile | null) ?? null;
  })();
  cached = { userId, promise };
  return promise;
}

// Shown on the owner's own Collection / Wishlist cards: visitors get "Make an offer" (collection) or
// "Offer to sell" (wishlist) on this watch when the list is public. Owners can't offer on their own watches,
// so this shows the status and links to the page visitors see.
export default function OfferStatus({ kind }: { kind: "collection" | "wishlist" }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    if (!user?.id) return;
    let live = true;
    void loadProfile(user.id).then((p) => live && setProfile(p));
    return () => {
      live = false;
    };
  }, [user?.id]);

  if (!profile) return null;
  const on = kind === "collection" ? profile.collection_public : profile.wishlist_public;
  const label = kind === "collection" ? "Make an offer" : "Offer to sell";
  return on ? (
    <Link
      href={`/collectors/${profile.handle}/${kind}`}
      onClick={(e) => e.stopPropagation()}
      className="relative z-10 mt-3 flex items-center justify-between gap-2 rounded-full border border-[#D9A43A]/40 bg-[#D9A43A]/10 px-4 py-2 text-xs font-semibold text-[#D9A43A] transition hover:bg-[#D9A43A]/20"
      title={`Visitors see a ${label} button on this watch`}
    >
      <span>
        {kind === "collection" ? "💰" : "🤝"} {label} is on for visitors
      </span>
      <span className="shrink-0 text-[11px] font-normal text-[#e8c477]">See it →</span>
    </Link>
  ) : (
    <p className="relative z-10 mt-3 rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs text-slate-400">
      🔒 Make your {kind} public (above) to add a {label} button for visitors
    </p>
  );
}
