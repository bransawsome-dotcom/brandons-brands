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

const defaultWatches: Watch[] = [
  {
    id: "1",
    slug: "rolex-submariner",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    brand: "Rolex",
    model: "Submariner",
    reference_number: "126610LN",
    condition: "Mint",
    nickname: "Deep Sea",
    purchase_date: "2022-06-15",
    purchase_price: "12500",
    estimated_value: "14200",
    notes: "A timeless diving icon with a polished black ceramic bezel.",
  },
  {
    id: "2",
    slug: "patek-nautilus",
    image_url: "https://images.unsplash.com/photo-1519400191923-a6d4decc7f3b?auto=format&fit=crop&w=1200&q=80",
    brand: "Patek Philippe",
    model: "Nautilus",
    reference_number: "5711/1A",
    condition: "Excellent",
    nickname: "Blue Oyster",
    purchase_date: "2023-02-03",
    purchase_price: "56000",
    estimated_value: "62000",
    notes: "Luxury sport elegance with a distinctive steel profile.",
  },
  {
    id: "3",
    slug: "omega-speedmaster",
    image_url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    brand: "Omega",
    model: "Speedmaster",
    reference_number: "311.30.42.30.01.005",
    condition: "Excellent",
    nickname: "Moonwatch",
    purchase_date: "2021-11-08",
    purchase_price: "6800",
    estimated_value: "7600",
    notes: "A legendary chronograph born for the moon and every luxury collection.",
  },
];

const defaultWishlist: WishlistItem[] = [
  {
    id: "1",
    brand: "Audemars Piguet",
    model: "Royal Oak Offshore",
    reference_number: "26470ST.OO.A125CR.01",
    target_price: "42000",
    current_market_price: "43500",
    notes: "High-impact luxury for the modern collector.",
    priority: "High",
    purchase_link: "https://www.audemarspiguet.com/royal-oak-offshore",
  },
  {
    id: "2",
    brand: "Omega",
    model: "Speedmaster Professional",
    reference_number: "310.30.42.50.01.001",
    target_price: "7800",
    current_market_price: "7600",
    notes: "A legendary chronograph with space heritage.",
    priority: "Medium",
    purchase_link: "https://www.omegawatches.com/speedmaster",
  },
];

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
  const fallback = userId ? [] : defaultWatches;
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
  const fallback = userId ? [] : defaultWishlist;
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
