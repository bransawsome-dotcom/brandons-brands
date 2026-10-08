"use client";

import supabase from "@/lib/supabaseClient";

export type ShareKind = "collection" | "wishlist";

export type ShareLink = {
  token: string;
  kind: ShareKind;
  show_paid: boolean;
  show_notes: boolean;
  created_at: string;
};

function db() {
  if (!supabase) throw new Error("Sharing isn't available right now.");
  return supabase;
}

function friendly(error: { message: string; code?: string } | null): Error | null {
  if (!error) return null;
  if (error.code === "42P01" || /does not exist|Could not find the table/i.test(error.message)) {
    return new Error("Sharing is being set up. Please check back soon.");
  }
  return new Error(error.message);
}

export function shareUrl(token: string): string {
  const origin = typeof window !== "undefined" ? window.location.origin : "https://brandonsbrands17.com";
  return `${origin}/share/${token}`;
}

export async function getShareLink(kind: ShareKind): Promise<ShareLink | null> {
  const { data, error } = await db().from("share_links").select("*").eq("kind", kind).maybeSingle();
  const err = friendly(error);
  if (err) throw err;
  return (data as ShareLink | null) ?? null;
}

export async function createShareLink(kind: ShareKind, options: { show_paid: boolean; show_notes: boolean }): Promise<ShareLink> {
  const { data, error } = await db().from("share_links").insert({ kind, ...options }).select("*").single();
  const err = friendly(error);
  if (err) throw err;
  return data as ShareLink;
}

export async function updateShareLink(token: string, options: { show_paid: boolean; show_notes: boolean }): Promise<void> {
  const { error } = await db().from("share_links").update(options).eq("token", token);
  const err = friendly(error);
  if (err) throw err;
}

// Stopping sharing deletes the link; turning it on again makes a brand-new link.
export async function stopSharing(token: string): Promise<void> {
  const { error } = await db().from("share_links").delete().eq("token", token);
  const err = friendly(error);
  if (err) throw err;
}
