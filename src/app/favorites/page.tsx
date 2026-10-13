import Link from "next/link";
import NewsletterSignup from "@/components/NewsletterSignup";
import type { Metadata } from "next";
import FavoritesView from "./FavoritesView";
import FollowBrandon from "@/components/FollowBrandon";
import { socials } from "@/lib/socials";
import { FAVORITES_SUBJECT, loadFavorites } from "@/lib/favorites";
import { SITE_URL } from "@/lib/site";
import Glyph from "@/components/Glyph";

// Brandon's Favorites: a public gallery of Brandon's favorite watches, each linking to its review or reel.

export const revalidate = 60;

const TITLE = "Brandon's Favorites | Favorite Watches of Brandon Volosov | Brandon's Brands";
const DESCRIPTION =
  "Brandon Volosov's favorite watches, from luxury icons to independent microbrands, each with his review or reel.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/favorites" },
  openGraph: { type: "website", url: "/favorites", title: "Brandon's Favorites", description: DESCRIPTION, images: ["/og-image.png?v=3"] },
  twitter: { card: "summary_large_image", title: "Brandon's Favorites", description: DESCRIPTION },
};

export default async function FavoritesPage() {
  const favorites = await loadFavorites();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Brandon's Favorites",
    description: DESCRIPTION,
    url: `${SITE_URL}/favorites`,
    author: { "@type": "Person", name: "Brandon Volosov", url: `${SITE_URL}/about`, sameAs: socials.map((s) => s.url) },
    isPartOf: { "@type": "WebSite", name: "Brandon's Brands", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: favorites.length,
      itemListElement: favorites.map((f, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Product",
          name: `${f.brand} ${f.model}`,
          brand: { "@type": "Brand", name: f.brand },
          ...(f.reference_number ? { mpn: f.reference_number } : {}),
          ...(f.image_url ? { image: f.image_url } : {}),
          ...(f.link_url ? { url: f.link_url.startsWith("/") ? `${SITE_URL}${f.link_url}` : f.link_url } : {}),
        },
      })),
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-0 py-4 sm:px-6 sm:py-12 lg:px-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <section>
        <p className="flex items-center gap-1.5 text-xs uppercase tracking-[0.35em] text-gold">
          <Glyph e="⭐" size={13} /> Brandon&apos;s discoveries
        </p>
        <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[1.05] text-ink sm:text-6xl">
          Hidden <span className="font-light text-gold">Gems</span>
          <span className="sr-only"> · Brandon&apos;s Favorites</span>
        </h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-ink/80">
          Brandon&apos;s favorite watches, with a focus on the lesser-known makers he&apos;s discovered, each with his own take on why it stands out. A new hidden gem every Sunday. Tap any watch to watch the reel or read the review,
          then join the conversation in the{" "}
          <Link href={`/forum?subject=${FAVORITES_SUBJECT}`} className="text-gold hover:text-gold-bright">
            Brandon&apos;s Favorites forum
          </Link>
          .
        </p>
      </section>

      <FavoritesView initial={favorites} />

      <NewsletterSignup source="favorites" compact className="mt-10" />
      <FollowBrandon className="mt-6" />

      <p className="mt-8 text-center text-sm text-muted">
        <Link href="/about" className="text-gold hover:text-gold">
          About Brandon
        </Link>
        <span className="mx-2 text-muted">·</span>
        <Link href="/collectors" className="text-gold hover:text-gold">
          Browse collectors
        </Link>
      </p>
    </div>
  );
}
