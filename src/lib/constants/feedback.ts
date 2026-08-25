export const FEEDBACK_RUBRIC = [
  {
    name: "rating",
    label: "전체 만족도",
    description: "이번 세션을 전반적으로 평가해 주세요.",
  },
  {
    name: "clarityRating",
    label: "설명 명확성",
    description: "개념과 풀이 과정이 이해하기 쉽게 전달됐는지 평가합니다.",
  },
  {
    name: "punctualityRating",
    label: "시간 준수",
    description: "약속한 시간, 진행 시간, 준비 상태가 적절했는지 평가합니다.",
  },
  {
    name: "goalProgressRating",
    label: "목표 달성도",
    description: "처음 정한 학습 목표에 얼마나 가까워졌는지 평가합니다.",
  },
] as const;

export const RETRY_PREFERENCE_OPTIONS = [
  { value: "yes", label: "다시 신청하고 싶음" },
  { value: "maybe", label: "상황에 따라 다름" },
  { value: "no", label: "다른 방식이 필요함" },
] as const;

export const IMPROVEMENT_TAGS = [
  "설명 속도 조절",
  "자료 보강",
  "시간 조율",
  "목표 재설정",
  "문제 난이도 조정",
  "세션 기록 보강",
  "장소 조율",
  "후속 과제 필요",
] as const;

export type RetryPreference = (typeof RETRY_PREFERENCE_OPTIONS)[number]["value"];
export type ImprovementTag = (typeof IMPROVEMENT_TAGS)[number];
