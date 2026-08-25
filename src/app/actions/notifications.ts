"use server";

import { revalidatePath } from "next/cache";

import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { ActionResult } from "@/app/actions/applications";

export async function markNotificationRead(notificationId: string): Promise<ActionResult> {
  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 알림을 읽음 처리했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("id", notificationId);

  if (error) {
    return { ok: false, message: "알림을 읽음 처리하지 못했습니다." };
  }

  revalidatePath("/notifications");
  return { ok: true, message: "알림을 읽음 처리했습니다." };
}

export async function markAllNotificationsRead(): Promise<ActionResult> {
  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 모든 알림을 읽음 처리했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "로그인이 필요합니다.", redirectTo: "/login" };
  }

  const { error } = await supabase.from("notifications").update({ is_read: true }).eq("user_id", user.id);

  if (error) {
    return { ok: false, message: "알림을 읽음 처리하지 못했습니다." };
  }

  revalidatePath("/notifications");
  return { ok: true, message: "모든 알림을 읽음 처리했습니다." };
}
