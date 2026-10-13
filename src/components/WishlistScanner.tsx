"use client";

import { ChangeEvent, useState } from "react";
import type { WishlistItem } from "@/lib/localData";
import { lookupWatchDetails, scanCollectionPhoto, type ScannedWatch } from "@/lib/watchAiClient";
import { applyWishlistLookup } from "@/lib/watchBuild";

type Row = ScannedWatch & { selected: boolean; priority: string };

const PRIORITIES = ["High", "Medium", "Low"];

// Upload a photo of a wishlist → review what was read → add the selected watches,
// each auto-filled with photo, specs, today's retail price and market value.
export default function WishlistScanner({ onAdd }: { onAdd: (items: WishlistItem[]) => Promise<void> }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    setError(null);
    setRows([]);
    setBusy(true);
    setStatus("Reading your wishlist…");
    try {
      const found = await scanCollectionPhoto(file, "wishlist");
      setRows(found.map((w) => ({ ...w, selected: true, priority: /top pick|#\s*1\b|must[- ]have|grail|high/i.test(w.notes) ? "High" : "Medium" })));
      setStatus(found.length ? `Found ${found.length} watch${found.length === 1 ? "" : "es"}. Check them, then add.` : null);
      if (!found.length) setError("No watches found in that photo. Try a clearer, closer shot.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't read that photo.");
      setStatus(null);
    } finally {
      setBusy(false);
    }
  };

  const updateRow = (index: number, patch: Partial<Row>) =>
    setRows((current) => current.map((row, i) => (i === index ? { ...row, ...patch } : row)));

  const handleAdd = async () => {
    const chosen = rows.filter((r) => r.selected && r.brand.trim() && r.model.trim());
    if (!chosen.length) return;
    setBusy(true);
    setError(null);
    const added: WishlistItem[] = [];
    const failed: string[] = [];
    const start = Date.now();
    for (const [i, row] of chosen.entries()) {
      setStatus(`Looking up ${row.brand} ${row.model} (${i + 1} of ${chosen.length})… about a minute each.`);
      const base: WishlistItem = {
        // Numeric ids keep the wishlist's newest-first sort working.
        id: String(start + i),
        brand: row.brand.trim(),
        model: row.model.trim(),
        reference_number: row.reference_number.trim(),
        target_price: row.purchase_price != null ? String(row.purchase_price) : "",
        notes: row.notes.trim(),
        priority: row.priority,
      };
      try {
        const lookup = await lookupWatchDetails({ brand: base.brand, model: base.model, reference_number: base.reference_number || undefined });
        added.push(applyWishlistLookup(base, lookup));
      } catch {
        failed.push(`${row.brand} ${row.model}`);
        added.push(base);
      }
    }
    await onAdd(added);
    setRows([]);
    setBusy(false);
    setStatus(`Added ${added.length} watch${added.length === 1 ? "" : "es"} to your wishlist.`);
    if (failed.length) setError(`Couldn't find prices for: ${failed.join(", ")}. They were added without them — use Auto-fill on the card to try again.`);
  };

  const input = "w-full rounded-xl border border-hairline bg-raised px-3 py-2 text-sm text-ink outline-none focus:border-gold/70";

  return (
    <div className="rounded-md border border-gold/40 bg-raised shadow-card p-5 sm:p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Scan a list</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">Add your whole wishlist from one photo</h2>
      <p className="mt-2 text-sm leading-6 text-ink/80">
        Snap a photo of your wishlist (handwritten, printed, a notes screenshot or a dealer listing). We&apos;ll read each watch and
        fill in its photo, details, today&apos;s retail price and market value. A price written next to a watch becomes your target price.
      </p>

      <label
        className={`mt-4 inline-flex cursor-pointer rounded-full bg-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep ${busy ? "pointer-events-none opacity-60" : ""}`}
      >
        {busy && !rows.length ? "Reading…" : "Choose photo"}
        <input type="file" accept="image/*" onChange={handleFile} className="sr-only" disabled={busy} />
      </label>

      {status ? <p className="mt-4 text-sm text-ink">{status}</p> : null}
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}

      {rows.length ? (
        <div className="mt-4 space-y-3">
          <div className="hidden px-3 text-[11px] uppercase tracking-[0.15em] text-muted sm:grid sm:grid-cols-[auto_1fr_1fr_1fr_1fr_auto] sm:gap-2">
            <span className="w-5" />
            <span>Brand</span>
            <span>Model</span>
            <span>Reference</span>
            <span>Target price</span>
            <span className="w-24">Priority</span>
          </div>
          {rows.map((row, i) => (
            <div key={i} className="grid gap-2 rounded border border-hairline bg-raised shadow-card p-3 sm:grid-cols-[auto_1fr_1fr_1fr_1fr_auto] sm:items-center">
              <input
                type="checkbox"
                checked={row.selected}
                onChange={(e) => updateRow(i, { selected: e.target.checked })}
                aria-label={`Add ${row.brand} ${row.model}`}
                className="h-5 w-5 accent-gold"
              />
              <input className={input} value={row.brand} onChange={(e) => updateRow(i, { brand: e.target.value })} placeholder="Brand" aria-label="Brand" />
              <input className={input} value={row.model} onChange={(e) => updateRow(i, { model: e.target.value })} placeholder="Model" aria-label="Model" />
              <input className={input} value={row.reference_number} onChange={(e) => updateRow(i, { reference_number: e.target.value })} placeholder="Reference" aria-label="Reference" />
              <input
                className={input}
                type="number"
                value={row.purchase_price ?? ""}
                onChange={(e) => updateRow(i, { purchase_price: e.target.value ? Number(e.target.value) : null })}
                placeholder="Target $"
                aria-label="Target price"
              />
              <select className={`${input} sm:w-24`} value={row.priority} onChange={(e) => updateRow(i, { priority: e.target.value })} aria-label="Priority">
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy || !rows.some((r) => r.selected)}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep disabled:opacity-60"
          >
            {busy ? "Adding…" : `Add ${rows.filter((r) => r.selected).length} to wishlist`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
