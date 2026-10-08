import type { Metadata } from "next";
import Link from "next/link";
import { collabEmail, socials } from "@/lib/socials";
import { SITE_URL } from "@/lib/site";

const TITLE = "About Brandon's Brands | Luxury Watch Reviews & Community";
const DESCRIPTION =
  "Brandon's Brands is a luxury watch brand and collector community. Watch reviews, unboxings and new-release first looks, free tools to track your watch collection and wishlist, and a forum for watch enthusiasts.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "Brandon's Brands",
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

const values = [
  { title: "Honest opinions", text: "We say what we like and what we don't, so you can buy with confidence." },
  { title: "Every budget welcome", text: "From a first automatic to a grail piece, every collector belongs here." },
  { title: "Craft first", text: "Movements, finishing and history matter as much as the name on the dial." },
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
    a: "We cover dozens of brands, including Rolex, Omega, Patek Philippe, Audemars Piguet, Cartier, Tudor, TAG Heuer, Grand Seiko and many more, plus vintage and independent watchmakers.",
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
        contactPoint: [{ "@type": "ContactPoint", contactType: "customer support", email: collabEmail, availableLanguage: "English" }],
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
            <p className="mt-3 text-lg text-[#D9A43A] sm:text-xl">Luxury watch reviews, collecting tools and a community for watch lovers.</p>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300">
              Brandon&apos;s Brands is built around one idea: a great watch is better when it&apos;s shared. We review and celebrate the
              world&apos;s finest timepieces, from iconic names like Rolex, Omega and Patek Philippe to vintage finds and independent
              makers. We also give collectors simple tools to catalog what they own, plan what&apos;s next and connect with people who
              love watches as much as they do.
            </p>
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

        {/* Mission */}
        <section aria-labelledby="mission" className="mt-12 rounded-[1.75rem] border border-blue-400/20 bg-gradient-to-br from-[#0E3A63]/60 to-black/30 p-6 sm:p-8">
          <h2 id="mission" className="text-2xl font-semibold text-white sm:text-3xl">Our mission</h2>
          <p className="mt-4 max-w-3xl text-base leading-7 text-slate-200">
            To help every watch enthusiast <strong className="font-semibold text-white">discover</strong> pieces worth knowing,{" "}
            <strong className="font-semibold text-white">collect</strong> with confidence and{" "}
            <strong className="font-semibold text-white">showcase</strong>{" "}the watches they love, whether it&apos;s a first automatic
            or a lifelong grail.
          </p>
        </section>

        {/* What we do */}
        <section aria-labelledby="what-we-do" className="mt-12">
          <h2 id="what-we-do" className="text-2xl font-semibold text-white sm:text-3xl">What we do</h2>
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

        {/* Values */}
        <section aria-labelledby="values" className="mt-12">
          <h2 id="values" className="text-2xl font-semibold text-white sm:text-3xl">What we stand for</h2>
          <ul className="mt-6 grid gap-5 sm:grid-cols-3">
            {values.map((v) => (
              <li key={v.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                <h3 className="text-lg font-semibold text-blue-200">{v.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-300">{v.text}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Follow */}
        <section aria-labelledby="follow" className="mt-12">
          <h2 id="follow" className="text-2xl font-semibold text-white sm:text-3xl">Follow Brandon&apos;s Brands</h2>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-300">
            Catch new reviews and watch culture on your favorite platform, or read longer stories on the{" "}
            <Link href="/blog" className="text-[#D9A43A] hover:text-[#e1b54a]">Brandon&apos;s Brands blog</Link>.
          </p>
          <ul className="mt-5 flex flex-wrap gap-3">
            {socials.map((s) => (
              <li key={s.name}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex flex-col rounded-2xl border border-[#3FB4EC]/40 bg-gradient-to-b from-[#1A7DBF] to-[#0E5A8F] px-5 py-3 text-white transition hover:from-[#2290D6] hover:to-[#136AA6]"
                >
                  <span className="text-sm font-semibold">{s.name}</span>
                  <span className="text-xs text-blue-100">{s.handle}</span>
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
