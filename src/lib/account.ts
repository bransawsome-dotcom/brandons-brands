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
  // The name is also the member's public name, so it has to be unique across the site.
  const { error: nameError } = await supabase.rpc("set_public_name", { p_name: clean });
  if (nameError && !/function .* does not exist|Could not find the function/i.test(nameError.message)) {
    if (/name_taken/.test(nameError.message)) throw new Error("That name is already taken. Try another, or add your customer number.");
    if (/name_invalid/.test(nameError.message)) throw new Error("Use 2–40 characters, including at least 2 letters or numbers.");
    throw new Error(nameError.message);
  }
  const { error } = await supabase.auth.updateUser({ data: { account_name: clean } });
  if (error) throw new Error(error.message);
}

// Is this name free to use as a public name? (true if the check isn't available yet)
export async function isNameAvailable(name: string): Promise<boolean> {
  if (!supabase) return true;
  const { data, error } = await supabase.rpc("public_name_available", { p_name: name });
  if (error) return true;
  return data !== false;
}
