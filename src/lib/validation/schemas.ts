import { z } from "zod";

import { IMPROVEMENT_TAGS, RETRY_PREFERENCE_OPTIONS } from "@/lib/constants/feedback";
import { HELP_TYPE_OPTIONS } from "@/lib/constants/options";

const gradeSchema = z.coerce.number().int().min(1, "학년을 선택해 주세요.").max(3, "학년을 선택해 주세요.");

const mentorAvailabilityFields = {
  mentorSubjectIds: z.array(z.string()).default([]),
  mentorTopics: z.string().max(300, "세부 단원은 300자 이하로 입력해 주세요.").optional(),
  proficiencyLevel: z.coerce.number().int().min(1).max(5).optional(),
  availableDays: z.array(z.coerce.number().int().min(0).max(6)).default([]),
  availableStartTime: z.string().optional(),
  availableEndTime: z.string().optional(),
  maxActiveMentees: z.coerce.number().int().min(1).max(10).default(3),
};

function hasValidMentorDetails(value: {
  wantsToMentor?: boolean;
  mentorEnabled?: boolean;
  mentorSubjectIds: string[];
  availableDays: number[];
  availableStartTime?: string;
  availableEndTime?: string;
}) {
  const enabled = value.wantsToMentor ?? value.mentorEnabled ?? false;
  if (!enabled) return true;
  return value.mentorSubjectIds.length > 0 && value.availableDays.length > 0 &&
    Boolean(value.availableStartTime && value.availableEndTime && value.availableEndTime > value.availableStartTime);
}

export const onboardingSchema = z.object({
  displayName: z.string().trim().min(2, "닉네임은 2자 이상이어야 합니다.").max(30, "닉네임은 30자 이하입니다."),
  grade: gradeSchema,
  bio: z.string().trim().max(300, "자기소개는 300자 이하입니다.").optional(),
  interests: z.array(z.string()).min(1, "관심 과목을 하나 이상 선택해 주세요."),
  needs: z.array(z.string()).min(1, "도움받고 싶은 과목을 하나 이상 선택해 주세요."),
  wantsToMentor: z.boolean(),
  ...mentorAvailabilityFields,
}).refine(hasValidMentorDetails, {
  path: ["mentorSubjectIds"],
  message: "멘토 활동 시 과목, 가능 요일과 올바른 시간 범위를 모두 입력해 주세요.",
});

export const mentorProfileSchema = z.object({
  displayName: z.string().trim().min(2, "닉네임은 2자 이상이어야 합니다.").max(30, "닉네임은 30자 이하입니다."),
  grade: gradeSchema,
  bio: z.string().trim().max(500, "자기소개는 500자 이하입니다.").optional(),
  mentorEnabled: z.coerce.boolean(),
  introduction: z.string().trim().max(800, "멘토 소개는 800자 이하입니다.").optional(),
  ...mentorAvailabilityFields,
}).refine(hasValidMentorDetails, {
  path: ["mentorSubjectIds"],
  message: "멘토 활동 시 과목, 가능 요일과 올바른 시간 범위를 모두 입력해 주세요.",
});

export const learningRequestSchema = z.object({
  title: z.string().trim().min(5, "제목은 5자 이상이어야 합니다.").max(80, "제목은 80자 이하입니다."),
  subjectId: z.string().min(1, "과목을 선택해 주세요."),
  topics: z.string().trim().min(1, "세부 단원 또는 주제를 입력해 주세요.").max(200, "주제는 200자 이하입니다."),
  description: z
    .string()
    .trim()
    .min(20, "어려운 점은 20자 이상 작성해 주세요.")
    .max(1000, "어려운 점은 1000자 이하입니다."),
  helpType: z.enum(HELP_TYPE_OPTIONS.map((option) => option.value) as [string, ...string[]]),
  desiredLevel: z.coerce.number().int().min(1).max(5),
  preferredDays: z.array(z.coerce.number().int().min(0).max(6)).min(1, "희망 요일을 하나 이상 선택해 주세요."),
  preferredStartTime: z.string().min(1, "희망 시작 시간을 선택해 주세요."),
  preferredEndTime: z.string().min(1, "희망 종료 시간을 선택해 주세요."),
  expectedSessions: z.coerce.number().int().min(1, "최소 1회 이상이어야 합니다.").max(20, "20회 이하로 입력해 주세요."),
  visibility: z.enum(["school", "mentor_only"]),
});

export const applicationSchema = z.object({
  learningRequestId: z.string().min(1),
  mentorId: z.string().min(1),
  message: z.string().trim().min(10, "신청 메시지는 10자 이상 작성해 주세요.").max(500, "신청 메시지는 500자 이하입니다."),
});

export const sessionSchema = z.object({
  mentorshipId: z.string().min(1),
  scheduledAt: z.string().min(1, "일정을 선택해 주세요."),
  durationMinutes: z.coerce.number().int().min(10, "최소 10분 이상이어야 합니다.").max(240, "최대 240분입니다."),
  topic: z.string().trim().min(2, "학습 주제를 입력해 주세요.").max(120, "학습 주제는 120자 이하입니다."),
  locationType: z.enum(["classroom", "library", "self_study", "online", "campus"]),
});

export const completeSessionSchema = z.object({
  sessionId: z.string().min(1),
  mentorshipId: z.string().min(1),
  note: z.string().trim().min(10, "활동 기록은 10자 이상 작성해 주세요.").max(1000, "활동 기록은 1000자 이하입니다."),
});

const feedbackRatingSchema = z.coerce.number().int().min(1, "평점을 선택해 주세요.").max(5, "평점은 5점 이하입니다.");

export const feedbackSchema = z
  .object({
    sessionId: z.string().min(1),
    targetUserId: z.string().min(1),
    rating: feedbackRatingSchema,
    clarityRating: feedbackRatingSchema,
    punctualityRating: feedbackRatingSchema,
    goalProgressRating: feedbackRatingSchema,
    retryPreference: z.enum(RETRY_PREFERENCE_OPTIONS.map((option) => option.value) as ["yes", "maybe", "no"]),
    improvementTags: z
      .array(z.enum(IMPROVEMENT_TAGS as unknown as [string, ...string[]]))
      .max(4, "개선 태그는 최대 4개까지 선택할 수 있습니다.")
      .default([]),
    improvementNote: z.string().trim().max(500, "개선 메모는 500자 이하입니다.").optional(),
    followUpNeeded: z.coerce.boolean().default(false),
    comment: z.string().trim().max(500, "후기는 500자 이하입니다.").optional(),
  })
  .refine(
    (value) =>
      value.rating >= 4 ||
      value.clarityRating >= 4 ||
      value.goalProgressRating >= 4 ||
      Boolean(value.improvementNote && value.improvementNote.length >= 10),
    {
      path: ["improvementNote"],
      message: "낮은 점수를 준 경우 개선 메모를 10자 이상 남겨 주세요.",
    },
  )
  .refine((value) => !value.followUpNeeded || Boolean(value.improvementNote && value.improvementNote.length >= 10), {
    path: ["improvementNote"],
    message: "후속 조치가 필요하면 개선 메모를 10자 이상 남겨 주세요.",
  });

export type LearningRequestInput = z.output<typeof learningRequestSchema>;
export type LearningRequestFormValues = z.input<typeof learningRequestSchema>;
