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
  openGraph: { type: "website", url: "/learn", title: "Learn About Watches | Brandon's Brands", description: DESCRIPTION, images: ["/og-image.png"] },
  twitter: { card: "summary_large_image", title: "Learn About Watches | Brandon's Brands", description: DESCRIPTION },
};

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
      <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Learn</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">Learn about watches</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300">
          Buying guides, watch types, how watches work and the history behind the icons, from Brandon Volosov and the Brandon&apos;s Brands
          community. Whether you&apos;re buying your first watch or your fiftieth, start here.
        </p>
        <nav aria-label="Guide categories" className="mt-5 flex flex-wrap gap-2">
          {LEARN_CATEGORIES.map((c) => (
            <a key={c.name} href={`#${c.name.toLowerCase().replace(/\s+/g, "-")}`} className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 hover:bg-white/5">
              {c.icon} {c.name}
            </a>
          ))}
        </nav>
      </section>

      {LEARN_CATEGORIES.map((c) => {
        const guides = learnGuides.filter((g) => g.category === c.name);
        if (!guides.length) return null;
        return (
          <section key={c.name} id={c.name.toLowerCase().replace(/\s+/g, "-")} className="mt-10 scroll-mt-6">
            <h2 className="text-2xl font-semibold text-white">
              <span aria-hidden className="mr-2">
                {c.icon}
              </span>
              {c.name}
            </h2>
            <p className="mt-1 text-sm text-slate-400">{c.blurb}</p>
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {guides.map((g) => (
                <li key={g.slug}>
                  <Link
                    href={`/learn/${g.slug}`}
                    className="group flex h-full flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/70 p-6 transition hover:-translate-y-0.5 hover:border-[#D9A43A]/40"
                  >
                    <h3 className="text-lg font-semibold text-white">{g.title}</h3>
                    <p className="mt-2 flex-1 text-sm leading-6 text-slate-300">{g.description}</p>
                    <span className="mt-4 inline-flex items-center gap-1 self-start text-xs font-semibold uppercase tracking-[0.15em] text-[#D9A43A]">
                      Read · {g.minutes} min <span aria-hidden className="transition group-hover:translate-x-1">→</span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-10 rounded-[1.75rem] border border-white/10 bg-white/5 p-6 text-center">
        <p className="text-lg font-semibold text-white">Have a question these guides don&apos;t answer?</p>
        <p className="mt-1 text-sm text-slate-300">Ask the community in the forum, or see which watches made Brandon&apos;s Favorites.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/forum?subject=buying-advice" className="rounded-full border border-[#3FB4EC]/40 bg-gradient-to-b from-[#1A7DBF] to-[#0E5A8F] px-5 py-2.5 text-sm font-semibold text-white hover:from-[#2290D6] hover:to-[#136AA6]">
            Ask in the forum
          </Link>
          <Link href="/favorites" className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-white/5">
            ⭐ Brandon&apos;s Favorites
          </Link>
        </div>
      </section>

      <ShowOffCTA className="mt-10" />
      <FollowBrandon className="mt-10" />
    </div>
  );
}
