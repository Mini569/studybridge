import { describe, expect, it } from "vitest";

import { calculateMentorScore, hasCapacity, hasTimeOverlap } from "@/lib/matching/calculate-mentor-score";
import { demoMentors, demoRequests } from "@/lib/demo/data";

describe("mentor matching", () => {
  const mathRequest = demoRequests.find((request) => request.id === "request-math-calculus");

  if (!mathRequest) {
    throw new Error("Missing math request fixture.");
  }

  it("excludes mentors when subjects do not match", () => {
    const englishMentor = demoMentors.find((mentor) => mentor.profile.id === "mentor-harin");

    expect(englishMentor).toBeDefined();
    expect(calculateMentorScore(mathRequest, englishMentor!)).toBeNull();
  });

  it("scores a mentor with matching subject and time higher", () => {
    const matchingMentor = demoMentors.find((mentor) => mentor.profile.id === "mentor-jiho");
    const lowerMatch = demoMentors.find((mentor) => mentor.profile.id === "mentor-taeho");

    expect(matchingMentor).toBeDefined();
    expect(lowerMatch).toBeDefined();

    const highScore = calculateMentorScore(mathRequest, matchingMentor!);
    const lowScore = calculateMentorScore(mathRequest, lowerMatch!);

    expect(highScore?.score ?? 0).toBeGreaterThan(lowScore?.score ?? 0);
  });

  it("excludes mentors who reached max capacity", () => {
    const fullMentor = demoMentors.find((mentor) => mentor.profile.id === "mentor-yuna");

    expect(fullMentor).toBeDefined();
    expect(hasCapacity(fullMentor!)).toBe(false);
  });

  it("gives a slightly higher score to a mentor with a higher rating under similar conditions", () => {
    const firstMentor = { ...demoMentors[0], averageRating: 4.9 };
    const secondMentor = { ...demoMentors[0], averageRating: 3.8, profile: { ...demoMentors[0].profile, id: "mentor-copy" } };

    const firstScore = calculateMentorScore(mathRequest, firstMentor);
    const secondScore = calculateMentorScore(mathRequest, secondMentor);

    expect(firstScore?.score ?? 0).toBeGreaterThan(secondScore?.score ?? 0);
  });

  it("keeps scores within 0 and 100", () => {
    const mentor = demoMentors.find((item) => item.profile.id === "mentor-jiho");
    const score = calculateMentorScore(mathRequest, mentor!);

    expect(score?.score).toBeGreaterThanOrEqual(0);
    expect(score?.score).toBeLessThanOrEqual(100);
  });

  it("detects time overlaps", () => {
    expect(hasTimeOverlap("18:00", "20:00", "19:00", "21:00")).toBe(true);
    expect(hasTimeOverlap("14:00", "15:00", "15:00", "16:00")).toBe(false);
  });
});
