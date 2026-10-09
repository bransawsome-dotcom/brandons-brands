// Blog posts saved in the database (weekly Claude drafts and posts written on the Drafts page).
// Published ones appear on /blog alongside the hand-written posts in blogPosts.ts.
import { blogPosts, type BlogPost } from "@/lib/blogPosts";

export type SocialDrafts = {
  instagram?: { caption?: string; hashtags?: string; reel_idea?: string };
  tiktok?: { hook?: string; script?: string; caption?: string; hashtags?: string };
  youtube?: { title?: string; description?: string; short_script?: string; tags?: string };
  facebook?: { post?: string };
  posted?: Record<string, boolean>;
};

export type DbPost = {
  id: string;
  slug: string;
  title: string;
  category: string;
  excerpt: string;
  meta_description: string;
  keywords: string[];
  body: string[];
  social: SocialDrafts;
  sources: { title?: string; url: string }[];
  status: "draft" | "published";
  post_date: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  published_at: string | null;
};

export type PublicPost = BlogPost & { metaDescription?: string; keywords?: string[]; fromDb?: boolean };

// Published posts from the database (public key; cached for 5 minutes). Empty if the table isn't set up.
export async function loadPublishedDbPosts(): Promise<PublicPost[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return [];
  try {
    const res = await fetch(
      `${url}/rest/v1/blog_posts?select=slug,title,category,excerpt,meta_description,keywords,body,post_date&status=eq.published&order=post_date.desc&limit=500`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300, tags: ["blog"] } },
    );
    if (!res.ok) return [];
    const rows = (await res.json()) as Pick<DbPost, "slug" | "title" | "category" | "excerpt" | "meta_description" | "keywords" | "body" | "post_date">[];
    return rows.map((r) => ({
      slug: r.slug,
      title: r.title,
      date: r.post_date,
      category: r.category,
      excerpt: r.excerpt,
      body: r.body,
      metaDescription: r.meta_description || undefined,
      keywords: r.keywords,
      fromDb: true,
    }));
  } catch {
    return [];
  }
}

// Every public post, newest first. A database post with the same address as a hand-written one wins.
export async function loadAllPosts(): Promise<PublicPost[]> {
  const db = await loadPublishedDbPosts();
  const taken = new Set(db.map((p) => p.slug));
  return [...db, ...blogPosts.filter((p) => !taken.has(p.slug))].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export async function loadPost(slug: string): Promise<PublicPost | undefined> {
  return (await loadAllPosts()).find((p) => p.slug === slug);
}

export function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
}
