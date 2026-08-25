import { hasCapacity } from "@/lib/matching/calculate-mentor-score";
import { normalizeKeyword } from "@/lib/utils";
import type { DayOfWeek, MentorProfile } from "@/types/domain";

export interface MentorFilter {
  subject?: string;
  keyword?: string;
  grade?: number;
  day?: number;
  availableOnly?: boolean;
  sort?: string;
}

export function filterMentors(mentors: MentorProfile[], filter: MentorFilter) {
  const keyword = normalizeKeyword(filter.keyword ?? "");

  return mentors
    .filter((mentor) => {
      const matchesSubject = filter.subject ? mentor.subjects.some((subject) => subject.subjectId === filter.subject) : true;
      const matchesKeyword = keyword
        ? mentor.profile.displayName.includes(filter.keyword ?? "") ||
          mentor.subjects.some((subject) => subject.topics.some((topic) => normalizeKeyword(topic).includes(keyword)))
        : true;
      const matchesGrade = filter.grade ? mentor.profile.grade === filter.grade : true;
      const matchesDay = filter.day !== undefined ? mentor.availability.some((slot) => slot.dayOfWeek === (filter.day as DayOfWeek)) : true;
      const matchesAvailability = filter.availableOnly ? hasCapacity(mentor) : true;

      return matchesSubject && matchesKeyword && matchesGrade && matchesDay && matchesAvailability;
    })
    .sort((first, second) => {
      if (filter.sort === "rating") {
        return (second.averageRating ?? 0) - (first.averageRating ?? 0);
      }
      if (filter.sort === "capacity") {
        return second.settings.maxActiveMentees - second.activeMentees - (first.settings.maxActiveMentees - first.activeMentees);
      }
      if (filter.sort === "recent") {
        return new Date(second.lastActiveAt).getTime() - new Date(first.lastActiveAt).getTime();
      }
      return second.completedMentorships - first.completedMentorships;
    });
}
