import type { Metadata } from "next";
import RecentVideoCards from "@/components/RecentVideoCards";
import { collabEmail, facebookGroup, socials } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Watch Reviews on Instagram, TikTok & YouTube | Brandon's Brands",
  description:
    "Follow Brandon's Brands for luxury and microbrand watch reviews, unboxings and new-release first looks on Instagram, TikTok, YouTube and Facebook.",
  alternates: { canonical: "/social" },
  openGraph: { type: "website", url: "/social", title: "Brandon's Brands on every platform", images: ["/og-image.png?v=2"] },
};

export default function SocialMediaPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Brandon's Brands on social media",
    url: `${SITE_URL}/social`,
    about: { "@type": "Person", name: "Brandon Volosov", sameAs: socials.map((s) => s.url) },
  };
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <header className="max-w-3xl">
        <span aria-hidden className="block h-px w-10 bg-gold" />
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">Watch &amp; Follow</p>
        <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[1.05] text-ink sm:text-6xl">
          Brandon&apos;s Brands on <span className="font-light text-gold">every platform</span>
        </h1>
        <p className="mt-5 font-serif text-xl italic leading-8 text-ink/80 sm:text-2xl">
          Watch reviews, unboxings, new-release first looks and watch culture. Pick your favorite place to follow along.
        </p>
      </header>

      <section aria-labelledby="recent-videos" className="mt-12 border-t border-hairline pt-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <h2 id="recent-videos" className="font-display text-3xl font-semibold uppercase text-ink sm:text-4xl">
            Recent <span className="font-light text-gold">videos</span>
          </h2>
          <a href={socials.find((s) => s.name === "YouTube")?.url} target="_blank" rel="noopener noreferrer" className="text-xs uppercase tracking-[0.2em] text-gold hover:text-gold-bright">
            See all on YouTube →
          </a>
        </div>
        <RecentVideoCards />
      </section>

      <section aria-labelledby="platforms" className="mt-14 border-t border-hairline pt-10">
        <h2 id="platforms" className="font-display text-3xl font-semibold uppercase text-ink sm:text-4xl">
          Follow <span className="font-light text-gold">along</span>
        </h2>
        <div className="mt-6 grid gap-px overflow-hidden rounded-md border border-hairline bg-hairline md:grid-cols-2">
          {socials.map((s) => (
            <article key={s.name} className="flex flex-col bg-raised p-6 sm:p-8">
              <p className="text-[11px] uppercase tracking-[0.25em] text-gold">{s.name}</p>
              <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{s.handle}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-ink/80">{s.blurb}</p>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex min-h-11 items-center self-start rounded-full border border-hairline-strong px-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink transition hover:border-gold hover:text-gold"
              >
                Follow on {s.name} ↗
              </a>
            </article>
          ))}
          <article className="flex flex-col bg-surface p-6 sm:p-8 md:col-span-2">
            <p className="text-[11px] uppercase tracking-[0.25em] text-gold">Facebook group</p>
            <h3 className="mt-2 font-display text-2xl font-semibold text-ink">{facebookGroup.name}</h3>
            <p className="mt-3 max-w-2xl flex-1 text-sm leading-7 text-ink/80">{facebookGroup.blurb}</p>
            <a
              href={facebookGroup.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex min-h-11 items-center self-start rounded-full bg-navy px-6 text-xs font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep"
            >
              Join the group
            </a>
          </article>
        </div>
      </section>

      <section className="mt-14 border-t border-hairline pt-10 text-center">
        <p className="text-xs uppercase tracking-[0.3em] text-gold">Work with Brandon&apos;s Brands</p>
        <p className="mx-auto mt-4 max-w-2xl font-serif text-2xl italic leading-9 text-ink">
          Brands, collectors and fellow creators: reach out about collabs, reviews and events.
        </p>
        <a
          href={`mailto:${collabEmail}`}
          className="mt-6 inline-flex min-h-11 items-center rounded-full bg-navy px-6 text-xs font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep"
        >
          Email {collabEmail}
        </a>
      </section>
    </div>
  );
}
