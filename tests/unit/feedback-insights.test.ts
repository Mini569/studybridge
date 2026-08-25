import { describe, expect, it } from "vitest";

import { demoFeedback } from "@/lib/demo/data";
import { buildFeedbackInsights } from "@/lib/feedback/insights";

describe("buildFeedbackInsights", () => {
  it("summarizes ratings, retry intent, follow-up count, and repeated tags", () => {
    const insights = buildFeedbackInsights(demoFeedback);

    expect(insights.averageRating).toBeGreaterThan(0);
    expect(insights.retryIntentRate).toBeGreaterThanOrEqual(0);
    expect(insights.followUpCount).toBe(1);
    expect(insights.topImprovementTags.map((item) => item.tag)).toContain("목표 재설정");
    expect(insights.priorityActions.length).toBeGreaterThan(0);
  });
});
