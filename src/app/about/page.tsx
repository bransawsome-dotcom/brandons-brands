import type { Metadata } from "next";
import Link from "next/link";
import { collabEmail, socials } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";

const TITLE = "About Brandon's Brands | Brandon Volosov & Watch Microbrands";
const DESCRIPTION =
  "Meet Brandon Volosov, founder of Brandon's Brands: a passion for horology, luxury watchmakers and independent microbrands, and a welcoming community for watch enthusiasts. Beyond the brand. Behind the craftsmanship.";

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
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Brandon's Brands – Luxury Watch Curation" }],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "About Brandon's Brands",
    description: DESCRIPTION,
    images: ["/og-image.png"],
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

const faqs = [
  {
    q: "What is Brandon's Brands?",
    a: "Brandon's Brands is a luxury watch brand and online community. We share watch reviews and watch culture on social media, publish a watch blog, and offer free tools for collectors to track their watch collection and wishlist.",
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
        "@type": "Organization",
        "@id": `${SITE_URL}/#organization`,
        name: "Brandon's Brands",
        url: SITE_URL,
        logo: `${SITE_URL}/logo-256.png`,
        image: `${SITE_URL}/og-image.png`,
        slogan: "Discover. Collect. Showcase the world's finest watches.",
        email: collabEmail,
        sameAs: socials.map((s) => s.url),
        founder: { "@id": `${SITE_URL}/about#brandon` },
        contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: collabEmail, availableLanguage: "English" }],
      },
      {
        "@type": "Person",
        "@id": `${SITE_URL}/about#brandon`,
        name: "Brandon Volosov",
        jobTitle: "Founder",
        worksFor: { "@id": `${SITE_URL}/#organization` },
        knowsAbout: ["Horology", "Luxury watches", "Watch microbrands", "Independent watchmakers", "Watch collecting"],
        sameAs: socials.map((s) => s.url),
      },
      {
        "@type": "AboutPage",
        "@id": `${SITE_URL}/about#webpage`,
        url: `${SITE_URL}/about`,
        name: TITLE,
        description: DESCRIPTION,
        about: { "@id": `${SITE_URL}/#organization` },
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

      <article className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8 lg:p-10">
        <nav aria-label="Breadcrumb" className="mb-6 text-xs text-slate-400">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-blue-200">Home</Link>
            </li>
            <li aria-hidden>›</li>
            <li aria-current="page" className="text-slate-300">About Us</li>
          </ol>
        </nav>

        {/* Intro */}
        <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">About Us</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              About Brandon&apos;s Brands
            </h1>
            <p className="mt-4 text-xl font-medium text-[#D9A43A] sm:text-2xl">Beyond the Brand. Behind the Craftsmanship.</p>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-1024.webp"
            alt="Brandon's Brands luxury watch logo"
            width={320}
            height={320}
            className="mx-auto h-56 w-56 drop-shadow-[0_0_60px_rgba(59,130,246,0.35)] sm:h-72 sm:w-72 lg:h-80 lg:w-80"
          />
        </header>

        {/* Meet Brandon */}
        <section aria-labelledby="meet-brandon" className="mt-10 max-w-3xl">
          <h2 id="meet-brandon" className="text-2xl font-semibold text-white sm:text-3xl">Meet Brandon Volosov</h2>
          <div className="mt-5 space-y-5 text-base leading-8 text-slate-300">
            <p>
              For Brandon Volosov, a watch is more than an accessory—it&apos;s an expression of craftsmanship, creativity, and personal
              style. His passion for{" "}
              <strong className="font-semibold text-white">horology—the art and science of timekeeping—</strong>is rooted in an
              appreciation for the details: the movement inside the case, the finish of a dial, the balance of a design, and the
              inspiration behind it.
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

        {/* Microbrands */}
        <section
          aria-labelledby="microbrands"
          className="mt-12 rounded-[1.75rem] border border-blue-400/20 bg-gradient-to-br from-[#0E3A63]/60 to-black/30 p-6 sm:p-8 lg:p-10"
        >
          <h2 id="microbrands" className="text-2xl font-semibold text-white sm:text-3xl">Why Microbrands Matter</h2>
          <blockquote className="mt-5 border-l-4 border-[#D9A43A] pl-4 text-lg font-medium italic leading-8 text-white sm:text-xl">
            Exceptional watches deserve attention—not just recognizable names.
          </blockquote>
          <div className="mt-6 max-w-3xl space-y-5 text-base leading-8 text-slate-200">
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
          <p className="mt-6 text-lg font-semibold text-[#D9A43A]">Because the name on the dial is only the beginning of the story.</p>
        </section>

        {/* Shared passion */}
        <section aria-labelledby="shared-passion" className="mt-12 max-w-3xl">
          <h2 id="shared-passion" className="text-2xl font-semibold text-white sm:text-3xl">A Shared Passion for Watches</h2>
          <div className="mt-5 space-y-5 text-base leading-8 text-slate-300">
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
          <p className="mt-6 text-xl font-semibold leading-8 text-white">
            Welcome to Brandon&apos;s Brands.{" "}
            <span className="text-blue-200">Discover the makers. Explore the details. Find what speaks to you.</span>
          </p>
        </section>

        {/* What we do */}
        <section aria-labelledby="what-we-do" className="mt-12">
          <h2 id="what-we-do" className="text-2xl font-semibold text-white sm:text-3xl">What you&apos;ll find here</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {offerings.map((o) => (
              <div key={o.title} className="flex flex-col rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6">
                <h3 className="text-xl font-semibold text-white">{o.title}</h3>
                <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">{o.text}</p>
                <Link href={o.href} className="mt-5 inline-flex items-center gap-1 self-start text-sm font-semibold uppercase tracking-[0.15em] text-[#D9A43A] hover:text-[#e1b54a]">
                  {o.cta} <span aria-hidden>→</span>
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Follow */}
        <section aria-labelledby="follow" className="mt-12">
          <h2 id="follow" className="text-2xl font-semibold text-white sm:text-3xl">Follow Brandon&apos;s Brands</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
            Catch new reviews and watch culture on your favorite platform, or read longer stories on the{" "}
            <Link href="/blog" className="text-[#D9A43A] hover:text-[#e1b54a]">Brandon&apos;s Brands blog</Link>.
          </p>
          <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-full w-full min-w-0 flex-col rounded-2xl border border-[#3FB4EC]/40 bg-gradient-to-b from-[#1A7DBF] to-[#0E5A8F] px-3 py-3 text-white sm:px-5 transition hover:from-[#2290D6] hover:to-[#136AA6]"
                >
                  <span className="text-sm font-semibold">{s.name}</span>
                  <span className="truncate text-[11px] text-blue-100 sm:text-xs">{s.handle}</span>
                </a>
              </li>
            ))}
          </ul>
        </section>

        {/* FAQ */}
        <section aria-labelledby="faq" className="mt-12">
          <h2 id="faq" className="text-2xl font-semibold text-white sm:text-3xl">Frequently asked questions</h2>
          <div className="mt-6 divide-y divide-white/10 rounded-[1.5rem] border border-white/10 bg-black/20">
            {faqs.map((f) => (
              <details key={f.q} className="group p-5 sm:p-6">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold text-white">
                  <h3>{f.q}</h3>
                  <span aria-hidden className="text-blue-300 transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-slate-300">{f.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* Contact */}
        <section aria-labelledby="contact-heading" id="contact" className="mt-12 rounded-[1.75rem] border border-[#D9A43A]/30 bg-gradient-to-br from-[#D9A43A]/10 via-transparent to-[#1A7DBF]/15 p-6 text-center sm:p-10">
          <h2 id="contact-heading" className="text-2xl font-semibold text-white sm:text-3xl">Get in touch</h2>
          <p className="mx-auto mt-3 max-w-xl text-base leading-7 text-slate-300">
            Questions, collaborations, review requests or just want to talk watches? We&apos;d love to hear from you.
          </p>
          <a
            href={`mailto:${collabEmail}?subject=${encodeURIComponent("Hello from brandonsbrands17.com")}`}
            className="mt-7 inline-flex rounded-full bg-[#D9A43A] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-black shadow-[0_10px_40px_rgba(217,164,58,0.3)] transition hover:bg-[#e1b54a]"
          >
            Contact Us
          </a>
          <p className="mt-4 text-sm text-slate-400">
            Or email{" "}
            <a href={`mailto:${collabEmail}`} className="text-[#D9A43A] hover:text-[#e1b54a]">{collabEmail}</a>
            {" · "}
            <Link href="/inbox" className="text-blue-300 hover:text-blue-200">message us on the site</Link>
          </p>
        </section>
      </article>
    </div>
  );
}
