"use client";

import type { User } from "@supabase/supabase-js";
import supabase from "@/lib/supabaseClient";
import { watchBrands } from "@/lib/watchCatalog";

// --- Subjects ------------------------------------------------------------------
// Built-in subjects live here. "Watch Brands" and "Watch Clubs & Meetups" are folders:
// brand sub-folders come from the Add Watch brand list (plus Miscellaneous); club
// sub-folders, and any extra subjects, are created by members and stored in the database.

export type SubjectNode = {
  slug: string;
  name: string;
  icon: string;
  parent: string | null;
  folder?: boolean;
  community?: boolean;
  description?: string | null;
  created_by?: string | null;
};

export const BRANDS_FOLDER = "brands";
export const CLUBS_FOLDER = "clubs";
// Brandon's favorite watches. Only Brandon's Brands (moderators) starts discussions here; anyone can reply.
import { FAVORITES_SUBJECT } from "@/lib/favorites";
export { FAVORITES_SUBJECT };

const BUILT_IN: SubjectNode[] = [
  { slug: "general", name: "General Discussion", icon: "💬", parent: null },
  {
    slug: FAVORITES_SUBJECT,
    name: "Brandon's Favorites",
    icon: "⭐",
    parent: null,
    description: "Brandon's favorite watches, with his reviews and reels. Only Brandon starts discussions here; everyone can reply.",
  },
  { slug: BRANDS_FOLDER, name: "Watch Brands", icon: "⌚", parent: null, folder: true },
  { slug: CLUBS_FOLDER, name: "Watch Clubs & Meetups", icon: "🤝", parent: null, folder: true },
  { slug: "collaborations", name: "Collaborative Opportunities", icon: "🧩", parent: null },
  { slug: "suggestions", name: "Suggestions", icon: "💡", parent: null },
  { slug: "new-releases", name: "New Releases", icon: "✨", parent: null },
  { slug: "vintage", name: "Vintage", icon: "⏳", parent: null },
  { slug: "for-sale", name: "For Sale", icon: "🏷️", parent: null, description: "Watches members have for sale. Include photos, condition, box & papers, location and price. Brandon's Brands doesn't take part in sales: verify buyers and sellers and use a secure payment method or escrow." },
  { slug: "seeking-to-buy", name: "Seeking to Buy", icon: "🔎", parent: null, description: "Looking for a specific watch? Post the brand, model, reference and your budget, and members who have one can reply or message you." },
  { slug: "buying-advice", name: "Buying & Selling Advice", icon: "💵", parent: null },
  { slug: "authentication", name: "Authentication, Box & Papers", icon: "🔍", parent: null },
  { slug: "straps", name: "Straps & Accessories", icon: "🧵", parent: null },
  { slug: "wrist-shots", name: "Wrist Shots", icon: "📸", parent: null },
];

