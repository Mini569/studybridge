import { describe, expect, it } from "vitest";

import { demoMentors } from "@/lib/demo/data";
import { filterMentors } from "@/lib/mentors/filter-mentors";

describe("filterMentors", () => {
  it("filters mentors by subject and keyword", () => {
    const mentors = filterMentors(demoMentors, {
      subject: "subject-math",
      keyword: "미적분",
    });

    expect(mentors.map((mentor) => mentor.profile.id)).toContain("mentor-jiho");
    expect(mentors.every((mentor) => mentor.subjects.some((subject) => subject.subjectId === "subject-math"))).toBe(true);
  });

  it("filters mentors by availability", () => {
    const mentors = filterMentors(demoMentors, {
      day: 2,
      availableOnly: true,
    });

    expect(mentors.length).toBeGreaterThan(0);
    expect(mentors.every((mentor) => mentor.availability.some((slot) => slot.dayOfWeek === 2))).toBe(true);
  });
});
