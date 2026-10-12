import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { FAVORITES_SUBJECT } from "@/lib/favorites";
import { collabEmail, socials } from "@/lib/socials";
import { IDENTITY, SITE_URL } from "@/lib/site";

const TITLE = "About Brandon's Brands | Brandon Volosov & Watch Microbrands";
const DESCRIPTION =
  "Meet Brandon Volosov, the watch enthusiast and social media creator behind Brandon's Brands: a passion for horology, luxury watchmakers and independent microbrands, and a welcoming community for watch enthusiasts. Beyond the brand. Behind the craftsmanship.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Brandon's Brands",
    "Brandon Volosov",
    "horology",
    "watch microbrands",
    "independent watchmakers",
    "luxury watches",
    "watch reviews",
    "watch collecting",
    "watch collection tracker",
    "watch wishlist",
    "watch forum",
    "watch community",
    "Rolex",
    "Omega",
    "Patek Philippe",
    "Audemars Piguet",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    type: "website",
    url: "/about",
    siteName: "Brandon's Brands",
    title: "About Brandon's Brands",
    description: DESCRIPTION,
    images: [{ url: "/og-image.png?v=2", width: 1200, height: 630, alt: "Brandon's Brands: watches worth knowing" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Brandon's Brands",
    description: DESCRIPTION,
    images: ["/og-image.png?v=2"],
  },
};

const offerings = [
  {
    title: "Watch reviews & first looks",
    text: "Hands-on reviews, unboxings, wrist shots and new-release first looks across Instagram, TikTok, YouTube and Facebook.",
    href: "/social",
    cta: "Watch the videos",
  },
  {
    title: "Your collection, organized",
    text: "Log every watch you own with photos, reference details, box & papers and estimated value, then share it with a private link.",
    href: "/collection",
    cta: "Start your collection",
  },
  {
    title: "A wishlist that does the work",
    text: "Snap a photo of a watch you want and the details fill in for you, including retail price and estimated market value.",
    href: "/wishlist",
    cta: "Build your wishlist",
  },
  {
    title: "A community of collectors",
    text: "Talk vintage, new releases, authentication, straps and buying advice with fellow enthusiasts, organized by brand and by club.",
    href: "/forum",
    cta: "Join the forum",
  },
];

// "A Collector's House": the four ways in, shown as a timeline.
const house = [
  { n: "01", title: "Discover", text: "Reviews, first looks and hidden-gem microbrands, picked by Brandon and shared every week.", href: "/blog", cta: "Read the latest" },
  { n: "02", title: "Collect", text: "Log the watches you own and the ones you want, with photos, box and papers and estimated values.", href: "/collection", cta: "Start your collection" },
  { n: "03", title: "Share", text: "Show your wrist, join a club, talk shop in the forum and meet collectors who get it.", href: "/forum", cta: "Join the conversation" },
  { n: "04", title: "Contact", text: "Ask Brandon a question, suggest a watch to review or reach out about a collaboration.", href: "#contact", cta: "Get in touch" },
];

const faqs = [
  {
    q: "What is Brandon's Brands?",
    a: "Brandon's Brands is the watch channel of Brandon Volosov, a watch enthusiast and social media creator, plus this free online community. Brandon shares watch reviews and watch culture on Instagram, TikTok, YouTube and Facebook, writes a watch blog, and offers free tools for collectors to track their collection and wishlist.",
  },
  {
    q: "Does Brandon's Brands make or sell watches?",
    a: "No. Brandon's Brands isn't a company, store or watch brand, and Brandon doesn't make, sell or distribute watches. He features watches from other brands he enjoys. Watches in the For Sale forum are listed by members, and any sale is between those members.",
  },
  {
    q: "Is it free to track my watch collection?",
    a: "Yes. Create a free account to add watches to your collection and wishlist, record box and papers, see estimated values, and share your collection with friends.",
  },
  {
    q: "Which watch brands do you cover?",
    a: "We cover dozens of brands, including Rolex, Omega, Patek Philippe, Audemars Piguet, Cartier, Tudor, TAG Heuer, Grand Seiko and many more, plus vintage pieces and independent microbrands that deserve a closer look.",
  },
  {
    q: "How can I work with Brandon's Brands?",
    a: `For collaborations, sponsorships, reviews or general questions, email ${collabEmail} or use the Contact Us button on this page.`,
  },
];

