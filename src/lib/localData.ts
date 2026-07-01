export type Watch = {
  id: string;
  slug: string;
  image_url: string;
  brand: string;
  model: string;
  reference_number?: string;
  condition?: string;
  nickname: string;
  purchase_date: string;
  purchase_price: string;
  estimated_value: string;
  notes: string;
  edited_at?: string;
};

export type WishlistItem = {
  id: string;
  brand: string;
  model: string;
  reference_number?: string;
  target_price?: string;
  current_market_price?: string;
  notes: string;
  priority: string;
  purchase_link?: string;
  purchased_at?: string;
  estimated_price?: string;
};

const COLLECTION_STORAGE_KEY = "brandons-brands-collection";
const WISHLIST_STORAGE_KEY = "brandons-brands-wishlist";
const GUEST_ID_KEY = "brandons_brands_guest_id";
const GUEST_COLLECTION_KEY_PREFIX = "brandons_brands_guest_watches_";
const GUEST_WISHLIST_KEY_PREFIX = "brandons_brands_guest_wishlist_";

function createGuestId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `guest-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getOrCreateGuestId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  let guestId = window.localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    guestId = createGuestId();
    window.localStorage.setItem(GUEST_ID_KEY, guestId);
  }
  return guestId;
}

function getGuestCollectionKey(): string | null {
  const guestId = getOrCreateGuestId();
  return guestId ? `${GUEST_COLLECTION_KEY_PREFIX}${guestId}` : null;
}

function getGuestWishlistKey(): string | null {
  const guestId = getOrCreateGuestId();
  return guestId ? `${GUEST_WISHLIST_KEY_PREFIX}${guestId}` : null;
}

function getCollectionKey(userId?: string | null) {
  if (userId) {
    return `${COLLECTION_STORAGE_KEY}-${userId}`;
  }
  return getGuestCollectionKey() ?? COLLECTION_STORAGE_KEY;
}

function getWishlistKey(userId?: string | null) {
  if (userId) {
    return `${WISHLIST_STORAGE_KEY}-${userId}`;
  }
  return getGuestWishlistKey() ?? WISHLIST_STORAGE_KEY;
}

const defaultWatches: Watch[] = [];

const defaultWishlist: WishlistItem[] = [];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 50);
}

function normalizeSlug(brand: string, model: string) {
  return slugify(`${brand}-${model}`);
}

function ensureUniqueSlug(slug: string, existing: Set<string>, suffix = 1): string {
  if (!existing.has(slug)) return slug;
  const next = `${slug}-${suffix}`;
  return ensureUniqueSlug(next, existing, suffix + 1);
}

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }

  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, data: T) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(key, JSON.stringify(data));
}

export function loadCollection(userId?: string | null): Watch[] {
  const fallback = [] as Watch[];
  const collection = readJson<Watch[]>(getCollectionKey(userId), fallback);
  const seen = new Set<string>();
  let mutated = false;

  const normalized = collection.map((watch) => {
    const slug = watch.slug || normalizeSlug(watch.brand, watch.model);
    const uniqueSlug = ensureUniqueSlug(slug, seen);
    if (uniqueSlug !== watch.slug) {
      mutated = true;
    }
    seen.add(uniqueSlug);
    return { ...watch, slug: uniqueSlug };
  });

  if (mutated) {
    saveCollection(userId, normalized);
  }

  return normalized;
}

export function saveCollection(userId: string | null | undefined, watches: Watch[]) {
  saveJson(getCollectionKey(userId), watches);
}

export function getWatchById(id: string, userId?: string | null): Watch | undefined {
  const all = loadCollection(userId);
  return all.find((w) => w.id === id);
}

export function getWatchBySlug(slug: string, userId?: string | null): Watch | undefined {
  const all = loadCollection(userId);
  return all.find((w) => w.slug === slug);
}

export function updateWatch(updated: Watch, userId?: string | null) {
  const all = loadCollection(userId);
  const next = all.map((w) =>
    w.id === updated.id
      ? {
          ...updated,
          slug: normalizeSlug(updated.brand, updated.model),
          edited_at: new Date().toISOString(),
        }
      : w,
  );
  const uniqueSlugs = new Set<string>();
  const normalized = next.map((watch) => ({
    ...watch,
    slug: ensureUniqueSlug(watch.slug, uniqueSlugs),
  }));
  saveCollection(userId, normalized);
  return normalized;
}

export function deleteWatchById(id: string, userId?: string | null) {
  const all = loadCollection(userId);
  const next = all.filter((w) => w.id !== id);
  saveCollection(userId, next);
  return next;
}

export function loadWishlist(userId?: string | null): WishlistItem[] {
  const fallback = [] as WishlistItem[];
  return readJson<WishlistItem[]>(getWishlistKey(userId), fallback);
}

export function saveWishlist(userId: string | null | undefined, wishlist: WishlistItem[]) {
  saveJson(getWishlistKey(userId), wishlist);
}

export function clearGuestData() {
  if (typeof window === "undefined") {
    return;
  }

  const guestId = window.localStorage.getItem(GUEST_ID_KEY);
  if (!guestId) {
    return;
  }

  window.localStorage.removeItem(`${GUEST_COLLECTION_KEY_PREFIX}${guestId}`);
  window.localStorage.removeItem(`${GUEST_WISHLIST_KEY_PREFIX}${guestId}`);
  window.localStorage.removeItem(GUEST_ID_KEY);
}

export function addWatchToCollection(watch: Watch, userId?: string | null) {
  const collection = loadCollection(userId);
  saveCollection(userId, [watch, ...collection]);
}
