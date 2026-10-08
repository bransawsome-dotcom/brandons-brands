"use client";

import supabase from "@/lib/supabaseClient";

export type WatchDetails = {
  year_introduced?: string;
  case_size_mm?: string;
  case_material?: string;
  movement?: string;
  water_resistance?: string;
  market_value_low?: number | null;
  market_value_high?: number | null;
  retail_price_date_note?: string;
  summary?: string;
  sources?: string[];
};

export type WatchLookupResult = WatchDetails & {
  brand: string;
  model: string;
  reference_number: string;
  retail_price_at_purchase: number | null;
  current_retail_price: number | null;
  market_value: number | null;
  image_url?: string | null;
};

export type ScannedWatch = {
  brand: string;
  model: string;
  reference_number: string;
  nickname: string;
  purchase_date: string;
  purchase_price: number | null;
  notes: string;
};

async function authHeaders(): Promise<Record<string, string>> {
  if (!supabase) throw new Error("Please log in to use auto-fill.");
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Please log in to use auto-fill.");
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(path, { method: "POST", headers: await authHeaders(), body: JSON.stringify(body) });
  const json = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error((json as { error?: string }).error ?? "Something went wrong. Please try again.");
  }
  return json as T;
}

export function lookupWatchDetails(input: {
  brand: string;
  model: string;
  reference_number?: string;
  purchase_date?: string;
}): Promise<WatchLookupResult> {
  return post<WatchLookupResult>("/api/watch-lookup", input);
}

// Shrinks the photo in the browser (max 1600 px, JPEG) so uploads stay fast and small.
async function toJpegBase64(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("Couldn't read that image."));
      el.src = url;
    });
    const scale = Math.min(1, 1600 / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't read that image.");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL("image/jpeg", 0.85).split(",")[1] ?? "";
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function scanCollectionPhoto(file: File): Promise<ScannedWatch[]> {
  const image = await toJpegBase64(file);
  const result = await post<{ watches: ScannedWatch[] }>("/api/watch-scan", { image, media_type: "image/jpeg" });
  return result.watches;
}

// Reads amounts typed any way: "10500", "$10,500", "10,500.00".
export function parseMoney(value?: string | number | null): number {
  if (typeof value === "number") return value;
  const n = parseFloat(String(value ?? "").replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : NaN;
}

export function formatUsd(value?: string | number | null): string {
  const n = parseMoney(value);
  if (!Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}
