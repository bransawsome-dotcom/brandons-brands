"use client";

import type { User } from "@supabase/supabase-js";
import supabase from "@/lib/supabaseClient";

// Discussion subjects. Add or rename here; existing posts keep their subject text.
export const FORUM_SUBJECTS = [
  { slug: "general", name: "General Discussion", icon: "💬" },
  { slug: "rolex", name: "Rolex", icon: "👑" },
  { slug: "omega", name: "Omega", icon: "Ω" },
  { slug: "holy-trinity", name: "Patek, AP & Vacheron", icon: "🏛️" },
  { slug: "tudor", name: "Tudor", icon: "🛡️" },
  { slug: "independents", name: "Independents & Micro Brands", icon: "🔧" },
  { slug: "vintage", name: "Vintage", icon: "⏳" },
  { slug: "new-releases", name: "New Releases", icon: "✨" },
  { slug: "buying-advice", name: "Buying & Selling Advice", icon: "🤝" },
  { slug: "authentication", name: "Authentication, Box & Papers", icon: "🔍" },
  { slug: "straps", name: "Straps & Accessories", icon: "🧵" },
  { slug: "wrist-shots", name: "Wrist Shots", icon: "📸" },
] as const;

export type ForumSubjectSlug = (typeof FORUM_SUBJECTS)[number]["slug"];

export function subjectInfo(slug: string) {
  return FORUM_SUBJECTS.find((s) => s.slug === slug) ?? { slug, name: slug, icon: "💬" };
}

export type ForumPost = {
  id: string;
  user_id: string;
  author_name: string;
  subject: string;
  title: string;
  body: string;
  created_at: string;
  updated_at: string | null;
  last_activity_at: string;
  comment_count: number;
};

export type ForumComment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  user_id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export const TITLE_MAX = 150;
export const BODY_MAX = 5000;
export const COMMENT_MAX = 3000;

function db() {
  if (!supabase) throw new Error("The forum isn't available right now.");
  return supabase;
}

function friendly(error: { message: string; code?: string } | null): Error | null {
  if (!error) return null;
  if (error.code === "42P01" || /relation .* does not exist|Could not find the table/i.test(error.message)) {
    return new Error("The forum is being set up. Please check back soon.");
  }
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return new Error("Please log in with a member account to do that.");
  }
  return new Error(error.message);
}

// The name shown on posts. Members choose it once; it's saved on their account.
export function forumName(user: User | null | undefined): string {
  const meta = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const name = meta.display_name ?? meta.full_name ?? meta.name;
  return typeof name === "string" ? name.trim() : "";
}

export async function saveForumName(name: string): Promise<User> {
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 40) throw new Error("Use 2–40 characters for your forum name.");
  const { data, error } = await db().auth.updateUser({ data: { display_name: clean } });
  if (error) throw friendly(error);
  return data.user;
}

export async function isModerator(userId: string | null | undefined): Promise<boolean> {
  if (!userId || !supabase) return false;
  const { data } = await supabase.from("forum_moderators").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data);
}

type PostRow = Omit<ForumPost, "comment_count"> & { forum_comments?: { count: number }[] };

function toPost(row: PostRow): ForumPost {
  const { forum_comments, ...rest } = row;
  return { ...rest, comment_count: forum_comments?.[0]?.count ?? 0 };
}

export async function listPosts(subject?: string): Promise<ForumPost[]> {
  let query = db()
    .from("forum_posts")
    .select("*, forum_comments(count)")
    .order("last_activity_at", { ascending: false })
    .limit(200);
  if (subject) query = query.eq("subject", subject);
  const { data, error } = await query;
  const err = friendly(error);
  if (err) throw err;
  return ((data ?? []) as PostRow[]).map(toPost);
}

export async function getPost(id: string): Promise<ForumPost | null> {
  const { data, error } = await db().from("forum_posts").select("*, forum_comments(count)").eq("id", id).maybeSingle();
  const err = friendly(error);
  if (err) throw err;
  return data ? toPost(data as PostRow) : null;
}

export async function createPost(input: { subject: string; title: string; body: string; author_name: string }): Promise<ForumPost> {
  const { data, error } = await db()
    .from("forum_posts")
    .insert({
      subject: input.subject,
      title: input.title.trim().slice(0, TITLE_MAX),
      body: input.body.trim().slice(0, BODY_MAX),
      author_name: input.author_name,
    })
    .select("*")
    .single();
  const err = friendly(error);
  if (err) throw err;
  return { ...(data as Omit<ForumPost, "comment_count">), comment_count: 0 };
}

export async function updatePost(id: string, patch: { title: string; body: string; subject: string }): Promise<void> {
  const { error } = await db()
    .from("forum_posts")
    .update({
      title: patch.title.trim().slice(0, TITLE_MAX),
      body: patch.body.trim().slice(0, BODY_MAX),
      subject: patch.subject,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  const err = friendly(error);
  if (err) throw err;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await db().from("forum_posts").delete().eq("id", id);
  const err = friendly(error);
  if (err) throw err;
}

export async function listComments(postId: string): Promise<ForumComment[]> {
  const { data, error } = await db().from("forum_comments").select("*").eq("post_id", postId).order("created_at", { ascending: true });
  const err = friendly(error);
  if (err) throw err;
  return (data ?? []) as ForumComment[];
}

export async function addComment(input: { post_id: string; parent_id: string | null; body: string; author_name: string }): Promise<ForumComment> {
  const { data, error } = await db()
    .from("forum_comments")
    .insert({ ...input, body: input.body.trim().slice(0, COMMENT_MAX) })
    .select("*")
    .single();
  const err = friendly(error);
  if (err) throw err;
  return data as ForumComment;
}

export async function deleteComment(id: string): Promise<void> {
  const { error } = await db().from("forum_comments").delete().eq("id", id);
  const err = friendly(error);
  if (err) throw err;
}

// Live updates: calls onChange whenever a comment is added or removed on this post.
export function watchComments(postId: string, onChange: () => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel(`forum-comments-${postId}-${Math.random().toString(36).slice(2, 8)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "forum_comments", filter: `post_id=eq.${postId}` }, onChange)
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}

// Live updates for the thread list.
export function watchPosts(onChange: () => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel(`forum-posts-${Math.random().toString(36).slice(2, 8)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "forum_posts" }, onChange)
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}

export function timeAgo(iso: string): string {
  const seconds = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
