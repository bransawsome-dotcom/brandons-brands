import type { Metadata } from "next";
import Link from "next/link";
import { loadFavorites } from "@/lib/favorites";

// A sample collection anyone can click through before signing up, so the free tools show their value first.
// Uses watches from Brandon's Favorites for the photos; every figure is an example, and the page says so.
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Try the Free Watch Collection Tracker | Brandon's Brands",
  description: "See how the free Brandon's Brands collection tracker works with a sample collection: photos, box and papers, and value estimates updated daily.",
  alternates: { canonical: "/demo" },
  robots: { index: false, follow: true },
};

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
// Example figures only (not prices for these watches).
const EXAMPLES = [
  { paid: 4200, value: 4650, box: true, papers: true },
  { paid: 980, value: 1050, box: true, papers: false },
  { paid: 7400, value: 8000, box: true, papers: true },
  { paid: 650, value: 610, box: false, papers: false },
  { paid: 2300, value: 2550, box: true, papers: true },
  { paid: 1500, value: 1620, box: true, papers: true },
];

export default async function DemoPage() {
  const favorites = (await loadFavorites()).filter((f) => f.image_url).slice(0, 6);
  const watches = favorites.map((f, i) => ({ ...EXAMPLES[i % EXAMPLES.length], id: f.id, brand: f.brand, model: f.model, image: f.image_url! }));
  const paid = watches.reduce((s, w) => s + w.paid, 0);
  const value = watches.reduce((s, w) => s + w.value, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <p role="note" className="mb-8 border border-gold/40 bg-raised px-5 py-3 text-sm text-ink/80">
        <span className="font-semibold text-gold">Sample collection.</span> This is an example so you can see how the tracker works. The figures are made up for
        illustration. Your own collection is private unless you choose to share it.
      </p>
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <span aria-hidden className="block h-px w-10 bg-gold" />
          <p className="mt-4 text-xs uppercase tracking-[0.3em] text-gold">The Vault · sample</p>
          <h1 className="mt-3 font-display text-5xl font-semibold uppercase leading-[1.05] text-ink sm:text-6xl">
            Your collection, <span className="font-light text-gold">kept.</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-ink/80">
            Add a watch by brand and model and the photo, specs, retail price and market value fill in on their own. Values update every day.
          </p>
        </div>
        <dl className="grid w-full grid-cols-3 gap-2 text-center sm:w-auto sm:gap-3">
          {[
            ["Watches", String(watches.length)],
            ["Paid", usd(paid)],
            ["Est. value", usd(value)],
          ].map(([k, v]) => (
            <div key={k} className="min-w-0 rounded-md border border-hairline bg-raised px-2 py-3 shadow-card sm:px-4">
              <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">{k}</dt>
              <dd className="mt-1 font-display text-base font-semibold text-ink sm:text-xl">{v}</dd>
            </div>
          ))}
        </dl>
      </header>

      {watches.length ? (
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {watches.map((w) => {
            const change = w.value - w.paid;
            return (
              <li key={w.id} className="overflow-hidden rounded-md border border-hairline bg-raised shadow-card">
                <div className="flex h-56 items-center justify-center bg-surface p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={w.image} alt={`${w.brand} ${w.model}`} loading="lazy" className="h-full w-full object-contain" />
                </div>
                <div className="p-6">
                  <p className="text-xs uppercase tracking-[0.25em] text-gold">{w.brand}</p>
                  <h2 className="mt-2 font-display text-2xl font-semibold text-ink">{w.model}</h2>
                  <p className="mt-2 text-xs text-muted">
                    {[w.box && "Box", w.papers && "Papers"].filter(Boolean).join(" & ") || "Watch only"}
                  </p>
                  <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-hairline pt-4">
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">Example value</dt>
                      <dd className="mt-1 font-display text-xl font-semibold text-ink">{usd(w.value)}</dd>
                    </div>
                    <div>
                      <dt className="text-[10px] uppercase tracking-[0.2em] text-muted">Since bought</dt>
                      <dd className={`mt-1 font-display text-xl font-semibold ${change >= 0 ? "text-emerald-800" : "text-rose-700"}`}>
                        {change >= 0 ? "+" : "−"}
                        {usd(Math.abs(change))}
                      </dd>
                    </div>
                  </dl>
                </div>
              </li>
            );
          })}
        </ul>
      ) : null}

      <section className="mt-12 rounded-md border p-8 text-center shadow-card bb-sheen sm:p-12">
        <h2 className="font-display text-3xl font-semibold uppercase text-ink sm:text-4xl">
          Start your own, <span className="font-light text-gold">free</span>
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-lg leading-7 text-ink/80">A private vault for your watches, a wishlist with price alerts, and daily value estimates.</p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href="/signup" className="inline-flex min-h-12 items-center bg-navy px-8 text-xs font-semibold uppercase tracking-[0.2em] text-on-navy transition hover:bg-navy-deep">
            Create a free account
          </Link>
          <Link href="/learn/how-to-start-a-watch-collection" className="text-xs font-semibold uppercase tracking-[0.2em] text-gold hover:text-gold-bright">
            How to start a collection →
          </Link>
        </div>
      </section>
    </div>
  );
}
