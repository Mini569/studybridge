export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const supabasePublicKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseAnonKey = supabasePublicKey;

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const isDemoMode =
  process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
  process.env.NEXT_PUBLIC_DEMO_MODE === undefined ||
  !isSupabaseConfigured;

export function requireSupabasePublicEnv() {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase public environment variables are not configured.");
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
  };
}
