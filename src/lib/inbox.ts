"use client";

import supabase from "@/lib/supabaseClient";

export type Notification = {
  id: string;
  user_id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  created_at: string;
  read_at: string | null;
};

export type Message = {
  id: string;
  sender_id: string;
  recipient_id: string;
  sender_name: string;
  recipient_name: string;
  body: string;
  created_at: string;
  read_at: string | null;
};

export type Conversation = {
  otherId: string;
  otherName: string;
  last: Message;
  unread: number;
};

export const MESSAGE_MAX = 3000;
export const BRAND_NAME = "Brandon's Brands";

// Fired after anything is marked read, so the header count updates right away.
export const INBOX_CHANGED = "bb-inbox-changed";
export function announceInboxChange() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(INBOX_CHANGED));
}

function db() {
  if (!supabase) throw new Error("The inbox isn't available right now.");
  return supabase;
}

function friendly(error: { message: string; code?: string } | null): Error | null {
  if (!error) return null;
  if (error.code === "42P01" || /does not exist|Could not find the table/i.test(error.message)) {
    return new Error("The inbox is being set up. Please check back soon.");
  }
  if (error.code === "42501" || /row-level security/i.test(error.message)) {
    return new Error("Please log in with a member account to do that.");
  }
  return new Error(error.message);
}

export async function unreadCounts(userId: string): Promise<{ notifications: number; messages: number }> {
  if (!supabase) return { notifications: 0, messages: 0 };
  const [n, m] = await Promise.all([
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId).is("read_at", null),
    supabase.from("messages").select("id", { count: "exact", head: true }).eq("recipient_id", userId).is("read_at", null),
  ]);
  return { notifications: n.error ? 0 : n.count ?? 0, messages: m.error ? 0 : m.count ?? 0 };
}

export async function listNotifications(userId: string, limit = 100): Promise<Notification[]> {
  const { data, error } = await db()
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  const err = friendly(error);
  if (err) throw err;
  return (data ?? []) as Notification[];
}

export async function markNotificationsRead(ids: string[]): Promise<void> {
  if (!ids.length) return;
  const { error } = await db().from("notifications").update({ read_at: new Date().toISOString() }).in("id", ids);
  const err = friendly(error);
  if (err) throw err;
  announceInboxChange();
}

export async function deleteNotification(id: string): Promise<void> {
  const { error } = await db().from("notifications").delete().eq("id", id);
  const err = friendly(error);
  if (err) throw err;
  announceInboxChange();
}

export async function listMessages(userId: string): Promise<Message[]> {
  const { data, error } = await db()
    .from("messages")
    .select("*")
    .or(`sender_id.eq.${userId},recipient_id.eq.${userId}`)
    .order("created_at", { ascending: true })
    .limit(1000);
  const err = friendly(error);
  if (err) throw err;
  return (data ?? []) as Message[];
}

export function groupConversations(messages: Message[], userId: string): Conversation[] {
  const map = new Map<string, Conversation>();
  for (const m of messages) {
    const mine = m.sender_id === userId;
    const otherId = mine ? m.recipient_id : m.sender_id;
    const otherName = mine ? m.recipient_name : m.sender_name;
    const existing = map.get(otherId);
    const unread = !mine && !m.read_at ? 1 : 0;
    if (!existing) map.set(otherId, { otherId, otherName, last: m, unread });
    else {
      existing.last = m;
      existing.unread += unread;
      // Prefer the name the other person used most recently.
      if (!mine) existing.otherName = m.sender_name;
    }
  }
  return [...map.values()].sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
}

export async function sendMessage(input: { recipient_id: string; recipient_name: string; sender_name: string; body: string }): Promise<Message> {
  const { data, error } = await db()
    .from("messages")
    .insert({ ...input, body: input.body.trim().slice(0, MESSAGE_MAX) })
    .select("*")
    .single();
  const err = friendly(error);
  if (err) throw err;
  return data as Message;
}

export async function markConversationRead(userId: string, otherId: string): Promise<void> {
  const { error } = await db()
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", userId)
    .eq("sender_id", otherId)
    .is("read_at", null);
  const err = friendly(error);
  if (err) throw err;
  announceInboxChange();
}

export async function brandContactId(): Promise<string | null> {
  if (!supabase) return null;
  const { data, error } = await supabase.rpc("brand_contact_id");
  if (error) return null;
  return (data as string | null) ?? null;
}

// Live updates for this member's notifications and messages.
// Each caller gets its own channel name: the header icon and the Inbox page listen at the same time,
// and reusing one name makes the second listener fail.
export function watchInbox(userId: string, onChange: () => void): () => void {
  if (!supabase) return () => {};
  const client = supabase;
  const channel = client
    .channel(`inbox-${userId}-${Math.random().toString(36).slice(2, 8)}`)
    .on("postgres_changes", { event: "*", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, onChange)
    .on("postgres_changes", { event: "*", schema: "public", table: "messages", filter: `recipient_id=eq.${userId}` }, onChange)
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `sender_id=eq.${userId}` }, onChange)
    .subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}

