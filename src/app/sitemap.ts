import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blogPosts";
import { learnGuides } from "@/lib/learn";
import { SITE_URL } from "@/lib/site";
import { listPublicCollectors } from "@/lib/publicLists";
import { FAVORITES_SUBJECT } from "@/lib/favorites";

// Rebuilt hourly so newly public lists are picked up by search engines.
export const revalidate = 3600;

// Public pages search engines should index. Member-only pages (account, inbox, etc.) are left out.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/forum`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/social`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/learn`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/terms`, lastModified: now, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/favorites`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/connect`, lastModified: now, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/collectors`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
  ];
  const lists: MetadataRoute.Sitemap = (await listPublicCollectors()).flatMap((c) =>
    (["collection", "wishlist"] as const)
      .filter((k) => (k === "collection" ? c.collection_public : c.wishlist_public))
      .map((k) => ({
        url: `${SITE_URL}/collectors/${c.handle}/${k}`,
        lastModified: new Date(c.updated_at),
        changeFrequency: "weekly" as const,
        priority: 0.6,
      })),
  );
  const posts: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T12:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const guides: MetadataRoute.Sitemap = learnGuides.map((g) => ({
    url: `${SITE_URL}/learn/${g.slug}`,
    lastModified: new Date(`${g.updated}T12:00:00Z`),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));
  return [...pages, ...guides, ...posts, ...lists, ...(await forumDiscussions())];
}

// Every forum discussion (Brandon's Favorites discussions rank highest).
async function forumDiscussions(): Promise<MetadataRoute.Sitemap> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(`${url}/rest/v1/forum_posts?select=id,subject,last_activity_at&order=last_activity_at.desc&limit=2000`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 3600 },
    });
    if (!res.ok) return [];
    const rows = (await res.json()) as { id: string; subject: string; last_activity_at: string }[];
    return rows.map((r) => ({
      url: `${SITE_URL}/forum/${r.id}`,
      lastModified: new Date(r.last_activity_at),
      changeFrequency: "weekly" as const,
      priority: r.subject === FAVORITES_SUBJECT ? 0.7 : 0.5,
    }));
  } catch {
    return [];
  }
}
