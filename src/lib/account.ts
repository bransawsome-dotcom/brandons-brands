"use client";

import type { User } from "@supabase/supabase-js";
import supabase from "@/lib/supabaseClient";

// The name or customer number a member chose for their account (asked at sign-up).
// Separate from the forum name, which is only used on forum posts.
export function accountName(user: User | null | undefined): string {
  const value = (user?.user_metadata as Record<string, unknown> | undefined)?.account_name;
  return typeof value === "string" ? value.trim() : "";
}

export async function saveAccountName(name: string): Promise<void> {
  const clean = name.trim().replace(/\s+/g, " ");
  if (clean.length < 2 || clean.length > 40) throw new Error("Use 2–40 characters.");
  if (!supabase) throw new Error("Settings can't be saved right now.");
  const { error } = await supabase.auth.updateUser({ data: { account_name: clean } });
  if (error) throw new Error(error.message);
}
