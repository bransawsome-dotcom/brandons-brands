import supabase from "@/lib/supabaseClient";
import {
  clearGuestData,
  loadCollection,
  saveCollection,
  loadWishlist,
  saveWishlist,
  getWatchBySlug,
  getWatchById,
  deleteWatchById,
  updateWatch,
  type Watch,
  type WishlistItem,
} from "@/lib/localData";

export async function loadCollectionData(userId?: string | null): Promise<Watch[]> {
  if (!userId || !supabase) {
    return loadCollection(userId);
  }

  const { data, error } = await supabase.from("watches").select("*").eq("user_id", userId);
  if (error) {
    console.error("Failed to load collection", error);
    return [];
  }
  return data.map(({ user_id, ...watch }) => watch);
}

export async function saveCollectionData(userId: string | null | undefined, watches: Watch[]): Promise<Watch[]> {
  if (!userId || !supabase) {
    saveCollection(userId, watches);
    return watches;
  }

  const rows = watches.map((watch) => ({ ...watch, user_id: userId }));
  const { error } = await supabase.from("watches").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("Failed to save collection", error);
  }
  return watches;
}

export async function deleteCollectionItem(id: string, userId?: string | null): Promise<void> {
  if (!userId || !supabase) {
    saveCollection(userId, loadCollection(userId).filter((watch) => watch.id !== id));
    return;
  }

  const { error } = await supabase.from("watches").delete().match({ id, user_id: userId });
  if (error) {
    console.error("Failed to delete collection item", error);
  }
}

export async function getWatchBySlugData(slug: string, userId?: string | null): Promise<Watch | undefined> {
  if (!userId || !supabase) {
    return getWatchBySlug(slug, userId);
  }

  const { data, error } = await supabase.from("watches").select("*").eq("slug", slug).eq("user_id", userId).limit(1).single();
  if (error) {
    console.error("Failed to load watch by slug", error);
    return undefined;
  }
  const { user_id, ...watch } = data;
  return watch;
}

export async function getWatchByIdData(id: string, userId?: string | null): Promise<Watch | undefined> {
  if (!userId || !supabase) {
    return getWatchById(id, userId);
  }

  const { data, error } = await supabase.from("watches").select("*").eq("id", id).eq("user_id", userId).limit(1).single();
  if (error) {
    console.error("Failed to load watch by id", error);
    return undefined;
  }
  const { user_id, ...watch } = data;
  return watch;
}

export async function getWatchByIdOrSlug(identifier: string, userId?: string | null): Promise<Watch | undefined> {
  // Try by id first, then fallback to slug lookup
  const byId = await getWatchByIdData(identifier, userId);
  if (byId) return byId;
  return await getWatchBySlugData(identifier, userId);
}

export async function updateWatchData(updated: Watch, userId?: string | null): Promise<Watch[]> {
  if (!userId || !supabase) {
    return updateWatch(updated, userId);
  }

  const row = { ...updated, user_id: userId };
  const { error } = await supabase.from("watches").upsert(row, { onConflict: "id" });
  if (error) {
    console.error("Failed to update watch", error);
  }
  return await loadCollectionData(userId);
}

export async function loadWishlistData(userId?: string | null): Promise<WishlistItem[]> {
  if (!userId || !supabase) {
    return loadWishlist(userId);
  }

  const { data, error } = await supabase.from("wishlist").select("*").eq("user_id", userId);
  if (error) {
    console.error("Failed to load wishlist", error);
    return [];
  }
  return data.map(({ user_id, ...item }) => item);
}

export async function saveWishlistData(userId: string | null | undefined, wishlist: WishlistItem[]): Promise<WishlistItem[]> {
  if (!userId || !supabase) {
    saveWishlist(userId, wishlist);
    return wishlist;
  }

  const rows = wishlist.map((item) => ({ ...item, user_id: userId }));
  const { error } = await supabase.from("wishlist").upsert(rows, { onConflict: "id" });
  if (error) {
    console.error("Failed to save wishlist", error);
  }
  return wishlist;
}

export function clearGuestStorageData() {
  clearGuestData();
}
