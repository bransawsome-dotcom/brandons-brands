import Link from "next/link";
import { collabEmail, socials } from "@/lib/socials";

export default function SiteFooter() {
  return (
    <footer className="site-footer mt-12 rounded-[2rem] border border-white/10 bg-white/5 px-5 py-6 backdrop-blur-xl sm:px-8">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-256.webp" alt="Brandon's Brands logo" width={56} height={56} className="h-12 w-12 shrink-0 sm:h-14 sm:w-14" />
          <div>
          <p className="whitespace-nowrap text-xs uppercase tracking-[0.18em] text-blue-300 sm:tracking-[0.3em]">Follow Brandon&apos;s Brands</p>
          <p className="mt-2 text-sm text-slate-300">
            Collabs:{" "}
            <a href={`mailto:${collabEmail}`} className="text-[#D9A43A] transition hover:text-[#e1b54a]">
              {collabEmail}
            </a>
          </p>
          <p className="mt-1 flex flex-wrap gap-y-1 text-sm [&>a]:whitespace-nowrap">
            <Link href="/about" className="text-blue-300 transition hover:text-blue-200">About us</Link>
            <span className="mx-2 text-slate-500">·</span>
            <Link href="/about#contact" className="text-blue-300 transition hover:text-blue-200">Contact us</Link>
            <span className="mx-2 text-slate-500">·</span>
            <Link href="/collectors" className="text-blue-300 transition hover:text-blue-200">Collectors</Link>
            <span className="mx-2 text-slate-500">·</span>
            <Link href="/learn" className="text-blue-300 transition hover:text-blue-200">Learn</Link>
          </p>
          </div>
        </div>
        {/* Phones: an even 2 x 2 grid. Larger screens: one row. */}
        <ul className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
          {socials.map((s) => (
            <li key={s.name}>
              <a
                href={s.url}
                target="_blank"
                rel="noreferrer"
                aria-label={`${s.name} ${s.handle}`}
                className="flex w-full justify-center rounded-full border sm:inline-flex sm:w-auto border-[#3FB4EC]/40 bg-gradient-to-b from-[#1A7DBF] to-[#0E5A8F] px-4 py-2 text-sm font-medium text-white shadow-[0_0_18px_rgba(30,155,215,0.25)] transition hover:border-[#5CC4F2]/70 hover:from-[#2290D6] hover:to-[#136AA6] hover:shadow-[0_0_24px_rgba(30,155,215,0.45)]"
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
