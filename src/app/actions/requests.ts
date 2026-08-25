"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/app/actions/applications";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { learningRequestSchema } from "@/lib/validation/schemas";

function splitTopics(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createLearningRequest(input: unknown): Promise<ActionResult> {
  const parsed = learningRequestSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 학습 도움 요청을 작성한 것으로 표시했습니다.", redirectTo: "/requests" };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "로그인이 필요합니다.", redirectTo: "/login" };
  }

  const { error } = await supabase.from("learning_requests").insert({
    mentee_id: user.id,
    subject_id: parsed.data.subjectId,
    title: parsed.data.title,
    topics: splitTopics(parsed.data.topics),
    description: parsed.data.description,
    help_type: parsed.data.helpType,
    desired_level: parsed.data.desiredLevel,
    preferred_days: parsed.data.preferredDays,
    preferred_start_time: parsed.data.preferredStartTime,
    preferred_end_time: parsed.data.preferredEndTime,
    expected_sessions: parsed.data.expectedSessions,
    visibility: parsed.data.visibility,
    status: "open",
  });

  if (error) {
    return { ok: false, message: "요청을 저장하지 못했습니다. 입력값과 권한을 확인해 주세요." };
  }

  revalidatePath("/requests");
  return { ok: true, message: "학습 도움 요청을 작성했습니다.", redirectTo: "/requests" };
}

export async function hideLearningRequest(requestId: string): Promise<ActionResult> {
  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 요청을 숨김 처리했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("learning_requests").update({ status: "hidden" }).eq("id", requestId);

  if (error) {
    return { ok: false, message: "요청을 숨김 처리하지 못했습니다." };
  }

  revalidatePath("/admin");
  return { ok: true, message: "요청을 숨김 처리했습니다." };
}

export async function cancelLearningRequest(requestId: string): Promise<ActionResult> {
  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 요청을 취소 처리했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("learning_requests")
    .update({ status: "cancelled" })
    .eq("id", requestId)
    .eq("status", "open");

  if (error) {
    return { ok: false, message: "요청을 취소하지 못했습니다." };
  }

  revalidatePath("/requests");
  return { ok: true, message: "요청을 취소했습니다." };
}
