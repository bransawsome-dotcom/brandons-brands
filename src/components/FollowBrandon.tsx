import Link from "next/link";

// "More from Brandon" panel: points readers to Brandon's reviews and the rest of the site.
// Social media buttons live in the site footer on every page, so they aren't repeated here.
// Used under forum discussions, guides, search and the favorites gallery.
const LINKS = [
  { href: "/favorites", label: "⭐ Favorites" },
  { href: "/learn", label: "📚 Watch guides" },
  { href: "/blog", label: "📝 Blog" },
  { href: "/forum", label: "💬 Forum" },
];

export default function FollowBrandon({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="More from Brandon"
      className={`rounded-[2rem] border border-[#3FB4EC]/30 bg-gradient-to-br from-[#1A7DBF]/20 via-slate-950/60 to-[#D9A43A]/10 p-5 text-center sm:p-7 ${className}`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Keep exploring</p>
      <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">More from Brandon Volosov</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
        Hands-on reviews of luxury watches and independent microbrands, new releases and founder interviews.
      </p>
      <ul className="mx-auto mt-4 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
        {LINKS.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="flex w-full justify-center rounded-full border border-white/15 bg-white/5 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
