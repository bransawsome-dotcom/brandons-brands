"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

// "Show off your own watches" call to action (home page and public collection/wishlist pages).
// Logged-in members get a shortcut to their own collection instead of the sign-up button.
export default function ShowOffCTA({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  return (
    <div className={`rounded-md border px-6 py-10 text-center shadow-card bb-sheen ${className}`}>
      <p className="font-display text-[29px] font-semibold uppercase leading-[1.05] text-ink sm:text-[36px]">Show off <span className="font-light text-gold">your own watches</span></p>
      <p className="mx-auto mt-3 max-w-2xl leading-7 text-muted">Build your collection and wishlist with photos, values and box &amp; papers. Keep them private, or choose to make them public and share them with other collectors.</p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href={user ? "/collection" : "/signup"}
          className="inline-flex min-h-[52px] items-center bg-navy px-7 text-xs font-semibold uppercase tracking-[0.2em] text-on-navy transition hover:bg-navy-deep"
        >
          {user ? "Go to my collection" : "Create a free account"}
        </Link>
        <Link
          href="/collectors"
          className="inline-flex min-h-[52px] items-center border border-hairline-strong px-7 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-gold hover:text-gold-bright"
        >
          Browse collectors
        </Link>
      </div>
    </div>
  );
}
