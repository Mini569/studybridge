import type { User } from "@supabase/supabase-js";

import type { createSupabaseServerClient } from "@/lib/supabase/server";

type ServerSupabaseClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

export async function ensureProfileForUser(supabase: ServerSupabaseClient, user: User): Promise<boolean> {
  const { data: profile, error: lookupError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (lookupError) {
    return false;
  }

  if (profile) {
    return true;
  }

  const displayName = typeof user.user_metadata.display_name === "string" ? user.user_metadata.display_name.trim() : "";
  const grade = Number(user.user_metadata.grade);

  if (displayName.length < 2 || displayName.length > 30 || ![1, 2, 3].includes(grade)) {
    return false;
  }

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: displayName,
    grade,
    onboarding_completed: false,
  });

  return !insertError || insertError.code === "23505";
}
