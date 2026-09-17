import { createClient } from "@supabase/supabase-js";

/**
 * Supabase client, ported from pgsa-mvp/src/supabase.ts.
 *
 * The key here is the *publishable* (anon) key, which is safe in the browser —
 * it grants nothing on its own. Every write is gated by Row-Level Security and
 * the `is_admin()` check in the database, not by anything this file does.
 *
 * When the env vars are absent the client is null and the site falls back to
 * bundled seed data, so the design can be reviewed without a database.
 */

const url = import.meta.env.VITE_SUPABASE_URL?.trim();
const publishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();

export const isSupabaseConfigured = Boolean(url && publishableKey);

export const supabase = isSupabaseConfigured
  ? createClient(url!, publishableKey!, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

export const missingSupabaseMessage =
  "Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY.";
