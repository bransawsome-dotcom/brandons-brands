"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";
import InboxBell from "@/components/InboxBell";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collection", label: "Collection" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/social", label: "Social Media" },
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
  { href: "/learn", label: "Learn" },
  { href: "/about", label: "About" },
  { href: "/account", label: "Account" },
];

function isActive(pathname: string | null, href: string) {
  if (!pathname) return false;
  if (href === "/") return pathname === "/";
  if (href === "/account") return pathname.startsWith("/account");
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, guestMode, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <div className="flex w-full flex-col gap-2 text-sm font-medium text-slate-200 lg:items-end">
      {/* Page links: one line on large screens (wraps on phones). */}
      <div className="grid grid-cols-3 gap-1 sm:flex sm:flex-wrap sm:justify-end xl:flex-nowrap xl:gap-1.5">
        {navLinks.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`${item.href === "/" ? "hidden sm:block " : ""}whitespace-nowrap rounded-full border px-2 py-2 sm:min-w-[96px] sm:px-3 text-center transition lg:min-w-0 lg:px-2.5 xl:px-3 ${
                active ? "border-blue-400/30 bg-blue-500/20 text-blue-200" : "border-transparent hover:bg-blue-500/10 hover:text-blue-200"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      {/* Inbox and Logout (or Login / Guest Mode) on the row below. */}
      <div className="flex items-center gap-2 sm:justify-end">
        <Link
          href="/search"
          aria-label="Search the site"
          title="Search watches, collectors, forum and more"
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border transition ${
            isActive(pathname, "/search") ? "border-blue-400/40 bg-blue-500/20 text-white" : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
          }`}
        >
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
        </Link>
        {guestMode ? (
          <span className="rounded-full border border-[#D9A43A]/30 bg-[#D9A43A]/10 px-4 py-2 text-center text-xs uppercase tracking-[0.18em] text-[#D9A43A]">
            Guest Mode
          </span>
        ) : user ? (
          <>
            <InboxBell />
            <button
              type="button"
              onClick={handleSignOut}
              className="min-w-[110px] rounded-full bg-white/5 px-3 py-2 text-center text-slate-200 transition hover:bg-white/10"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/login" className="min-w-[110px] rounded-full bg-white/5 px-3 py-2 text-center text-slate-200 transition hover:bg-white/10">
            Login
          </Link>
        )}
      </div>
    </div>
  );
}
