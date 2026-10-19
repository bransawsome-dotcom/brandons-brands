import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import NewsletterSignup from "@/components/NewsletterSignup";

// One welcome page per platform: /from/instagram, /from/tiktok, /from/youtube, /from/facebook.
// Use these in bios, link stickers and video descriptions. Each shows up as its own page in
// Vercel Web Analytics (UTM reports need a paid add-on; page paths are counted for free),
// so the weekly report can see which platform sends visitors.

const PLATFORMS = {
  instagram: { name: "Instagram", hello: "Thanks for coming over from Instagram." },
  tiktok: { name: "TikTok", hello: "Thanks for coming over from TikTok." },
  youtube: { name: "YouTube", hello: "Thanks for coming over from YouTube." },
  facebook: { name: "Facebook", hello: "Thanks for coming over from Facebook." },
} as const;

type PlatformKey = keyof typeof PLATFORMS;

// Only the four platforms above exist; anything else is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return Object.keys(PLATFORMS).map((platform) => ({ platform }));
}

export async function generateMetadata({ params }: { params: Promise<{ platform: string }> }): Promise<Metadata> {
  const { platform } = await params;
  const p = PLATFORMS[platform as PlatformKey];
  return {
    title: `Welcome${p ? `, ${p.name} friends` : ""} | Brandon's Brands`,
    description: "Track your watch collection, post a wrist check, vote in polls and read Brandon's watch stories.",
    // Same content for every platform, so search engines should index the home page instead.
    alternates: { canonical: "/" },
    robots: { index: false, follow: true },
  };
}

const PICKS = [
  {
    href: "/collection",
    title: "Track your collection",
    text: "Snap a photo, let the scanner fill in the details, and watch your collection's value.",
  },
  {
    href: "/wrist-check",
    title: "Post a Wrist Check",
    text: "Share what's on your wrist today. Brandon picks a Wrist Check of the Week.",
  },
  {
    href: "/polls",
    title: "Vote in this week's polls",
    text: "Which new release would you wear? See what other collectors picked.",
  },
  {
    href: "/blog",
    title: "Read the blog",
    text: "Hands-on reviews, event recaps and the stories behind the watches in the reels.",
  },
];

const card =
  "group flex h-full flex-col rounded-md border border-hairline-strong bg-raised p-5 text-left shadow-card transition hover:border-gold hover:bg-surface";

export default async function FromPlatformPage({ params }: { params: Promise<{ platform: string }> }) {
  const { platform } = await params;
  const p = PLATFORMS[platform as PlatformKey];
  if (!p) notFound();

  return (
    <div className="mx-auto w-full max-w-4xl px-1 py-4 sm:px-6 sm:py-10">
      <section className="rounded-md border border-hairline bg-raised p-6 text-center shadow-card sm:p-10 bb-sheen">
        <p className="text-xs uppercase tracking-[0.35em] text-gold">Welcome to Brandon&apos;s Brands</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em] text-ink sm:text-4xl">{p.hello}</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-ink/80">
          This is Brandon&apos;s home for collectors: microbrands, independents and the watches from the videos, plus free tools to track
          your own collection.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/signup"
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep"
          >
            Create a free account
          </Link>
          <Link href="/" className="text-sm font-semibold text-gold hover:text-gold-bright">
            Look around first →
          </Link>
        </div>
      </section>

      <ul className="mt-6 grid gap-3 sm:grid-cols-2">
        {PICKS.map((pick) => (
          <li key={pick.href}>
            <Link href={pick.href} className={card}>
              <span className="text-base font-semibold text-ink">{pick.title}</span>
              <span className="mt-1 text-sm leading-6 text-ink/75">{pick.text}</span>
              <span aria-hidden className="mt-3 text-gold transition group-hover:translate-x-0.5">→</span>
            </Link>
          </li>
        ))}
      </ul>

      <NewsletterSignup source={`from-${platform}`} compact className="mt-10" />
    </div>
  );
}