export function slugify(name: string): string {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

// Built-in sub-folders under Watch Clubs & Meetups (members can add their own clubs too).
const CLUB_NODES: SubjectNode[] = [
  {
    slug: `${CLUBS_FOLDER}/virtual-events`,
    name: "Virtual Events",
    icon: "💻",
    parent: CLUBS_FOLDER,
    description: "Online watch meetups, live streams, Zoom and Instagram Live sessions, virtual launches and webinars.",
  },
];

const BRAND_NODES: SubjectNode[] = [
  ...watchBrands.map((b) => ({ slug: `${BRANDS_FOLDER}/${slugify(b)}`, name: b, icon: "⌚", parent: BRANDS_FOLDER })),
  { slug: `${BRANDS_FOLDER}/misc`, name: "Miscellaneous", icon: "🗃️", parent: BRANDS_FOLDER },
];

export type CustomSubject = {
  slug: string;
  name: string;
  parent: string | null;
  description: string | null;
  created_by: string | null;
  created_at: string;
};

export type SubjectTree = {
  top: SubjectNode[];
  children: Map<string, SubjectNode[]>;
  bySlug: Map<string, SubjectNode>;
};

export function buildSubjectTree(custom: CustomSubject[]): SubjectTree {
  const communityTop = custom
    .filter((c) => !c.parent)
    .map((c) => ({ slug: c.slug, name: c.name, icon: "🗨️", parent: null, community: true, description: c.description, created_by: c.created_by }))
    .sort((a, b) => a.name.localeCompare(b.name));
  // Member-added sub-folders can sit under any subject (clubs under Watch Clubs & Meetups,
  // extra brands under Watch Brands, topics under Suggestions, and so on).
  const builtInSlugs = new Set(CLUB_NODES.map((n) => n.slug));
  const subs: SubjectNode[] = custom
    .filter((c) => c.parent && !builtInSlugs.has(c.slug))
    .map((c) => ({
      slug: c.slug,
      name: c.name,
      icon: c.parent === CLUBS_FOLDER ? "📍" : c.parent === BRANDS_FOLDER ? "⌚" : "📁",
      parent: c.parent,
      community: true,
      description: c.description,
      created_by: c.created_by,
    }));
  const top = [...BUILT_IN, ...communityTop];
  const children = new Map<string, SubjectNode[]>([
    [BRANDS_FOLDER, [...BRAND_NODES]],
    [CLUBS_FOLDER, [...CLUB_NODES]],
  ]);
  for (const sub of subs) children.set(sub.parent!, [...(children.get(sub.parent!) ?? []), sub]);
  for (const [parent, list] of children) {
    // Keep the brand list alphabetical with Miscellaneous last; everything else alphabetical.
    children.set(
      parent,
      [...list].sort((a, b) => (a.slug.endsWith("/misc") ? 1 : 0) - (b.slug.endsWith("/misc") ? 1 : 0) || a.name.localeCompare(b.name)),
    );
  }
  const bySlug = new Map<string, SubjectNode>();
  for (const n of [...top, ...BRAND_NODES, ...CLUB_NODES, ...subs]) bySlug.set(n.slug, n);
  return { top, children, bySlug };
}

export function parentOf(slug: string): string | null {
  return slug.includes("/") ? slug.split("/")[0] : null;
}

// A post matches a subject when it is in it, or in one of its sub-folders.
export function inSubject(postSubject: string, selected: string): boolean {
  return postSubject === selected || postSubject.startsWith(`${selected}/`);
}

export function describeSubject(tree: SubjectTree, slug: string): { node: SubjectNode; parent: SubjectNode | null } {
  const node = tree.bySlug.get(slug) ?? { slug, name: slug.split("/").pop()!.replace(/-/g, " "), icon: "💬", parent: parentOf(slug) };
  const p = node.parent ? tree.bySlug.get(node.parent) ?? null : null;
  return { node, parent: p };
}

// Full label like "Watch Brands › Rolex".
export function subjectLabel(tree: SubjectTree, slug: string): string {
  const { node, parent } = describeSubject(tree, slug);
  return parent ? `${parent.name} › ${node.name}` : node.name;
}

export async function listCustomSubjects(): Promise<CustomSubject[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("forum_subjects").select("*").order("name");
  if (error) return [];
  return (data ?? []) as CustomSubject[];
}

export async function createSubject(input: { name: string; parent: string | null; description?: string }): Promise<CustomSubject> {
  const name = input.name.trim().replace(/\s+/g, " ");
  if (name.length < 2 || name.length > 50) throw new Error("Topic names need 2–50 characters.");
  const base = slugify(name);
  if (base.length < 2) throw new Error("Use letters or numbers in the topic name.");
  if (input.parent && input.parent.includes("/")) throw new Error("Sub-folders can only be added to a main topic.");
  const slug = input.parent ? `${input.parent}/${base}` : `c-${base}`;
  const builtInNames = (input.parent ? [...BRAND_NODES, ...CLUB_NODES].filter((n) => n.parent === input.parent) : BUILT_IN).map((n) => n.name.toLowerCase());
  if (builtInNames.includes(name.toLowerCase()) || [...BRAND_NODES, ...CLUB_NODES].some((n) => n.slug === slug)) {
    throw new Error(`"${name}" already exists. Pick it from the list.`);
  }
  const { data, error } = await db()
    .from("forum_subjects")
    .insert({ slug, name, parent: input.parent, description: input.description?.trim() || null })
    .select("*")
    .single();
  if (error) {
    if (error.code === "23505") throw new Error(`"${name}" already exists. Pick it from the list.`);
    const err = friendly(error);
    if (err) throw err;
  }
  return data as CustomSubject;
}

export async function deleteSubject(slug: string): Promise<void> {
  const { error } = await db().from("forum_subjects").delete().eq("slug", slug);
  const err = friendly(error);
  if (err) throw err;
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

// Folders with owners (e.g. Brandon's Favorites): only the owners start discussions there; anyone can reply.
// Returns null if that isn't set up yet.
export type FolderOwners = Record<string, string[]>;

export async function loadFolderOwners(): Promise<FolderOwners | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.from("forum_folder_owners").select("subject,user_id");
  if (error) return null;
  const out: FolderOwners = {};
  for (const r of (data ?? []) as { subject: string; user_id: string }[]) (out[r.subject] ??= []).push(r.user_id);
  return out;
}

// Topics this member can't start discussions in.
export function lockedSubjects(owners: FolderOwners | null, userId: string | null | undefined, moderator: boolean): string[] {
  // Until folder owners are set up, Brandon's Favorites is limited to moderators.
  if (!owners) return moderator ? [] : [FAVORITES_SUBJECT];
  return Object.entries(owners)
    .filter(([, ids]) => ids.length && !(userId && ids.includes(userId)))
    .map(([subject]) => subject);
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
