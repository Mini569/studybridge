import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

import { requireSupabasePublicEnv } from "@/lib/env";

export async function createSupabaseServerClient() {
  const { supabaseUrl, supabaseAnonKey } = requireSupabasePublicEnv();
  const cookieStore = await cookies();

  return createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // Server Components cannot set cookies. Route handlers and actions can.
          }
        });
      },
    },
  });
}
