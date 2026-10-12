import { facebookGroup } from "@/lib/socials";

// "Join the Facebook group" banner, from the Brandon's Brands Graphics design (Claude Design).
// Built in HTML rather than as an image so it stays sharp and readable at phone width.
export default function FacebookGroupBanner({ className = "" }: { className?: string }) {
  return (
    <section
      aria-label="Facebook group"
      className={`relative overflow-hidden rounded-[1.75rem] border-2 border-[#2A5683] bg-[#0B1B30] px-6 py-8 sm:px-10 sm:py-10 ${className}`}
    >
      <svg aria-hidden="true" className="pointer-events-none absolute -right-24 top-1/2 h-[420px] w-[420px] -translate-y-1/2" viewBox="0 0 420 420" fill="none">
        <circle cx="210" cy="210" r="205" stroke="#163352" strokeWidth="2" />
        <circle cx="210" cy="210" r="168" stroke="#163352" strokeWidth="2" />
      </svg>
      <div className="relative flex flex-col items-center gap-6 text-center md:flex-row md:text-left">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-256.webp" alt="" width={128} height={128} className="h-24 w-24 shrink-0 object-contain sm:h-32 sm:w-32" />
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-bold uppercase tracking-[0.3em] text-[#7CC8F0] sm:text-xs">Facebook group · 6,600+ collectors</p>
          <h2 className="font-display mt-2 text-2xl font-bold leading-tight text-white sm:text-4xl">{facebookGroup.name}</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">Wrist checks, hidden gems and watch fair news, hosted by Brandon.</p>
        </div>
        <a
          href={facebookGroup.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 shrink-0 items-center rounded-full bg-[#D9A43A] px-7 text-base font-bold text-[#0B1420] transition hover:bg-[#E8BC5C]"
        >
          Join the group ↗
        </a>
      </div>
    </section>
  );
}
