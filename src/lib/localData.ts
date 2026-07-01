export type Watch = {
  id: string;
  image_url: string;
  brand: string;
  model: string;
  nickname: string;
  purchase_date: string;
  purchase_price: string;
  estimated_value: string;
  notes: string;
};

export type WishlistItem = {
  id: string;
  brand: string;
  model: string;
  notes: string;
  priority: string;
  estimated_price: string;
  purchase_link: string;
};

const COLLECTION_STORAGE_KEY = "brandons-brands-collection";
const WISHLIST_STORAGE_KEY = "brandons-brands-wishlist";

const defaultWatches: Watch[] = [
  {
    id: "1",
    image_url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80",
    brand: "Rolex",
    model: "Submariner",
    nickname: "Deep Sea",
    purchase_date: "2022-06-15",
    purchase_price: "12500",
    estimated_value: "14200",
    notes: "A timeless diving icon with a polished black ceramic bezel.",
  },
  {
    id: "2",
    image_url: "https://images.unsplash.com/photo-1519400191923-a6d4decc7f3b?auto=format&fit=crop&w=1200&q=80",
    brand: "Patek Philippe",
    model: "Nautilus",
    nickname: "Blue Oyster",
    purchase_date: "2023-02-03",
    purchase_price: "56000",
    estimated_value: "62000",
    notes: "Luxury sport elegance with a distinctive steel profile.",
  },
];

const defaultWishlist: WishlistItem[] = [
  {
    id: "1",
    brand: "Audemars Piguet",
    model: "Royal Oak Offshore",
    notes: "High-impact luxury for the modern collector.",
    priority: "High",
    estimated_price: "42000",
    purchase_link: "https://www.audemarspiguet.com/royal-oak-offshore",
  },
  {
    id: "2",
    brand: "Omega",
    model: "Speedmaster Professional",
    notes: "A legendary chronograph with space heritage.",
    priority: "Medium",
    estimated_price: "7800",
    purchase_link: "https://www.omegawatches.com/speedmaster",
  },
];

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

export function loadCollection(): Watch[] {
  return readJson<Watch[]>(COLLECTION_STORAGE_KEY, defaultWatches);
}

export function saveCollection(watches: Watch[]) {
  saveJson(COLLECTION_STORAGE_KEY, watches);
}

export function loadWishlist(): WishlistItem[] {
  return readJson<WishlistItem[]>(WISHLIST_STORAGE_KEY, defaultWishlist);
}

export function saveWishlist(wishlist: WishlistItem[]) {
  saveJson(WISHLIST_STORAGE_KEY, wishlist);
}
