"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Phones only: the five most-used places, pinned to the bottom of the screen.
const tabs = [
  { href: "/", label: "Home", d: "M4 11.5 12 5l8 6.5V20h-5v-5h-6v5H4z" },
  { href: "/social", label: "Videos", d: "M5 6h14v12H5zM10.5 9.5v5l4-2.5z" },
  { href: "/wrist-check", label: "Wrist", d: "M9 3h6l1 4M9 3 8 7m0 10 1 4h6l1-4M12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2v2l1.2 1" },
  { href: "/forum", label: "Forum", d: "M4 5h16v10H9l-5 4z" },
  { href: "/collection", label: "Collection", d: "M4 7h16v12H4zM8 7V5h8v2M4 12h16" },
];

export default function MobileTabBar() {
  const path = usePathname() ?? "/";
  return (
    <nav aria-label="Quick links" className="fixed inset-x-0 bottom-0 z-40 border-t border-hairline bg-raised/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {tabs.map((t) => {
          const active = t.href === "/" ? path === "/" : path.startsWith(t.href);
          return (
            <li key={t.href}>
              <Link
                href={t.href}
                aria-current={active ? "page" : undefined}
                className={`flex min-h-14 flex-col items-center justify-center gap-1 text-[10px] uppercase tracking-[0.12em] ${active ? "text-gold" : "text-muted"}`}
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" aria-hidden>
                  <path d={t.d} />
                </svg>
                {t.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
