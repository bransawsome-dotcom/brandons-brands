// Server-side site search: public watches and wishlists, members' public names, forum discussions and authors,
// Brandon's Favorites, the blog and the site's own pages. Uses only public data (the public key).

import { blogPosts } from "@/lib/blogPosts";
import { FAVORITES_SUBJECT } from "@/lib/favorites";

export type WatchHit = { id: string; brand: string; model: string; reference_number: string | null; image_url: string | null; handle: string; display_name: string };
export type PersonHit = { display_name: string; handle: string; collection_public: boolean; wishlist_public: boolean };
export type PostHit = { id: string; title: string; author_name: string; subject: string; last_activity_at: string };
export type AuthorHit = { user_id: string; author_name: string; posts: number };
export type FavoriteHit = { id: string; brand: string; model: string; image_url: string | null; post_id: string | null; link_url: string | null };
export type PageHit = { href: string; title: string; text: string };

export type SearchResults = {
  query: string;
  watches: WatchHit[];
  wishes: WatchHit[];
  people: PersonHit[];
  posts: PostHit[];
  authors: AuthorHit[];
  favorites: FavoriteHit[];
  blog: PageHit[];
  pages: PageHit[];
};

// Site pages people might look for by keyword.
const PAGES: (PageHit & { keywords: string })[] = [
  { href: "/", title: "Home", text: "Brandon's Brands: luxury watch curation.", keywords: "home luxury watch curation brandon" },
  { href: "/about", title: "About Brandon's Brands", text: "Meet Brandon Volosov and why microbrands matter.", keywords: "about brandon volosov microbrands story contact" },
  { href: "/favorites", title: "Brandon's Favorites", text: "Brandon's favorite watches with his reviews and reels.", keywords: "favorites favourite reviews reels brandon" },
  { href: "/collectors", title: "Watch collectors", text: "Public collections and wishlists from members.", keywords: "collectors public collections wishlists members offers" },
  { href: "/forum", title: "Community forum", text: "Talk watches with the community.", keywords: "forum community discussions topics questions" },
  { href: "/blog", title: "Blog", text: "Watch stories, collecting tips and news.", keywords: "blog stories articles news tips" },
  { href: "/social", title: "Social media", text: "Instagram, TikTok, YouTube and Facebook.", keywords: "social media instagram tiktok youtube facebook reels videos" },
  { href: "/connect", title: "Connect with Brandon", text: "All of Brandon's links in one place.", keywords: "connect links follow social qr" },
  { href: "/collection", title: "Your collection", text: "Track your watches, values and box & papers.", keywords: "collection my watches track value" },
  { href: "/wishlist", title: "Your wishlist", text: "Watches you want, with price alerts.", keywords: "wishlist want price alerts target" },
  { href: "/dashboard", title: "Dashboard", text: "Your collection at a glance.", keywords: "dashboard stats value" },
  { href: "/about#contact", title: "Contact us", text: "Collaborations and questions.", keywords: "contact email collab collaboration help" },
];

// Words to search for: lowercase, letters/numbers and a few safe symbols only (so they can't break the query).
export function searchTerms(q: string): string[] {
  return q
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s'.&-]/gu, " ")
    .split(/\s+/)
    .map((t) => t.replace(/^[.'&-]+|[.'&-]+$/g, ""))
    .filter((t) => t.length >= 2)
    .slice(0, 6);
}

function matchesAll(text: string, terms: string[]) {
  const hay = text.toLowerCase();
  return terms.every((t) => hay.includes(t));
}

async function rest<T>(path: string, init?: RequestInit): Promise<T | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/${path}`, {
      ...init,
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...(init?.headers ?? {}) },
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

// PostgREST filter: every term must appear in at least one of the columns.
function allTermsFilter(terms: string[], columns: string[]) {
  const ors = terms.map((t) => `or(${columns.map((c) => `${c}.ilike.*${encodeURIComponent(t)}*`).join(",")})`);
  return `and=(${ors.join(",")})`;
}

export async function siteSearch(query: string): Promise<SearchResults> {
  const q = query.trim().slice(0, 100);
  const terms = searchTerms(q);
  const empty: SearchResults = { query: q, watches: [], wishes: [], people: [], posts: [], authors: [], favorites: [], blog: [], pages: [] };
  if (!terms.length) return empty;

  const [publicHits, posts, authorRows, favorites] = await Promise.all([
    rest<{ watches: WatchHit[]; wishes: WatchHit[]; people: PersonHit[] }>("rpc/search_public", {
      method: "POST",
      body: JSON.stringify({ p_q: terms.join(" ") }),
    }),
    rest<PostHit[]>(
      `forum_posts?select=id,title,author_name,subject,last_activity_at&${allTermsFilter(terms, ["title", "body", "author_name"])}&order=last_activity_at.desc&limit=20`,
    ),
    rest<{ user_id: string; author_name: string }[]>(
      `forum_posts?select=user_id,author_name&${allTermsFilter(terms, ["author_name"])}&limit=200`,
    ),
    rest<FavoriteHit[]>(
      `brand_favorites?select=id,brand,model,image_url,post_id,link_url&${allTermsFilter(terms, ["brand", "model", "note", "features"])}&order=sort.asc&limit=12`,
    ),
  ]);

  const authorMap = new Map<string, AuthorHit>();
  for (const r of authorRows ?? []) {
    const key = `${r.user_id}:${r.author_name}`;
    const cur = authorMap.get(key);
    if (cur) cur.posts += 1;
    else authorMap.set(key, { user_id: r.user_id, author_name: r.author_name, posts: 1 });
  }

  return {
    query: q,
    watches: publicHits?.watches ?? [],
    wishes: publicHits?.wishes ?? [],
    people: publicHits?.people ?? [],
    posts: posts ?? [],
    authors: [...authorMap.values()].sort((a, b) => b.posts - a.posts).slice(0, 12),
    favorites: favorites ?? [],
    blog: blogPosts
      .filter((p) => matchesAll(`${p.title} ${p.category} ${p.excerpt} ${p.body.join(" ")}`, terms))
      .map((p) => ({ href: `/blog/${p.slug}`, title: p.title, text: p.excerpt })),
    pages: PAGES.filter((p) => matchesAll(`${p.title} ${p.text} ${p.keywords}`, terms)).map(({ href, title, text }) => ({ href, title, text })),
  };
}

export function isFavoritesPost(subject: string) {
  return subject === FAVORITES_SUBJECT;
}
