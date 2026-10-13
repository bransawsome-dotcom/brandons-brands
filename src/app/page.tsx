import type { Metadata } from "next";
import Link from "next/link";
import LoopVideo from "@/components/LoopVideo";
import VaultLink from "@/components/VaultLink";
import NewsletterSignup from "@/components/NewsletterSignup";
import LatestVideos from "@/components/LatestVideos";
import TheEdit from "@/components/TheEdit";
import { FAVORITES_PATH, loadFavorites } from "@/lib/favorites";
import { facebookGroup } from "@/lib/socials";
import { loadAllPosts } from "@/lib/blogDb";
import { eventWhen, loadEvents, splitEvents } from "@/lib/events";
import { SITE_URL } from "@/lib/site";

// Videos, favorites and the next event refresh every 5 minutes.
export const revalidate = 300;

const TITLE = "Brandon's Brands | Luxury & Microbrand Watch Reviews and Free Collection Tracker";
const DESCRIPTION =
  "Watch reviews of luxury microbrands and independent watchmakers by Brandon Volosov, plus a free watch collection tracker with daily value estimates, a wishlist with price alerts, upcoming watch fairs and a community of collectors.";

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { type: "website", url: "/", title: TITLE, description: DESCRIPTION },
};

// Small gold rule + label + two-weight headline used by every section.
function SectionHead({ eyebrow, bold, light, id }: { eyebrow: string; bold: string; light: string; id: string }) {
  return (
    <div>
      <div className="mb-4 h-0.5 w-11 bg-gold" aria-hidden />
      <p className="mb-2 text-xs uppercase tracking-[0.22em] text-gold">{eyebrow}</p>
      <h2 id={id} className="font-display text-[38px] font-semibold uppercase leading-[1.05] text-ink sm:text-[54px]">
        {bold} <span className="font-light text-gold">{light}</span>
      </h2>
    </div>
  );
}

const smallLink = "text-xs uppercase tracking-[0.2em] text-gold transition hover:text-gold-bright";

