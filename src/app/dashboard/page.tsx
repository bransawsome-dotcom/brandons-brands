"use client";

import Link from "next/link";
import { useMemo } from "react";
import { loadCollection, type Watch } from "@/lib/localData";

function formatCurrency(v?: string | number) {
  const n = typeof v === "number" ? v : parseFloat(String(v || "0"));
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
  if (!points.length) return <div className="text-slate-400">Not enough data for chart.</div>;

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
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40 rounded-3xl bg-slate-950/90 p-2">
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
  const watches = useMemo<Watch[]>(() => loadCollection(), []);

  const totalEstimatedValue = watches.reduce((sum, watch) => sum + (parseFloat(watch.estimated_value || "0") || 0), 0);
  const totalPurchaseCost = watches.reduce((sum, watch) => sum + (parseFloat(watch.purchase_price || "0") || 0), 0);
  const totalProfit = totalEstimatedValue - totalPurchaseCost;
  const totalWatches = watches.length;
  const avgWatchValue = totalWatches ? Math.round(totalEstimatedValue / totalWatches) : 0;
  const mostValuable = watches.slice().sort((a, b) => (parseFloat(b.estimated_value || "0") || 0) - (parseFloat(a.estimated_value || "0") || 0))[0];

  const valueByBrand = useMemo(() => {
    const map: Record<string, number> = {};
    watches.forEach((watch) => {
      map[watch.brand] = (map[watch.brand] || 0) + (parseFloat(watch.estimated_value || "0") || 0);
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
      points[month] = (points[month] || 0) + (parseFloat(watch.purchase_price || "0") || 0);
    });
    return Object.entries(points)
      .map(([label, value]) => ({ label, value }))
      .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());
  }, [watches]);

  const valuesVsCost = useMemo(() => {
    return watches
      .map((watch) => ({
        label: `${watch.brand} ${watch.model}`,
        value: parseFloat(watch.estimated_value || "0") || 0,
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
    <div className="mx-auto w-full max-w-7xl px-6 py-12 sm:px-10 lg:px-16">
      <div className="rounded-[2rem] border border-white/10 bg-gradient-to-br from-slate-900/90 via-black/70 to-slate-950/95 p-8 shadow-[0_30px_80px_rgba(0,0,0,0.45)] backdrop-blur-xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-[0.35em] text-[#D9A43A]">Dashboard</p>
            <h1 className="text-4xl font-semibold text-white">Collection Intelligence</h1>
            <p className="max-w-2xl text-sm text-slate-300">A premium overview of the archive, performance, and activity across Brandon’s curated timepieces.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <Link href="/collection" className="rounded-full border border-[#D9A43A]/25 bg-[#0f172a] px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:border-[#D9A43A] hover:bg-[#111827]">
              Add Watch
            </Link>
            <Link href="/collection" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10">
              View Collection
            </Link>
            <Link href="/wishlist" className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-white/10">
              Wishlist
            </Link>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_78px_rgba(0,0,0,0.3)]">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Total Collection Value</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(totalEstimatedValue)}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_78px_rgba(0,0,0,0.3)]">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Total Purchase Cost</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(totalPurchaseCost)}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_78px_rgba(0,0,0,0.3)]">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Profit / Loss</p>
            <p className={`mt-4 text-3xl font-semibold ${totalProfit >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{formatCurrency(totalProfit)}</p>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_78px_rgba(0,0,0,0.3)]">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Number of Watches</p>
            <p className="mt-4 text-3xl font-semibold text-white">{totalWatches}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_78px_rgba(0,0,0,0.3)]">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Average Watch Value</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatCurrency(avgWatchValue)}</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] transition hover:-translate-y-0.5 hover:shadow-[0_26px_78px_rgba(0,0,0,0.3)]">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Most Valuable Watch</p>
            <p className="mt-4 text-xl font-semibold text-white">{mostValuable ? `${mostValuable.brand} ${mostValuable.model}` : "—"}</p>
            <p className="mt-2 text-sm text-slate-400">{mostValuable ? formatCurrency(mostValuable.estimated_value) : "No data"}</p>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Collection Value by Brand</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Brand Breakdown</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">Dynamic</span>
            </div>
            <div className="mt-6 space-y-4">
              {valueByBrand.length ? valueByBrand.map((item) => (
                <div key={item.label} className="rounded-3xl border border-white/10 bg-black/30 p-4">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm text-slate-300">{item.label}</p>
                    <p className="text-sm font-semibold text-white">{formatCurrency(item.value)}</p>
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/5">
                    <div className="h-2 rounded-full bg-[#D9A43A]" style={{ width: `${Math.min(100, (item.value / Math.max(1, valueByBrand[0].value)) * 100)}%` }} />
                  </div>
                </div>
              )) : <p className="text-slate-400">No brand value data available.</p>}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Quick Actions</p>
            <div className="mt-6 space-y-4">
              <Link href="/collection" className="block rounded-3xl border border-[#D9A43A]/20 bg-[#111827] px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-[#D9A43A] hover:bg-[#1f2937]">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Add Watch</p>
                <p className="mt-2 text-lg font-semibold text-white">Curate a new luxury piece</p>
              </Link>
              <Link href="/collection" className="block rounded-3xl border border-white/10 bg-[#111827] px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#1f2937]">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">View Collection</p>
                <p className="mt-2 text-lg font-semibold text-white">Explore every watch in the archive</p>
              </Link>
              <Link href="/wishlist" className="block rounded-3xl border border-white/10 bg-[#111827] px-5 py-4 text-left transition hover:-translate-y-0.5 hover:border-white/20 hover:bg-[#1f2937]">
                <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Wishlist</p>
                <p className="mt-2 text-lg font-semibold text-white">Review future acquisitions</p>
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Purchase Timeline</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Cost Evolution</h2>
              </div>
              <span className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.22em] text-slate-300">Historical</span>
            </div>
            <div className="mt-6">
              <ValueChart points={purchaseTimeline} />
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <div>
              <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Value vs Purchase Price</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Estimated vs Cost</h2>
            </div>
            <div className="mt-6">
              <ValueChart points={valuesVsCost} />
            </div>
          </div>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Recently Added</p>
            <div className="mt-6 space-y-4">
              {recentlyAdded.length ? recentlyAdded.map((watch) => (
                <div key={watch.id} className="rounded-3xl border border-white/10 bg-black/30 p-4 transition hover:bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-300">{watch.brand}</p>
                      <p className="text-lg font-semibold text-white">{watch.model}</p>
                    </div>
                    <span className="rounded-full bg-[#D9A43A]/15 px-3 py-1 text-xs uppercase tracking-[0.18em] text-[#D9A43A]">New</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Added {smallDate(watch.purchase_date)}</p>
                </div>
              )) : <p className="text-slate-400">No recently added watches yet.</p>}
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)]">
            <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Recently Edited</p>
            <div className="mt-6 space-y-4">
              {recentlyEdited.length ? recentlyEdited.map((watch) => (
                <div key={watch.id} className="rounded-3xl border border-white/10 bg-black/30 p-4 transition hover:bg-white/5">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-300">{watch.brand}</p>
                      <p className="text-lg font-semibold text-white">{watch.model}</p>
                    </div>
                    <span className="rounded-full bg-slate-700/70 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-200">Edited</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-400">Updated {smallDate(watch.edited_at)}</p>
                </div>
              )) : <p className="text-slate-400">No recently edited watches yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
