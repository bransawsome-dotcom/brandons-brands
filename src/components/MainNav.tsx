"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/components/AuthProvider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/collection", label: "Collection" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/social", label: "Social Media" },
  { href: "/blog", label: "Blog" },
  { href: "/forum", label: "Forum" },
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
    <nav className="flex w-full flex-wrap gap-2 text-sm font-medium text-slate-200 sm:justify-end">
      {navLinks.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`min-w-[110px] rounded-full px-3 py-2 text-center transition ${
  active
    ? "bg-blue-500/20 text-blue-200 border border-blue-400/30"
    : "hover:bg-blue-500/10 hover:text-blue-200"
}`}
          >
            {item.label}
          </Link>
        );
      })}
      {guestMode ? (
        <span className="min-w-[110px] rounded-full border border-[#D9A43A]/30 bg-[#D9A43A]/10 px-3 py-2 text-center text-xs uppercase tracking-[0.18em] text-[#D9A43A]">
          Guest Mode
        </span>
      ) : user ? (
        <button
          type="button"
          onClick={handleSignOut}
          className="min-w-[110px] rounded-full px-3 py-2 text-center transition bg-white/5 text-slate-200 hover:bg-white/10"
        >
          Logout
        </button>
      ) : (
        <Link
          href="/login"
          className="min-w-[110px] rounded-full px-3 py-2 text-center transition bg-white/5 text-slate-200 hover:bg-white/10"
        >
          Login
        </Link>
      )}
    </nav>
  );
}
