"use client";

import { createBrowserClient } from "@supabase/ssr";

import { requireSupabasePublicEnv } from "@/lib/env";

export function createSupabaseBrowserClient() {
  const { supabaseUrl, supabaseAnonKey } = requireSupabasePublicEnv();

  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}