// --- Folders -------------------------------------------------------------------

export type FolderKey = "all" | "messages" | "alerts" | "forum" | "updates" | "events";

export const FOLDERS: { key: FolderKey; name: string; icon: string; hint: string }[] = [
  { key: "all", name: "All", icon: "📥", hint: "Everything in your inbox" },
  { key: "messages", name: "Messages", icon: "✉️", hint: "Private messages with members and Brandon's Brands" },
  { key: "alerts", name: "Price alerts", icon: "🏷️", hint: "Wishlist watches listed at or below your target price" },
  { key: "forum", name: "Forum", icon: "💬", hint: "Replies to your posts and discussions or subjects you follow" },
  { key: "updates", name: "Website updates", icon: "📢", hint: "News and new features from Brandon's Brands" },
  { key: "events", name: "Watch group events", icon: "📅", hint: "Meetups, group events and updates" },
];

const KIND_FOLDER: Record<string, FolderKey> = {
  price_alert: "alerts",
  forum_reply: "forum",
  comment_reply: "forum",
  followed_reply: "forum",
  subject_post: "forum",
  folder_reply: "forum",
  folder_new: "forum",
  site_update: "updates",
  group_event: "events",
};

export function folderOf(kind: string): FolderKey {
  return KIND_FOLDER[kind] ?? "updates";
}

export const KIND_ICON: Record<string, string> = {
  price_alert: "🏷️",
  forum_reply: "💬",
  comment_reply: "↩️",
  followed_reply: "👀",
  subject_post: "🆕",
  folder_reply: "⭐",
  folder_new: "📁",
  site_update: "📢",
  group_event: "📅",
};

// --- Following -----------------------------------------------------------------

export async function isFollowingPost(userId: string, postId: string): Promise<boolean> {
  if (!supabase) return false;
  const { data } = await supabase.from("forum_post_follows").select("post_id").eq("user_id", userId).eq("post_id", postId).maybeSingle();
  return Boolean(data);
}

export async function setFollowPost(postId: string, follow: boolean): Promise<void> {
  const client = db();
  const { error } = follow
    ? await client.from("forum_post_follows").upsert({ post_id: postId }, { onConflict: "user_id,post_id", ignoreDuplicates: true })
    : await client.from("forum_post_follows").delete().eq("post_id", postId);
  const err = friendly(error);
  if (err) throw err;
}

export async function followedSubjects(userId: string): Promise<string[]> {
  if (!supabase) return [];
  const { data } = await supabase.from("forum_subject_follows").select("subject").eq("user_id", userId);
  return (data ?? []).map((r: { subject: string }) => r.subject);
}

export async function setFollowSubject(subject: string, follow: boolean): Promise<void> {
  const client = db();
  const { error } = follow
    ? await client.from("forum_subject_follows").upsert({ subject }, { onConflict: "user_id,subject", ignoreDuplicates: true })
    : await client.from("forum_subject_follows").delete().eq("subject", subject);
  const err = friendly(error);
  if (err) throw err;
}

// --- Announcements (moderators) ------------------------------------------------

export async function sendAnnouncement(input: { kind: "site_update" | "group_event"; title: string; body: string; link?: string }): Promise<number> {
  const { data, error } = await db().rpc("send_announcement", {
    p_kind: input.kind,
    p_title: input.title.trim(),
    p_body: input.body.trim(),
    p_link: input.link?.trim() || null,
  });
  const err = friendly(error);
  if (err) throw err;
  announceInboxChange();
  return (data as number) ?? 0;
}

// --- Favorite forum folders -------------------------------------------------------
// A favorite is a followed subject/folder. notify = whether new discussions, replies and
// sub-folders in it (and everything inside it) send inbox alerts.

export type Favorite = { subject: string; notify: boolean; created_at: string };

export async function listFavorites(userId: string): Promise<Favorite[]> {
  if (!supabase) return [];
  const { data, error } = await supabase.from("forum_subject_follows").select("*").eq("user_id", userId).order("created_at");
  if (error) return [];
  return (data ?? []).map((r: { subject: string; notify?: boolean | null; created_at: string }) => ({
    subject: r.subject,
    notify: r.notify !== false,
    created_at: r.created_at,
  }));
}

export async function setFavoriteNotify(subject: string, notify: boolean): Promise<void> {
  const { error } = await db().from("forum_subject_follows").update({ notify }).eq("subject", subject);
  const err = friendly(error);
  if (err) throw err;
}
