"use server";

import { revalidatePath } from "next/cache";

import { isDemoMode } from "@/lib/env";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { onboardingSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/app/actions/applications";

export async function completeOnboarding(input: unknown): Promise<ActionResult> {
  const parsed = onboardingSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 온보딩을 완료했습니다.", redirectTo: "/dashboard" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "로그인이 필요합니다.", redirectTo: "/login" };
  }

  if (!(await ensureProfileForUser(supabase, user))) {
    return { ok: false, message: "학습 프로필을 준비하지 못했습니다. 잠시 후 다시 시도해 주세요." };
  }

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      grade: parsed.data.grade,
      bio: parsed.data.bio,
      interests: parsed.data.interests,
      needs: parsed.data.needs,
      onboarding_completed: false,
      mentor_enabled: parsed.data.wantsToMentor,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: "온보딩 정보를 저장하지 못했습니다." };
  }

  if (parsed.data.wantsToMentor) {
    const { error: settingsError } = await supabase.from("mentor_settings").upsert({
      mentor_id: user.id,
      introduction: parsed.data.bio ?? "",
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
      return { ok: false, message: "멘토 과목과 가능 시간을 저장하지 못했습니다. 입력값을 확인해 주세요." };
    }
  } else {
    const [{ error: subjectError }, { error: availabilityError }, { error: settingsError }] = await Promise.all([
      supabase.from("mentor_subjects").delete().eq("mentor_id", user.id),
      supabase.from("availability_slots").delete().eq("user_id", user.id),
      supabase.from("mentor_settings").delete().eq("mentor_id", user.id),
    ]);
    if (subjectError || availabilityError || settingsError) {
      return { ok: false, message: "멘토 활동 설정을 정리하지 못했습니다." };
    }
  }

  const { error: completionError } = await supabase.from("profiles").update({ onboarding_completed: true }).eq("id", user.id);
  if (completionError) return { ok: false, message: "온보딩 완료 상태를 저장하지 못했습니다." };

  revalidatePath("/", "layout");
  return { ok: true, message: "온보딩을 완료했습니다.", redirectTo: "/dashboard" };
}

export async function signOut(): Promise<ActionResult> {
  if (isDemoMode) {
    return { ok: true, message: "데모 모드에서 로그아웃했습니다.", redirectTo: "/" };
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  return { ok: true, message: "로그아웃했습니다.", redirectTo: "/" };
}
