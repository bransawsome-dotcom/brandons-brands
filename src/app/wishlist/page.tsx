"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { deleteWishlistItem, loadWishlistData, saveWishlistData } from "@/lib/storage";
import { useRequireAuth } from "@/components/AuthProvider";
import { type WishlistItem } from "@/lib/localData";
import Combobox from "@/components/Combobox";
import { canonicalBrand, modelsForBrand, watchBrands } from "@/lib/watchCatalog";
import { checkPriceNow, formatUsd, lookupWatchDetails, type WatchLookupResult } from "@/lib/watchAiClient";
import { dismissPriceMatch, listPriceMatches, setPriceAlert, type PriceMatch } from "@/lib/priceAlertsClient";
import PriceAlertPanel from "@/components/PriceAlertPanel";
import { applyWishlistLookup } from "@/lib/watchBuild";
import WishlistScanner from "@/components/WishlistScanner";
import ShareButton from "@/components/ShareButton";

const initialForm = {
  brand: "",
  model: "",
  reference_number: "",
  target_price: "",
  priority: "Medium",
  notes: "",
  purchase_link: "",
};

const priorityOptions = ["High", "Medium", "Low"] as const;

const inputClass =
  "w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-blue-400/70";

function hostOf(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function WishlistPage() {
  const { user, guestMode, loading: authLoading } = useRequireAuth();
  const userId = user?.id ?? null;
  const canAutoFill = Boolean(user) && !guestMode;
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [lookup, setLookup] = useState<WatchLookupResult | null>(null);
  const [lookingUp, setLookingUp] = useState(false);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [matches, setMatches] = useState<Record<string, PriceMatch[]>>({});
  const [checkingId, setCheckingId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  // Latest list, so a long photo scan doesn't overwrite changes made while it ran.
  const wishlistRef = useRef<WishlistItem[]>([]);
  useEffect(() => {
    wishlistRef.current = wishlist;
  }, [wishlist]);

  const addScannedItems = async (items: WishlistItem[]) => {
    const next = [...items, ...wishlistRef.current];
    wishlistRef.current = next;
    setWishlist(next);
    await saveWishlistData(userId, next);
  };

  useEffect(() => {
    if (authLoading) return;

    loadWishlistData(userId).then((saved) => {
      setWishlist(saved);
      setLoading(false);
    });
    if (userId && !guestMode) void listPriceMatches(userId).then(setMatches);
  }, [authLoading, userId, guestMode]);

  // Coming from a price-alert notification: scroll to that watch once the list is loaded.
  useEffect(() => {
    if (loading || typeof window === "undefined" || !window.location.hash.startsWith("#w-")) return;
    document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [loading]);

  const togglePriceAlert = async (item: WishlistItem, on: boolean) => {
    if (!userId) return;
    setAlertMessage(null);
    try {
      await setPriceAlert(userId, item.id, on);
      setWishlist((current) => current.map((w) => (w.id === item.id ? { ...w, price_alert: on } : w)));
    } catch (err) {
      setAlertMessage(err instanceof Error ? err.message : "Couldn't change the price alert.");
    }
  };

  const runPriceCheck = async (item: WishlistItem) => {
    if (!userId) return;
    setCheckingId(item.id);
    setAlertMessage(null);
    try {
      const result = await checkPriceNow(item.id);
      setWishlist((current) => current.map((w) => (w.id === item.id ? { ...w, alert_checked_at: new Date().toISOString() } : w)));
      setMatches(await listPriceMatches(userId));
      if (!result.found) setAlertMessage(`No listings at or below your target for the ${item.brand} ${item.model} right now. We'll keep checking daily.`);
    } catch (err) {
      setAlertMessage(err instanceof Error ? err.message : "Couldn't check prices right now.");
    } finally {
      setCheckingId(null);
    }
  };

  const dismissMatch = async (wishlistId: string, matchId: string) => {
    await dismissPriceMatch(matchId);
    setMatches((current) => ({ ...current, [wishlistId]: (current[wishlistId] ?? []).filter((m) => m.id !== matchId) }));
  };

  const filteredWishlist = useMemo(() => {
    const query = search.trim().toLowerCase();
    const priorityRank: Record<string, number> = { High: 0, Medium: 1, Low: 2 };
    return wishlist
      .filter((item) => {
        if (priorityFilter && item.priority !== priorityFilter) return false;
        if (!query) return true;
        return [item.brand, item.model, item.reference_number || "", item.notes || ""].join(" ").toLowerCase().includes(query);
      })
      .sort((a, b) => {
        const diff = (priorityRank[a.priority] ?? 3) - (priorityRank[b.priority] ?? 3);
        if (diff) return diff;
        return Number(b.id) - Number(a.id);
      });
  }, [search, priorityFilter, wishlist]);

  const totalValue = useMemo(
    () =>
      wishlist.reduce((sum, item) => {
        const n = parseFloat(String(item.current_market_price ?? "").replace(/[^0-9.]/g, ""));
        return Number.isFinite(n) ? sum + n : sum;
      }, 0),
    [wishlist],
  );

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    if (name === "reference_number") setLookup(null);
  };

  const runLookup = async (override?: { brand?: string; model?: string }): Promise<WatchLookupResult | null> => {
    const brand = (override?.brand ?? form.brand).trim();
    const model = (override?.model ?? form.model).trim();
    if (!brand || !model) {
      setMessage("Enter a brand and model first.");
      return null;
    }
    setLookingUp(true);
    setMessage("Looking up details, prices and a photo… this can take up to a minute.");
    try {
      // No purchase date: wishlist prices are today's.
      const result = await lookupWatchDetails({ brand, model, reference_number: form.reference_number.trim() || undefined });
      setLookup(result);
      setForm((current) => ({ ...current, reference_number: current.reference_number || result.reference_number || "" }));
      setMessage(null);
      return result;
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Couldn't look that watch up.");
      return null;
    } finally {
      setLookingUp(false);
    }
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setLookup(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);

    if (!form.brand.trim() || !form.model.trim()) {
      setMessage("Brand and model are required.");
      return;
    }

    const existing = editingId ? wishlist.find((item) => item.id === editingId) : undefined;
    const sameWatch =
      existing &&
      existing.brand.toLowerCase() === form.brand.trim().toLowerCase() &&
      existing.model.toLowerCase() === form.model.trim().toLowerCase() &&
      (existing.reference_number || "") === form.reference_number.trim();

    // Fill in details automatically, unless already looked up or this is an edit of the same watch.
    const needsLookup = !lookup && canAutoFill && !(sameWatch && existing?.value_updated_at);
    const details = lookup ?? (needsLookup ? await runLookup() : null);

    // A different watch on edit: drop the old watch's photo, prices and specs.
    const carried: Partial<WishlistItem> = sameWatch ? existing! : {};
    const base: WishlistItem = {
      ...carried,
      id: editingId ?? `${Date.now()}`,
      brand: form.brand.trim(),
      model: form.model.trim(),
      reference_number: form.reference_number.trim(),
      target_price: form.target_price,
      notes: form.notes.trim(),
      priority: form.priority,
      purchase_link: form.purchase_link.trim(),
    };
    const newItem = details ? applyWishlistLookup(base, details) : base;

    const updated = editingId ? wishlist.map((item) => (item.id === editingId ? newItem : item)) : [newItem, ...wishlist];

    setWishlist(updated);
    await saveWishlistData(userId, updated);
    const wasEditing = Boolean(editingId);
    resetForm();
    setMessage(
      wasEditing ? "Wishlist item saved." : details ? "Added to your wishlist with details, prices and a photo." : "Added to your wishlist.",
    );
  };

  const handleRefresh = async (item: WishlistItem) => {
    if (!canAutoFill) return;
    setRefreshingId(item.id);
    setMessage(null);
    try {
      const result = await lookupWatchDetails({ brand: item.brand, model: item.model, reference_number: item.reference_number || undefined });
      const refreshed = applyWishlistLookup(item, result);
      const updated = wishlist.map((w) => (w.id === item.id ? refreshed : w));
      setWishlist(updated);
      await saveWishlistData(userId, updated);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Couldn't refresh that watch.");
    } finally {
      setRefreshingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const shouldDelete = window.confirm("Delete this wishlist item?");
    if (!shouldDelete) return;

    const next = wishlist.filter((item) => item.id !== id);
    setWishlist(next);
    await deleteWishlistItem(id, userId);
    setMessage("Wishlist item deleted.");
  };

  const handleEdit = (item: WishlistItem) => {
    setEditingId(item.id);
    setLookup(null);
    setMessage(null);
    setForm({
      brand: item.brand,
      model: item.model,
      reference_number: item.reference_number || "",
      target_price: item.target_price || "",
      priority: item.priority,
      notes: item.notes || "",
      purchase_link: item.purchase_link || "",
    });
    document.getElementById("add-wishlist")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-3 py-8 sm:px-6 sm:py-14 lg:px-16 overflow-x-hidden">
      <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-[0_30px_90px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:p-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Wishlist</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-white sm:text-5xl">Luxury watch wishlist.</h1>
            <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Pick a brand and model. The photo, specs, today&apos;s retail price and market value fill in automatically.
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-3 sm:items-end">
          <ShareButton kind="wishlist" />
          <dl className="grid grid-cols-2 gap-3 text-center sm:min-w-[260px]">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Watches</dt>
              <dd className="mt-1 text-xl font-semibold text-white">{wishlist.length}</dd>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-3">
              <dt className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Market value</dt>
              <dd className="mt-1 text-xl font-semibold text-[#D9A43A]">{totalValue ? formatUsd(totalValue) : "—"}</dd>
            </div>
          </dl>
          </div>
        </div>

        {canAutoFill ? (
          <div className="mb-6">
            <WishlistScanner onAdd={addScannedItems} />
          </div>
        ) : (
          <p className="mb-6 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-300">
            <a href="/login" className="font-semibold text-[#D9A43A] hover:text-[#e1b54a]">Log in</a> to auto-fill photos, details and prices, or scan a photo of your wishlist.
          </p>
        )}

        <form id="add-wishlist" onSubmit={handleSubmit} className="grid gap-6 rounded-[1.75rem] border border-white/10 bg-black/30 p-5 sm:p-6">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-blue-300">{editingId ? "Edit wishlist watch" : "Add to wishlist"}</p>
            <p className="mt-1 text-sm text-slate-400">Choose from the lists, or type a watch that isn&apos;t listed.</p>
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
                if (canAutoFill) void runLookup({ brand: form.brand, model: value });
              }}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:items-end">
            <label className="space-y-2 text-sm text-slate-300">
              Reference (optional)
              <input name="reference_number" value={form.reference_number} onChange={handleChange} className={inputClass} placeholder="15510ST" />
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
              {lookup.image_url ? (
                <img
                  src={lookup.image_url}
                  alt={`${lookup.brand} ${lookup.model}`}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = "none";
                  }}
                  className="h-24 w-24 shrink-0 rounded-2xl bg-white object-contain p-1 sm:h-28 sm:w-28"
                />
              ) : null}
              <div className="min-w-0">
                <p className="font-semibold text-white">
                  {lookup.brand} {lookup.model}
                  {lookup.reference_number ? ` · Ref. ${lookup.reference_number}` : ""}
                </p>
                <p className="mt-1 text-slate-300">
                  Retail today: <span className="text-white">{formatUsd(lookup.current_retail_price)}</span> · Market value:{" "}
                  <span className="text-white">{formatUsd(lookup.market_value)}</span>
                </p>
                {[lookup.case_size_mm, lookup.case_material, lookup.movement].filter(Boolean).length ? (
                  <p className="mt-1 text-slate-400">{[lookup.case_size_mm, lookup.case_material, lookup.movement].filter(Boolean).join(" · ")}</p>
                ) : null}
                <p className="mt-2 text-xs text-slate-500">Saved with the watch when you click {editingId ? "Save" : "Add to Wishlist"}.</p>
              </div>
            </div>
          ) : null}

          <div className="grid gap-6 lg:grid-cols-2">
            <label className="space-y-2 text-sm text-slate-300">
              Priority
              <select name="priority" value={form.priority} onChange={handleChange} className={inputClass}>
                {priorityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm text-slate-300">
              Target price (what you&apos;d pay)
              <input name="target_price" value={form.target_price} onChange={handleChange} type="number" step="0.01" className={inputClass} placeholder="42000" />
              <span className="block text-xs text-slate-500">Turn on 🔔 Price alert on the watch to get notified when it&apos;s listed at or below this price.</span>
            </label>
          </div>

          <label className="space-y-2 text-sm text-slate-300">
            Notes
            <textarea name="notes" value={form.notes} onChange={handleChange} rows={3} className={inputClass} placeholder="Why this watch is a future must-have" />
          </label>

          {message ? <div className="rounded-3xl bg-white/5 px-4 py-3 text-sm text-amber-300">{message}</div> : null}

          <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <button
              type="submit"
              disabled={lookingUp}
              className="w-full rounded-full bg-[#D9A43A] px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-black shadow-[0_20px_60px_rgba(217,164,58,0.22)] transition hover:-translate-y-0.5 hover:bg-[#e1b54a] disabled:opacity-60"
            >
              {lookingUp ? "Looking up…" : editingId ? "Save" : "Add to Wishlist"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  resetForm();
                  setMessage(null);
                }}
                className="rounded-full border border-white/15 px-6 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-slate-200 hover:bg-white/5"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <section className="mt-12">
        <div className="mb-8 grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Your wishlist</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Future watch ambitions.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search wishlist" className={inputClass} />
            <select value={priorityFilter} onChange={(event) => setPriorityFilter(event.target.value)} className={inputClass}>
              <option value="">All Priorities</option>
              {priorityOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>

        {alertMessage ? <div className="mb-6 rounded-3xl bg-white/5 px-4 py-3 text-sm text-amber-300">{alertMessage}</div> : null}
        {loading ? (
          <div className="rounded-[2rem] border border-white/10 bg-white/5 p-12 text-center text-slate-300">Loading wishlist…</div>
        ) : !wishlist.length ? (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-300">
            <div className="text-4xl">⭐</div>
            <h3 className="mt-4 text-lg font-semibold text-white">Your wishlist is empty.</h3>
            <p className="mt-2 text-sm text-slate-300">Save watches you&apos;d like to own in the future.</p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => document.getElementById("add-wishlist")?.scrollIntoView({ behavior: "smooth" })}
                className="inline-flex items-center gap-2 rounded-full bg-[#D9A43A] px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-black"
              >
                <span>➕</span>
                <span>Add Your First Wishlist Item</span>
              </button>
            </div>
          </div>
        ) : filteredWishlist.length ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredWishlist.map((item) => {
              const d = item.details ?? {};
              const range =
                typeof d.market_value_low === "number" && typeof d.market_value_high === "number"
                  ? `${formatUsd(d.market_value_low)} – ${formatUsd(d.market_value_high)}`
                  : null;
              const specs = [d.case_size_mm, d.case_material, d.movement, d.water_resistance].filter(Boolean).join(" · ");
              const refreshing = refreshingId === item.id;
              return (
                <article
                  key={item.id}
                  id={`w-${item.id}`}
                  className="scroll-mt-6 flex flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 shadow-[0_25px_70px_rgba(0,0,0,0.28)] backdrop-blur-xl"
                >
                  {item.image_url ? (
                    <div className="flex h-56 items-center justify-center bg-white p-4">
                      <img
                        src={item.image_url}
                        alt={`${item.brand} ${item.model}`}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          (e.currentTarget.parentElement as HTMLElement).style.display = "none";
                        }}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : null}
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="text-xs uppercase tracking-[0.25em] text-blue-300">{item.priority} priority</p>
                        <h3 className="mt-2 text-2xl font-semibold text-white">
                          {item.brand} {item.model}
                        </h3>
                        {item.reference_number ? <p className="mt-1 text-sm text-slate-400">Ref. {item.reference_number}</p> : null}
                      </div>
                      <span className="shrink-0 rounded-full border border-[#D9A43A]/20 bg-[#D9A43A]/10 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-[#D9A43A]">
                        Wishlist
                      </span>
                    </div>

                    <dl className="mt-5 grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-2">
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Market value</dt>
                        <dd className="mt-1 font-semibold text-[#D9A43A]">{formatUsd(item.current_market_price)}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-2">
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Retail today</dt>
                        <dd className="mt-1 font-semibold text-white">{formatUsd(item.retail_price)}</dd>
                      </div>
                      <div className="rounded-2xl border border-white/10 bg-black/30 p-2">
                        <dt className="text-[10px] uppercase tracking-[0.15em] text-slate-400">Your target</dt>
                        <dd className="mt-1 font-semibold text-white">{formatUsd(item.target_price)}</dd>
                      </div>
                    </dl>
                    {range ? <p className="mt-2 text-xs text-slate-400">Market range {range}</p> : null}

                    {specs ? <p className="mt-4 text-sm text-slate-300">{specs}</p> : null}
                    {d.year_introduced ? <p className="mt-1 text-xs text-slate-400">Introduced {d.year_introduced}</p> : null}
                    {d.summary ? <p className="mt-3 text-sm leading-6 text-slate-300">{d.summary}</p> : null}
                    {item.notes ? <p className="mt-3 text-sm leading-6 text-slate-200">📝 {item.notes}</p> : null}

                    {canAutoFill ? (
                      <PriceAlertPanel
                        item={item}
                        matches={matches[String(item.id)] ?? []}
                        checking={checkingId === item.id}
                        onToggle={(on) => togglePriceAlert(item, on)}
                        onCheck={() => runPriceCheck(item)}
                        onDismiss={(matchId) => dismissMatch(String(item.id), matchId)}
                      />
                    ) : null}

                    {item.value_updated_at || d.sources?.length ? (
                      <p className="mt-3 text-xs leading-5 text-slate-500">
                        {item.value_updated_at ? `Prices checked ${new Date(item.value_updated_at).toLocaleDateString("en-US")}. ` : ""}
                        Estimates from public listings.
                        {d.sources?.length ? " Sources: " : ""}
                        {d.sources?.slice(0, 3).map((url, i) => (
                          <span key={url}>
                            {i ? ", " : ""}
                            <a href={url} target="_blank" rel="noreferrer" className="underline hover:text-slate-300">
                              {hostOf(url)}
                            </a>
                          </span>
                        ))}
                      </p>
                    ) : null}

                    <div className={`mt-auto grid gap-2 pt-6 ${canAutoFill ? "grid-cols-3" : "grid-cols-2"}`}>
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="rounded-3xl border border-[#D9A43A]/20 bg-[#D9A43A]/10 px-3 py-3 text-sm font-semibold text-[#D9A43A] transition hover:bg-[#D9A43A]/20"
                      >
                        Edit
                      </button>
                      {canAutoFill ? (
                        <button
                          type="button"
                          onClick={() => handleRefresh(item)}
                          disabled={refreshing}
                          className="rounded-3xl border border-blue-400/30 bg-blue-500/10 px-3 py-3 text-sm font-semibold text-blue-200 transition hover:bg-blue-500/20 disabled:opacity-60"
                        >
                          {refreshing ? "Updating…" : item.value_updated_at ? "Refresh value" : "Auto-fill"}
                        </button>
                      ) : null}
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="rounded-3xl border border-rose-500/80 bg-rose-500/10 px-3 py-3 text-sm font-semibold text-rose-200 transition hover:bg-rose-500/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-white/10 bg-white/5 p-12 text-center text-slate-300">
            No wishlist items matched your search or filter.
          </div>
        )}
      </section>
    </div>
  );
}
