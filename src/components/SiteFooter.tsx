import Link from "next/link";
import LogoMark from "@/components/LogoMark";
import { collabEmail, facebookGroup, socials } from "@/lib/socials";
import { SALES_DISCLAIMER } from "@/lib/legal";

// Footer, dark luxury look: brand column plus four link columns, then the disclaimer.
const columns: { title: string; links: { href: string; label: string; external?: boolean }[] }[] = [
  {
    title: "About",
    links: [
      { href: "/about", label: "About Brandon" },
      { href: "/about#contact", label: "Contact" },
      { href: "/newsletter", label: "Newsletter" },
      { href: "/terms", label: "Terms" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/forum", label: "Forum" },
      { href: "/wrist-check", label: "Wrist Check" },
      { href: "/events", label: "Watch events" },
      { href: "/polls", label: "Polls" },
      { href: facebookGroup.url, label: "Facebook group", external: true },
    ],
  },
  {
    title: "Tools & guides",
    links: [
      { href: "/collection", label: "Collection" },
      { href: "/wishlist", label: "Wishlist" },
      { href: "/watch-value-tracker", label: "Watch value tracker" },
      { href: "/collectors", label: "Collectors" },
      { href: "/learn", label: "Watch guides" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    title: "Follow",
    links: socials.map((s) => ({ href: s.url, label: s.name, external: true })),
  },
];

const linkCls = "text-sm text-ink/85 transition hover:text-gold-bright";

export default function SiteFooter() {
  return (
    <footer className="site-footer mt-24 border-t border-hairline bg-surface text-ink">
      <div className="mx-auto grid max-w-[1180px] gap-10 px-4 py-14 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.6fr_repeat(4,1fr)]">
        <div>
          <Link href="/" className="flex items-center gap-3" aria-label="Brandon's Brands home">
            <LogoMark className="h-12 w-12" />
            <span className="whitespace-nowrap font-display text-[24px] font-semibold uppercase leading-none tracking-[0.06em]">Brandon&apos;s Brands</span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-6 text-muted">Luxury and microbrand watch reviews by Brandon Volosov, and a free community for collectors.</p>
          <p className="mt-4 text-sm text-muted">
            Collabs:{" "}
            <a href={`mailto:${collabEmail}`} className="text-gold transition hover:text-gold-bright">
              {collabEmail}
            </a>
          </p>
        </div>
        {columns.map((col) => (
          <nav key={col.title} aria-label={col.title}>
            <p className="mb-3 text-[11px] uppercase tracking-[0.2em] text-muted">{col.title}</p>
            <ul className="space-y-2">
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
      <p className="mx-auto max-w-[1180px] border-t border-hairline px-4 py-6 text-[11px] leading-5 text-muted sm:px-6">
        <span className="font-semibold text-ink/80">Disclaimer:</span> {SALES_DISCLAIMER} Any deal made through connections on this site is solely between the
        people involved.{" "}
        <Link href="/terms" className="underline hover:text-ink">
          Terms &amp; Disclaimers
        </Link>
      </p>
    </footer>
  );
}
