import { facebookGroup } from "@/lib/socials";

// "Join the Facebook group" banner, in the site's dark luxury style.
export default function FacebookGroupBanner({ className = "" }: { className?: string }) {
  return (
    <section aria-labelledby="fb-group" className={`border border-hairline bg-surface px-6 py-9 sm:px-10 ${className}`}>
      <div className="flex flex-col items-start gap-6 md:flex-row md:items-center">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-[0.2em] text-gold">Facebook group · 6,600+ collectors</p>
          <h2 id="fb-group" className="mt-2 font-display text-[36px] font-semibold uppercase leading-none text-ink sm:text-[44px]">
            {facebookGroup.name.replace(/ Watches$/, "")} <span className="font-light text-gold">Watches</span>
          </h2>
          <p className="mt-3 text-muted">Wrist checks, hidden gems and watch fair news, hosted by Brandon.</p>
        </div>
        <a
          href={facebookGroup.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[52px] shrink-0 items-center border border-ink px-7 text-xs font-semibold uppercase tracking-[0.2em] text-ink transition hover:border-gold hover:text-gold-bright"
        >
          Join the group ↗
        </a>
      </div>
    </section>
  );
}