export default async function Home() {
  const [favorites, events, posts] = await Promise.all([loadFavorites(), loadEvents(), loadAllPosts().catch(() => [])]);
  // The newest interview (blog posts with the category "Interview"), shown under the videos when there is one.
  const interview = posts.find((p) => /interview/i.test(p.category));
  const edit = favorites.slice(0, 8).map((f) => ({
    id: f.id,
    brand: f.brand,
    model: f.model,
    image: f.image_url ?? null,
    href: f.post_id ? `/forum/${f.post_id}` : FAVORITES_PATH,
  }));
  const nextEvent = splitEvents(events).upcoming[0];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Brandon's Brands",
    url: SITE_URL,
    description: DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="bb-home theme-cream text-ink">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Hero: full-width film of a watch movement behind the headline */}
      <section className="relative left-1/2 -mt-6 w-screen -translate-x-1/2 overflow-hidden border-b border-hairline bg-surface sm:-mt-8">
        <LoopVideo name="movement" poster="/redesign/video/movement-poster.webp" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#f1ece3] via-[#f1ece3]/85 to-[#f1ece3]/20 max-md:via-[#f1ece3]/90 max-md:to-[#f1ece3]/70" aria-hidden />
        <p className="absolute bottom-3 right-4 z-10 text-[10px] uppercase tracking-[0.12em] text-ink/45">Film · Pond5</p>
        <div className="relative mx-auto max-w-[1180px] px-4 pb-20 pt-16 sm:px-6 md:pb-28 md:pt-24">
          <div className="max-w-2xl animate-fade-in">
            <p className="mb-5 text-xs uppercase tracking-[0.22em] text-gold">Brandon Volosov · Watch reviews &amp; discoveries</p>
            <h1 className="font-display text-[62px] font-semibold uppercase leading-[0.84] tracking-[-0.01em] sm:text-[104px] lg:text-[128px]">
              Discover.
              <span className="block font-light text-gold">Collect.</span>
              <span className="sr-only"> Luxury and microbrand watch reviews, interviews and hidden gems by Brandon Volosov</span>
            </h1>
            <p className="mt-7 max-w-xl text-xl leading-8 text-ink">
              Watch reviews, interviews and hidden-gem microbrands from Brandon Volosov, plus a free place to keep your collection.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
              <a href="#latest-videos" className="inline-flex min-h-[52px] items-center bg-navy px-7 text-xs font-semibold uppercase tracking-[0.2em] text-on-navy transition hover:bg-navy-deep">
                Watch the latest review
              </a>
              <Link href="/demo" className="inline-flex min-h-[44px] items-center text-xs font-semibold uppercase tracking-[0.2em] text-ink underline decoration-gold/60 underline-offset-8 transition hover:text-gold">
                Try the free collection tracker →
              </Link>
            </div>
            {/* The weekly rhythm: a reason to come back. */}
            <dl className="mt-10 grid max-w-xl grid-cols-3 border-t border-hairline-strong/60">
              {[
                ["Weekly", "New reviews"],
                ["Saturday", "Wrist Check"],
                ["Sunday", "Hidden Gem"],
              ].map(([big, small], i) => (
                <div key={big} className={`pt-4 ${i ? "border-l border-hairline-strong/60 pl-4" : "pr-4"}`}>
                  <dt className="font-serif text-2xl text-ink sm:text-3xl">{big}</dt>
                  <dd className="mt-1 text-[11px] uppercase tracking-[0.16em] text-ink/70">{small}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <LatestVideos className="mt-20" />

      {interview ? (
        <Link
          href={`/blog/${interview.slug}`}
          className="group mt-10 grid gap-6 rounded-md border p-8 shadow-card bb-sheen transition hover:-translate-y-0.5 hover:shadow-card-hover sm:grid-cols-[auto_minmax(0,1fr)] sm:items-center sm:p-10"
        >
          <p className="font-serif text-6xl italic leading-none text-gold sm:text-7xl" aria-hidden>
            &ldquo;
          </p>
          <div>
            <p className="text-[11px] uppercase tracking-[0.22em] text-gold">The latest interview</p>
            <h2 className="mt-2 font-display text-3xl font-semibold uppercase leading-[1.05] text-ink group-hover:text-gold sm:text-4xl">{interview.title}</h2>
            <p className="mt-3 max-w-2xl leading-7 text-muted">{interview.excerpt}</p>
            <span className={`mt-5 inline-block ${smallLink}`}>Read the interview →</span>
          </div>
        </Link>
      ) : (
        <p className="mt-8 text-sm text-muted">
          More from Brandon:{" "}
          <Link href="/blog" className="text-gold underline-offset-4 hover:underline">
            all reviews &amp; interviews
          </Link>
        </p>
      )}

      {/* The Edit: Brandon's Favorites */}
      {edit.length ? (
        <section aria-labelledby="the-edit" className="mt-24 border-t border-hairline pt-20">
          <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
            <div>
              <SectionHead id="the-edit" eyebrow="Brandon's discoveries" bold="Hidden" light="Gems" />
              <p className="mt-4 max-w-xl text-lg leading-7 text-ink/80">
                Lesser-known watchmakers Brandon found and loves, each with his own take. A new one every Sunday.
              </p>
            </div>
            <Link href={FAVORITES_PATH} className={smallLink}>
              See all hidden gems →
            </Link>
          </div>
          <TheEdit watches={edit} />
        </section>
      ) : null}

      {/* Community */}
      <section aria-labelledby="community" className="mt-24">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-5">
          <SectionHead id="community" eyebrow="The community" bold="Wear it." light="Show it." />
          <Link href="/community" className={smallLink}>
            All community →
          </Link>
        </div>
        <div className="grid overflow-hidden rounded-md border shadow-card bb-sheen sm:grid-cols-2 lg:grid-cols-4 [&>article]:border-hairline [&>article]:border-b sm:[&>article:nth-child(odd)]:border-r lg:[&>article]:border-b-0 lg:[&>article:not(:last-child)]:border-r">
          <article className="flex flex-col border-b border-hairline">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/redesign/wristcheck.webp" alt="A steel watch with a green dial and brown leather strap on a wrist" width={900} height={675} loading="lazy" className="aspect-[4/3] w-full object-cover" />
            <div className="flex flex-1 flex-col p-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Wrist Check</p>
            <h3 className="mt-3 font-display text-[29px] font-semibold uppercase leading-[1.05]">Post today&apos;s wrist shot</h3>
            <p className="mt-4 flex-1 leading-7 text-muted">Share what you&apos;re wearing. Each week Brandon picks one for Wrist Check of the Week.</p>
            <Link href="/wrist-check" className={`mt-6 ${smallLink}`}>
              Post a wrist check →
            </Link>
            </div>
          </article>
          <article className="flex flex-col border-b border-hairline p-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{nextEvent ? `Next watch fair · ${eventWhen(nextEvent)}` : "Watch events"}</p>
            <h3 className="mt-3 font-display text-[29px] font-semibold uppercase leading-[1.05]">{nextEvent ? nextEvent.title : "Microbrand fairs and meetups"}</h3>
            <p className="mt-4 flex-1 leading-7 text-muted">
              {nextEvent?.location ? `${nextEvent.location}. ` : ""}Microbrand watch fairs, shows and collector meetups worth knowing about.
            </p>
            <Link href="/events" className={`mt-6 ${smallLink}`}>
              Upcoming watch fairs →
            </Link>
          </article>
          <article className="flex flex-col p-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">The Salon</p>
            <h3 className="mt-3 font-display text-[29px] font-semibold uppercase leading-[1.05]">Questions, finds, for sale</h3>
            <p className="mt-4 flex-1 leading-7 text-muted">Ask, share and swap with collectors. Sales and trades happen between members.</p>
            <Link href="/forum" className={`mt-6 ${smallLink}`}>
              Read the threads →
            </Link>
          </article>
          <article className="flex flex-col p-8">
            <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Facebook group · 6,600+ collectors</p>
            <h3 className="mt-3 font-display text-[29px] font-semibold uppercase leading-[1.05]">Luxury Microbrand Watches</h3>
            <p className="mt-4 flex-1 leading-7 text-muted">Wrist checks, hidden gems and watch fair news, hosted by Brandon.</p>
            <a href={facebookGroup.url} target="_blank" rel="noopener noreferrer" className={`mt-6 ${smallLink}`}>
              Join the group ↗
            </a>
          </article>
        </div>
      </section>


      {/* Free tools */}
      <section id="collection" aria-labelledby="tools" className="mt-24 border-t border-hairline pt-20">
        <div className="mb-12">
          <SectionHead id="tools" eyebrow="Free collector tools" bold="Everything you own," light="in one place" />
          <p className="mt-4 max-w-xl text-lg leading-7 text-ink/80">
            Free with an account. Want to see it first?{" "}
            <Link href="/demo" className="text-gold underline decoration-gold/50 underline-offset-4 hover:text-gold-bright">
              Open a sample collection
            </Link>
            , no sign-up needed.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { href: "/collection", vault: true, img: "/redesign/tool-vault.webp", alt: "A round steel bank vault door with its locking bolts", label: "My Collection", title: "The Vault", text: "Store each watch with photos, brand, model, purchase date, and box and papers, with an estimated value updated daily." },
            { href: "/wishlist", img: "/redesign/tool-case.webp", alt: "Three gold chronographs on stone display stands", label: "Wishlist", title: "The Display Case", text: "Save the watches you want, get price alerts, and move them into your vault the day you buy one." },
            { href: "/watch-value-tracker", img: "/redesign/tool-wrist.webp", alt: "A vintage steel watch on a suede strap, worn on the wrist", label: "Watch value tracker", title: "What it's worth", text: "See your collection's value over time and the watches that moved the most." },
          ].map((c) => {
            const body = (
              <>
                {c.vault ? (
                  <div className="relative -mx-8 -mt-8 mb-7 w-[calc(100%+4rem)] max-w-none">
                    <LoopVideo name="vault" poster="/redesign/video/vault-poster.webp" label="A bank vault door unlocks and swings open to reveal gold inside" className="aspect-[4/3] w-full object-cover" />
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={c.img} alt={c.alt} width={900} height={675} loading="lazy" className="-mx-8 -mt-8 mb-7 aspect-[4/3] w-[calc(100%+4rem)] max-w-none object-cover" />
                )}
                <p className="text-[11px] uppercase tracking-[0.2em] text-gold">{c.label}</p>
                <h3 className="mt-3 font-display text-[29px] font-semibold uppercase leading-[1.05] text-ink">{c.title}</h3>
                <p className="mt-4 flex-1 leading-7 text-muted">{c.text}</p>
                <span className={`mt-6 ${smallLink}`}>Open →</span>
              </>
            );
            const cls = "group flex h-full flex-col overflow-hidden rounded-md border p-8 shadow-card bb-sheen transition duration-300 hover:-translate-y-1 hover:shadow-card-hover";
            return c.vault ? (
              <VaultLink key={c.href} href={c.href} className={cls}>
                {body}
              </VaultLink>
            ) : (
              <Link key={c.href} href={c.href} className={cls}>
                {body}
              </Link>
            );
          })}
        </div>
      </section>

      <NewsletterSignup source="home" className="mt-16" />
    </div>
  );
}
