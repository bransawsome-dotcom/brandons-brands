"use client";

import { ChangeEvent, useState } from "react";
import type { Watch } from "@/lib/localData";
import { lookupWatchDetails, scanCollectionPhoto, type ScannedWatch } from "@/lib/watchAiClient";
import { applyLookup, newWatchId, slugFor } from "@/lib/watchBuild";

type Row = ScannedWatch & { selected: boolean };

// Upload a photo of a collection list → review what was read → add the selected
// watches, each auto-filled with specs and prices.
export default function CollectionScanner({ onAdd }: { onAdd: (watches: Watch[]) => Promise<void> }) {
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
    setStatus("Reading your list…");
    try {
      const found = await scanCollectionPhoto(file);
      setRows(found.map((w) => ({ ...w, selected: true })));
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
    const added: Watch[] = [];
    const failed: string[] = [];
    for (const [i, row] of chosen.entries()) {
      setStatus(`Looking up ${row.brand} ${row.model} (${i + 1} of ${chosen.length})…`);
      const base: Watch = {
        id: newWatchId(),
        slug: slugFor(row.brand, row.model),
        image_url: "",
        brand: row.brand.trim(),
        model: row.model.trim(),
        reference_number: row.reference_number.trim() || undefined,
        nickname: row.nickname.trim(),
        purchase_date: row.purchase_date,
        purchase_price: row.purchase_price != null ? String(row.purchase_price) : "",
        estimated_value: "",
        notes: row.notes.trim(),
      };
      try {
        const lookup = await lookupWatchDetails({
          brand: base.brand,
          model: base.model,
          reference_number: base.reference_number,
          purchase_date: base.purchase_date || undefined,
        });
        added.push(applyLookup(base, lookup));
      } catch {
        failed.push(`${row.brand} ${row.model}`);
        added.push(base);
      }
    }
    await onAdd(added);
    setRows([]);
    setBusy(false);
    setStatus(`Added ${added.length} watch${added.length === 1 ? "" : "es"} to your collection.`);
    if (failed.length) setError(`Couldn't find prices for: ${failed.join(", ")}. They were added without them.`);
  };

  const input = "w-full rounded-xl border border-hairline bg-raised px-3 py-2 text-sm text-ink outline-none focus:border-gold/70";

  return (
    <div className="rounded-md border border-gold/40 bg-raised shadow-card p-6">
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Scan a list</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">Add your whole collection from one photo</h2>
      <p className="mt-2 text-sm leading-6 text-ink/80">
        Snap a photo of your collection list (handwritten, printed or a screenshot). We&apos;ll read each watch and fill in its
        details, retail price and current value.
      </p>

      <label className={`mt-4 inline-flex cursor-pointer rounded-full bg-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep ${busy ? "pointer-events-none opacity-60" : ""}`}>
        {busy && !rows.length ? "Reading…" : "Choose photo"}
        <input type="file" accept="image/*" capture="environment" onChange={handleFile} className="sr-only" disabled={busy} />
      </label>

      {status ? <p className="mt-4 text-sm text-ink">{status}</p> : null}
      {error ? <p className="mt-2 text-sm text-rose-700">{error}</p> : null}

      {rows.length ? (
        <div className="mt-4 space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="grid gap-2 rounded border border-hairline bg-raised shadow-card p-3 sm:grid-cols-[auto_1fr_1fr_1fr_1fr_1fr] sm:items-center">
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
              <input className={input} type="date" value={row.purchase_date} onChange={(e) => updateRow(i, { purchase_date: e.target.value })} aria-label="Purchase date" />
              <input
                className={input}
                type="number"
                value={row.purchase_price ?? ""}
                onChange={(e) => updateRow(i, { purchase_price: e.target.value ? Number(e.target.value) : null })}
                placeholder="Paid $"
                aria-label="Purchase price"
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAdd}
            disabled={busy || !rows.some((r) => r.selected)}
            className="rounded-full bg-navy px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-on-navy transition hover:bg-navy-deep disabled:opacity-60"
          >
            {busy ? "Adding…" : `Add ${rows.filter((r) => r.selected).length} to collection`}
          </button>
        </div>
      ) : null}
    </div>
  );
}
