import { BASE_SUBJECTS, DAY_LABELS } from "@/lib/constants/options";
import { clamp, normalizeKeyword } from "@/lib/utils";
import type { AvailabilitySlot, DayOfWeek, LearningRequest, MentorProfile, MentorScoreResult } from "@/types/domain";

function toMinutes(value: string) {
  const [hourText, minuteText] = value.split(":");
  const hour = Number(hourText);
  const minute = Number(minuteText);

  return hour * 60 + minute;
}

export function hasTimeOverlap(
  firstStart: string,
  firstEnd: string,
  secondStart: string,
  secondEnd: string,
) {
  return toMinutes(firstStart) < toMinutes(secondEnd) && toMinutes(secondStart) < toMinutes(firstEnd);
}

function calculateTopicScore(requestTopics: string[], mentorTopics: string[]) {
  if (requestTopics.length === 0 || mentorTopics.length === 0) {
    return 0;
  }

  const normalizedMentorTopics = new Set(mentorTopics.map(normalizeKeyword));
  const matchedCount = requestTopics
    .map(normalizeKeyword)
    .filter((topic) => normalizedMentorTopics.has(topic)).length;

  return (matchedCount / requestTopics.length) * 20;
}

function calculateAvailabilityScore(request: LearningRequest, availability: AvailabilitySlot[]) {
  const matchingDaySlots = availability.filter((slot) => request.preferredDays.includes(slot.dayOfWeek));

  if (matchingDaySlots.length === 0) {
    return { score: 0, reason: undefined };
  }

  if (!request.preferredStartTime || !request.preferredEndTime) {
    const day = DAY_LABELS[matchingDaySlots[0].dayOfWeek];
    return { score: 10, reason: `${day} 가능` };
  }

  const overlappingSlot = matchingDaySlots.find((slot) =>
    hasTimeOverlap(request.preferredStartTime ?? "00:00", request.preferredEndTime ?? "23:59", slot.startTime, slot.endTime),
  );

  if (!overlappingSlot) {
    const day = DAY_LABELS[matchingDaySlots[0].dayOfWeek];
    return { score: 10, reason: `${day} 요일 가능` };
  }

  return {
    score: 20,
    reason: `${DAY_LABELS[overlappingSlot.dayOfWeek]} ${overlappingSlot.startTime.slice(0, 5)} 시간 가능`,
  };
}

export function calculateMentorScore(request: LearningRequest, mentor: MentorProfile): MentorScoreResult | null {
  const mentorSubject = mentor.subjects.find((subject) => subject.subjectId === request.subjectId && subject.isActive);

  if (!mentorSubject) {
    return null;
  }

  if (!mentor.settings.isAccepting || mentor.activeMentees >= mentor.settings.maxActiveMentees) {
    return null;
  }

  const reasons: string[] = [];
  const subjectName = BASE_SUBJECTS.find((subject) => subject.id === request.subjectId)?.name ?? "요청 과목";
  let score = 40;
  reasons.push(`요청한 ${subjectName} 과목 멘토`);

  const topicScore = calculateTopicScore(request.topics, mentorSubject.topics);
  score += topicScore;
  if (topicScore > 0) {
    reasons.push(`${request.topics.join(", ")} 단원 일치`);
  }

  const availability = calculateAvailabilityScore(request, mentor.availability);
  score += availability.score;
  if (availability.reason) {
    reasons.push(availability.reason);
  }

  const requesterGrade = request.requester?.grade;
  if (!requesterGrade || mentorSubject.preferredGrades.length === 0 || mentorSubject.preferredGrades.includes(requesterGrade)) {
    score += 10;
    reasons.push("요청자 학년과 멘토 선호 학년 일치");
  }

  const rating = mentor.averageRating ?? 4;
  score += clamp(rating, 1, 5);

  score += 5;
  reasons.push("현재 신청 가능한 여유 인원 있음");

  return {
    mentorId: mentor.profile.id,
    score: Math.round(clamp(score, 0, 100)),
    reasons,
  };
}

export function rankRecommendedMentors(request: LearningRequest, mentors: MentorProfile[]) {
  return mentors
    .map((mentor) => {
      const result = calculateMentorScore(request, mentor);
      return result ? { mentor, result } : null;
    })
    .filter((item): item is { mentor: MentorProfile; result: MentorScoreResult } => item !== null)
    .sort((first, second) => second.result.score - first.result.score);
}

export function hasCapacity(mentor: Pick<MentorProfile, "settings" | "activeMentees">) {
  return mentor.settings.isAccepting && mentor.activeMentees < mentor.settings.maxActiveMentees;
}

export function summarizeAvailability(slots: AvailabilitySlot[]) {
  if (slots.length === 0) {
    return "가능 시간 미등록";
  }

  return slots
    .slice(0, 3)
    .map((slot) => `${DAY_LABELS[slot.dayOfWeek as DayOfWeek]} ${slot.startTime.slice(0, 5)}`)
    .join(", ");
}
