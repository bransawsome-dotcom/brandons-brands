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
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-40">
      <defs>
        <linearGradient id="g1" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#D9A43A" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#D9A43A" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={areaPts} fill="url(#g1)" />
      <polyline points={pts} fill="none" stroke="#D9A43A" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => {
        const x = pad + (i / Math.max(1, points.length - 1)) * (width - pad * 2);
        const y = pad + (1 - (p.value - min) / Math.max(1, max - min)) * (height - pad * 2);
        return <circle key={i} cx={x} cy={y} r={3.5} fill="#D9A43A" />;
      })}
    </svg>
  );
}

export default function DashboardPage() {
  const watches = useMemo<Watch[]>(() => loadCollection(), []);

  const totalValue = watches.reduce((s, w) => s + (parseFloat(w.estimated_value || "0") || 0), 0);
  const totalWatches = watches.length;
  const avgValue = totalWatches ? Math.round(totalValue / totalWatches) : 0;

  const favoriteBrand = useMemo(() => {
    const map: Record<string, number> = {};
    for (const w of watches) map[w.brand] = (map[w.brand] || 0) + 1;
    const entries = Object.entries(map).sort((a, b) => b[1] - a[1]);
    return entries[0]?.[0] ?? "—";
  }, [watches]);

  // Chart: group by month-year and cumulative estimated value
  const chartPoints = useMemo(() => {
    const byMonth: Record<string, number> = {};
    const items = watches
      .map((w) => ({
        date: w.purchase_date || new Date(parseInt(w.id || "0")).toISOString(),
        val: parseFloat(w.estimated_value || "0") || 0,
      }))
      .filter((x) => x.date)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (const it of items) {
      const d = new Date(it.date);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth[key] = (byMonth[key] || 0) + it.val;
    }

    const keys = Object.keys(byMonth).sort();
    let cum = 0;
    return keys.map((k) => { cum += byMonth[k]; return { label: k, value: Math.round(cum) }; });
  }, [watches]);

  const mostValuable = watches.slice().sort((a, b) => (parseFloat(b.estimated_value || "0") || 0) - (parseFloat(a.estimated_value || "0") || 0))[0];

  const recentlyAdded = watches.slice().sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 4);

  const recentActivity = watches.slice().sort((a, b) => Number(b.id) - Number(a.id)).slice(0, 6).map((w) => ({
    id: w.id,
    message: `Added ${w.brand} ${w.model}`,
    date: new Date(Number(w.id)).toLocaleString(),
  }));

  return (
    <div className="mx-auto w-full max-w-7xl px-6 py-16 sm:px-10 lg:px-16">
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Total Collection Value</p>
          <div className="mt-3 text-2xl font-bold text-white">{formatCurrency(totalValue)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Total Watches</p>
          <div className="mt-3 text-2xl font-bold text-white">{totalWatches}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Average Watch Value</p>
          <div className="mt-3 text-2xl font-bold text-white">{formatCurrency(avgValue)}</div>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Favorite Brand</p>
          <div className="mt-3 text-2xl font-bold text-white">{favoriteBrand}</div>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Collection Value Over Time</p>
          <div className="mt-4">
            <ValueChart points={chartPoints} />
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Most Valuable Watch</p>
          {mostValuable ? (
            <div className="mt-4 flex gap-4">
              <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg bg-slate-950/90">
                {mostValuable.image_url ? <img src={mostValuable.image_url} alt={`${mostValuable.brand} ${mostValuable.model}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">No image</div>}
              </div>
              <div>
                <div className="text-sm text-slate-300">{mostValuable.brand}</div>
                <div className="mt-1 text-lg font-semibold text-white">{mostValuable.model}</div>
                <div className="mt-2 text-sm text-slate-300">{formatCurrency(mostValuable.estimated_value)}</div>
              </div>
            </div>
          ) : (
            <div className="mt-4 text-slate-400">No watches yet.</div>
          )}
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Recently Added Watches</p>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {recentlyAdded.length ? recentlyAdded.map((w) => (
              <Link key={w.id} href={`/collection/${w.id}`} className="flex items-center gap-4 rounded-lg border border-white/6 p-3 hover:bg-white/5">
                <div className="h-16 w-16 overflow-hidden rounded-md bg-slate-950/90">
                  {w.image_url ? <img src={w.image_url} alt={`${w.brand} ${w.model}`} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-slate-400">No image</div>}
                </div>
                <div>
                  <div className="text-sm text-slate-300">{w.brand}</div>
                  <div className="text-white">{w.model}</div>
                  <div className="text-xs text-slate-400">Added {smallDate(new Date(Number(w.id)).toISOString())}</div>
                </div>
              </Link>
            )) : <div className="text-slate-400">No recent additions.</div>}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.25em] text-blue-300">Recent Activity</p>
          <div className="mt-4 space-y-3">
            {recentActivity.length ? recentActivity.map((a) => (
              <div key={a.id} className="text-sm text-slate-300">
                <div className="text-white">{a.message}</div>
                <div className="text-xs text-slate-400">{a.date}</div>
              </div>
            )) : <div className="text-slate-400">No recent activity.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}
