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
  AUTO_FILL_FIELDS,
  WISHLIST_AUTO_FILL_FIELDS,
} from "@/lib/localData";

// Upserts watch rows. If the database doesn't have the auto-fill columns yet,
// retries without them so saving never breaks.
async function upsertWatchRows(rows: Record<string, unknown>[]) {
  if (!supabase) return null;
  const { error } = await supabase.from("watches").upsert(rows, { onConflict: "id" });
  if (!error) return null;
  const missingColumn = error.code === "PGRST204" || /column/i.test(error.message);
  if (!missingColumn) return error;
  const stripped = rows.map((row) => {
    const copy = { ...row };
    for (const field of AUTO_FILL_FIELDS) delete copy[field];
    return copy;
  });
  const retry = await supabase.from("watches").upsert(stripped, { onConflict: "id" });
  return retry.error;
}

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
  const error = await upsertWatchRows(rows);
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
  const error = await upsertWatchRows([row]);
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

  const rows: Record<string, unknown>[] = wishlist.map((item) => ({ ...item, user_id: userId }));
  let { error } = await supabase.from("wishlist").upsert(rows, { onConflict: "id" });
  if (error && (error.code === "PGRST204" || /column/i.test(error.message))) {
    // Database doesn't have the auto-fill columns yet: save the basics anyway.
    const stripped = rows.map((row) => {
      const copy = { ...row };
      for (const field of WISHLIST_AUTO_FILL_FIELDS) delete copy[field];
      return copy;
    });
    ({ error } = await supabase.from("wishlist").upsert(stripped, { onConflict: "id" }));
  }
  if (error) {
    console.error("Failed to save wishlist", error);
  }
  return wishlist;
}

export async function deleteWishlistItem(id: string, userId?: string | null): Promise<void> {
  if (!userId || !supabase) {
    saveWishlist(userId, loadWishlist(userId).filter((item) => item.id !== id));
    return;
  }

  const { error } = await supabase.from("wishlist").delete().match({ id, user_id: userId });
  if (error) {
    console.error("Failed to delete wishlist item", error);
  }
}

export function clearGuestStorageData() {
  clearGuestData();
}
