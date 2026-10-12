"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import InboxBell from "@/components/InboxBell";
import LogoMark from "@/components/LogoMark";
import { requestVault } from "@/lib/vault";

// Site header, dark luxury look: a thin announcement strip, a centered wordmark with search and
// account on either side, and one row of page links (scrolls sideways on phones).
const pageLinks = [
  { href: "/collection", label: "Collection" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/dashboard", label: "Dashboard", signedIn: true },
  { href: "/collectors", label: "Collectors" },
  { href: "/forum", label: "Forum" },
  { href: "/blog", label: "Blog" },
  { href: "/learn", label: "Learn" },
  { href: "/events", label: "Events" },
  { href: "/social", label: "Social" },
  { href: "/about", label: "About" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

const smallCaps = "whitespace-nowrap text-[12px] font-medium uppercase tracking-[0.2em]";

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, guestMode, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <header className="site-header theme-cream relative z-30 border-b border-hairline bg-ground text-ink">
      <div className="theme-navy">
        <div className={`mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-2 text-muted sm:px-6 ${smallCaps}`}>
          <span className="hidden sm:inline">Luxury &amp; microbrand watch reviews</span>
          <Link href="/wrist-check" className="mx-auto text-muted transition hover:text-gold-bright sm:mx-0">
            Wrist Check of the Week · <span className="text-gold">submit yours</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-4 sm:gap-3 sm:px-6 sm:py-5">
        <Link
          href="/search"
          aria-label="Search the site"
          className={`inline-flex min-h-11 items-center gap-2 justify-self-start text-ink transition hover:text-gold-bright ${smallCaps}`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <span className="hidden sm:inline">Search</span>
        </Link>

        <Link href="/" aria-label="Brandon's Brands home" className="flex items-center gap-3 text-ink">
          <span className="hidden sm:block">
            <LogoMark className="h-11 w-11" />
          </span>
          <span className="whitespace-nowrap font-display text-[17px] font-semibold uppercase leading-[1.05] tracking-[0.04em] min-[400px]:text-[19px] sm:text-[36px] sm:tracking-[0.08em] lg:text-[44px]">Brandon&apos;s Brands</span>
        </Link>

        <div className="flex items-center gap-2 justify-self-end sm:gap-3">
          {guestMode && !user ? (
            <>
              <span className={`hidden text-gold sm:inline ${smallCaps}`}>Guest</span>
              <button
                type="button"
                onClick={() => {
                  try {
                    window.localStorage.removeItem("brandons-brands-guest-mode");
                  } catch {
                    /* ignore */
                  }
                  window.location.assign("/login");
                }}
                className={`min-h-11 text-gold transition hover:text-gold-bright ${smallCaps}`}
              >
                Log in
              </button>
            </>
          ) : user ? (
            <>
              <InboxBell />
              <Link
                href="/account"
                aria-current={isActive(pathname, "/account") ? "page" : undefined}
                aria-label="Account"
                className={`inline-flex min-h-11 min-w-9 items-center justify-center text-ink transition hover:text-gold-bright ${smallCaps}`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden className="sm:hidden">
                  <circle cx="12" cy="8.5" r="3.5" />
                  <path d="M5 20c.8-3.6 3.6-5.5 7-5.5s6.2 1.9 7 5.5" />
                </svg>
                <span className="hidden sm:inline">Account</span>
              </Link>
              {/* Phones: Log out lives on the Account page, so the header stays on one line. */}
              <button type="button" onClick={handleSignOut} className={`hidden min-h-11 text-gold transition hover:text-gold-bright sm:inline ${smallCaps}`}>
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className={`inline-flex min-h-11 items-center text-gold transition hover:text-gold-bright ${smallCaps}`}>
              Log in
            </Link>
          )}
        </div>
      </div>

      <nav aria-label="Main" className="border-t border-hairline">
        <ul className="mx-auto flex max-w-[1180px] gap-7 overflow-x-auto whitespace-nowrap px-4 py-3 [scrollbar-width:none] sm:justify-center sm:gap-9 sm:px-6 [&::-webkit-scrollbar]:hidden">
          {pageLinks
            .filter((l) => !l.signedIn || user)
            .map((l) => {
              const active = isActive(pathname, l.href);
              return (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    aria-current={active ? "page" : undefined}
                    onClick={l.href === "/collection" ? requestVault : undefined}
                    className={`inline-block border-b py-1 transition ${smallCaps} ${
                      active ? "border-gold text-gold-bright" : "border-transparent text-ink hover:text-gold-bright"
                    }`}
                  >
                    {l.label}
                  </Link>
                </li>
              );
            })}
        </ul>
      </nav>
    </header>
  );
}
