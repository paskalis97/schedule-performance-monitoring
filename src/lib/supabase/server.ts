import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/** Supabase client for use in Server Components (no cookie handling — no auth). */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
