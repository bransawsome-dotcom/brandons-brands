import type { Metadata } from "next";
import Link from "next/link";
import { collabEmail, socials } from "@/lib/socials";

// "Connect with Brandon": the page the printed QR code opens (brandonsbrands17.com/connect).
// Links come from src/lib/socials.ts, so updating them there updates this page without reprinting cards.

export const metadata: Metadata = {
  title: "Connect with Brandon | Brandon's Brands",
  description: "Follow Brandon Volosov and Brandon's Brands on Instagram, TikTok, YouTube and Facebook, or visit the website.",
  alternates: { canonical: "/connect" },
  openGraph: { type: "website", url: "/connect", title: "Connect with Brandon", images: ["/og-image.png"] },
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
};

const button =
  "group flex w-full items-center gap-4 rounded-2xl border border-[#3FB4EC]/40 bg-gradient-to-b from-[#1A7DBF] to-[#0E5A8F] px-4 py-3 text-left text-white sm:px-5 sm:py-4 shadow-[0_10px_30px_rgba(14,90,143,0.35)] transition hover:from-[#2290D6] hover:to-[#136AA6] active:scale-[0.99]";

export default function ConnectPage() {
  return (
    <div className="connect-page mx-auto flex w-full max-w-md flex-col items-center px-1 pb-4 pt-0 text-center sm:pt-6">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/logo-256.webp"
        alt="Brandon's Brands logo"
        width={128}
        height={128}
        className="hidden h-24 w-24 drop-shadow-[0_0_40px_rgba(59,130,246,0.45)] sm:block sm:h-28 sm:w-28"
      />
      <p className="text-xs uppercase tracking-[0.35em] text-blue-300 sm:mt-5">Brandon&apos;s Brands</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-[-0.02em] text-white sm:mt-2 sm:text-4xl">Connect with Brandon</h1>
      <p className="mt-2 text-sm leading-6 text-slate-300 sm:mt-3">Luxury watches, microbrands and watch culture. Discover the makers.</p>

      <ul className="mt-5 w-full space-y-2.5 sm:mt-8 sm:space-y-3">
        <li>
          <Link href="/" className={button}>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">{ICONS.Website}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-base font-semibold">Website</span>
              <span className="block truncate text-xs text-blue-100">brandonsbrands17.com</span>
            </span>
            <span aria-hidden className="text-blue-100 transition group-hover:translate-x-0.5">→</span>
          </Link>
        </li>
        {socials.map((s) => (
          <li key={s.name}>
            <a href={s.url} target="_blank" rel="noopener noreferrer" className={button}>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15">{ICONS[s.name]}</span>
              <span className="min-w-0 flex-1">
                <span className="block text-base font-semibold">{s.name}</span>
                <span className="block truncate text-xs text-blue-100">{s.handle}</span>
              </span>
              <span aria-hidden className="text-blue-100 transition group-hover:translate-x-0.5">↗</span>
            </a>
          </li>
        ))}
      </ul>

      <p className="mt-8 text-sm text-slate-400">
        Collaborations:{" "}
        <a href={`mailto:${collabEmail}`} className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
          {collabEmail}
        </a>
      </p>
      <Link href="/about" className="mt-2 text-xs text-slate-500 hover:text-slate-300">
        About Brandon&apos;s Brands
      </Link>
    </div>
  );
}
