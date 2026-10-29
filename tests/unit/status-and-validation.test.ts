import { describe, expect, it } from "vitest";

import { formatStatusLabel } from "@/lib/utils";
import { feedbackSchema, learningRequestSchema, onboardingSchema } from "@/lib/validation/schemas";

describe("status labels", () => {
  it("translates known status values into Korean labels", () => {
    expect(formatStatusLabel("pending")).toBe("대기 중");
    expect(formatStatusLabel("accepted")).toBe("승인됨");
    expect(formatStatusLabel("open")).toBe("모집 중");
    expect(formatStatusLabel("completed")).toBe("완료");
  });
});

describe("form validation", () => {
  it("requires at least one interest during Google account onboarding", () => {
    const result = onboardingSchema.safeParse({
      displayName: "김민서",
      grade: 2,
      bio: "수학을 함께 공부하고 싶습니다.",
      interests: [],
      needs: ["수학"],
      wantsToMentor: false,
      mentorSubjectIds: [],
      availableDays: [],
      maxActiveMentees: 3,
    });

    expect(result.success).toBe(false);
  });

  it("rejects a learning request without preferred days", () => {
    const result = learningRequestSchema.safeParse({
      title: "미적분 접선 문제 도움 요청",
      subjectId: "subject-math",
      topics: "미적분",
      description: "접선의 기울기와 극값 조건을 연결하는 과정이 어려워서 대표 문제로 연습하고 싶습니다.",
      helpType: "problem_solving",
      desiredLevel: 3,
      preferredDays: [],
      preferredStartTime: "18:00",
      preferredEndTime: "20:00",
      expectedSessions: 3,
      visibility: "school",
    });

    expect(result.success).toBe(false);
  });

  it("requires an improvement note when feedback needs follow-up", () => {
    const result = feedbackSchema.safeParse({
      sessionId: "session-1",
      targetUserId: "user-1",
      rating: 3,
      clarityRating: 3,
      punctualityRating: 5,
      goalProgressRating: 3,
      retryPreference: "maybe",
      improvementTags: ["목표 재설정"],
      improvementNote: "",
      followUpNeeded: true,
      comment: "설명은 친절했습니다.",
    });

    expect(result.success).toBe(false);
  });
});
