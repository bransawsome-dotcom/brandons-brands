import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/lib/site";

// Public landing page for the collection tools, written for searches like "watch value tracker",
// "watch price tracker" and "how much is my watch worth". The tools themselves need a free account.

const TITLE = "Free Watch Value Tracker & Watch Price Tracker | Brandon's Brands";
const DESCRIPTION =
  "Track what your watches are worth for free. Add a watch from a photo, see its estimated market value updated daily, chart your collection's value over time and get price alerts for watches on your wishlist.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "watch value tracker",
    "watch price tracker",
    "watch collection tracker",
    "watch collection app",
    "how much is my watch worth",
    "watch value",
    "watch price alerts",
  ],
  alternates: { canonical: "/watch-value-tracker" },
  openGraph: { type: "website", url: "/watch-value-tracker", title: "Free Watch Value Tracker", description: DESCRIPTION, images: ["/og-image.png"] },
  twitter: { card: "summary_large_image", title: "Free Watch Value Tracker", description: DESCRIPTION },
};

const FEATURES = [
  {
    icon: "📸",
    title: "Add a watch from a photo",
    text: "Pick a brand and model, or snap a photo of a list of your watches. The reference, specs, retail price and a photo fill in automatically.",
  },
  {
    icon: "💵",
    title: "Estimated value, updated daily",
    text: "Every watch gets an estimated pre-owned market value and today's retail price, refreshed every day from current market prices.",
  },
  {
    icon: "📈",
    title: "Your collection's value over time",
    text: "A chart of your whole collection's value, plus the watches that moved the most since you added them.",
  },
  {
    icon: "🔔",
    title: "Price alerts for your wishlist",
    text: "Set a target price on a watch you want. When one is listed at or below it, you get an alert in your inbox and by email.",
  },
  {
    icon: "📦",
    title: "Box, papers and what you paid",
    text: "Keep purchase price, date, box and papers and notes in one place, private to you unless you choose to share.",
  },
  {
    icon: "🌐",
    title: "Share it if you want",
    text: "Make your collection or wishlist public with one switch, or share a Story card on Instagram. It stays private until you do.",
  },
];

const FAQS = [
  {
    q: "Is the watch value tracker really free?",
    a: "Yes. Create a free Brandon's Brands account to track your collection and wishlist, see estimated values and set price alerts. There's nothing to pay.",
  },
  {
    q: "How much is my watch worth?",
    a: "Add it to your collection and you'll see an estimated pre-owned market value based on current market prices, updated daily. It's an estimate for information only, not an appraisal: condition, box and papers and service history all change what a buyer will pay.",
  },
  {
    q: "How is the value estimated?",
    a: "Each day the site checks the brand's current retail price and current pre-owned prices for that model (for example recent listings and sales on major marketplaces), then saves the estimate so your value history builds over time.",
  },
  {
    q: "Is my collection private?",
    a: "Yes. Your collection and wishlist are private to your account unless you turn on the public switch for either one.",
  },
];

export default function WatchValueTrackerPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebApplication",
      name: "Brandon's Brands Watch Value Tracker",
      url: `${SITE_URL}/watch-value-tracker`,
      applicationCategory: "LifestyleApplication",
      operatingSystem: "Any (web browser)",
      description: DESCRIPTION,
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      creator: { "@type": "Person", name: "Brandon Volosov", url: `${SITE_URL}/about` },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: FAQS.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <div className="mx-auto w-full max-w-5xl px-0 py-4 sm:px-6 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      <section className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#0E3A63]/60 via-slate-950/80 to-black/40 p-6 sm:p-10">
        <p className="text-xs uppercase tracking-[0.35em] text-blue-300">Free collection tools</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.02em] text-white sm:text-5xl">Free watch value tracker</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
          Find out what your watches are worth and watch your collection&apos;s value over time. Add a watch in seconds, get daily estimated values, and set
          price alerts for the watches you want next.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/signup" className="rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold text-black hover:bg-[#e1b54a]">
            Start tracking free
          </Link>
          <Link href="/collection" className="rounded-full border border-white/15 px-6 py-3 text-sm font-semibold text-slate-100 hover:bg-white/5">
            I have an account
          </Link>
        </div>
      </section>

      <section aria-labelledby="features" className="mt-8">
        <h2 id="features" className="px-1 text-2xl font-semibold text-white">What the watch price tracker does</h2>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <li key={f.title} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
              <p className="text-2xl" aria-hidden>
                {f.icon}
              </p>
              <h3 className="mt-2 text-lg font-semibold text-white">{f.title}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{f.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="faq" className="mt-10 rounded-[2rem] border border-white/10 bg-white/5 p-6 sm:p-8">
        <h2 id="faq" className="text-2xl font-semibold text-white">Questions</h2>
        <dl className="mt-4 divide-y divide-white/10">
          {FAQS.map((f) => (
            <div key={f.q} className="py-4">
              <dt className="font-semibold text-white">{f.q}</dt>
              <dd className="mt-1 text-sm leading-6 text-slate-300">{f.a}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs text-slate-500">Estimated market values are for information only and are not appraisals or financial advice.</p>
      </section>

      <p className="mt-8 px-1 text-sm text-slate-400">
        New to collecting? Read <Link href="/learn/how-to-start-a-watch-collection" className="text-blue-300 hover:text-blue-200">how to start a watch collection</Link>,{" "}
        <Link href="/learn/are-watches-a-good-investment" className="text-blue-300 hover:text-blue-200">are watches a good investment?</Link> and{" "}
        <Link href="/learn/buying-pre-owned-watches-safely" className="text-blue-300 hover:text-blue-200">buying pre-owned watches safely</Link>.
      </p>
    </div>
  );
}
