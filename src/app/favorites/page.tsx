import Link from "next/link";
import type { Metadata } from "next";
import FavoritesView from "./FavoritesView";
import { FAVORITES_SUBJECT, loadFavorites } from "@/lib/favorites";
import { SITE_URL } from "@/lib/site";

// Brandon's Favorites: a public gallery of Brandon's favorite watches, each linking to its review or reel.

export const revalidate = 60;

const TITLE = "Brandon's Favorites | Favorite Watches of Brandon Volosov | Brandon's Brands";
const DESCRIPTION =
  "Brandon Volosov's favorite watches, from luxury icons to independent microbrands, each with his review or reel.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/favorites" },
  openGraph: { type: "website", url: "/favorites", title: "Brandon's Favorites", description: DESCRIPTION, images: ["/og-image.png"] },
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
    author: { "@type": "Person", name: "Brandon Volosov" },
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
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">⭐ Brandon&apos;s Favorites</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">The watches Brandon loves</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          A personal pick of favorite watches, from the icons to the independent makers. Tap any watch to watch the reel or read the review,
          then join the conversation in the{" "}
          <Link href={`/forum?subject=${FAVORITES_SUBJECT}`} className="text-[#D9A43A] hover:text-[#e1b54a]">
            Brandon&apos;s Favorites forum
          </Link>
          .
        </p>
      </section>

      <FavoritesView initial={favorites} />

      <p className="mt-8 text-center text-sm text-slate-400">
        <Link href="/about" className="text-blue-300 hover:text-blue-200">
          About Brandon
        </Link>
        <span className="mx-2 text-slate-600">·</span>
        <Link href="/collectors" className="text-blue-300 hover:text-blue-200">
          Browse collectors
        </Link>
      </p>
    </div>
  );
}
