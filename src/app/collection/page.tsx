"use client";

import Link from "next/link";
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "@/components/AuthProvider";
import { loadCollectionData, saveCollectionData, deleteCollectionItem } from "@/lib/storage";
import { provenanceLabels, type Watch } from "@/lib/localData";
import ProvenanceFields, { emptyProvenance, type Provenance } from "@/components/ProvenanceFields";
import CollectionScanner from "@/components/CollectionScanner";
import ShareButton from "@/components/ShareButton";
import PublicListToggle from "@/components/PublicListToggle";
import OfferStatus from "@/components/OfferStatus";
import Combobox from "@/components/Combobox";
import { canonicalBrand, modelsForBrand, watchBrands } from "@/lib/watchCatalog";
import { formatUsd, parseMoney, lookupWatchDetails, type WatchLookupResult } from "@/lib/watchAiClient";
import { applyLookup, newWatchId } from "@/lib/watchBuild";

function buildSlug(brand: string, model: string) {
  return `${brand.trim().toLowerCase()} ${model.trim().toLowerCase()}`
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const initialForm = {
  image_url: "",
  brand: "",
  model: "",
  reference_number: "",
  nickname: "",
  purchase_date: "",
  purchase_price: "",
  estimated_value: "",
  condition: "",
  notes: "",
};

export default function CollectionPage() {
  const [watches, setWatches] = useState<Watch[]>([]);
  const [search, setSearch] = useState("");
  const { user, guestMode, loading: authLoading } = useRequireAuth();
  const canAutoFill = Boolean(user) && !guestMode;
  const [lookup, setLookup] = useState<WatchLookupResult | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const userId = user?.id ?? null;
  const [brandFilter, setBrandFilter] = useState("");
  const [conditionFilter, setConditionFilter] = useState("");
  const [sortOption, setSortOption] = useState<"highest" | "lowest" | "newest" | "oldest" | "brand">("highest");
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [selectedWatch, setSelectedWatch] = useState<Watch | null>(null);
  const [form, setForm] = useState(initialForm);
  const [provenance, setProvenance] = useState<Provenance>(emptyProvenance);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"grid" | "list">("grid");
  const [message, setMessage] = useState<string | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (authLoading) return;

    loadCollectionData(userId).then((saved) => {
      setWatches(saved);
      setLoading(false);
    });
  }, [authLoading, userId]);

  async function fetchWatches() {
    const saved = await loadCollectionData(userId);
    setWatches(saved);
  }

  const totals = useMemo(() => {
    const sum = (key: "purchase_price" | "estimated_value") =>
      watches.reduce((acc, w) => acc + (parseMoney(w[key]) || 0), 0);
    return { paid: sum("purchase_price"), value: sum("estimated_value") };
  }, [watches]);

  const uniqueBrands = useMemo(() => {
    const brands = Array.from(new Set(watches.map((w) => w.brand))).filter(Boolean) as string[];
    return brands.sort();
  }, [watches]);

  const uniqueConditions = useMemo(() => {
    const conditions = Array.from(new Set(watches.map((w) => w.condition).filter(Boolean))).filter(Boolean) as string[];
    return conditions.sort();
  }, [watches]);

  const filteredWatches = useMemo(() => {
    const query = search.trim().toLowerCase();

    const results = watches.filter((w) => {
      if (query) {
        const hay = `${w.brand} ${w.model} ${w.nickname} ${w.reference_number ?? ""}`.toLowerCase();
        if (!hay.includes(query)) return false;
      }

      if (brandFilter && w.brand !== brandFilter) return false;
      if (conditionFilter && w.condition !== conditionFilter) return false;

      const val = parseMoney(w.estimated_value) || 0;
      const min = parseMoney(priceMin) || 0;
      const max = priceMax && Number.isFinite(parseMoney(priceMax)) ? parseMoney(priceMax) : Infinity;
      if (val < min) return false;
      if (val > max) return false;

      return true;
    });

    return [...results].sort((left, right) => {
      if (sortOption === "highest") {
        return (parseMoney(right.estimated_value) || 0) - (parseMoney(left.estimated_value) || 0);
      }
      if (sortOption === "lowest") {
        return (parseMoney(left.estimated_value) || 0) - (parseMoney(right.estimated_value) || 0);
      }
      if (sortOption === "newest") {
        return new Date(right.purchase_date).getTime() - new Date(left.purchase_date).getTime();
      }
      if (sortOption === "oldest") {
        return new Date(left.purchase_date).getTime() - new Date(right.purchase_date).getTime();
      }
      if (sortOption === "brand") {
        return left.brand.localeCompare(right.brand);
      }
      return 0;
    });
  }, [watches, search, brandFilter, conditionFilter, sortOption, priceMin, priceMax]);

  const uploadImage = async (file: File) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result;
        if (typeof result === "string") {
          resolve(result);
        } else {
          reject(new Error("Unable to read image file"));
        }
      };
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    // A different watch means the earlier lookup no longer applies.
    if (name === "brand" || name === "model" || name === "reference_number") setLookup(null);
  };

  const runLookup = async (override?: { brand?: string; model?: string }): Promise<WatchLookupResult | null> => {
    const brand = (override?.brand ?? form.brand).trim();
    const model = (override?.model ?? form.model).trim();
    if (!brand || !model) {
      setMessage("Enter a brand and model first.");
      return null;
    }
    setLookingUp(true);
    setMessage("Looking up details and prices… this can take up to a minute.");
    try {
      const result = await lookupWatchDetails({
        brand,
        model,
        reference_number: form.reference_number.trim() || undefined,
        purchase_date: form.purchase_date || undefined,
      });
      setLookup(result);
      setForm((current) => ({
        ...current,
        reference_number: current.reference_number || result.reference_number || "",
        estimated_value: current.estimated_value || (result.market_value != null ? String(Math.round(result.market_value)) : ""),
      }));
      setMessage(null);
      return result;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Couldn't look that watch up.");
      return null;
    } finally {
      setLookingUp(false);
    }
  };

  const addScannedWatches = async (scanned: Watch[]) => {
    const updated = [...scanned, ...watches];
    setWatches(updated);
    await saveCollectionData(userId, updated);
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    setPhotoFile(file);
    setPreview(file ? URL.createObjectURL(file) : "");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!form.brand.trim() || !form.model.trim()) {
      setMessage("Brand and model are required.");
      return;
    }

    // Fill in details automatically on add, unless already looked up.
    const details = lookup ?? (canAutoFill ? await runLookup() : null);

    const imageUrl = photoFile ? await uploadImage(photoFile) : form.image_url || "";
    const base: Watch = {
      id: newWatchId(),
      slug: buildSlug(form.brand, form.model),
      image_url: imageUrl,
      brand: form.brand.trim(),
      model: form.model.trim(),
      reference_number: form.reference_number.trim() || undefined,
      nickname: form.nickname.trim(),
      purchase_date: form.purchase_date,
      purchase_price: form.purchase_price,
      estimated_value: form.estimated_value,
      condition: form.condition.trim() || undefined,
      has_box: provenance.has_box,
      has_papers: provenance.has_papers,
      authenticated: provenance.authenticated,
      authenticated_by: provenance.authenticated ? provenance.authenticated_by.trim() || null : null,
      notes: form.notes.trim(),
    };
    const newWatch = details ? applyLookup(base, details, { keepTypedValue: true }) : base;

    const updated = [newWatch, ...watches];
    setWatches(updated);
    await saveCollectionData(userId, updated);
    setForm(initialForm);
    setProvenance(emptyProvenance);
    setPhotoFile(null);
    setPreview("");
    setLookup(null);
    setMessage(details ? "Watch added with details and prices." : "Watch added.");
  };


  const router = useRouter();

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-14 lg:px-16 overflow-x-hidden">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-blue-300 sm:text-sm">My Collection</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">
              Build a luxury watch archive.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Add watches below, then browse, search and sort them in your collection.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <ShareButton kind="collection" />
          <PublicListToggle kind="collection" />
          <dl className="grid grid-cols-3 gap-2 text-center min-[360px]:gap-3 sm:min-w-[360px]">
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-white/10 bg-black/20 px-2 py-3 sm:px-3">
              <dt className="whitespace-nowrap text-[10px] uppercase tracking-[0.1em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">Watches</dt>
              <dd className="mt-1 whitespace-nowrap text-sm font-semibold tabular-nums min-[360px]:text-lg sm:text-xl text-white">{watches.length}</dd>
            </div>
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-white/10 bg-black/20 px-2 py-3 sm:px-3">
              <dt className="whitespace-nowrap text-[10px] uppercase tracking-[0.1em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">Paid</dt>
              <dd className="mt-1 whitespace-nowrap text-sm font-semibold tabular-nums min-[360px]:text-lg sm:text-xl text-white">{formatUsd(totals.paid)}</dd>
            </div>
            <div className="flex min-w-0 flex-col justify-between rounded-2xl border border-white/10 bg-black/20 px-2 py-3 sm:px-3">
              <dt className="whitespace-nowrap text-[10px] uppercase tracking-[0.1em] text-slate-400 sm:text-[11px] sm:tracking-[0.18em]">Est. value</dt>
              <dd className="mt-1 whitespace-nowrap text-sm font-semibold tabular-nums min-[360px]:text-lg sm:text-xl text-[#D9A43A]">{formatUsd(totals.value)}</dd>
            </div>
          </dl>
          </div>
        </div>


        <h2 className="mb-4 mt-2 text-xl font-semibold text-white">Add watches</h2>
        {canAutoFill ? (
          <div className="mb-6">
            <CollectionScanner onAdd={addScannedWatches} />
          </div>
        ) : (
          <p className="mb-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
            <a href="/login" className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">Log in</a> to auto-fill watch details and prices, or scan a photo of your collection list.
          </p>
        )}

        <form id="add-watch" onSubmit={handleSubmit} className="grid gap-6 rounded-[1.75rem] border border-white/10 bg-black/30 p-6">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-blue-300">Add one watch</p>
              <p className="mt-1 text-sm text-slate-400">Choose a brand and model from the lists. Details, prices and a photo fill in automatically. Not listed? Just type it.</p>
            </div>
            <div className="grid gap-6 lg:grid-cols-2">
              <Combobox
                label="Brand"
                name="brand"
                value={form.brand}
                options={watchBrands}
                placeholder="Choose or type a brand"
                required
                onChange={(value) => {
                  setForm((current) => ({ ...current, brand: value, model: current.brand === value ? current.model : "" }));
                  setLookup(null);
                }}
                onSelect={(value) => setForm((current) => ({ ...current, brand: canonicalBrand(value) }))}
              />
              <Combobox
                label="Model"
                name="model"
                value={form.model}
                options={modelsForBrand(form.brand)}
                placeholder={form.brand ? "Choose or type a model" : "Choose a brand first"}
                emptyHint="Pick a brand to see its models, or type a model."
                required
                onChange={(value) => {
                  setForm((current) => ({ ...current, model: value }));
                  setLookup(null);
                }}
                onSelect={(value) => {
                  // Picking a model from the list fills in details, prices and a photo automatically.
                  if (canAutoFill) void runLookup({ brand: form.brand, model: value });
                }}
              />
            </div>

            <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
              <label className="space-y-2 text-sm text-slate-300">
                Reference (optional)
                <input
                  name="reference_number"
                  value={form.reference_number}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="126610LN"
                />
              </label>
              {canAutoFill ? (
                <button
                  type="button"
                  onClick={() => runLookup()}
                  disabled={lookingUp}
                  className="rounded-full border border-[#D9A43A]/50 bg-[#D9A43A]/10 px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-[#D9A43A] transition hover:bg-[#D9A43A]/20 disabled:opacity-60"
                >
                  {lookingUp ? "Looking up…" : lookup ? "Look up again" : "Auto-fill details & prices"}
                </button>
              ) : null}
            </div>

            {lookup ? (
              <div className="flex gap-4 rounded-3xl border border-emerald-400/20 bg-emerald-500/5 p-4 text-sm text-slate-200">
                {lookup.image_url && !preview && !form.image_url ? (
                  <img
                    src={lookup.image_url}
                    alt={`${lookup.brand} ${lookup.model}`}
                    referrerPolicy="no-referrer"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                    className="h-24 w-24 shrink-0 rounded-2xl bg-white object-contain p-1 sm:h-28 sm:w-28"
                  />
                ) : null}
                <div className="min-w-0">
                <p className="font-semibold text-white">
                  {lookup.brand} {lookup.model}
                  {lookup.reference_number ? ` · Ref. ${lookup.reference_number}` : ""}
                </p>
                <p className="mt-1 text-slate-300">
                  Retail at purchase: <span className="text-white">{formatUsd(lookup.retail_price_at_purchase)}</span>
                  {lookup.retail_price_date_note ? ` (${lookup.retail_price_date_note})` : ""} · Retail today:{" "}
                  <span className="text-white">{formatUsd(lookup.current_retail_price)}</span> · Market value:{" "}
                  <span className="text-white">{formatUsd(lookup.market_value)}</span>
                </p>
                {[lookup.case_size_mm, lookup.case_material, lookup.movement].filter(Boolean).length ? (
                  <p className="mt-1 text-slate-400">{[lookup.case_size_mm, lookup.case_material, lookup.movement].filter(Boolean).join(" · ")}</p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">
                  Saved with the watch when you click Add Watch. Retail at purchase stays fixed after that.
                  {lookup.image_url ? " The official photo is used unless you upload your own." : ""}
                </p>
                </div>
              </div>
            ) : null}

            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Nickname
                <input
                  name="nickname"
                  value={form.nickname}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="The Night Rider"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Purchase Date
                <input
                  type="date"
                  name="purchase_date"
                  value={form.purchase_date}
                  onChange={handleChange}
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                />
              </label>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <label className="space-y-2 text-sm text-slate-300">
                Purchase Price
                <input
                  name="purchase_price"
                  value={form.purchase_price}
                  onChange={handleChange}
                  type="number"
                  step="0.01"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="45000"
                />
              </label>
              <label className="space-y-2 text-sm text-slate-300">
                Estimated Value
                <input
                  name="estimated_value"
                  value={form.estimated_value}
                  onChange={handleChange}
                  type="number"
                  step="0.01"
                  className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                  placeholder="62000"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm text-slate-300">
              Condition
              <input
                name="condition"
                value={form.condition}
                onChange={handleChange}
                list="condition-options"
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                placeholder="Unworn, Excellent, Very good…"
              />
              <datalist id="condition-options">
                {["Unworn", "Excellent", "Very good", "Good", "Fair"].map((c) => (
                  <option key={c} value={c} />
                ))}
              </datalist>
            </label>

            <ProvenanceFields value={provenance} onChange={setProvenance} />

            <label className="space-y-2 text-sm text-slate-300">
              Upload Photo
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="w-full cursor-pointer rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Photo URL fallback
              <input
                name="image_url"
                value={form.image_url}
                onChange={handleChange}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                placeholder="https://example.com/watch.jpg"
              />
            </label>

            <label className="space-y-2 text-sm text-slate-300">
              Notes
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70"
                placeholder="Add styling notes, provenance, or collection context"
              />
            </label>

            {preview ? (
              <div className="overflow-hidden rounded-3xl border border-white/10 bg-slate-950/90">
                <img src={preview} alt="Preview watch" className="h-60 w-full object-cover" />
              </div>
            ) : null}

            {message ? <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-amber-300">{message}</div> : null}

            <button
              type="submit"
              disabled={lookingUp}
              className="w-full disabled:opacity-60 rounded-full bg-[#D9A43A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_20px_60px_rgba(217,164,58,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e1b54a] sm:w-auto"
            >
              {lookingUp ? "Looking up…" : "Add Watch"}
            </button>
          </form>
      </div>

      <section className="mt-12">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Your collection</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">
              {filteredWatches.length} watch{filteredWatches.length === 1 ? "" : "es"}
              {filteredWatches.length !== watches.length ? <span className="text-lg font-normal text-slate-400"> of {watches.length} (filtered)</span> : null}
            </h2>
          </div>
          <div className="inline-flex rounded-full border border-white/10 bg-black/30 p-1" role="group" aria-label="Layout">
            <button
              type="button"
              onClick={() => setView("grid")}
              aria-pressed={view === "grid"}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${view === "grid" ? "bg-blue-500 text-white" : "text-blue-200 hover:bg-white/10"}`}
            >
              Grid
            </button>
            <button
              type="button"
              onClick={() => setView("list")}
              aria-pressed={view === "list"}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${view === "list" ? "bg-blue-500 text-white" : "text-blue-200 hover:bg-white/10"}`}
            >
              List
            </button>
          </div>
        </div>

        <p className="mb-2 text-xs uppercase tracking-[0.25em] text-slate-400">Search &amp; filter</p>
        {/* Search & filter your collection */}
        <div className="mb-4 grid gap-4 rounded-[1.25rem] border border-white/6 bg-black/20 p-4 sm:grid-cols-4">
          <div>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search your watches…" aria-label="Search your watches"
              className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none text-sm"
            />
          </div>
          <div>
            <select aria-label="Filter by brand" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none">
              <option value="">All brands</option>
              {uniqueBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>
          <div>
            <select aria-label="Filter by condition" value={conditionFilter} onChange={(e) => setConditionFilter(e.target.value)} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none">
              <option value="">All conditions</option>
              {uniqueConditions.map((condition) => (
                <option key={condition} value={condition}>{condition}</option>
              ))}
            </select>
          </div>
          <div>
            <select aria-label="Sort" value={sortOption} onChange={(e) => setSortOption(e.target.value as typeof sortOption)} className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none">
              <option value="highest">Highest Estimated Value</option>
              <option value="lowest">Lowest Estimated Value</option>
              <option value="newest">Newest Purchase Date</option>
              <option value="oldest">Oldest Purchase Date</option>
              <option value="brand">Brand A-Z</option>
            </select>
          </div>
        </div>
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <input value={priceMin} onChange={(e) => setPriceMin(e.target.value)} placeholder="Min value $" aria-label="Minimum estimated value" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none text-sm" />
          <input value={priceMax} onChange={(e) => setPriceMax(e.target.value)} placeholder="Max value $" aria-label="Maximum estimated value" className="w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none text-sm" />
        </div>
        {brandFilter || conditionFilter || search || priceMin || priceMax ? (
          <button
            type="button"
            onClick={() => { setSearch(""); setBrandFilter(""); setConditionFilter(""); setPriceMin(""); setPriceMax(""); }}
            className="mb-6 text-sm font-semibold text-[#D9A43A] hover:text-[#e1b54a]"
          >
            Clear filters
          </button>
        ) : null}

        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-300">Loading your collection…</div>
        ) : filteredWatches.length ? (
          <div className={view === "grid" ? "grid gap-6 md:grid-cols-2 xl:grid-cols-3" : "space-y-3"}>
            {filteredWatches.map((watch) => (
              <div key={watch.id} className={`group relative overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl transition hover:border-[#D9A43A]/40 ${view === "grid" ? "rounded-[2rem] shadow-[0_25px_70px_rgba(0,0,0,0.28)] hover:-translate-y-0.5 hover:shadow-[0_35px_80px_rgba(217,164,58,0.18)]" : "rounded-2xl"}`}>
                <Link href={`/collection/${watch.id}`} className="absolute inset-0 z-0" aria-hidden />
                {view === "grid" ? (
                  <div className="flex flex-col relative z-10">
                    <div className="h-[220px] w-full bg-slate-950/90 overflow-hidden md:h-64">
                      {watch.image_url ? (
                        <img src={watch.image_url} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} alt={`${watch.brand} ${watch.model}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                      )}
                    </div>
                    <div className="p-6">
                      <p className="text-sm uppercase tracking-[0.25em] text-blue-300">{watch.brand}</p>
                      <h3 className="mt-2 text-2xl font-semibold text-white">{watch.model}</h3>
                      {watch.reference_number ? <p className="text-sm text-slate-400">Reference: {watch.reference_number}</p> : null}
                      {provenanceLabels(watch).length ? (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {provenanceLabels(watch).map((label) => (
                            <span key={label} className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-200">✓ {label}</span>
                          ))}
                        </div>
                      ) : null}
                      <OfferStatus kind="collection" />
                        <div className="mt-4 flex items-center justify-between">
                          <div className="text-sm text-slate-200 md:text-slate-300">
                            <div><span className="font-semibold text-white">Market value:</span> {formatUsd(watch.estimated_value)}</div>
                            <div><span className="font-semibold text-white">Retail at purchase:</span> {formatUsd(watch.retail_price)}</div>
                          </div>
                          <div className="flex gap-2">
                            <Link href={`/collection/${watch.id}`} className="rounded-full bg-[#D9A43A] px-3 py-1 text-sm font-semibold uppercase tracking-[0.12em] text-black shadow-[0_8px_20px_rgba(217,164,58,0.14)]">View</Link>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                router.push(`/collection/${watch.id}`);
                              }}
                              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-semibold text-white"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={async (e) => {
                                e.stopPropagation();
                                const shouldDelete = window.confirm("Delete this watch?");
                                if (!shouldDelete) return;
                                await deleteCollectionItem(watch.id, userId);
                                await fetchWatches();
                              }}
                              className="rounded-full border border-rose-500/80 bg-rose-500/10 px-3 py-1 text-sm font-semibold text-rose-200"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                    </div>

                    {/* Mobile buttons */}
                    <div className="flex md:hidden border-t border-white/6">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/collection/${watch.id}`);
                        }}
                        className="w-1/2 px-4 py-3 text-sm font-semibold text-white"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={async (e) => {
                          e.stopPropagation();
                          const shouldDelete = window.confirm("Delete this watch?");
                          if (!shouldDelete) return;
                          await deleteCollectionItem(watch.id, userId);
                          await fetchWatches();
                        }}
                        className="w-1/2 px-4 py-3 text-sm font-semibold text-white bg-rose-600"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 flex items-center gap-4 p-3 sm:p-4 pointer-events-none">
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-950/90 sm:h-20 sm:w-20">
                      {watch.image_url ? (
                        <img src={watch.image_url} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} alt={`${watch.brand} ${watch.model}`} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-[10px] text-slate-500">No image</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs uppercase tracking-[0.2em] text-blue-300">{watch.brand}</p>
                      <h3 className="truncate text-lg font-semibold text-white">{watch.model}</h3>
                      <p className="truncate text-xs text-slate-400">
                        {[watch.reference_number ? `Ref. ${watch.reference_number}` : "", ...provenanceLabels(watch), watch.nickname ? `“${watch.nickname}”` : "", watch.purchase_date ? `Bought ${watch.purchase_date}` : ""].filter(Boolean).join(" · ") || "No details yet"}
                      </p>
                    </div>
                    <dl className="hidden shrink-0 grid-cols-3 gap-6 text-right text-sm md:grid">
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Paid</dt>
                        <dd className="font-semibold text-white">{formatUsd(watch.purchase_price)}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Retail at purchase</dt>
                        <dd className="font-semibold text-white">{formatUsd(watch.retail_price)}</dd>
                      </div>
                      <div>
                        <dt className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Market value</dt>
                        <dd className="font-semibold text-[#D9A43A]">{formatUsd(watch.estimated_value)}</dd>
                      </div>
                    </dl>
                    <div className="shrink-0 text-right text-sm md:hidden">
                      <p className="text-[11px] uppercase tracking-[0.15em] text-slate-400">Value</p>
                      <p className="font-semibold text-[#D9A43A]">{formatUsd(watch.estimated_value)}</p>
                    </div>
                    <span aria-hidden className="hidden text-slate-500 transition group-hover:translate-x-1 group-hover:text-[#D9A43A] sm:block">→</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-300">
            <div className="text-4xl">📷</div>
            <h3 className="mt-4 text-lg font-semibold text-white">Your collection is empty.</h3>
            <p className="mt-2 text-sm text-slate-300">Start building your luxury watch collection today.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  const el = document.getElementById("add-watch");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                className="inline-flex items-center gap-2 rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black"
              >
                <span>➕</span>
                <span>Add Your First Watch</span>
              </button>
            </div>
          </div>
        )}

        {/* Details modal */}
        {selectedWatch ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/70" onClick={() => setSelectedWatch(null)} />
            <div className="relative z-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_40px_120px_rgba(0,0,0,0.6)]">
              <div className="grid gap-6 lg:grid-cols-2">
                <div className="h-80 bg-slate-950/90 overflow-hidden rounded-lg">
                  {selectedWatch.image_url ? (
                    <img src={selectedWatch.image_url} referrerPolicy="no-referrer" onError={(e) => { e.currentTarget.style.visibility = "hidden"; }} alt={`${selectedWatch.brand} ${selectedWatch.model}`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">No image</div>
                  )}
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-blue-300">{selectedWatch.brand}</p>
                  <h3 className="mt-2 text-3xl font-bold text-white">{selectedWatch.model}</h3>
                  {selectedWatch.reference_number ? <p className="mt-2 text-sm text-slate-300">Reference: <span className="font-semibold text-white">{selectedWatch.reference_number}</span></p> : null}
                  <p className="mt-4 text-sm text-slate-300">{selectedWatch.notes}</p>
                  <div className="mt-6 space-y-2 text-sm text-slate-300">
                    <div><span className="font-semibold text-white">Estimated value:</span> {selectedWatch.estimated_value ? `$${selectedWatch.estimated_value}` : "—"}</div>
                    <div><span className="font-semibold text-white">Condition:</span> {selectedWatch.condition ?? "—"}</div>
                    <div><span className="font-semibold text-white">Box &amp; papers:</span> {provenanceLabels(selectedWatch).join(" · ") || "—"}</div>
                    <div><span className="font-semibold text-white">Purchased:</span> {selectedWatch.purchase_date || "—"}</div>
                  </div>
                  <div className="mt-6 flex gap-3">
                    <button onClick={() => setSelectedWatch(null)} className="rounded-full px-5 py-3 text-sm font-semibold bg-white/5 text-white">Close</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
