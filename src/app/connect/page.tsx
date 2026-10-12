import type { Metadata } from "next";
import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { collabEmail, facebookGroup, socials } from "@/lib/socials";

// "Connect with Brandon": the page the printed QR code opens (brandonsbrands17.com/connect).
// Links come from src/lib/socials.ts, so updating them there updates this page without reprinting cards.

export const metadata: Metadata = {
  title: "Connect with Brandon | Brandon's Brands",
  description: "Follow Brandon Volosov and Brandon's Brands on Instagram, TikTok, YouTube and Facebook, or visit the website.",
  alternates: { canonical: "/connect" },
  openGraph: { type: "website", url: "/connect", title: "Connect with Brandon", images: ["/og-image.png?v=2"] },
};

const ICONS: Record<string, React.ReactNode> = {
  Website: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.7 3.7 5.7 3.7 9s-1.2 6.3-3.7 9c-2.5-2.7-3.7-5.7-3.7-9S9.5 5.7 12 3Z" />
    </svg>
  ),
  Instagram: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),
  TikTok: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M16.5 3c.4 2.3 1.8 3.8 4 4v3.1a7.6 7.6 0 0 1-4-1.2v6.3a6.2 6.2 0 1 1-6.2-6.2c.3 0 .7 0 1 .1v3.2a3.1 3.1 0 1 0 2.1 2.9V3h3.1Z" />
    </svg>
  ),
  YouTube: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M21.6 7.2a2.6 2.6 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.6 2.6 0 0 0 2.4 7.2 27 27 0 0 0 2 12a27 27 0 0 0 .4 4.8 2.6 2.6 0 0 0 1.8 1.8c1.6.4 7.8.4 7.8.4s6.2 0 7.8-.4a2.6 2.6 0 0 0 1.8-1.8A27 27 0 0 0 22 12a27 27 0 0 0-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
    </svg>
  ),
  Facebook: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor" aria-hidden>
      <path d="M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8v3h2.6V21h2.9Z" />
    </svg>
  ),
  Group: (
    <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M3.5 19c.6-3 2.8-4.8 5.5-4.8s4.9 1.8 5.5 4.8M14.8 14.6c.7-.3 1.4-.4 2.2-.4 2.2 0 3.9 1.5 4.4 4" />
    </svg>
  ),
};

const button =
  "group flex w-full items-center gap-4 rounded border border-hairline-strong bg-raised px-4 py-3 text-left text-ink sm:px-5 sm:py-4 shadow-[0_10px_30px_rgba(43,38,32,0.08)] transition hover:border-gold hover:bg-surface active:scale-[0.99]";

export default function ConnectPage() {
  return (
    <div className="connect-page mx-auto flex w-full max-w-md flex-col items-center px-1 pb-4 pt-0 text-center sm:pt-6">
      <div role="img" aria-label="Brandon's Brands logo" className="hidden sm:block">
        <LogoMark className="h-24 w-24 drop-shadow-[0_10px_30px_rgba(43,38,32,0.08)] sm:h-28 sm:w-28" />
      </div>
      <p className="text-xs uppercase tracking-[0.35em] text-gold sm:mt-5">Brandon&apos;s Brands</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-ink sm:mt-2 sm:text-4xl">Connect with Brandon</h1>
      <p className="mt-2 text-sm leading-6 text-ink/80 sm:mt-3">Luxury watches, microbrands and watch culture. Discover the makers.</p>

      <ul className="mt-5 w-full space-y-2.5 sm:mt-8 sm:space-y-3">
        <li>
          <Link href="/" className={button}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hairline">{ICONS.Website}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold">Website</span>
              <span className="block truncate text-xs text-gold">brandonsbrands17.com</span>
            </span>
            <span aria-hidden className="text-gold transition group-hover:translate-x-0.5">→</span>
          </Link>
        </li>
        {socials.map((s) => (
          <li key={s.name}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className={button}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hairline">{ICONS[s.name]}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold">{s.name}</span>
                <span className="block truncate text-xs text-gold">{s.handle}</span>
              </span>
              <span aria-hidden className="text-gold transition group-hover:translate-x-0.5">↗</span>
            </a>
          </li>
        ))}
        <li>
          <a href={facebookGroup.url} target="_blank" rel="noopener noreferrer" className={button}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-hairline">{ICONS.Group}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold">Join the Facebook group</span>
              <span className="block truncate text-xs text-gold">{facebookGroup.name}</span>
            </span>
            <span aria-hidden className="text-gold transition group-hover:translate-x-0.5">↗</span>
          </a>
        </li>
      </ul>

      <p className="mt-8 text-sm text-muted">
        Collaborations:{" "}
        <a href={`mailto:${collabEmail}`} className="font-semibold text-gold hover:text-gold-bright">
          {collabEmail}
        </a>
      </p>
      <Link href="/about" className="mt-2 text-xs text-muted hover:text-ink/80">
        About Brandon&apos;s Brands
      </Link>
    </div>
  );
}
