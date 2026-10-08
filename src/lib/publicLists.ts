// Public collections and wishlists: shared types and server-side loading (anon key, read-only).

export type ListKind = "collection" | "wishlist";

export type PublicDetails = {
  case_size_mm?: string;
  case_material?: string;
  movement?: string;
  market_value_low?: number | null;
  market_value_high?: number | null;
  summary?: string;
} | null;

export type PublicWatch = {
  id: string;
  brand: string;
  model: string;
  reference_number?: string | null;
  nickname?: string | null;
  image_url?: string | null;
  condition?: string | null;
  estimated_value?: string | null;
  current_retail_price?: string | null;
  details?: PublicDetails;
  has_box?: boolean | null;
  has_papers?: boolean | null;
  authenticated?: boolean | null;
  authenticated_by?: string | null;
};

export type PublicWish = {
  id: string;
  brand: string;
  model: string;
  reference_number?: string | null;
  image_url?: string | null;
  priority?: string | null;
  market_value?: string | null;
  retail_price?: string | null;
  details?: PublicDetails;
};

export type PublicList = {
  kind: ListKind;
  display_name: string;
  handle: string;
  updated_at: string;
  collection_public: boolean;
  wishlist_public: boolean;
  items: (PublicWatch | PublicWish)[];
};

export type PublicCollector = {
  handle: string;
  display_name: string;
  collection_public: boolean;
  wishlist_public: boolean;
  watch_count: number;
  wish_count: number;
  updated_at: string;
};

export const HANDLE_RE = /^[a-z0-9]([a-z0-9-]{0,48}[a-z0-9])?$/;

export function handleFromName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function rpc<T>(fn: string, body: Record<string, unknown>, revalidate = 300): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/rpc/${fn}`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function loadPublicList(handle: string, kind: ListKind): Promise<PublicList | null> {
  const h = handle.toLowerCase();
  if (!HANDLE_RE.test(h)) return null;
  return rpc<PublicList | null>("get_public_list", { p_handle: h, p_kind: kind }, 60);
}

export async function listPublicCollectors(): Promise<PublicCollector[]> {
  return (await rpc<PublicCollector[]>("list_public_collectors", {}, 600)) ?? [];
}

export function money(value?: string | number | null): string | null {
  if (value === null || value === undefined || value === "") return null;
  const n = typeof value === "number" ? value : parseFloat(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }) : null;
}

export function possessive(name: string) {
  return `${name}'${name.endsWith("s") ? "" : "s"}`;
}
