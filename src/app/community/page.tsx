import type { Metadata } from "next";
import Link from "next/link";
import PollCard from "@/components/PollCard";
import { loadPolls } from "@/lib/polls";
import { eventWhen, loadEvents, splitEvents } from "@/lib/events";
import { facebookGroup, socials } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";

// Community hub: one place for everything people do together on Brandon's Brands.
export const revalidate = 300;

const DESCRIPTION =
  "The Brandon's Brands watch community: talk watches in The Salon forum, share a Wrist Check, find microbrand watch fairs, browse collectors' watches, vote in weekly polls and join the Luxury Microbrand Watches Facebook group.";

export const metadata: Metadata = {
  title: "Watch Collector Community | Brandon's Brands",
  description: DESCRIPTION,
  alternates: { canonical: "/community" },
  openGraph: { type: "website", url: "/community", title: "The Brandon's Brands community", description: DESCRIPTION, images: ["/og-image.png?v=3"] },
};

const smallLink = "mt-6 inline-flex text-xs uppercase tracking-[0.2em] text-gold transition hover:text-gold-bright";

export default async function CommunityPage() {
  const [polls, events] = await Promise.all([loadPolls(5), loadEvents()]);
  const poll = polls.find((p) => p.active);
  const nextEvent = splitEvents(events).upcoming[0];

  const places = [
    {
      href: "/forum",
      kicker: "The Salon",
      title: "Questions, finds, for sale",
      text: "Ask anything, share a discovery or list a watch. Reading is open to everyone; posting needs a free account.",
      cta: "Read the threads →",
    },
    {
      href: "/wrist-check",
      kicker: "Wrist Check · Saturdays",
      title: "What's on your wrist?",
      text: "Post today's wrist shot. Each week Brandon picks one for Wrist Check of the Week.",
      cta: "See this week's wrist checks →",
    },
    {
      href: "/events",
      kicker: nextEvent ? `Next watch fair · ${eventWhen(nextEvent)}` : "Watch events",
      title: nextEvent ? nextEvent.title : "Microbrand fairs and meetups",
      text: `${nextEvent?.location ? `${nextEvent.location}. ` : ""}Microbrand watch fairs, shows and collector meetups worth knowing about.`,
      cta: "Upcoming events →",
    },
    {
      href: "/collectors",
      kicker: "Collectors",
      title: "Browse members' watches",
      text: "See the collections and wishlists members have chosen to share, and message a collector.",
      cta: "Browse collectors →",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Brandon's Brands community",
    description: DESCRIPTION,
    url: `${SITE_URL}/community`,
    isPartOf: { "@type": "WebSite", name: "Brandon's Brands", url: SITE_URL },
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <header className="max-w-3xl">
        <span aria-hidden className="block h-px w-10 bg-gold" />
        <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">The community</p>
        <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[1.05] text-ink sm:text-6xl">
          Wear it. <span className="font-light text-gold">Show it.</span>
        </h1>
        <p className="mt-5 text-lg leading-8 text-ink/80">
          Brandon&apos;s Brands is more than reviews: it&apos;s a friendly place for collectors at every level. You don&apos;t need an expensive
          collection to join in, just curiosity. Look around first; you only need a free account to post.
        </p>
      </header>

      <ul className="mt-10 grid gap-5 sm:grid-cols-2">
        {places.map((p) => (
          <li key={p.href} className="flex flex-col rounded-md border p-7 shadow-card bb-sheen">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{p.kicker}</p>
            <h2 className="mt-3 font-display text-[28px] font-semibold uppercase leading-[1.05] text-ink">{p.title}</h2>
            <p className="mt-3 flex-1 leading-7 text-muted">{p.text}</p>
            <Link href={p.href} className={smallLink}>
              {p.cta}
            </Link>
          </li>
        ))}
      </ul>

      {poll ? (
        <section aria-labelledby="this-week" className="mt-14">
          <h2 id="this-week" className="font-display text-3xl font-semibold uppercase text-ink sm:text-4xl">
            This week&apos;s <span className="font-light text-gold">poll</span>
          </h2>
          <PollCard poll={poll} className="mt-5" />
          <Link href="/polls" className={smallLink}>
            Past polls and results →
          </Link>
        </section>
      ) : null}

      <section aria-labelledby="elsewhere" className="mt-14 rounded-md border p-7 shadow-card bb-sheen sm:p-9">
        <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Facebook group · 6,600+ collectors</p>
        <h2 id="elsewhere" className="mt-3 font-display text-3xl font-semibold uppercase leading-[1.05] text-ink">{facebookGroup.name}</h2>
        <p className="mt-3 max-w-2xl leading-7 text-muted">{facebookGroup.blurb}</p>
        <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
          <a
            href={facebookGroup.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center bg-navy px-7 text-xs font-semibold uppercase tracking-[0.2em] text-on-navy transition hover:bg-navy-deep"
          >
            Join the group ↗
          </a>
          <span className="text-sm text-muted">
            Also on{" "}
            {socials.map((s, i) => (
              <span key={s.name}>
                {i ? ", " : ""}
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">
                  {s.name}
                </a>
              </span>
            ))}
          </span>
        </div>
      </section>
    </div>
  );
}
