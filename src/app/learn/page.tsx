import Link from "next/link";
import type { Metadata } from "next";
import FollowBrandon from "@/components/FollowBrandon";
import ShowOffCTA from "@/components/ShowOffCTA";
import { LEARN_CATEGORIES, learnGuides } from "@/lib/learn";
import { SITE_URL } from "@/lib/site";

// Education hub: buying guides, watch types, how watches work and watch history.

const TITLE = "Learn About Watches: Buying Guides, Watch Types & History | Brandon's Brands";
const DESCRIPTION =
  "Free watch education from Brandon's Brands: how to buy your first luxury watch, buying pre-owned safely, watch sizes, watch types, complications, movements and watch history.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/learn" },
  openGraph: { type: "website", url: "/learn", title: "Learn About Watches | Brandon's Brands", description: DESCRIPTION, images: ["/og-image.png?v=3"] },
  twitter: { card: "summary_large_image", title: "Learn About Watches | Brandon's Brands", description: DESCRIPTION },
};

// The small editorial label on each card.
function kindOf(slug: string, category: string): string {
  if (/glossary|terms/.test(slug)) return "Glossary";
  if (category === "Watch History" || category === "Collecting & Community" || /trends|vs-/.test(slug)) return "Journal";
  return "Guide";
}

export default function LearnPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Learn About Watches",
    description: DESCRIPTION,
    url: `${SITE_URL}/learn`,
    isPartOf: { "@type": "WebSite", name: "Brandon's Brands", url: SITE_URL },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: learnGuides.map((g, i) => ({ "@type": "ListItem", position: i + 1, url: `${SITE_URL}/learn/${g.slug}`, name: g.title })),
    },
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-0 py-4 sm:px-6 sm:py-12 lg:px-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="px-4 pt-6 sm:px-0 sm:pt-0">
        <span aria-hidden className="block h-px w-10 bg-gold" />
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">The Library</p>
        <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[1.05] text-ink sm:text-6xl">
          Learn about <span className="font-light text-gold">watches</span>
        </h1>
        <p className="mt-5 max-w-2xl font-serif text-xl italic leading-8 text-ink/80 sm:text-2xl">
          Buying guides, watch types, how watches work and the history behind the icons, from Brandon Volosov and the Brandon&apos;s Brands
          community. Whether you&apos;re buying your first watch or your fiftieth, start here.
        </p>
        <nav aria-label="Guide categories" className="mt-7 flex flex-wrap gap-2">
          {LEARN_CATEGORIES.map((c) => (
            <a
              key={c.name}
              href={`#${c.name.toLowerCase().replace(/\s+/g, "-")}`}
              className="inline-flex min-h-10 items-center rounded-full border border-hairline-strong px-4 text-[11px] uppercase tracking-[0.18em] text-ink transition hover:border-gold hover:text-gold"
            >
              {c.name}
            </a>
          ))}
        </nav>
      </header>

      {LEARN_CATEGORIES.map((c) => {
        const guides = learnGuides.filter((g) => g.category === c.name);
        if (!guides.length) return null;
        return (
          <section key={c.name} id={c.name.toLowerCase().replace(/\s+/g, "-")} className="mt-14 scroll-mt-6 px-4 sm:px-0">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b border-hairline pb-4">
              <h2 className="font-display text-3xl font-semibold uppercase text-ink sm:text-4xl">{c.name}</h2>
              <p className="max-w-md text-sm text-muted">{c.blurb}</p>
            </div>
            <ul className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g) => (
                <li key={g.slug} className="border-b border-hairline">
                  <Link href={`/learn/${g.slug}`} className="group flex h-full flex-col py-6">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-gold">{kindOf(g.slug, g.category)}</span>
                    <h3 className="mt-3 font-display text-2xl font-semibold uppercase leading-tight text-ink transition group-hover:text-gold">{g.title}</h3>
                    <p className="mt-3 flex-1 text-sm leading-6 text-ink/80">{g.description}</p>
                    <span className="mt-4 text-[11px] uppercase tracking-[0.2em] text-muted">
                      {g.minutes} min read <span aria-hidden className="ml-1 inline-block text-gold transition group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-14 rounded-md border border-hairline bg-raised shadow-card p-6 text-center sm:p-10 bb-sheen">
        <p className="font-serif text-2xl italic text-ink">Have a question these guides don&apos;t answer?</p>
        <p className="mt-1 text-sm text-ink/80">Ask the community in the forum, or see which watches made Brandon&apos;s Favorites.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/forum?subject=buying-advice" className="rounded-full border border-hairline-strong bg-raised px-5 py-2.5 text-sm font-semibold text-ink hover:border-gold hover:bg-surface">
            Ask in the forum
          </Link>
          <Link href="/favorites" className="rounded-full border border-hairline px-5 py-2.5 text-sm font-semibold text-ink hover:bg-surface">
            Brandon&apos;s Favorites
          </Link>
        </div>
      </section>

      <ShowOffCTA className="mt-10" />
      <FollowBrandon className="mt-10" />
    </div>
  );
}
