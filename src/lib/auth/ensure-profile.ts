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

  const metadata = user.user_metadata;
  const nameCandidates = [metadata.display_name, metadata.full_name, metadata.name];
  const metadataName = nameCandidates.find((value): value is string => typeof value === "string" && value.trim().length > 0)?.trim();
  const emailName = user.email?.split("@", 1)[0]?.trim();
  const fallbackName = `학생-${user.id.slice(0, 6)}`;
  const rawDisplayName = metadataName ?? emailName ?? fallbackName;
  const displayName = (rawDisplayName.length >= 2 ? rawDisplayName : `${rawDisplayName} 학생`).slice(0, 30);
  const metadataGrade = Number(metadata.grade);
  const grade = [1, 2, 3].includes(metadataGrade) ? metadataGrade : 1;

  const { error: insertError } = await supabase.from("profiles").insert({
    id: user.id,
    display_name: displayName,
    grade,
    onboarding_completed: false,
  });

  return !insertError || insertError.code === "23505";
}
