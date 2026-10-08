import type { Watch, WishlistItem } from "@/lib/localData";
import type { WatchLookupResult } from "@/lib/watchAiClient";

function numToString(value: number | null | undefined): string {
  return typeof value === "number" && Number.isFinite(value) ? String(Math.round(value)) : "";
}

export function slugFor(brand: string, model: string) {
  return `${brand.trim().toLowerCase()} ${model.trim().toLowerCase()}`
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Merges an auto-fill lookup into a watch.
// - retail_price (list price on the purchase date) is only set when empty: it never changes later.
// - current_retail_price and estimated_value (market value) are refreshed every time.
// - Fields the person typed (estimated value on add) win over the lookup when keepTypedValue is true.
export function applyLookup(watch: Watch, lookup: WatchLookupResult, opts: { keepTypedValue?: boolean } = {}): Watch {
  const typedValue = opts.keepTypedValue ? watch.estimated_value : "";
  return {
    ...watch,
    brand: watch.brand || lookup.brand,
    model: watch.model || lookup.model,
    reference_number: watch.reference_number || lookup.reference_number || undefined,
    // Use the official product photo only when the owner hasn't added their own.
    image_url: watch.image_url || lookup.image_url || "",
    retail_price: watch.retail_price || numToString(lookup.retail_price_at_purchase),
    current_retail_price: numToString(lookup.current_retail_price) || watch.current_retail_price || "",
    estimated_value: typedValue || numToString(lookup.market_value) || watch.estimated_value,
    value_updated_at: new Date().toISOString(),
    details: {
      year_introduced: lookup.year_introduced,
      case_size_mm: lookup.case_size_mm,
      case_material: lookup.case_material,
      movement: lookup.movement,
      water_resistance: lookup.water_resistance,
      market_value_low: lookup.market_value_low,
      market_value_high: lookup.market_value_high,
      retail_price_date_note: watch.details?.retail_price_date_note || lookup.retail_price_date_note,
      summary: lookup.summary,
      sources: lookup.sources,
    },
  };
}

// Merges an auto-fill lookup into a wishlist item. Uses today's prices (no purchase date).
export function applyWishlistLookup(item: WishlistItem, lookup: WatchLookupResult): WishlistItem {
  return {
    ...item,
    brand: item.brand || lookup.brand,
    model: item.model || lookup.model,
    reference_number: item.reference_number || lookup.reference_number || undefined,
    image_url: lookup.image_url || item.image_url || "",
    retail_price: numToString(lookup.current_retail_price) || item.retail_price || "",
    current_market_price: numToString(lookup.market_value) || item.current_market_price || "",
    value_updated_at: new Date().toISOString(),
    details: {
      year_introduced: lookup.year_introduced,
      case_size_mm: lookup.case_size_mm,
      case_material: lookup.case_material,
      movement: lookup.movement,
      water_resistance: lookup.water_resistance,
      market_value_low: lookup.market_value_low,
      market_value_high: lookup.market_value_high,
      summary: lookup.summary,
      sources: lookup.sources,
    },
  };
}

export function newWatchId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}
