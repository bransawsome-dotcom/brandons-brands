"use client";

import type { Watch } from "@/lib/localData";
import { formatUsd } from "@/lib/watchAiClient";

function toNumber(value?: string | null) {
  const n = parseFloat(value ?? "");
  return Number.isFinite(n) ? n : null;
}

// Prices and specs for one watch: purchase, retail at purchase (locked), today's retail, market value.
export default function WatchValuePanel({ watch, compact = false }: { watch: Watch; compact?: boolean }) {
  const paid = toNumber(watch.purchase_price);
  const market = toNumber(watch.estimated_value);
  const change = paid !== null && market !== null && paid > 0 ? (market - paid) / paid : null;
  const d = watch.details ?? {};
  const range =
    typeof d.market_value_low === "number" && typeof d.market_value_high === "number"
      ? `${formatUsd(d.market_value_low)} – ${formatUsd(d.market_value_high)}`
      : null;

  const rows: { label: string; value: string; note?: string }[] = [
    { label: "You paid", value: formatUsd(watch.purchase_price), note: watch.purchase_date || undefined },
    {
      label: "Retail at purchase",
      value: formatUsd(watch.retail_price),
      note: watch.retail_price ? d.retail_price_date_note || "Locked to purchase date" : undefined,
    },
    { label: "Retail today", value: formatUsd(watch.current_retail_price) },
    { label: "Est. market value", value: formatUsd(watch.estimated_value), note: range ?? undefined },
  ];

  const specs = [
    ["Case", [d.case_size_mm, d.case_material].filter(Boolean).join(", ")],
    ["Movement", d.movement],
    ["Water resistance", d.water_resistance],
    ["Introduced", d.year_introduced],
  ].filter(([, v]) => v) as [string, string][];

  return (
    <div className="space-y-4">
      <dl className={`grid gap-3 ${compact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"}`}>
        {rows.map((row) => (
          <div key={row.label} className="rounded-2xl border border-white/10 bg-slate-950/70 p-3">
            <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">{row.label}</dt>
            <dd className="mt-1 text-lg font-semibold text-white">{row.value}</dd>
            {row.note ? <dd className="mt-0.5 text-xs text-slate-400">{row.note}</dd> : null}
          </div>
        ))}
      </dl>

      {change !== null ? (
        <p className={`text-sm font-semibold ${change >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
          {change >= 0 ? "▲" : "▼"} {Math.abs(change * 100).toFixed(0)}% vs. what you paid
        </p>
      ) : null}

      {!compact && specs.length ? (
        <dl className="grid gap-x-6 gap-y-1 text-sm text-slate-300 sm:grid-cols-2">
          {specs.map(([k, v]) => (
            <div key={k}>
              <dt className="inline font-semibold text-white">{k}: </dt>
              <dd className="inline">{v}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {!compact && d.summary ? <p className="text-sm leading-6 text-slate-300">{d.summary}</p> : null}

      {!compact && (d.sources?.length || watch.value_updated_at) ? (
        <p className="text-xs leading-5 text-slate-500">
          {watch.value_updated_at ? `Prices checked ${new Date(watch.value_updated_at).toLocaleDateString("en-US")}. ` : ""}
          Estimates from public listings, not an appraisal.
          {d.sources?.length ? " Sources: " : ""}
          {d.sources?.slice(0, 4).map((url, i) => {
            let host = url;
            try {
              host = new URL(url).hostname.replace(/^www\./, "");
            } catch {}
            return (
              <span key={url}>
                {i ? ", " : ""}
                <a href={url} target="_blank" rel="noreferrer" className="underline hover:text-slate-300">
                  {host}
                </a>
              </span>
            );
          })}
        </p>
      ) : null}
    </div>
  );
}
