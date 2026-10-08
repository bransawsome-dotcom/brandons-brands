import type { MetadataRoute } from "next";
import { blogPosts } from "@/lib/blogPosts";
import { SITE_URL } from "@/lib/site";

// Public pages search engines should index. Member-only pages (account, inbox, etc.) are left out.
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const pages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/forum`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/social`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
  const posts: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    lastModified: new Date(`${p.date}T12:00:00Z`),
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [...pages, ...posts];
}
