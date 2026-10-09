// Brandon's Favorites: his favorite watches, each linking to its review or reel.
// Shared by the server page (read) and the client manager (types and link labels).

export type Favorite = {
  id: string;
  watch_id: string | null;
  brand: string;
  model: string;
  reference_number: string | null;
  image_url: string | null;
  link_url: string | null;
  note: string | null;
  sort: number;
  created_at: string;
  // The forum discussion made for this favorite (in the Brandon's Favorites folder).
  post_id?: string | null;
};

export const FAVORITES_PATH = "/favorites";
// The forum folder for Brandon's Favorites (kept here so server pages can use it too).
export const FAVORITES_SUBJECT = "brandons-favorites";

// Read the gallery with the public key (anyone can see it). Refreshed every minute.
export async function loadFavorites(): Promise<Favorite[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/brand_favorites?select=*&order=sort.asc,created_at.asc`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return (await res.json()) as Favorite[];
  } catch {
    return [];
  }
}

// What a favorite's link opens, for the button text and icon.
export function linkInfo(link: string | null | undefined): { label: string; icon: string; external: boolean } | null {
  if (!link) return null;
  const external = /^https?:\/\//i.test(link);
  let host = "";
  try {
    host = external ? new URL(link).hostname.replace(/^www\./, "") : "";
  } catch {
    host = "";
  }
  if (/instagram\.com$/.test(host)) return { label: /\/reels?\//.test(link) ? "Watch the reel" : "View on Instagram", icon: "▶", external };
  if (/tiktok\.com$/.test(host)) return { label: "Watch on TikTok", icon: "▶", external };
  if (/(youtube\.com|youtu\.be)$/.test(host)) return { label: "Watch on YouTube", icon: "▶", external };
  if (/facebook\.com$|fb\.watch$/.test(host)) return { label: "Watch on Facebook", icon: "▶", external };
  return { label: "Read the review", icon: "→", external };
}

export function isAllowedLink(link: string): boolean {
  return /^https:\/\/\S+$/i.test(link) || /^\/[^/\s]\S*$/.test(link);
}
