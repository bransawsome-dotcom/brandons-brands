"use client";

import Link from "next/link";
import { useAuth } from "@/components/AuthProvider";

// "Show off your own watches" call to action (home page and public collection/wishlist pages).
// Logged-in members get a shortcut to their own collection instead of the sign-up button.
export default function ShowOffCTA({ className = "" }: { className?: string }) {
  const { user } = useAuth();
  return (
    <div className={`rounded-[2rem] border border-[#D9A43A]/30 bg-[#D9A43A]/5 p-6 text-center ${className}`}>
      <p className="text-lg font-semibold text-white">Show off your own watches</p>
      <p className="mt-1 text-sm text-slate-300">Build your collection and wishlist with photos, values and box &amp; papers. Keep them private, or choose to make them public and share them with other collectors.</p>
      <div className="mt-4 flex flex-wrap justify-center gap-3">
        <Link
          href={user ? "/collection" : "/signup"}
          className="inline-flex rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-black hover:bg-[#e1b54a]"
        >
          {user ? "Go to my collection" : "Create a free account"}
        </Link>
        <Link
          href="/collectors"
          className="inline-flex rounded-full border border-white/15 px-6 py-3 text-sm font-semibold uppercase tracking-[0.15em] text-slate-200 hover:bg-white/5"
        >
          Browse collectors
        </Link>
      </div>
    </div>
  );
}
