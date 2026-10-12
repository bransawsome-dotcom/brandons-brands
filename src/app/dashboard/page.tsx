"use client";

import { parseMoney } from "@/lib/watchAiClient";
import ValueHistory from "@/components/ValueHistory";
import WelcomeTour from "@/components/WelcomeTour";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { loadCollectionData } from "@/lib/storage";
import { type Watch } from "@/lib/localData";
import { useRequireAuth } from "@/components/AuthProvider";

function formatCurrency(v?: string | number) {
  const n = typeof v === "number" ? v : parseMoney(v as string | number);
  if (isNaN(n)) return "—";
  return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function smallDate(d?: string) {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString(); } catch { return d; }
}

function ValueChart({ points }: { points: { label: string; value: number }[] }) {
  const width = 700;
  const height = 160;
  const pad = 24;
  if (!points.length) return <div className="text-muted">Not enough data for chart.</div>;

  const vals = points.map((p) => p.value);
  const max = Math.max(...vals);
  const min = Math.min(...vals);

  const pts = points.map((p, i) => {
    const x = pad + (i / Math.max(1, points.length - 1)) * (width - pad * 2);
    const y = pad + (1 - (p.value - min) / Math.max(1, max - min)) * (height - pad * 2);
    return `${x},${y}`;
  }).join(" ");

  const areaPts = `M ${pad},${height - pad} L ${pts} L ${width - pad},${height - pad} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 rounded-md bg-raised p-2">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#D9A43A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#D9A43A" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPts} fill="url(#g1)" />
      <polyline points={pts} fill="none" stroke="#D9A43A" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const x = pad + (i / Math.max(1, points.length - 1)) * (width - pad * 2);
        const y = pad + (1 - (p.value - min) / Math.max(1, max - min)) * (height - pad * 2);
        return <circle key={i} cx={x} cy={y} r={4} fill="#D9A43A" />;
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useRequireAuth();
  const [watches, setWatches] = useState<Watch[]>([]);
  const userId = user?.id ?? null;

  useEffect(() => {
    if (authLoading) return;

    loadCollectionData(userId).then((loaded) => setWatches(loaded));
  }, [authLoading, userId]);

  const totalEstimatedValue = watches.reduce((sum, watch) => sum + (parseMoney(watch.estimated_value) || 0), 0);
  const totalPurchaseCost = watches.reduce((sum, watch) => sum + (parseMoney(watch.purchase_price) || 0), 0);
  const totalProfit = totalEstimatedValue - totalPurchaseCost;
  const totalWatches = watches.length;
  const avgWatchValue = totalWatches ? Math.round(totalEstimatedValue / totalWatches) : 0;
  const mostValuable = watches.slice().sort((a, b) => (parseMoney(b.estimated_value) || 0) - (parseMoney(a.estimated_value) || 0))[0];

  const valueByBrand = useMemo(() => {
    const map: Record<string, number> = {};
    watches.forEach((watch) => {
      map[watch.brand] = (map[watch.brand] || 0) + (parseMoney(watch.estimated_value) || 0);
    });
    return Object.entries(map)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => b.value - a.value);
  }, [watches]);

  const purchaseTimeline = useMemo(() => {
    const points: Record<string, number> = {};
    watches.forEach((watch) => {
      const date = watch.purchase_date ? new Date(watch.purchase_date) : new Date();
      const month = `${date.toLocaleString(undefined, { month: "short" })} ${date.getFullYear()}`;
      points[month] = (points[month] || 0) + (parseMoney(watch.purchase_price) || 0);
    });
    return Object.entries(points)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
  }, [watches]);

  const valuesVsCost = useMemo(() => {
    return watches
      .map((watch) => ({
        label: `${watch.brand} ${watch.model}`,
        value: parseMoney(watch.estimated_value) || 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [watches]);

  const recentlyAdded = watches.slice().sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4);
  const recentlyEdited = watches
    .filter((watch) => watch.edited_at)
    .sort((a, b) => Number(new Date(b.edited_at as string)) - Number(new Date(a.edited_at as string)))
    .slice(0, 4);

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:px-16">
      <WelcomeTour />
      <div className="rounded-md border border-hairline bg-surface p-5 shadow-[0_10px_30px_rgba(43,38,32,0.08)] backdrop-blur-xl sm:p-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-gold">Dashboard</p>
            <h1 className="text-4xl font-semibold text-ink">Collection Intelligence</h1>
            <p className="max-w-2xl text-sm text-ink/80">A premium overview of the archive, performance, and activity across your Brandon&apos;s Brands collection.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/collection" className="rounded-full border border-gold/25 bg-raised px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:border-gold hover:bg-surface">
              Add Watch
            </Link>
            <Link href="/collection" className="rounded-full border border-hairline bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-surface">
              View Collection
            </Link>
            <Link href="/wishlist" className="rounded-full border border-hairline bg-surface px-5 py-3 text-sm font-semibold text-ink transition hover:-translate-y-0.5 hover:bg-surface">
              Wishlist
            </Link>
          </div>
        </div>
        {totalWatches === 0 ? (
          <div className="mt-6 rounded-[1rem] border border-hairline bg-surface p-4 text-sm text-ink/80">
            Collection statistics will appear here after you add your first watch.
          </div>
        ) : null}

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)] transition hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <p className="text-sm uppercase tracking-[0.28em] text-muted">Total Collection Value</p>
            <p className="mt-4 text-3xl font-semibold text-ink">{formatCurrency(totalEstimatedValue)}</p>
          </div>
          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)] transition hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <p className="text-sm uppercase tracking-[0.28em] text-muted">Total Purchase Cost</p>
            <p className="mt-4 text-3xl font-semibold text-ink">{formatCurrency(totalPurchaseCost)}</p>
          </div>
          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)] transition hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <p className="text-sm uppercase tracking-[0.28em] text-muted">Profit / Loss</p>
            <p className={`mt-4 text-3xl font-semibold ${totalProfit >= 0 ? "text-emerald-800" : "text-rose-700"}`}>{formatCurrency(totalProfit)}</p>
          </div>
        </div>

        <ValueHistory userId={userId} watches={watches} className="mt-6" />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)] transition hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <p className="text-sm uppercase tracking-[0.28em] text-muted">Number of Watches</p>
            <p className="mt-4 text-3xl font-semibold text-ink">{totalWatches}</p>
          </div>
          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)] transition hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <p className="text-sm uppercase tracking-[0.28em] text-muted">Average Watch Value</p>
            <p className="mt-4 text-3xl font-semibold text-ink">{formatCurrency(avgWatchValue)}</p>
          </div>
          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)] transition hover:-translate-y-0.5 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <p className="text-sm uppercase tracking-[0.28em] text-muted">Most Valuable Watch</p>
            <p className="mt-4 text-xl font-semibold text-ink">{mostValuable ? `${mostValuable.brand} ${mostValuable.model}` : "—"}</p>
            <p className="mt-2 text-sm text-muted">{mostValuable ? formatCurrency(mostValuable.estimated_value) : "No data"}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-muted">Collection Value by Brand</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">Brand Breakdown</h2>
              </div>
              <span className="rounded-full border border-hairline bg-surface px-4 py-2 text-xs uppercase tracking-[0.22em] text-ink/80">Dynamic</span>
            </div>
            <div className="mt-6 space-y-4">
              {valueByBrand.length ? valueByBrand.map((item) => (
                <div key={item.label} className="rounded-md border border-hairline bg-surface p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-ink/80">{item.label}</p>
                    <p className="text-sm font-semibold text-ink">{formatCurrency(item.value)}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface">
                    <div className="h-2 rounded-full bg-gold" style={{ width: `${Math.min(100, (item.value / Math.max(1, valueByBrand[0].value)) * 100)}%` }} />
                  </div>
                </div>
              )) : <p className="text-muted">No brand value data available.</p>}
            </div>
          </div>

          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <p className="text-sm uppercase tracking-[0.25em] text-muted">Quick Actions</p>
            <div className="mt-6 space-y-4">
              <Link href="/collection" className="block rounded-md border border-gold/20 bg-surface px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-gold hover:bg-surface">
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Add Watch</p>
                <p className="mt-2 text-lg font-semibold text-ink">Curate a new luxury piece</p>
              </Link>
              <Link href="/collection" className="block rounded-md border border-hairline bg-surface px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-surface">
                <p className="text-sm uppercase tracking-[0.22em] text-muted">View Collection</p>
                <p className="mt-2 text-lg font-semibold text-ink">Explore every watch in the archive</p>
              </Link>
              <Link href="/wishlist" className="block rounded-md border border-hairline bg-surface px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-hairline-strong hover:bg-surface">
                <p className="text-sm uppercase tracking-[0.22em] text-muted">Wishlist</p>
                <p className="mt-2 text-lg font-semibold text-ink">Review future acquisitions</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-muted">Purchase Timeline</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">Cost Evolution</h2>
              </div>
              <span className="rounded-full border border-hairline bg-surface px-4 py-2 text-xs uppercase tracking-[0.22em] text-ink/80">Historical</span>
            </div>
            <div className="mt-6">
              <ValueChart points={purchaseTimeline} />
            </div>
          </div>

          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-muted">Value vs Purchase Price</p>
              <h2 className="mt-2 text-2xl font-semibold text-ink">Estimated vs Cost</h2>
            </div>
            <div className="mt-6">
              <ValueChart points={valuesVsCost} />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <p className="text-sm uppercase tracking-[0.25em] text-muted">Recently Added</p>
            <div className="mt-6 space-y-4">
              {recentlyAdded.length ? recentlyAdded.map((watch) => (
                <div key={watch.id} className="rounded-md border border-hairline bg-surface p-4 transition hover:bg-surface">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-ink/80">{watch.brand}</p>
                      <p className="text-lg font-semibold text-ink">{watch.model}</p>
                    </div>
                    <span className="rounded-full bg-gold/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gold">New</span>
                  </div>
                  <p className="mt-3 text-sm text-muted">Added {smallDate(watch.purchase_date)}</p>
                </div>
              )) : <p className="text-muted">No recently added watches yet.</p>}
            </div>
          </div>

          <div className="rounded-md border border-hairline bg-raised p-6 shadow-[0_10px_30px_rgba(43,38,32,0.08)]">
            <p className="text-sm uppercase tracking-[0.25em] text-muted">Recently Edited</p>
            <div className="mt-6 space-y-4">
              {recentlyEdited.length ? recentlyEdited.map((watch) => (
                <div key={watch.id} className="rounded-md border border-hairline bg-surface p-4 transition hover:bg-surface">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-ink/80">{watch.brand}</p>
                      <p className="text-lg font-semibold text-ink">{watch.model}</p>
                    </div>
                    <span className="rounded-full bg-surface px-3 py-1 text-xs uppercase tracking-[0.18em] text-ink">Edited</span>
                  </div>
                  <p className="mt-3 text-sm text-muted">Updated {smallDate(watch.edited_at)}</p>
                </div>
              )) : <p className="text-muted">No recently edited watches yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
