"use server";

import { revalidatePath } from "next/cache";

import type { ActionResult } from "@/app/actions/applications";
import { isDemoMode } from "@/lib/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { completeSessionSchema, feedbackSchema, sessionSchema } from "@/lib/validation/schemas";

export async function createMentoringSession(input: unknown): Promise<ActionResult> {
  const parsed = sessionSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 새 세션을 등록한 것으로 표시했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("mentoring_sessions").insert({
    mentorship_id: parsed.data.mentorshipId,
    scheduled_at: parsed.data.scheduledAt,
    duration_minutes: parsed.data.durationMinutes,
    topic: parsed.data.topic,
    location_type: parsed.data.locationType,
    status: "scheduled",
  });

  if (error) {
    return { ok: false, message: "세션을 등록하지 못했습니다. 권한을 확인해 주세요." };
  }

  revalidatePath(`/mentorships/${parsed.data.mentorshipId}`);
  return { ok: true, message: "세션을 등록했습니다." };
}

export async function completeMentorship(mentorshipId: string): Promise<ActionResult> {
  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 멘토링을 완료 처리했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.rpc("complete_mentorship", {
    mentorship_id: mentorshipId,
  });

  if (error) {
    return { ok: false, message: "멘토링을 완료 처리하지 못했습니다." };
  }

  revalidatePath(`/mentorships/${mentorshipId}`);
  return { ok: true, message: "멘토링을 완료 처리했습니다." };
}

export async function completeMentoringSession(input: unknown): Promise<ActionResult> {
  const parsed = completeSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }
  if (isDemoMode) return { ok: true, message: "데모 모드: 세션을 완료하고 활동 기록을 저장한 것으로 표시했습니다." };

  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, message: "로그인이 필요합니다.", redirectTo: "/login" };

  const { data: mentorship } = await supabase
    .from("mentorships")
    .select("mentor_id, mentee_id")
    .eq("id", parsed.data.mentorshipId)
    .maybeSingle();
  if (!mentorship || (mentorship.mentor_id !== user.id && mentorship.mentee_id !== user.id)) {
    return { ok: false, message: "이 세션을 완료할 권한이 없습니다." };
  }

  const noteColumn = mentorship.mentor_id === user.id ? "mentor_note" : "mentee_note";
  const { data, error } = await supabase
    .from("mentoring_sessions")
    .update({ status: "completed", completed_at: new Date().toISOString(), [noteColumn]: parsed.data.note })
    .eq("id", parsed.data.sessionId)
    .eq("mentorship_id", parsed.data.mentorshipId)
    .eq("status", "scheduled")
    .select("id")
    .maybeSingle();

  if (error || !data) return { ok: false, message: "세션을 완료하지 못했습니다. 이미 처리되었는지 확인해 주세요." };
  revalidatePath(`/mentorships/${parsed.data.mentorshipId}`);
  return { ok: true, message: "세션을 완료하고 활동 기록을 저장했습니다." };
}

export async function submitFeedback(input: unknown): Promise<ActionResult> {
  const parsed = feedbackSchema.safeParse(input);

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "입력값을 확인해 주세요." };
  }

  if (isDemoMode) {
    return { ok: true, message: "데모 모드: 피드백을 저장한 것으로 표시했습니다." };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "로그인이 필요합니다.", redirectTo: "/login" };
  }

  const { error } = await supabase.from("session_feedback").insert({
    session_id: parsed.data.sessionId,
    author_id: user.id,
    target_user_id: parsed.data.targetUserId,
    rating: parsed.data.rating,
    clarity_rating: parsed.data.clarityRating,
    punctuality_rating: parsed.data.punctualityRating,
    goal_progress_rating: parsed.data.goalProgressRating,
    retry_preference: parsed.data.retryPreference,
    improvement_tags: parsed.data.improvementTags,
    improvement_note: parsed.data.improvementNote,
    follow_up_needed: parsed.data.followUpNeeded,
    comment: parsed.data.comment,
  });

  if (error) {
    return { ok: false, message: "피드백을 저장하지 못했습니다. 이미 작성했거나 권한이 없을 수 있습니다." };
  }

  return { ok: true, message: "피드백을 저장했습니다." };
}
