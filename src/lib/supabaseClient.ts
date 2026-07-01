import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

const supabase =
  typeof window !== "undefined" && supabaseUrl
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          detectSessionInUrl: true,
        },
        global: {
          headers: {
            "X-Client-Info": "brandons-brands",
          },
        },
      })
    : null;

export default supabase;
