"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/app/actions/applications";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";

async function ensureAdmin() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { supabase, isAllowed: false };
  }

  const { data } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  return { supabase, isAllowed: data?.role === "admin" };
}

export async function suspendMentor(mentorId: string): Promise<ActionResult> {
  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 멘토 활동을 중지 처리했습니다." };
  }

  const { supabase, isAllowed } = await ensureAdmin();
  if (!isAllowed) {
    return { ok: false, message: "관리자 권한이 필요합니다." };
  }

  const { error } = await supabase.from("profiles").update({ mentor_enabled: false }).eq("id", mentorId);
  if (error) {
    return { ok: false, message: "멘토 활동을 중지하지 못했습니다." };
  }

  revalidatePath("/admin");
  return { ok: true, message: "멘토 활동을 중지했습니다." };
}

export async function resolveReport(reportId: string): Promise<ActionResult> {
  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 신고를 해결 처리했습니다." };
  }

  const { supabase, isAllowed } = await ensureAdmin();
  if (!isAllowed) {
    return { ok: false, message: "관리자 권한이 필요합니다." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { error } = await supabase
    .from("content_reports")
    .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: user?.id })
    .eq("id", reportId);

  if (error) {
    return { ok: false, message: "신고를 처리하지 못했습니다." };
  }

  revalidatePath("/admin");
  return { ok: true, message: "신고를 해결 처리했습니다." };
}
