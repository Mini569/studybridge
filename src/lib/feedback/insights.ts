import type { SessionFeedback } from "@/types/domain";

export interface FeedbackInsight {
  averageRating: number;
  averageClarity: number;
  averagePunctuality: number;
  averageGoalProgress: number;
  retryIntentRate: number;
  followUpCount: number;
  topImprovementTags: Array<{ tag: string; count: number }>;
  priorityActions: string[];
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }

  return Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(1));
}

export function buildFeedbackInsights(feedback: SessionFeedback[]): FeedbackInsight {
  const tagCounts = new Map<string, number>();

  feedback.forEach((item) => {
    item.improvementTags.forEach((tag) => {
      tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
    });
  });

  const topImprovementTags = Array.from(tagCounts.entries())
    .map(([tag, count]) => ({ tag, count }))
    .sort((first, second) => second.count - first.count || first.tag.localeCompare(second.tag, "ko-KR"))
    .slice(0, 5);

  const followUpCount = feedback.filter((item) => item.followUpNeeded).length;
  const retryIntentRate =
    feedback.length === 0
      ? 0
      : Math.round((feedback.filter((item) => item.retryPreference === "yes").length / feedback.length) * 100);

  const averageClarity = average(feedback.map((item) => item.clarityRating));
  const averageGoalProgress = average(feedback.map((item) => item.goalProgressRating));
  const priorityActions: string[] = [];

  if (followUpCount > 0) {
    priorityActions.push("후속 조치가 필요한 세션을 먼저 확인하세요.");
  }
  if (averageClarity > 0 && averageClarity < 4) {
    priorityActions.push("설명 명확성 점수가 낮습니다. 멘토 설명 속도와 예시 자료를 점검하세요.");
  }
  if (averageGoalProgress > 0 && averageGoalProgress < 4) {
    priorityActions.push("목표 달성도가 낮습니다. 세션 시작 전 학습 목표를 더 작게 나누세요.");
  }
  if (topImprovementTags[0]) {
    priorityActions.push(`${topImprovementTags[0].tag} 항목이 가장 많이 선택되었습니다.`);
  }

  return {
    averageRating: average(feedback.map((item) => item.rating)),
    averageClarity,
    averagePunctuality: average(feedback.map((item) => item.punctualityRating)),
    averageGoalProgress,
    retryIntentRate,
    followUpCount,
    topImprovementTags,
    priorityActions,
  };
}
