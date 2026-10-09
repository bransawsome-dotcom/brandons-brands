import Link from "next/link";
import { socials } from "@/lib/socials";

// "Follow Brandon" box: sends readers to Brandon's website and every social account.
// Used under forum discussions and on the favorites gallery.
export default function FollowBrandon({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="Follow Brandon's Brands"
      className={`rounded-[2rem] border border-[#3FB4EC]/30 bg-gradient-to-br from-[#1A7DBF]/20 via-slate-950/60 to-[#D9A43A]/10 p-5 text-center sm:p-7 ${className}`}
    >
      <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Follow Brandon</p>
      <h2 className="mt-2 text-xl font-semibold text-white sm:text-2xl">More watch reviews from Brandon Volosov</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-slate-300">
        Hands-on reviews of luxury watches and independent microbrands, new releases and founder interviews. Follow along and never miss
        a drop.
      </p>
      <ul className="mx-auto mt-4 grid max-w-xl grid-cols-2 gap-2 sm:grid-cols-4">
        {socials.map((s) => (
          <li key={s.name}>
            <a
              href={s.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Brandon's Brands on ${s.name} (${s.handle})`}
              className="flex w-full justify-center rounded-full border border-[#3FB4EC]/40 bg-gradient-to-b from-[#1A7DBF] to-[#0E5A8F] px-4 py-2 text-sm font-semibold text-white transition hover:from-[#2290D6] hover:to-[#136AA6]"
            >
              {s.name}
            </a>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-sm">
        <Link href="/" className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">
          brandonsbrands17.com
        </Link>
        <span className="mx-2 text-slate-500">·</span>
        <Link href="/favorites" className="text-blue-200 hover:text-white">
          Brandon&apos;s favorites
        </Link>
        <span className="mx-2 text-slate-500">·</span>
        <Link href="/blog" className="text-blue-200 hover:text-white">
          Blog
        </Link>
      </p>
    </section>
  );
}
