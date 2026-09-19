"use client";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

let client: SupabaseClient | undefined;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error("Supabase тохиргоо дутуу байна. Төслийн үндсэн .env.local тохиргоог шалгаад server-ээ дахин асаана уу.");
  // Only the explicitly named publishable credential is used.
  client = createClient(url, key);
  return client;
}