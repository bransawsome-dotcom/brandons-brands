"use client";

import supabase from "@/lib/supabaseClient";

// Members' favorite brands: saved on their profile (public_profiles.favorite_brands, private to them)
// so picks follow them across devices. A copy is kept on the device for speed and as a fallback.
export const BRANDS_KEY = "bb-favorite-brands";
export const LUXURY_BRANDS = ["Rolex", "Omega", "Tudor", "Cartier", "Grand Seiko", "Patek Philippe", "Audemars Piguet", "IWC", "Seiko", "Longines", "Oris", "TAG Heuer"];
export const MICRO_BRANDS = ["Baltic", "Christopher Ward", "Farer", "Studio Underd0g", "Lorier", "Furlan Marri", "Kurono Tokyo", "Nodus"];

function local(): string[] {
  try {
    const v = JSON.parse(localStorage.getItem(BRANDS_KEY) ?? "[]");
    return Array.isArray(v) ? v.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}
function keepLocal(brands: string[]) {
  try {
    localStorage.setItem(BRANDS_KEY, JSON.stringify(brands));
  } catch {
    /* private mode */
  }
}

export async function loadFavoriteBrands(userId: string | null | undefined): Promise<string[]> {
  if (!userId || !supabase) return local();
  const { data, error } = await supabase.from("public_profiles").select("favorite_brands").eq("user_id", userId).maybeSingle();
  if (error || !data) return local();
  const saved = (data.favorite_brands as string[] | null) ?? [];
  // First time on this account but picks exist on this device (e.g. from the welcome tour before saving): move them up.
  if (!saved.length && local().length) return saveFavoriteBrands(local());
  keepLocal(saved);
  return saved;
}

export async function saveFavoriteBrands(brands: string[]): Promise<string[]> {
  keepLocal(brands);
  if (!supabase) return brands;
  const { data, error } = await supabase.rpc("set_favorite_brands", { p_brands: brands });
  if (error) return brands;
  return (data as string[] | null) ?? brands;
}
