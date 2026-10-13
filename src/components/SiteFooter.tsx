import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { collabEmail, facebookGroup, socials } from "@/lib/socials";

// Footer, navy panel: brand column plus four link columns, then the disclaimer.
const columns: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "About",
    links: [
      { href: "/about", label: "About us" },
      { href: "/about#contact", label: "Contact us" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/collectors", label: "Collectors" },
      { href: "/events", label: "Events" },
      { href: "/wrist-check", label: "Wrist Check" },
      { href: "/forum", label: "The Salon" },
      { href: "/polls", label: "Polls" },
      { href: facebookGroup.url, label: "Facebook group", external: true },
    ],
  },
  {
    title: "Tools",
    links: [
      { href: "/watch-value-tracker", label: "Watch value tracker" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/newsletter", label: "Newsletter" },
      { href: "/collection", label: "Collection" },
      { href: "/learn", label: "Watch guides" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Follow",
    links: socials.map((s) => ({ href: s.url, label: s.name, external: true })),
  },
];

// The footer disclaimer, worded as on the reference design.
export const FOOTER_DISCLAIMER =
  "Brandon's Brands does not take part in or guarantee sales, trades or payments between members. It doesn't hold funds, verify watches, or verify sellers or buyers.";

const linkCls = "text-[15px] tracking-[0.06em] text-ink/85 transition hover:text-gold-bright";

export default function SiteFooter() {
  return (
    <footer className="site-footer theme-navy mt-24 border-t-2 border-[#c9a45c] text-ink">
      <div className="mx-auto grid max-w-[1180px] gap-x-6 gap-y-10 px-5 py-14 sm:px-6 lg:grid-cols-[1.5fr_repeat(4,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-3" aria-label="Brandon's Brands home">
            <LogoMark className="h-12 w-12" />
            <span className="font-display text-[26px] font-semibold uppercase leading-[1.05] tracking-[0.06em] sm:whitespace-nowrap">Brandon&apos;s Brands</span>
          </Link>
          <p className="mt-4 text-[12px] uppercase tracking-[0.3em] text-muted">Luxury watch curation</p>
          <p className="mt-4 text-sm text-muted">
            For collabs, write to{" "}
            <a href={`mailto:${collabEmail}`} className="text-gold transition hover:text-gold-bright">
              {collabEmail}
            </a>
          </p>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4 lg:contents">
          {columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mb-4 text-[12px] font-semibold uppercase tracking-[0.25em] text-ink">{col.title}</p>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    {l.external ? (
                      <a href={l.href} target="_blank" rel="noreferrer" className={linkCls}>
                        {l.label}
                      </a>
                    ) : (
                      <Link href={l.href} className={linkCls}>
                        {l.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
      </div>
      <div className="mx-auto max-w-[1180px] px-5 sm:px-6">
        <p className="border-t border-hairline py-6 text-sm leading-6 text-muted">
          {FOOTER_DISCLAIMER}{" "}
          <Link href="/terms" className="underline underline-offset-2 hover:text-ink">
            Terms &amp; Disclaimers
          </Link>
        </p>
      </div>
    </footer>
  );
}
