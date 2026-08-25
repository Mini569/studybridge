import type {
  ApplicationStatus,
  DayOfWeek,
  HelpType,
  LocationType,
  MentorshipStatus,
  RequestStatus,
  SessionStatus,
  Subject,
} from "@/types/domain";

export const DAY_LABELS: Record<DayOfWeek, string> = {
  0: "일요일",
  1: "월요일",
  2: "화요일",
  3: "수요일",
  4: "목요일",
  5: "금요일",
  6: "토요일",
};

export const DAY_OPTIONS = Object.entries(DAY_LABELS).map(([value, label]) => ({
  value: Number(value) as DayOfWeek,
  label,
}));

export const GRADE_OPTIONS = [
  { value: 1, label: "1학년" },
  { value: 2, label: "2학년" },
  { value: 3, label: "3학년" },
] as const;

export const HELP_TYPE_LABELS: Record<HelpType, string> = {
  concept: "개념 설명",
  problem_solving: "문제 풀이",
  study_method: "학습 방법 조언",
  exam: "시험 대비",
  project: "프로젝트 조언",
  other: "기타",
};

export const HELP_TYPE_OPTIONS = Object.entries(HELP_TYPE_LABELS).map(([value, label]) => ({
  value: value as HelpType,
  label,
}));

export const LOCATION_LABELS: Record<LocationType, string> = {
  classroom: "교실",
  library: "도서관",
  self_study: "자율학습실",
  online: "온라인",
  campus: "기타 교내 공간",
};

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  open: "모집 중",
  matched: "매칭 완료",
  closed: "마감",
  cancelled: "취소됨",
  hidden: "숨김",
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  pending: "대기 중",
  accepted: "승인됨",
  rejected: "거절됨",
  cancelled: "취소됨",
};

export const MENTORSHIP_STATUS_LABELS: Record<MentorshipStatus, string> = {
  planned: "진행 예정",
  active: "진행 중",
  completed: "완료",
  cancelled: "취소",
};

export const SESSION_STATUS_LABELS: Record<SessionStatus, string> = {
  scheduled: "예정",
  completed: "완료",
  cancelled: "취소",
};

export const STATUS_TONE: Record<string, "blue" | "green" | "yellow" | "red" | "gray"> = {
  pending: "yellow",
  accepted: "green",
  rejected: "red",
  cancelled: "gray",
  open: "blue",
  matched: "green",
  closed: "gray",
  active: "green",
  completed: "blue",
  hidden: "red",
  planned: "yellow",
  scheduled: "yellow",
};

const createdAt = "2026-08-01T00:00:00+09:00";

export const BASE_SUBJECTS: Subject[] = [
  { id: "subject-korean", name: "국어", category: "인문", isActive: true, createdAt },
  { id: "subject-math", name: "수학", category: "수리", isActive: true, createdAt },
  { id: "subject-english", name: "영어", category: "외국어", isActive: true, createdAt },
  { id: "subject-physics", name: "물리학", category: "과학", isActive: true, createdAt },
  { id: "subject-chemistry", name: "화학", category: "과학", isActive: true, createdAt },
  { id: "subject-biology", name: "생명과학", category: "과학", isActive: true, createdAt },
  { id: "subject-earth", name: "지구과학", category: "과학", isActive: true, createdAt },
  { id: "subject-cs", name: "정보", category: "기술", isActive: true, createdAt },
  { id: "subject-history", name: "한국사", category: "사회", isActive: true, createdAt },
  { id: "subject-etc", name: "기타", category: "기타", isActive: true, createdAt },
];

export const TIME_PERIODS = [
  { value: "morning", label: "오전", start: "08:00", end: "12:00" },
  { value: "afternoon", label: "오후", start: "12:00", end: "18:00" },
  { value: "evening", label: "저녁", start: "18:00", end: "22:00" },
] as const;
