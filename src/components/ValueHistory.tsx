"use client";

import { useEffect, useMemo, useState } from "react";
import supabase from "@/lib/supabaseClient";

type Row = { watch_id: string; value: number; recorded_on: string };
type Watch = { id: string | number; brand: string; model: string };

const usd = (n: number) => n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pctText = (p: number) => `${p >= 0 ? "+" : ""}${p.toFixed(1)}%`;

// Collection value over time (from the daily value refresh), plus the biggest movers.
export default function ValueHistory({ userId, watches, className = "" }: { userId: string | null; watches: Watch[]; className?: string }) {
  const [rows, setRows] = useState<Row[] | null>(null);

  useEffect(() => {
    if (!supabase || !userId) return;
    let live = true;
    void supabase
      .from("watch_value_history")
      .select("watch_id,value,recorded_on")
      .eq("user_id", userId)
      .order("recorded_on")
      .limit(5000)
      .then(({ data }) => {
        if (live) setRows(((data ?? []) as Row[]).map((r) => ({ ...r, value: Number(r.value) })));
      });
    return () => {
      live = false;
    };
  }, [userId]);

  const { series, movers } = useMemo(() => {
    const owned = new Set(watches.map((w) => String(w.id)));
    const list = (rows ?? []).filter((r) => owned.has(r.watch_id));
    const days = [...new Set(list.map((r) => r.recorded_on))].sort();
    // Each day's total = every watch's most recent known value on or before that day.
    const last: Record<string, number> = {};
    const byDay = new Map<string, Row[]>();
    for (const r of list) byDay.set(r.recorded_on, [...(byDay.get(r.recorded_on) ?? []), r]);
    const series = days.map((d) => {
      for (const r of byDay.get(d) ?? []) last[r.watch_id] = r.value;
      return { day: d, total: Object.values(last).reduce((t, v) => t + v, 0) };
    });
    const first: Record<string, number> = {};
    const latest: Record<string, number> = {};
    for (const r of list) {
      if (!(r.watch_id in first)) first[r.watch_id] = r.value;
      latest[r.watch_id] = r.value;
    }
    const movers = watches
      .map((w) => {
        const a = first[String(w.id)];
        const b = latest[String(w.id)];
        return a && b && a !== b ? { name: `${w.brand} ${w.model}`, change: ((b - a) / a) * 100, value: b } : null;
      })
      .filter((m): m is { name: string; change: number; value: number } => Boolean(m))
      .sort((x, y) => Math.abs(y.change) - Math.abs(x.change))
      .slice(0, 4);
    return { series, movers };
  }, [rows, watches]);

  if (!userId || rows === null || !watches.length) return null;

  const W = 640;
  const H = 180;
  const vals = series.map((s) => s.total);
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = max - min || max * 0.05 || 1;
  const x = (i: number) => (series.length < 2 ? W / 2 : (i / (series.length - 1)) * W);
  const y = (v: number) => H - 12 - ((v - (min - span * 0.1)) / (span * 1.2)) * (H - 24);
  const path = series.map((s, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(s.total).toFixed(1)}`).join(" ");
  const change = series.length > 1 && series[0].total ? ((series[series.length - 1].total - series[0].total) / series[0].total) * 100 : null;
  const since = series[0] ? new Date(`${series[0].day}T12:00:00Z`).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "";

  return (
    <section className={`rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.25)] ${className}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.25em] text-slate-400">Collection value over time</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{series.length ? usd(series[series.length - 1].total) : "—"}</h2>
        </div>
        {change !== null ? (
          <p className={`text-sm font-semibold ${change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {pctText(change)} since {since}
          </p>
        ) : null}
      </div>
      {series.length > 1 ? (
        <svg viewBox={`0 0 ${W} ${H}`} className="mt-4 h-44 w-full" role="img" aria-label={`Collection value from ${usd(series[0].total)} to ${usd(series[series.length - 1].total)}`}>
          <path d={`${path} L${x(series.length - 1)},${H} L${x(0)},${H} Z`} fill="rgba(217,164,58,0.12)" />
          <path d={path} fill="none" stroke="#D9A43A" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
          <circle cx={x(series.length - 1)} cy={y(series[series.length - 1].total)} r="5" fill="#D9A43A" />
        </svg>
      ) : (
        <p className="mt-4 rounded-2xl border border-white/10 bg-black/30 p-4 text-sm text-slate-300">
          Your chart starts today. Values refresh every day, so your collection&apos;s value trend will build here over the coming weeks.
        </p>
      )}
      {movers.length ? (
        <div className="mt-5">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Biggest moves</p>
          <ul className="mt-2 grid gap-2 sm:grid-cols-2">
            {movers.map((m) => (
              <li key={m.name} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/30 px-4 py-2 text-sm">
                <span className="truncate text-slate-200">{m.name}</span>
                <span className={`shrink-0 font-semibold ${m.change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>{pctText(m.change)}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <p className="mt-4 text-[11px] text-slate-500">Estimated market values for information only, not appraisals.</p>
    </section>
  );
}
