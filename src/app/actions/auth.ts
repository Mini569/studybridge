"use server";

import { revalidatePath } from "next/cache";

import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loginSchema, onboardingSchema, signupSchema } from "@/lib/validation/schemas";
import type { ActionResult } from "@/app/actions/applications";

export async function loginWithPassword(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  if (isDemoMode) {
    return { ok: true, message: "데모 모드로 로그인했습니다.", redirectTo: "/dashboard" };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);

  if (error) {
    return { ok: false, message: "이메일 또는 비밀번호를 확인해 주세요." };
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
      data: {
        display_name: parsed.data.displayName,
        grade: parsed.data.grade,
      },
    },
  });

  if (error || !data.user) {
    return { ok: false, message: "회원가입을 완료하지 못했습니다. 이미 가입한 이메일인지 확인해 주세요." };
  }

  const { error: profileError } = await supabase.from("profiles").insert({
    id: data.user.id,
    display_name: parsed.data.displayName,
    grade: parsed.data.grade,
    onboarding_completed: false,
  });

  if (profileError) {
    return { ok: false, message: "프로필을 생성하지 못했습니다. 잠시 후 다시 시도해 주세요." };
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

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.displayName,
      grade: parsed.data.grade,
      bio: parsed.data.bio,
      onboarding_completed: true,
      mentor_enabled: parsed.data.wantsToMentor,
    })
    .eq("id", user.id);

  if (error) {
    return { ok: false, message: "온보딩 정보를 저장하지 못했습니다." };
  }

  if (parsed.data.wantsToMentor) {
    await supabase.from("mentor_settings").upsert({
      mentor_id: user.id,
      introduction: parsed.data.bio ?? "",
      max_active_mentees: parsed.data.maxActiveMentees,
      is_accepting: true,
    });
  }

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
