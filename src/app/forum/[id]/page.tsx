import type { Metadata } from "next";
import { cache } from "react";
import PostView from "./PostView";
import { SITE_URL } from "@/lib/site";
import { socials } from "@/lib/socials";
import { FAVORITES_SUBJECT } from "@/lib/favorites";

// A forum discussion. The page itself is interactive (PostView); this server part gives search engines
// a real title, description and structured data for every discussion.

export const revalidate = 300;

type PostRow = {
  id: string;
  title: string;
  body: string;
  author_name: string;
  subject: string;
  created_at: string;
  updated_at: string | null;
  forum_comments?: { count: number }[];
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const loadPost = cache(async (id: string): Promise<PostRow | null> => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key || !UUID.test(id)) return null;
  try {
    const res = await fetch(
      `${url}/rest/v1/forum_posts?id=eq.${id}&select=id,title,body,author_name,subject,created_at,updated_at,forum_comments(count)`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` }, next: { revalidate: 300 } },
    );
    if (!res.ok) return null;
    const rows = (await res.json()) as PostRow[];
    return rows[0] ?? null;
  } catch {
    return null;
  }
});

// The favorite's photo, for link previews of Brandon's Favorites discussions.
async function favoriteImage(postId: string): Promise<string | null> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  try {
    const res = await fetch(`${url}/rest/v1/brand_favorites?post_id=eq.${postId}&select=image_url`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const rows = (await res.json()) as { image_url: string | null }[];
    return rows[0]?.image_url ?? null;
  } catch {
    return null;
  }
}

function excerpt(text: string, max = 158): string {
  const clean = text.replace(/https?:\/\/\S+/g, "").replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const post = await loadPost(id);
  if (!post) return { title: "Discussion | Brandon's Brands Forum" };
  const favorite = post.subject === FAVORITES_SUBJECT;
  const title = favorite
    ? `${post.title} | Brandon's Favorites Watch Review | Brandon's Brands`
    : `${post.title} | Brandon's Brands Watch Forum`;
  const description = excerpt(post.body);
  const image = favorite ? await favoriteImage(post.id) : null;
  const path = `/forum/${post.id}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "article", url: path, title: post.title, description, images: [image || "/og-image.png"] },
    twitter: { card: "summary_large_image", title: post.title, description, images: [image || "/og-image.png"] },
  };
}

export default async function ForumThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await loadPost(id);
  const jsonLd = post
    ? {
        "@context": "https://schema.org",
        "@type": "DiscussionForumPosting",
        headline: post.title,
        text: post.body,
        url: `${SITE_URL}/forum/${post.id}`,
        datePublished: post.created_at,
        ...(post.updated_at ? { dateModified: post.updated_at } : {}),
        author:
          post.subject === FAVORITES_SUBJECT
            ? { "@type": "Person", name: "Brandon Volosov", url: `${SITE_URL}/about`, sameAs: socials.map((s) => s.url) }
            : { "@type": "Person", name: post.author_name },
        interactionStatistic: {
          "@type": "InteractionCounter",
          interactionType: "https://schema.org/CommentAction",
          userInteractionCount: post.forum_comments?.[0]?.count ?? 0,
        },
        isPartOf: { "@type": "WebSite", name: "Brandon's Brands", url: SITE_URL },
      }
    : null;
  return (
    <>
      {jsonLd ? <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} /> : null}
      <PostView />
    </>
  );
}
