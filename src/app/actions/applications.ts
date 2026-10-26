"use server";

import { revalidatePath } from "next/cache";

import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { applicationSchema } from "@/lib/validation/schemas";

export interface ActionResult {
  ok: boolean;
  message: string;
  redirectTo?: string;
}

function demoResult(message: string): ActionResult {
  return {
    ok: true,
    message: `데모 모드: ${message}`,
  };
}

export async function createApplication(input: unknown): Promise<ActionResult> {
  const parsed = applicationSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  if (isDemoMode) {
    return demoResult("멘토링 신청이 접수된 것으로 표시했습니다.");
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "로그인이 필요합니다.", redirectTo: "/login" };
  }

  const { error } = await supabase.from("mentoring_applications").insert({
    learning_request_id: parsed.data.learningRequestId,
    mentor_id: parsed.data.mentorId,
    mentee_id: user.id,
    message: parsed.data.message,
  });

  if (error) {
    return { ok: false, message: "신청을 저장하지 못했습니다. 이미 신청했거나 권한이 없을 수 있습니다." };
  }

  revalidatePath("/applications");
  return { ok: true, message: "멘토링 신청을 보냈습니다.", redirectTo: "/applications" };
}

export async function acceptApplication(applicationId: string): Promise<ActionResult> {
  if (isDemoMode) {
    return demoResult("신청을 승인하고 멘토링 관계를 생성했습니다.");
  }

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.rpc("accept_mentoring_application", {
    application_id: applicationId,
  });

  if (error) {
    return { ok: false, message: "신청을 승인하지 못했습니다. 이미 처리되었거나 권한이 없습니다." };
  }

  revalidatePath("/applications");
  revalidatePath("/mentorships");
  return { ok: true, message: "신청을 승인했습니다.", redirectTo: `/mentorships/${data as string}` };
}

export async function rejectApplication(applicationId: string): Promise<ActionResult> {
  if (isDemoMode) {
    return demoResult("신청을 거절 처리했습니다.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("reject_mentoring_application", {
    application_id: applicationId,
  });

  if (error) {
    return { ok: false, message: "신청을 거절하지 못했습니다." };
  }

  revalidatePath("/applications");
  return { ok: true, message: "신청을 거절했습니다." };
}

export async function cancelApplication(applicationId: string): Promise<ActionResult> {
  if (isDemoMode) {
    return demoResult("대기 중인 신청을 취소했습니다.");
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("cancel_mentoring_application", {
    application_id: applicationId,
  });

  if (error) {
    return { ok: false, message: "신청을 취소하지 못했습니다." };
  }

  revalidatePath("/applications");
  return { ok: true, message: "신청을 취소했습니다." };
}
