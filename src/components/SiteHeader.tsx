"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import InboxBell from "@/components/InboxBell";
import LogoMark from "@/components/LogoMark";
import { requestVault } from "@/lib/vault";

// Site header: a navy announcement strip, then the wordmark with search and account either side, and one row of
// page links. On phones the page links move into a menu (button on the left) and search sits on the right.
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

const SearchIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export default function SiteHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, guestMode, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menu = useRef<HTMLDialogElement>(null);

  // Close the phone menu whenever the page changes.
  useEffect(() => {
    menu.current?.close();
  }, [pathname]);

  const handleSignOut = async () => {
    menu.current?.close();
    await signOut();
    router.push("/login");
  };

  const links = pageLinks.filter((l) => !l.signedIn || user);

  return (
    <header className="site-header theme-cream relative z-30 border-b border-hairline bg-ground text-ink">
      <div className="theme-navy">
        <div className={`mx-auto flex max-w-[1180px] items-center justify-between gap-4 px-4 py-2 text-muted sm:px-6 ${smallCaps}`}>
          <span>Luxury watch curation</span>
          <Link href="/wrist-check" className="hidden text-muted transition hover:text-gold-bright sm:inline">
            Wrist Check of the Week · <span className="text-gold">submit yours</span>
          </Link>
        </div>
      </div>

      <div className="mx-auto grid max-w-[1180px] grid-cols-[1fr_auto_1fr] items-center gap-2 px-3 py-4 sm:gap-3 sm:px-6 sm:py-5">
        <div className="justify-self-start">
          {/* Phones: menu button */}
          <button
            type="button"
            onClick={() => {
              setMenuOpen(true);
              menu.current?.showModal();
            }}
            aria-label="Open menu"
            aria-expanded={menuOpen}
            className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink sm:hidden"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
              <path d="M4 9h16M4 15h16" />
            </svg>
          </button>
          <Link href="/search" aria-label="Search the site" className={`hidden min-h-11 items-center gap-2 text-ink transition hover:text-gold-bright sm:inline-flex ${smallCaps}`}>
            <SearchIcon />
            Search
          </Link>
        </div>

        <Link href="/" aria-label="Brandon's Brands home" className="flex items-center gap-3 text-ink">
          <span className="hidden sm:block">
            <LogoMark className="h-11 w-11" />
          </span>
          <span className="whitespace-nowrap font-display text-[19px] font-semibold uppercase leading-[1.05] tracking-[0.04em] min-[400px]:text-[21px] sm:text-[36px] sm:tracking-[0.08em] lg:text-[44px]">
            Brandon&apos;s Brands
          </span>
        </Link>

        <div className="flex items-center gap-1 justify-self-end sm:gap-3">
          <Link href="/search" aria-label="Search the site" className="inline-flex min-h-11 min-w-11 items-center justify-center text-ink sm:hidden">
            <SearchIcon />
          </Link>
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
                className={`hidden min-h-11 text-gold transition hover:text-gold-bright sm:inline ${smallCaps}`}
              >
                Log in
              </button>
            </>
          ) : user ? (
            <>
              <span className="hidden sm:inline-flex">
                <InboxBell />
              </span>
              <Link
                href="/account"
                aria-current={isActive(pathname, "/account") ? "page" : undefined}
                className={`hidden min-h-11 items-center text-ink transition hover:text-gold-bright sm:inline-flex ${smallCaps}`}
              >
                Account
              </Link>
              <button type="button" onClick={handleSignOut} className={`hidden min-h-11 text-gold transition hover:text-gold-bright sm:inline ${smallCaps}`}>
                Log out
              </button>
            </>
          ) : (
            <Link href="/login" className={`hidden min-h-11 items-center text-gold transition hover:text-gold-bright sm:inline-flex ${smallCaps}`}>
              Log in
            </Link>
          )}
        </div>
      </div>

      <nav aria-label="Main" className="hidden border-t border-hairline sm:block">
        <ul className="mx-auto flex max-w-[1180px] flex-wrap justify-center gap-x-9 gap-y-1 px-6 py-3">
          {links.map((l) => {
            const active = isActive(pathname, l.href);
            return (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  onClick={l.href === "/collection" ? requestVault : undefined}
                  className={`inline-block border-b py-1 transition ${smallCaps} ${active ? "border-gold text-gold" : "border-transparent text-ink hover:text-gold-bright"}`}
                >
                  {l.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Phone menu: a full-height panel from the left. */}
      <dialog
        ref={menu}
        onClose={() => setMenuOpen(false)}
        onClick={(e) => {
          if (e.target === menu.current) menu.current?.close();
        }}
        aria-label="Menu"
        className="bb-drawer m-0 h-dvh max-h-none w-[min(22rem,88vw)] max-w-none border-r border-hairline bg-ground p-0 text-ink backdrop:bg-[#1b2a41]/45 backdrop:backdrop-blur-sm"
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-hairline px-5 py-4">
            <span className="font-display text-lg font-semibold uppercase tracking-[0.06em]">Brandon&apos;s Brands</span>
            <button type="button" onClick={() => menu.current?.close()} aria-label="Close menu" className="inline-flex h-11 w-11 items-center justify-center text-2xl text-muted">
              ×
            </button>
          </div>
          <ul className="flex-1 overflow-y-auto px-5 py-4">
            <li>
              <Link href="/" className="block border-b border-hairline py-3.5 font-display text-xl font-semibold uppercase tracking-[0.06em]">
                Home
              </Link>
            </li>
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={l.href === "/collection" ? requestVault : undefined}
                  aria-current={isActive(pathname, l.href) ? "page" : undefined}
                  className={`block border-b border-hairline py-3.5 font-display text-xl font-semibold uppercase tracking-[0.06em] ${isActive(pathname, l.href) ? "text-gold" : ""}`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-hairline px-5 py-5">
            {user ? (
              <div className="flex items-center justify-between gap-3">
                <Link href="/account" className={`inline-flex min-h-11 items-center text-ink ${smallCaps}`}>
                  Account
                </Link>
                <Link href="/inbox" className={`inline-flex min-h-11 items-center text-ink ${smallCaps}`}>
                  Inbox
                </Link>
                <button type="button" onClick={handleSignOut} className={`min-h-11 text-gold ${smallCaps}`}>
                  Log out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <Link href="/login" className={`inline-flex min-h-11 items-center justify-center border border-hairline-strong text-ink ${smallCaps}`}>
                  Log in
                </Link>
                <Link href="/signup" className={`inline-flex min-h-11 items-center justify-center bg-navy text-on-navy ${smallCaps}`}>
                  Join free
                </Link>
              </div>
            )}
            <p className={`mt-4 text-muted ${smallCaps}`}>Luxury watch curation</p>
          </div>
        </div>
      </dialog>
    </header>
  );
}
