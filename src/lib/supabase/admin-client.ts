import { createClient, type SupabaseClient } from "@supabase/supabase-js";

// Server-only Supabase client backed by the SECRET key (sb_secret_... /
// service_role). The secret key BYPASSES Row Level Security, so this client is
// what all privileged admin writes and the OAuth member-upsert must use once
// RLS is enabled (see web/TODO_SECURITY.md, step 2).
//
// SECURITY: SUPABASE_SECRET_KEY must NEVER be exposed to the browser. It has no
// NEXT_PUBLIC_ prefix, and this module must only ever be imported from server
// code ("use server" actions, route handlers) — never from a "use client" file.
//
// Callers must still gate access themselves (e.g. requireOfficer()) before
// using this client, since it can read and write every row in every table.

let cached: SupabaseClient | null = null;

export function createSupabaseAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) return null;

  if (!cached) {
    cached = createClient(url, secret, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return cached;
}
