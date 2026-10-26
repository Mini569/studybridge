"use server";

import { revalidatePath } from "next/cache";
import type { AuthError } from "@supabase/supabase-js";

import { isDemoMode, siteUrl } from "@/lib/env";
import { ensureProfileForUser } from "@/lib/auth/ensure-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, onboardingSchema, signupSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/app/actions/applications";

function signupErrorMessage(error: AuthError | null) {
  switch (error?.code) {
    case "email_address_not_authorized":
      return "현재 이메일 발송 설정에서는 이 주소로 확인 메일을 보낼 수 없습니다. 운영자에게 문의해 주세요.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "가입 요청이 많아 잠시 제한되었습니다. 잠시 후 다시 시도해 주세요.";
    case "email_address_invalid":
      return "이 이메일 주소는 사용할 수 없습니다. 다른 주소를 입력해 주세요.";
    case "user_already_exists":
      return "이미 가입된 이메일입니다. 로그인해 주세요.";
    default:
      return "회원가입을 완료하지 못했습니다. 잠시 후 다시 시도해 주세요.";
  }
}

export async function loginWithPassword(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  if (isDemoMode) {
    return { ok: true, message: "데모 모드로 로그인했습니다.", redirectTo: "/dashboard" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error || !data.user) {
    return { ok: false, message: error?.code === "email_not_confirmed" ? "이메일의 가입 확인 링크를 먼저 눌러 주세요." : "이메일 또는 비밀번호를 확인해 주세요." };
  }

  if (!(await ensureProfileForUser(supabase, data.user))) {
    return { ok: false, message: "학습 프로필을 준비하지 못했습니다. 잠시 후 다시 로그인해 주세요." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "로그인했습니다.", redirectTo: "/dashboard" };
}

export async function signupWithPassword(input: unknown): Promise<ActionResult> {
  const parsed = signupSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 가입 정보를 확인했습니다.", redirectTo: "/onboarding" };
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      emailRedirectTo: new URL("/auth/callback", siteUrl).toString(),
      data: {
        display_name: parsed.data.displayName,
        grade: parsed.data.grade,
      },
    },
  });

  if (error || !data.user) {
    return { ok: false, message: signupErrorMessage(error) };
  }

  if (!data.session) {
    return { ok: true, message: "확인 메일을 보냈습니다. 받은 편지함의 가입 확인 링크를 눌러 주세요." };
  }

  if (!(await ensureProfileForUser(supabase, data.user))) {
    return { ok: false, message: "계정은 만들어졌지만 학습 프로필을 준비하지 못했습니다. 다시 로그인해 주세요." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "회원가입을 완료했습니다.", redirectTo: "/onboarding" };
}

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