export default function AboutPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Brandon's Brands",
        url: SITE_URL,
        image: `${SITE_URL}/og-image.png`,
        slogan: "Discover. Collect. Showcase the world's finest watches.",
        description: IDENTITY,
        creator: { "@id": `${SITE_URL}/about#brandon` },
        publisher: { "@id": `${SITE_URL}/about#brandon` },
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/about#brandon`,
        name: "Brandon Volosov",
        jobTitle: "Watch content creator",
        description: "Watch enthusiast and social media creator behind Brandon's Brands.",
        email: collabEmail,
        image: `${SITE_URL}/logo-256.png`,
        knowsAbout: ["Horology", "Luxury watches", "Watch microbrands", "Independent watchmakers", "Watch collecting"],
        sameAs: socials.map((s) => s.url),
      },
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about#webpage`,
        url: `${SITE_URL}/about`,
        name: TITLE,
        description: DESCRIPTION,
        about: { "@id": `${SITE_URL}/about#brandon` },
        isPartOf: { "@type": "WebSite", name: "Brandon's Brands", url: SITE_URL },
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "About Us", item: `${SITE_URL}/about` },
          ],
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
    ],
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <article className="rounded-md border border-hairline bg-surface p-5 shadow-[0_10px_30px_rgba(27,42,65,0.08)] backdrop-blur-xl sm:p-8 lg:p-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-muted">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-gold">Home</Link>
            </li>
            <li aria-hidden>›</li>
            <li aria-current="page" className="text-ink/80">About Us</li>
          </ol>
        </nav>

        {/* Intro */}
        <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <span aria-hidden className="block h-px w-10 bg-gold" />
            <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">About Us</p>
            <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[1.05] tracking-[-0.01em] text-ink sm:text-6xl">
              About Brandon&apos;s <span className="font-light text-gold">Brands</span>
            </h1>
            <p className="mt-5 font-serif text-2xl italic text-ink/80 sm:text-3xl">Beyond the Brand. Behind the Craftsmanship.</p>
          </div>
          {/* The logo with its gold seconds hand sweeping in real time. */}
          <div role="img" aria-label="Brandon's Brands luxury watch logo" className="mx-auto">
            <LogoMark
              src="/logo-dial-1024.webp"
              className="block h-56 w-56 drop-shadow-[0_10px_30px_rgba(27,42,65,0.08)] sm:h-72 sm:w-72 lg:h-80 lg:w-80"
              handWidth={1}
            />
          </div>
        </header>

        {/* Meet Brandon */}
        <section aria-labelledby="meet-brandon" className="mt-10 max-w-3xl">
          <h2 id="meet-brandon" className="text-2xl font-semibold text-ink sm:text-3xl">Meet Brandon Volosov</h2>
          <div className="mt-5 space-y-5 text-base leading-8 text-ink/80">
            <p>
              For Brandon Volosov, a watch is more than an accessory—it&apos;s an expression of craftsmanship, creativity, and personal
              style. His passion for{" "}
              <strong className="font-semibold text-ink">horology—the art and science of timekeeping—</strong>is rooted in an
              appreciation for the details: the movement inside the case, the finish of a dial, the balance of a design, and the
              inspiration behind it.
            </p>
            <p>
              It all started with his dad. Watches were something Brandon and his father shared, and it&apos;s still something they
              enjoy doing together today. That shared passion is at the heart of everything Brandon does.
            </p>
            <p>
              Brandon created Brandon&apos;s Brands to share that curiosity and enthusiasm with others. His interests span both
              established luxury watchmakers and independent microbrands, with a particular appreciation for discovering names that
              deserve a closer look.
            </p>
            <p>
              What draws Brandon to a timepiece isn&apos;t simply the logo on the dial. It&apos;s the thought behind its design, the care
              in its execution, and the connection it creates with the person wearing it. To him, exploring an unfamiliar watchmaker
              can be just as exciting as admiring an iconic luxury watch.
            </p>
          </div>
        </section>

        {/* A Collector's House */}
        <section aria-labelledby="collectors-house" className="mt-14 border-t border-hairline pt-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">How it works</p>
              <h2 id="collectors-house" className="mt-3 font-display text-4xl font-semibold uppercase leading-[1.05] text-ink sm:text-5xl">
                A Collector&apos;s <span className="font-light text-gold">House</span>
              </h2>
              <p className="mt-4 font-serif text-xl italic leading-8 text-ink/80">
                Not a shop and not a brand. A home for people who love watches, with four ways in.
              </p>
            </div>
            <ol className="relative">
              <span aria-hidden className="absolute bottom-6 left-[19px] top-6 w-px bg-hairline-strong sm:left-[23px]" />
              {house.map((h) => (
                <li key={h.n} className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-5 pb-8 last:pb-0 sm:grid-cols-[48px_minmax(0,1fr)] sm:gap-7">
                  <span className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full border border-gold bg-raised font-display text-sm font-semibold text-gold sm:h-12 sm:w-12 sm:text-lg">
                    {h.n}
                  </span>
                  <div className="pt-1 sm:pt-2">
                    <h3 className="font-display text-2xl font-semibold uppercase tracking-[0.04em] text-ink sm:text-3xl">{h.title}</h3>
                    <p className="mt-2 max-w-xl text-base leading-7 text-ink/80">{h.text}</p>
                    <Link href={h.href} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-bright">
                      {h.cta} <span aria-hidden>→</span>
                    </Link>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Microbrands */}
        <section
          aria-labelledby="microbrands"
          className="mt-12 rounded-md border border-gold/20 bg-surface p-6 sm:p-8 lg:p-10"
        >
          <h2 id="microbrands" className="text-2xl font-semibold text-ink sm:text-3xl">Why Microbrands Matter</h2>
          <blockquote className="mt-5 border-l-4 border-gold pl-4 text-lg font-medium italic leading-8 text-ink sm:text-xl">
            Exceptional watches deserve attention—not just recognizable names.
          </blockquote>
          <div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-ink">
            <p>
              Brandon believes smaller independent watchmakers deserve the same thoughtful attention and appreciation as established
              luxury houses. His interest in microbrands comes from a desire to look beyond familiar labels and explore different
              approaches to design, craftsmanship, and self-expression.
            </p>
            <p>
              At Brandon&apos;s Brands, that means making room for discovery: introducing lesser-known names, exploring what makes their
              watches distinctive, and looking at the people and ideas behind them. The goal isn&apos;t to choose independent brands over
              established watchmakers. It&apos;s to appreciate both with an open mind and an eye for detail.
            </p>
            <p>
              Brandon&apos;s commitment is to help enthusiasts discover watches they might otherwise overlook—and develop their own
              understanding of what makes a timepiece meaningful.
            </p>
          </div>
          <p className="mt-6 text-lg font-semibold text-gold">Because the name on the dial is only the beginning of the story.</p>
        </section>

        {/* Shared passion */}
        <section aria-labelledby="shared-passion" className="mt-12 max-w-3xl">
          <h2 id="shared-passion" className="text-2xl font-semibold text-ink sm:text-3xl">A Shared Passion for Watches</h2>
          <div className="mt-5 space-y-5 text-base leading-8 text-ink/80">
            <p>
              Brandon&apos;s Brands is about more than showcasing timepieces. It&apos;s about creating a welcoming place to learn, ask
              questions, exchange perspectives, and enjoy the discovery process.
            </p>
            <p>
              Whether you&apos;re exploring your first mechanical watch, building a collection, or searching for something outside the
              familiar luxury names, you belong in the conversation. You don&apos;t need an expensive collection or an encyclopedic
              knowledge of movements—just curiosity and an appreciation for watches.
            </p>
          </div>
          <p className="mt-6 text-xl font-semibold leading-8 text-ink">
            Welcome to Brandon&apos;s Brands.{" "}
            <span className="text-gold">Discover the makers. Explore the details. Find what speaks to you.</span>
          </p>
        </section>

        {/* Brandon's Favorites */}
        <section
          aria-labelledby="favorites"
          className="mt-12 rounded-md border border-gold/30 bg-gradient-to-br from-gold/20 via-surface to-gold/10 p-6 sm:p-8"
        >
          <p className="text-xs uppercase tracking-[0.3em] text-gold">⭐ Brandon&apos;s Favorites</p>
          <h2 id="favorites" className="mt-2 text-2xl font-semibold text-ink sm:text-3xl">The watches Brandon loves</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/80">
            See Brandon&apos;s favorite watches, each with his review or reel, and talk about them with other collectors in the Brandon&apos;s
            Favorites forum folder.
          </p>
          <div className="mt-5 grid gap-3 sm:flex sm:flex-wrap">
            <Link
              href="/favorites"
              className="inline-flex justify-center text-center rounded-full bg-navy px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.08em] text-on-navy sm:px-6 sm:tracking-[0.15em] hover:bg-navy-deep"
            >
              See the favorites
            </Link>
            <Link
              href={`/forum?subject=${FAVORITES_SUBJECT}`}
              className="inline-flex justify-center text-center rounded-full border border-hairline-strong bg-raised px-4 py-3 text-xs sm:text-sm font-semibold uppercase tracking-[0.08em] text-ink sm:px-6 sm:tracking-[0.15em] hover:border-gold hover:bg-surface"
            >
              <span className="sm:hidden">Favorites forum</span>
              <span className="hidden sm:inline">Brandon&apos;s Favorites forum</span>
            </Link>
          </div>
        </section>

        {/* What we do */}
        <section aria-labelledby="what-we-do" className="mt-12">
          <h2 id="what-we-do" className="text-2xl font-semibold text-ink sm:text-3xl">What you&apos;ll find here</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {offerings.map((o) => (
              <div key={o.title} className="flex flex-col rounded-md border border-hairline bg-raised p-6">
                <h3 className="text-xl font-semibold text-ink">{o.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-ink/80">{o.text}</p>
                <Link href={o.href} className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold uppercase tracking-[0.15em] text-gold hover:text-gold-bright">
                  {o.cta} <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Follow */}
        <section aria-labelledby="follow" className="mt-12">
          <h2 id="follow" className="text-2xl font-semibold text-ink sm:text-3xl">Follow Brandon&apos;s Brands</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-ink/80">
            Catch new reviews and watch culture on your favorite platform, or read longer stories on the{" "}
            <Link href="/blog" className="text-gold hover:text-gold-bright">Brandon&apos;s Brands blog</Link>.
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full w-full min-w-0 flex-col rounded border border-hairline-strong bg-raised px-3 py-3 text-ink sm:px-5 transition hover:border-gold hover:bg-surface"
                >
                  <span className="text-sm font-semibold">{s.name}</span>
                  <span className="truncate text-[11px] text-gold sm:text-xs">{s.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq" className="mt-12">
          <h2 id="faq" className="text-2xl font-semibold text-ink sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-hairline rounded-md border border-hairline bg-surface">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-ink">
                  <h3>{f.q}</h3>
                  <span aria-hidden className="text-gold transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-ink/80">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section aria-labelledby="contact-heading" id="contact" className="mt-12 rounded-md border border-gold/30 bg-gradient-to-br from-gold/10 via-transparent to-gold/15 p-6 text-center sm:p-10">
          <h2 id="contact-heading" className="text-2xl font-semibold text-ink sm:text-3xl">Get in touch</h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-ink/80">
            Questions, collaborations, review requests or just want to talk watches? We&apos;d love to hear from you.
          </p>
          <a
            href={`mailto:${collabEmail}?subject=${encodeURIComponent("Hello from brandonsbrands17.com")}`}
            className="mt-7 inline-flex rounded-full bg-navy px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-on-navy shadow-[0_10px_30px_rgba(27,42,65,0.08)] transition hover:bg-navy-deep"
          >
            Contact Us
          </a>
          <p className="mt-4 text-sm text-muted">
            Or email{" "}
            <a href={`mailto:${collabEmail}`} className="text-gold hover:text-gold-bright">{collabEmail}</a>
            {" · "}
            <Link href="/inbox" className="text-gold hover:text-gold">message us on the site</Link>
          </p>
        </section>
      </article>
    </div>
  );
}
