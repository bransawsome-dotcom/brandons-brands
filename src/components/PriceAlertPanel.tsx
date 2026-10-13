"use client";

import { Fragment, useState } from "react";
import type { WishlistItem } from "@/lib/localData";
import type { PriceMatch } from "@/lib/priceAlertsClient";
import { formatUsd } from "@/lib/watchAiClient";
import Glyph from "@/components/Glyph";

function hasTarget(item: WishlistItem) {
  const n = parseFloat(String(item.target_price ?? "").replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) && n > 0;
}

function when(iso: string) {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// The "Price alert" box on a wishlist card: on/off switch, last check, matching listings and "Check now".
export default function PriceAlertPanel({
  item,
  matches,
  onToggle,
  onCheck,
  onDismiss,
  checking,
}: {
  item: WishlistItem;
  matches: PriceMatch[];
  onToggle: (on: boolean) => Promise<void>;
  onCheck: () => Promise<void>;
  onDismiss: (id: string) => Promise<void>;
  checking: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [showAll, setShowAll] = useState(false);
  const on = Boolean(item.price_alert);
  const target = hasTarget(item);
  const shown = showAll ? matches : matches.slice(0, 3);

  const toggle = async () => {
    setBusy(true);
    try {
      await onToggle(!on);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`mt-5 rounded border p-4 ${on ? "border-gold/40 bg-gold/15" : "border-hairline bg-surface"}`}>
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
            <Glyph e={on ? "🔔" : "🔕"} className="text-gold" /> Price alert
          </p>
          <p className="mt-0.5 text-xs text-muted">
            {!target
              ? "Add a target price (Edit) to turn this on."
              : on
                ? `Searching daily for ${formatUsd(item.target_price)} or less.`
                : `Get alerted when it's listed for ${formatUsd(item.target_price)} or less.`}
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label="Price alert"
          disabled={busy || (!target && !on)}
          onClick={toggle}
          className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:opacity-40 ${on ? "bg-gold" : "bg-hairline"}`}
        >
          <span className={`absolute top-1 h-5 w-5 rounded-full bg-surface shadow transition-all ${on ? "left-6" : "left-1"}`} />
        </button>
      </div>

      {on && target ? (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
          <span>{item.alert_checked_at ? `Last checked ${when(item.alert_checked_at)}` : "First check within a day"}</span>
          <button
            type="button"
            onClick={onCheck}
            disabled={checking}
            className="rounded-full border border-gold/40 px-3 py-1 font-semibold text-gold transition hover:bg-gold/20 disabled:opacity-60"
          >
            {checking ? "Searching… up to a minute" : "Check now"}
          </button>
        </div>
      ) : null}

      {matches.length ? (
        <ul className="mt-3 space-y-2">
          {shown.map((m) => (
            <li key={m.id} className="rounded-xl border border-emerald-400/25 bg-emerald-500/5 p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <a href={m.url} target="_blank" rel="noopener noreferrer" className="min-w-0 font-semibold text-emerald-800 hover:underline">
                  {formatUsd(m.price_usd)}
                  {m.currency !== "USD" && m.price ? <span className="font-normal text-muted"> ({m.currency} {Math.round(m.price).toLocaleString("en-US")})</span> : null}
                  <span className="font-normal text-ink/80"> · {m.marketplace}</span>
                </a>
                <button type="button" onClick={() => onDismiss(m.id)} aria-label="Dismiss" className="shrink-0 text-muted hover:text-ink">
                  ✕
                </button>
              </div>
              <p className="mt-1 text-xs leading-5 text-ink/80">
                {[
                  m.location ? (
                    <>
                      <Glyph e="📍" size={12} className="mr-0.5" />
                      {m.location}
                    </>
                  ) : null,
                  m.seller && m.seller !== m.marketplace ? m.seller : "",
                  m.condition,
                  m.box_papers,
                ]
                  .filter(Boolean)
                  .map((part, i) => (
                    <Fragment key={i}>
                      {i ? " · " : ""}
                      {part}
                    </Fragment>
                  ))}
              </p>
              <p className="mt-0.5 text-[11px] text-muted">Found {when(m.found_at)}</p>
            </li>
          ))}
          {matches.length > 3 ? (
            <li>
              <button type="button" onClick={() => setShowAll((v) => !v)} className="text-xs font-semibold text-gold hover:text-gold">
                {showAll ? "Show fewer" : `Show all ${matches.length}`}
              </button>
            </li>
          ) : null}
          <li className="text-[11px] leading-4 text-muted">Asking prices from public listings. Always verify the seller, reference and box &amp; papers.</li>
        </ul>
      ) : null}
    </div>
  );
}
