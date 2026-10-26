"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/app/actions/applications";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mentorProfileSchema } from "@/lib/validation/schemas";

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const parsed = mentorProfileSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 프로필 변경 사항을 저장한 것으로 표시했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "로그인이 필요합니다.", redirectTo: "/login" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      grade: parsed.data.grade,
      bio: parsed.data.bio,
      mentor_enabled: parsed.data.mentorEnabled,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: "프로필을 저장하지 못했습니다." };
  }

  if (parsed.data.mentorEnabled) {
    const { error: settingsError } = await supabase.from("mentor_settings").upsert({
      mentor_id: user.id,
      introduction: parsed.data.introduction ?? "",
      max_active_mentees: parsed.data.maxActiveMentees,
      is_accepting: true,
    });
    const { error: subjectDeleteError } = await supabase.from("mentor_subjects").delete().eq("mentor_id", user.id);
    const topics = (parsed.data.mentorTopics ?? "").split(",").map((item) => item.trim()).filter(Boolean);
    const { error: subjectInsertError } = await supabase.from("mentor_subjects").insert(
      parsed.data.mentorSubjectIds.map((subjectId) => ({
        mentor_id: user.id,
        subject_id: subjectId,
        proficiency_level: parsed.data.proficiencyLevel ?? 3,
        topics,
        preferred_grades: [parsed.data.grade],
        is_active: true,
      })),
    );
    const { error: availabilityDeleteError } = await supabase.from("availability_slots").delete().eq("user_id", user.id);
    const { error: availabilityInsertError } = await supabase.from("availability_slots").insert(
      parsed.data.availableDays.map((day) => ({
        user_id: user.id,
        day_of_week: day,
        start_time: parsed.data.availableStartTime,
        end_time: parsed.data.availableEndTime,
      })),
    );
    if (settingsError || subjectDeleteError || subjectInsertError || availabilityDeleteError || availabilityInsertError) {
      return { ok: false, message: "프로필은 저장했지만 멘토 과목 또는 가능 시간을 저장하지 못했습니다." };
    }
  } else {
    await Promise.all([
      supabase.from("mentor_subjects").delete().eq("mentor_id", user.id),
      supabase.from("availability_slots").delete().eq("user_id", user.id),
      supabase.from("mentor_settings").delete().eq("mentor_id", user.id),
    ]);
  }

  revalidatePath("/profile");
  return { ok: true, message: "프로필을 저장했습니다." };
}
