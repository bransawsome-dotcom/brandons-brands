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

const smallCaps = "whitespace-nowrap text-[11px] uppercase tracking-[0.2em]";

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
      <div className="border-b border-hairline">
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
          <span className="whitespace-nowrap font-display text-[24px] font-semibold uppercase leading-none tracking-[0.06em] min-[400px]:text-[28px] sm:text-[40px] sm:tracking-[0.08em] lg:text-[48px]">Brandon&apos;s Brands</span>
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
                className={`hidden min-h-11 items-center text-ink transition hover:text-gold-bright sm:inline-flex ${smallCaps}`}
              >
                Account
              </Link>
              <button type="button" onClick={handleSignOut} className={`min-h-11 text-gold transition hover:text-gold-bright ${smallCaps}`}>
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
