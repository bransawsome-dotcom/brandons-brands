"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collection", label: "Collection" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/videos", label: "Videos" },
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
    <nav className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-200">
      {navLinks.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`rounded-full px-4 py-2 transition ${active ? "bg-white/10 text-white" : "hover:bg-white/10 hover:text-white"}`}
          >
            {item.label}
          </Link>
        );
      })}
      {guestMode ? (
        <span className="rounded-full border border-[#D9A43A]/30 bg-[#D9A43A]/10 px-4 py-2 text-xs uppercase tracking-[0.18em] text-[#D9A43A]">
          Guest Mode
        </span>
      ) : user ? (
        <button
          type="button"
          onClick={handleSignOut}
          className="rounded-full px-4 py-2 transition bg-white/5 text-slate-200 hover:bg-white/10"
        >
          Logout
        </button>
      ) : (
        <Link
          href="/login"
          className="rounded-full px-4 py-2 transition bg-white/5 text-slate-200 hover:bg-white/10"
        >
          Login
        </Link>
      )}
    </nav>
  );
}
