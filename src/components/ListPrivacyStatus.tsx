"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import supabase from "@/lib/supabaseClient";

type Profile = { handle: string; collection_public: boolean; wishlist_public: boolean };

// Account page line saying whether the member's collection and wishlist are public or private, with links to the public pages.
export default function ListPrivacyStatus({ userId }: { userId: string }) {
  const [profile, setProfile] = useState<Profile | null | undefined>(undefined);

  useEffect(() => {
    if (!supabase) return;
    let alive = true;
    void supabase
      .from("public_profiles")
      .select("handle, collection_public, wishlist_public")
      .eq("user_id", userId)
      .maybeSingle()
      .then(({ data }) => {
        if (alive) setProfile((data as Profile | null) ?? null);
      });
    return () => {
      alive = false;
    };
  }, [userId]);

  if (profile === undefined) return null;

  const col = Boolean(profile?.collection_public);
  const wish = Boolean(profile?.wishlist_public);
  const link = (kind: "collection" | "wishlist", label: string) =>
    profile ? (
      <Link href={`/collectors/${profile.handle}/${kind}`} className="text-[#D9A43A] hover:text-[#e1b54a]">
        {label}
      </Link>
    ) : (
      label
    );
  const settings = (
    <>
      {" "}
      Change this on your <Link href="/collection" className="text-blue-200 hover:text-blue-100">Collection</Link> and{" "}
      <Link href="/wishlist" className="text-blue-200 hover:text-blue-100">Wishlist</Link> pages.
    </>
  );

  if (col && wish)
    return (
      <>
        Your {link("collection", "collection")} and {link("wishlist", "wishlist")} are public: anyone can see them.{settings}
      </>
    );
  if (col)
    return (
      <>
        Your {link("collection", "collection")} is public and your wishlist is private.{settings}
      </>
    );
  if (wish)
    return (
      <>
        Your {link("wishlist", "wishlist")} is public and your collection is private.{settings}
      </>
    );
  return <>Your collection and wishlist are private to your account. You can make either one public anytime.{settings}</>;
}
