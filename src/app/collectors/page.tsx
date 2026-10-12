import Link from "next/link";
import type { Metadata } from "next";
import MessageMemberButton from "@/components/MessageMemberButton";
import CollectorMedallion from "@/components/CollectorMedallion";
import { listPublicCollectors, possessive } from "@/lib/publicLists";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Watch Collectors | Public Collections & Wishlists | Brandon's Brands",
  description:
    "Browse public watch collections and wishlists from the Brandon's Brands community: luxury watches, microbrands and vintage pieces. Make an offer on watches in public collections.",
  alternates: { canonical: "/collectors" },
  openGraph: { type: "website", url: "/collectors", title: "Watch Collectors on Brandon's Brands", images: ["/og-image.png?v=2"] },
};

export default async function CollectorsPage() {
  const collectors = await listPublicCollectors();
  return (
    <div className="mx-auto w-full max-w-7xl px-0 py-4 sm:px-6 sm:py-12 lg:px-16">
      <section className="border-b border-hairline pb-10">
        <div className="mb-4 h-0.5 w-11 bg-gold" aria-hidden />
        <p className="mb-2 text-xs uppercase tracking-[0.22em] text-gold">Community</p>
        <h1 className="font-display text-[48px] font-semibold uppercase leading-[0.95] text-ink sm:text-[72px]">
          Watch <span className="font-light text-gold">collectors</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/80">
          Public watch collections and wishlists from Brandon&apos;s Brands members. Hover a medallion to turn its bezel, then open a collection to see
          what they wear, make an offer, or message the collector.
        </p>
      </section>

      {!collectors.length ? (
        <div className="mt-8 rounded-md border border-dashed border-hairline bg-surface p-10 text-center text-ink/80">
          <p className="text-lg font-semibold text-ink">No public lists yet</p>
          <p className="mt-2 text-sm">
            Members can make their collection or wishlist public from the{" "}
            <Link href="/collection" className="text-gold hover:text-gold-bright">Collection</Link> and{" "}
            <Link href="/wishlist" className="text-gold hover:text-gold-bright">Wishlist</Link> pages.
          </p>
        </div>
      ) : (
        <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 lg:grid-cols-5">
          {collectors.map((c) => {
            const main = c.collection_public ? `/collectors/${c.handle}/collection` : `/collectors/${c.handle}/wishlist`;
            const count = c.collection_public ? c.watch_count : c.wish_count;
            return (
              <li key={c.handle} className="group flex flex-col items-center text-center">
                <Link href={main} aria-label={`${possessive(c.display_name)} ${c.collection_public ? "collection" : "wishlist"}`} className="rounded-full outline-none focus-visible:ring-2 focus-visible:ring-gold">
                  <CollectorMedallion name={c.display_name} seed={c.handle} size={168} />
                </Link>
                <Link href={main} className="mt-4 font-display text-2xl font-semibold uppercase leading-none text-ink transition hover:text-gold">
                  {c.display_name}
                </Link>
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-muted">
                  {count} {c.collection_public ? (count === 1 ? "watch" : "watches") : count === 1 ? "on wishlist" : "on wishlist"}
                </p>
                <div className="mt-3 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-[0.16em]">
                  {c.collection_public ? (
                    <Link href={`/collectors/${c.handle}/collection`} className="text-gold hover:text-gold-bright">
                      Collection
                    </Link>
                  ) : null}
                  {c.wishlist_public ? (
                    <Link href={`/collectors/${c.handle}/wishlist`} className="text-gold hover:text-gold-bright">
                      Wishlist
                    </Link>
                  ) : null}
                </div>
                <div className="mt-3">
                  <MessageMemberButton handle={c.handle} name={c.display_name} compact />
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
