"use client";

import supabase from "@/lib/supabaseClient";

export type PriceMatch = {
  id: string;
  wishlist_id: string;
  url: string;
  title: string;
  price: number | null;
  currency: string;
  price_usd: number;
  target_usd: number | null;
  seller: string;
  marketplace: string;
  location: string;
  condition: string;
  box_papers: string;
  found_at: string;
};

// All saved price-alert listings for this member, newest first, grouped by wishlist watch.
export async function listPriceMatches(userId: string): Promise<Record<string, PriceMatch[]>> {
  if (!supabase) return {};
  const { data, error } = await supabase
    .from("price_alert_matches")
    .select("*")
    .eq("user_id", userId)
    .order("found_at", { ascending: false })
    .limit(300);
  if (error) return {};
  const grouped: Record<string, PriceMatch[]> = {};
  for (const m of (data ?? []) as PriceMatch[]) (grouped[m.wishlist_id] ??= []).push(m);
  return grouped;
}

export async function dismissPriceMatch(id: string): Promise<void> {
  if (!supabase) return;
  await supabase.from("price_alert_matches").delete().eq("id", id);
}

// Turn the daily alert on or off for one wishlist watch.
export async function setPriceAlert(userId: string, wishlistId: string, on: boolean): Promise<void> {
  if (!supabase) throw new Error("Please log in to use price alerts.");
  const { error } = await supabase.from("wishlist").update({ price_alert: on }).eq("id", wishlistId).eq("user_id", userId);
  if (error) {
    throw new Error(/column/i.test(error.message) ? "Price alerts are being set up. Please try again soon." : error.message);
  }
}
