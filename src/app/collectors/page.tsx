import Link from "next/link";
import type { Metadata } from "next";
import { listPublicCollectors, possessive } from "@/lib/publicLists";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Watch Collectors | Public Collections & Wishlists | Brandon's Brands",
  description:
    "Browse public watch collections and wishlists from the Brandon's Brands community: luxury watches, microbrands and vintage pieces. Make an offer on watches in public collections.",
  alternates: { canonical: "/collectors" },
  openGraph: { type: "website", url: "/collectors", title: "Watch Collectors on Brandon's Brands", images: ["/og-image.png"] },
};

export default async function CollectorsPage() {
  const collectors = await listPublicCollectors();
  return (
    <div className="mx-auto w-full max-w-7xl px-0 py-4 sm:px-6 sm:py-12 lg:px-16">
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Community</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">Watch collectors</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Public collections and wishlists from Brandon&apos;s Brands members. See what others are wearing and hunting for, and make an
          offer on watches in public collections.
        </p>
      </section>

      {!collectors.length ? (
        <div className="mt-8 rounded-[2rem] border border-dashed border-white/15 bg-white/5 p-10 text-center text-slate-300">
          <p className="text-lg font-semibold text-white">No public lists yet</p>
          <p className="mt-2 text-sm">
            Members can make their collection or wishlist public from the{" "}
            <Link href="/collection" className="text-[#D9A43A] hover:text-[#e1b54a]">Collection</Link> and{" "}
            <Link href="/wishlist" className="text-[#D9A43A] hover:text-[#e1b54a]">Wishlist</Link> pages.
          </p>
        </div>
      ) : (
        <ul className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {collectors.map((c) => (
            <li key={c.handle} className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-5">
              <p className="text-xl font-semibold text-white">{c.display_name}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {c.collection_public ? (
                  <Link
                    href={`/collectors/${c.handle}/collection`}
                    className="rounded-full border border-[#D9A43A]/40 bg-[#D9A43A]/10 px-4 py-2 text-sm font-semibold text-[#D9A43A] hover:bg-[#D9A43A]/20"
                    aria-label={`${possessive(c.display_name)} collection`}
                  >
                    Collection · {c.watch_count}
                  </Link>
                ) : null}
                {c.wishlist_public ? (
                  <Link
                    href={`/collectors/${c.handle}/wishlist`}
                    className="rounded-full border border-blue-400/30 bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 hover:bg-blue-500/20"
                    aria-label={`${possessive(c.display_name)} wishlist`}
                  >
                    Wishlist · {c.wish_count}
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
