import { BASE_SUBJECTS } from "@/lib/constants/options";
import { rankRecommendedMentors } from "@/lib/matching/calculate-mentor-score";
import type {
  AvailabilitySlot,
  ContentReport,
  DashboardStats,
  LearningRequest,
  MentoringApplication,
  MentoringSession,
  Mentorship,
  MentorProfile,
  MentorSettings,
  MentorSubject,
  Notification,
  Profile,
  SessionFeedback,
  Subject,
} from "@/types/domain";

const now = "2026-08-24T17:30:00+09:00";

export const demoSubjects: Subject[] = BASE_SUBJECTS;

export const demoCurrentUser: Profile = {
  id: "user-minseo",
  displayName: "김민서",
  grade: 2,
  bio: "수학과 과학 개념을 차근차근 잡고 싶은 2학년 학생입니다.",
  role: "student",
  onboardingCompleted: true,
  mentorEnabled: false,
  interests: ["수학", "물리학", "정보"],
  needs: ["수학", "영어"],
  createdAt: "2026-08-01T09:00:00+09:00",
  updatedAt: now,
};

export const demoAdminUser: Profile = {
  id: "user-admin",
  displayName: "운영 관리자",
  grade: 3,
  bio: "교내 학습 멘토링 운영 담당자입니다.",
  role: "admin",
  onboardingCompleted: true,
  mentorEnabled: true,
  interests: ["국어", "수학"],
  needs: [],
  createdAt: "2026-08-01T09:00:00+09:00",
  updatedAt: now,
};

export const demoProfiles: Profile[] = [
  demoCurrentUser,
  demoAdminUser,
  {
    id: "mentor-jiho",
    displayName: "박지호",
    grade: 3,
    bio: "수학 문제 풀이 과정을 말로 설명하는 데 자신 있습니다.",
    role: "student",
    onboardingCompleted: true,
    mentorEnabled: true,
    interests: ["수학", "정보"],
    needs: [],
    createdAt: "2026-08-01T09:00:00+09:00",
    updatedAt: "2026-08-22T13:00:00+09:00",
  },
  {
    id: "mentor-harin",
    displayName: "이하린",
    grade: 3,
    bio: "영어 독해와 내신 서술형 대비를 함께 도와요.",
    role: "student",
    onboardingCompleted: true,
    mentorEnabled: true,
    interests: ["영어", "국어"],
    needs: [],
    createdAt: "2026-08-02T09:00:00+09:00",
    updatedAt: "2026-08-23T15:00:00+09:00",
  },
  {
    id: "mentor-seoyun",
    displayName: "최서윤",
    grade: 2,
    bio: "물리학 개념을 그림과 예시로 설명하는 걸 좋아합니다.",
    role: "student",
    onboardingCompleted: true,
    mentorEnabled: true,
    interests: ["물리학", "화학"],
    needs: [],
    createdAt: "2026-08-03T09:00:00+09:00",
    updatedAt: "2026-08-21T12:00:00+09:00",
  },
  {
    id: "mentor-taeho",
    displayName: "정태호",
    grade: 3,
    bio: "정보 과목과 파이썬 프로젝트 멘토링을 맡고 있습니다.",
    role: "student",
    onboardingCompleted: true,
    mentorEnabled: true,
    interests: ["정보", "수학"],
    needs: [],
    createdAt: "2026-08-03T09:00:00+09:00",
    updatedAt: "2026-08-20T10:00:00+09:00",
  },
  {
    id: "mentor-yuna",
    displayName: "한유나",
    grade: 2,
    bio: "생명과학 암기 흐름과 개념 연결을 같이 정리합니다.",
    role: "student",
    onboardingCompleted: true,
    mentorEnabled: true,
    interests: ["생명과학", "화학"],
    needs: [],
    createdAt: "2026-08-04T09:00:00+09:00",
    updatedAt: "2026-08-19T14:00:00+09:00",
  },
  {
    id: "mentor-doyeon",
    displayName: "서도연",
    grade: 3,
    bio: "한국사 흐름 정리와 국어 비문학 독해를 도와드립니다.",
    role: "student",
    onboardingCompleted: true,
    mentorEnabled: true,
    interests: ["한국사", "국어"],
    needs: [],
    createdAt: "2026-08-05T09:00:00+09:00",
    updatedAt: "2026-08-18T11:00:00+09:00",
  },
  {
    id: "student-eunwoo",
    displayName: "강은우",
    grade: 1,
    bio: "고등학교 수학 적응 중입니다.",
    role: "student",
    onboardingCompleted: true,
    mentorEnabled: false,
    interests: ["수학"],
    needs: ["수학", "영어"],
    createdAt: "2026-08-06T09:00:00+09:00",
    updatedAt: "2026-08-21T09:00:00+09:00",
  },
];

const mentorSettings: MentorSettings[] = [
  {
    mentorId: "mentor-jiho",
    introduction: "식을 세우는 이유부터 풀이 전략까지 같이 정리합니다.",
    maxActiveMentees: 3,
    isAccepting: true,
    createdAt: "2026-08-05T09:00:00+09:00",
    updatedAt: now,
  },
  {
    mentorId: "mentor-harin",
    introduction: "본문 구조 파악, 어휘 정리, 서술형 답안 작성까지 단계별로 도와요.",
    maxActiveMentees: 2,
    isAccepting: true,
    createdAt: "2026-08-05T09:00:00+09:00",
    updatedAt: now,
  },
  {
    mentorId: "mentor-seoyun",
    introduction: "개념을 먼저 잡고 대표 문제로 확인하는 방식으로 진행합니다.",
    maxActiveMentees: 2,
    isAccepting: true,
    createdAt: "2026-08-05T09:00:00+09:00",
    updatedAt: now,
  },
  {
    mentorId: "mentor-taeho",
    introduction: "파이썬 문법, 알고리즘 사고, 수행평가 프로젝트를 함께 봅니다.",
    maxActiveMentees: 4,
    isAccepting: true,
    createdAt: "2026-08-05T09:00:00+09:00",
    updatedAt: now,
  },
  {
    mentorId: "mentor-yuna",
    introduction: "암기보다 흐름과 연결을 먼저 잡는 생명과학 멘토링을 합니다.",
    maxActiveMentees: 1,
    isAccepting: true,
    createdAt: "2026-08-05T09:00:00+09:00",
    updatedAt: now,
  },
  {
    mentorId: "mentor-doyeon",
    introduction: "사건의 원인과 결과를 연결해 한국사를 오래 기억하게 돕습니다.",
    maxActiveMentees: 3,
    isAccepting: true,
    createdAt: "2026-08-05T09:00:00+09:00",
    updatedAt: now,
  },
];

const mentorSubjects: MentorSubject[] = [
  {
    id: "ms-jiho-math",
    mentorId: "mentor-jiho",
    subjectId: "subject-math",
    proficiencyLevel: 5,
    topics: ["함수", "미적분", "수열", "확률"],
    preferredGrades: [1, 2, 3],
    isActive: true,
    createdAt: now,
  },
  {
    id: "ms-jiho-cs",
    mentorId: "mentor-jiho",
    subjectId: "subject-cs",
    proficiencyLevel: 4,
    topics: ["파이썬", "알고리즘"],
    preferredGrades: [1, 2],
    isActive: true,
    createdAt: now,
  },
  {
    id: "ms-harin-english",
    mentorId: "mentor-harin",
    subjectId: "subject-english",
    proficiencyLevel: 5,
    topics: ["독해", "어법", "서술형"],
    preferredGrades: [1, 2, 3],
    isActive: true,
    createdAt: now,
  },
  {
    id: "ms-seoyun-physics",
    mentorId: "mentor-seoyun",
    subjectId: "subject-physics",
    proficiencyLevel: 5,
    topics: ["역학", "전기", "파동"],
    preferredGrades: [1, 2],
    isActive: true,
    createdAt: now,
  },
  {
    id: "ms-taeho-cs",
    mentorId: "mentor-taeho",
    subjectId: "subject-cs",
    proficiencyLevel: 5,
    topics: ["파이썬", "자료구조", "웹 프로젝트"],
    preferredGrades: [1, 2, 3],
    isActive: true,
    createdAt: now,
  },
  {
    id: "ms-yuna-biology",
    mentorId: "mentor-yuna",
    subjectId: "subject-biology",
    proficiencyLevel: 4,
    topics: ["유전", "세포", "항상성"],
    preferredGrades: [2, 3],
    isActive: true,
    createdAt: now,
  },
  {
    id: "ms-doyeon-history",
    mentorId: "mentor-doyeon",
    subjectId: "subject-history",
    proficiencyLevel: 5,
    topics: ["근현대사", "조선 후기", "사료 분석"],
    preferredGrades: [1, 2, 3],
    isActive: true,
    createdAt: now,
  },
  {
    id: "ms-doyeon-korean",
    mentorId: "mentor-doyeon",
    subjectId: "subject-korean",
    proficiencyLevel: 4,
    topics: ["비문학", "문학", "화법과 작문"],
    preferredGrades: [1, 2],
    isActive: true,
    createdAt: now,
  },
];

export const demoAvailability: AvailabilitySlot[] = [
  { id: "slot-jiho-1", userId: "mentor-jiho", dayOfWeek: 2, startTime: "18:00", endTime: "20:00", createdAt: now },
  { id: "slot-jiho-2", userId: "mentor-jiho", dayOfWeek: 4, startTime: "17:00", endTime: "19:00", createdAt: now },
  { id: "slot-harin-1", userId: "mentor-harin", dayOfWeek: 1, startTime: "16:30", endTime: "18:00", createdAt: now },
  { id: "slot-harin-2", userId: "mentor-harin", dayOfWeek: 3, startTime: "18:00", endTime: "20:00", createdAt: now },
  { id: "slot-seoyun-1", userId: "mentor-seoyun", dayOfWeek: 2, startTime: "17:30", endTime: "19:00", createdAt: now },
  { id: "slot-seoyun-2", userId: "mentor-seoyun", dayOfWeek: 5, startTime: "16:00", endTime: "18:00", createdAt: now },
  { id: "slot-taeho-1", userId: "mentor-taeho", dayOfWeek: 4, startTime: "18:00", endTime: "20:30", createdAt: now },
  { id: "slot-taeho-2", userId: "mentor-taeho", dayOfWeek: 6, startTime: "10:00", endTime: "12:00", createdAt: now },
  { id: "slot-yuna-1", userId: "mentor-yuna", dayOfWeek: 3, startTime: "17:00", endTime: "18:30", createdAt: now },
  { id: "slot-doyeon-1", userId: "mentor-doyeon", dayOfWeek: 5, startTime: "18:00", endTime: "20:00", createdAt: now },
];

export const demoMentors: MentorProfile[] = mentorSettings.map((settings) => {
  const profile = demoProfiles.find((item) => item.id === settings.mentorId);

  if (!profile) {
    throw new Error(`Missing demo mentor profile: ${settings.mentorId}`);
  }

  const activeMenteesByMentor: Record<string, number> = {
    "mentor-jiho": 1,
    "mentor-harin": 1,
    "mentor-seoyun": 0,
    "mentor-taeho": 2,
    "mentor-yuna": 1,
    "mentor-doyeon": 0,
  };

  const ratings: Record<string, number> = {
    "mentor-jiho": 4.8,
    "mentor-harin": 4.7,
    "mentor-seoyun": 4.5,
    "mentor-taeho": 4.9,
    "mentor-yuna": 4.2,
    "mentor-doyeon": 4.6,
  };

  return {
    profile,
    settings,
    subjects: mentorSubjects.filter((subject) => subject.mentorId === settings.mentorId),
    availability: demoAvailability.filter((slot) => slot.userId === settings.mentorId),
    averageRating: ratings[settings.mentorId] ?? null,
    completedMentorships: settings.mentorId === "mentor-taeho" ? 8 : settings.mentorId === "mentor-jiho" ? 6 : 3,
    activeMentees: activeMenteesByMentor[settings.mentorId] ?? 0,
    lastActiveAt: profile.updatedAt,
  };
});

export const demoRequests: LearningRequest[] = [
  {
    id: "request-math-calculus",
    menteeId: "user-minseo",
    subjectId: "subject-math",
    title: "미적분 접선과 극값 문제 풀이가 어려워요",
    topics: ["미적분", "함수"],
    description: "그래프에서 접선의 기울기를 구하는 문제와 극값 조건을 연결하는 과정이 헷갈립니다. 풀이 순서를 함께 정리하고 싶습니다.",
    helpType: "problem_solving",
    desiredLevel: 3,
    preferredDays: [2, 4],
    preferredStartTime: "18:00",
    preferredEndTime: "20:00",
    expectedSessions: 4,
    visibility: "school",
    status: "open",
    createdAt: "2026-08-21T14:00:00+09:00",
    updatedAt: "2026-08-21T14:00:00+09:00",
    requester: demoCurrentUser,
  },
  {
    id: "request-english-reading",
    menteeId: "student-eunwoo",
    subjectId: "subject-english",
    title: "영어 독해 지문 구조를 잡고 싶어요",
    topics: ["독해", "어휘"],
    description: "긴 지문을 읽으면 중심 문장과 예시 문장이 구분되지 않습니다. 시험 전에 지문 구조를 빠르게 파악하는 방법을 연습하고 싶습니다.",
    helpType: "study_method",
    desiredLevel: 2,
    preferredDays: [1, 3],
    preferredStartTime: "16:00",
    preferredEndTime: "19:00",
    expectedSessions: 3,
    visibility: "school",
    status: "open",
    createdAt: "2026-08-20T10:20:00+09:00",
    updatedAt: "2026-08-20T10:20:00+09:00",
    requester: demoProfiles.find((profile) => profile.id === "student-eunwoo"),
  },
  {
    id: "request-physics-force",
    menteeId: "user-minseo",
    subjectId: "subject-physics",
    title: "역학 힘 분석을 처음부터 다시 보고 싶어요",
    topics: ["역학"],
    description: "물체에 작용하는 힘을 표시하는 단계부터 잘 안 됩니다. 자유물체도를 그리고 식을 세우는 흐름을 같이 연습하고 싶습니다.",
    helpType: "concept",
    desiredLevel: 2,
    preferredDays: [2, 5],
    preferredStartTime: "17:00",
    preferredEndTime: "19:00",
    expectedSessions: 5,
    visibility: "school",
    status: "open",
    createdAt: "2026-08-19T12:10:00+09:00",
    updatedAt: "2026-08-19T12:10:00+09:00",
    requester: demoCurrentUser,
  },
  {
    id: "request-python-project",
    menteeId: "student-eunwoo",
    subjectId: "subject-cs",
    title: "파이썬 수행평가 프로젝트 구조를 잡고 싶어요",
    topics: ["파이썬", "웹 프로젝트"],
    description: "간단한 설문 결과를 정리하는 프로그램을 만들고 있는데 파일 구조와 함수 분리가 어렵습니다. 프로젝트 방향을 함께 잡고 싶습니다.",
    helpType: "project",
    desiredLevel: 3,
    preferredDays: [4, 6],
    preferredStartTime: "18:00",
    preferredEndTime: "20:00",
    expectedSessions: 2,
    visibility: "school",
    status: "matched",
    createdAt: "2026-08-18T11:10:00+09:00",
    updatedAt: "2026-08-22T10:00:00+09:00",
    requester: demoProfiles.find((profile) => profile.id === "student-eunwoo"),
  },
  {
    id: "request-biology-genetics",
    menteeId: "user-minseo",
    subjectId: "subject-biology",
    title: "유전 문제에서 경우의 수가 헷갈립니다",
    topics: ["유전"],
    description: "가계도와 독립 유전 문제를 풀 때 어떤 경우를 먼저 나눠야 하는지 모르겠습니다. 대표 문제로 접근법을 익히고 싶습니다.",
    helpType: "problem_solving",
    desiredLevel: 4,
    preferredDays: [3],
    preferredStartTime: "17:00",
    preferredEndTime: "19:00",
    expectedSessions: 4,
    visibility: "school",
    status: "open",
    createdAt: "2026-08-17T15:40:00+09:00",
    updatedAt: "2026-08-17T15:40:00+09:00",
    requester: demoCurrentUser,
  },
  {
    id: "request-history-modern",
    menteeId: "student-eunwoo",
    subjectId: "subject-history",
    title: "근현대사 흐름을 시험 전까지 정리하고 싶어요",
    topics: ["근현대사"],
    description: "시대 순서와 사건 원인을 자꾸 섞어서 외웁니다. 큰 흐름을 잡고 사료 문제까지 연결해서 연습하고 싶습니다.",
    helpType: "exam",
    desiredLevel: 2,
    preferredDays: [5],
    preferredStartTime: "18:00",
    preferredEndTime: "20:00",
    expectedSessions: 3,
    visibility: "school",
    status: "open",
    createdAt: "2026-08-16T08:30:00+09:00",
    updatedAt: "2026-08-16T08:30:00+09:00",
    requester: demoProfiles.find((profile) => profile.id === "student-eunwoo"),
  },
  {
    id: "request-math-foundation",
    menteeId: "user-minseo",
    subjectId: "subject-math",
    title: "함수 그래프 해석을 꾸준히 연습하고 싶어요",
    topics: ["함수"],
    description: "그래프의 증가 감소와 교점 해석을 문제마다 새로 보는 느낌이 듭니다. 대표 유형을 정리하며 반복 연습하고 싶습니다.",
    helpType: "concept",
    desiredLevel: 2,
    preferredDays: [2],
    preferredStartTime: "18:00",
    preferredEndTime: "20:00",
    expectedSessions: 4,
    visibility: "school",
    status: "matched",
    createdAt: "2026-08-14T08:30:00+09:00",
    updatedAt: "2026-08-20T18:30:00+09:00",
    requester: demoCurrentUser,
  },
];

export const demoApplications: MentoringApplication[] = [
  {
    id: "app-math-jiho",
    learningRequestId: "request-math-calculus",
    mentorId: "mentor-jiho",
    menteeId: "user-minseo",
    message: "미적분 접선 문제를 대표 유형별로 같이 정리해 볼 수 있습니다.",
    status: "pending",
    createdAt: "2026-08-22T10:00:00+09:00",
  },
  {
    id: "app-physics-seoyun",
    learningRequestId: "request-physics-force",
    mentorId: "mentor-seoyun",
    menteeId: "user-minseo",
    message: "힘 분석은 그림부터 차근차근 잡으면 금방 안정됩니다.",
    status: "pending",
    createdAt: "2026-08-22T11:00:00+09:00",
  },
  {
    id: "app-python-taeho",
    learningRequestId: "request-python-project",
    mentorId: "mentor-taeho",
    menteeId: "student-eunwoo",
    message: "프로젝트 구조와 함수 분리를 같이 잡아 보겠습니다.",
    status: "accepted",
    createdAt: "2026-08-18T16:00:00+09:00",
    respondedAt: "2026-08-22T10:00:00+09:00",
  },
  {
    id: "app-foundation-jiho",
    learningRequestId: "request-math-foundation",
    mentorId: "mentor-jiho",
    menteeId: "user-minseo",
    message: "함수 그래프 해석은 증가 감소와 교점 기준을 같이 잡아 보겠습니다.",
    status: "accepted",
    createdAt: "2026-08-20T17:00:00+09:00",
    respondedAt: "2026-08-20T18:30:00+09:00",
  },
];

export const demoMentorships: Mentorship[] = [
  {
    id: "mentorship-python",
    learningRequestId: "request-python-project",
    mentorId: "mentor-taeho",
    menteeId: "student-eunwoo",
    subjectId: "subject-cs",
    goal: "파이썬 수행평가 프로젝트의 파일 구조와 핵심 함수 설계를 완성한다.",
    status: "active",
    startedAt: "2026-08-22T10:00:00+09:00",
    createdAt: "2026-08-22T10:00:00+09:00",
    updatedAt: now,
  },
  {
    id: "mentorship-english",
    learningRequestId: "request-english-reading",
    mentorId: "mentor-harin",
    menteeId: "user-minseo",
    subjectId: "subject-english",
    goal: "영어 독해 지문의 중심 문장과 근거 문장을 구분하는 습관을 만든다.",
    status: "completed",
    startedAt: "2026-08-03T16:30:00+09:00",
    completedAt: "2026-08-17T17:30:00+09:00",
    createdAt: "2026-08-03T16:30:00+09:00",
    updatedAt: "2026-08-17T17:30:00+09:00",
  },
  {
    id: "mentorship-math-foundation",
    learningRequestId: "request-math-foundation",
    mentorId: "mentor-jiho",
    menteeId: "user-minseo",
    subjectId: "subject-math",
    goal: "함수 그래프의 증가 감소, 교점, 극값 해석을 대표 유형으로 정리한다.",
    status: "active",
    startedAt: "2026-08-20T18:30:00+09:00",
    createdAt: "2026-08-20T18:30:00+09:00",
    updatedAt: now,
  },
];

export const demoSessions: MentoringSession[] = [
  {
    id: "session-python-1",
    mentorshipId: "mentorship-python",
    scheduledAt: "2026-08-25T18:30:00+09:00",
    durationMinutes: 60,
    topic: "프로젝트 요구사항 정리와 함수 목록 작성",
    locationType: "library",
    status: "scheduled",
    createdAt: "2026-08-22T10:30:00+09:00",
    updatedAt: now,
  },
  {
    id: "session-python-2",
    mentorshipId: "mentorship-python",
    scheduledAt: "2026-08-29T10:30:00+09:00",
    durationMinutes: 80,
    topic: "파일 입출력과 결과 표 만들기",
    locationType: "online",
    status: "scheduled",
    createdAt: "2026-08-22T10:30:00+09:00",
    updatedAt: now,
  },
  {
    id: "session-english-1",
    mentorshipId: "mentorship-english",
    scheduledAt: "2026-08-10T16:30:00+09:00",
    durationMinutes: 50,
    topic: "독해 지문 구조 분석",
    locationType: "classroom",
    status: "completed",
    mentorNote: "중심 문장 표시는 안정적이고, 연결어 단서만 더 연습하면 됩니다.",
    menteeNote: "문단마다 역할을 적으니 이해가 쉬웠습니다.",
    completedAt: "2026-08-10T17:20:00+09:00",
    createdAt: "2026-08-05T11:00:00+09:00",
    updatedAt: "2026-08-10T17:20:00+09:00",
  },
  {
    id: "session-math-1",
    mentorshipId: "mentorship-math-foundation",
    scheduledAt: "2026-08-27T18:00:00+09:00",
    durationMinutes: 60,
    topic: "함수 그래프 증가 감소와 교점 해석",
    locationType: "library",
    status: "scheduled",
    createdAt: "2026-08-20T18:40:00+09:00",
    updatedAt: now,
  },
];

export const demoFeedback: SessionFeedback[] = [
  {
    id: "feedback-english-mentor",
    sessionId: "session-english-1",
    authorId: "user-minseo",
    targetUserId: "mentor-harin",
    rating: 5,
    clarityRating: 5,
    punctualityRating: 5,
    goalProgressRating: 4,
    retryPreference: "yes",
    improvementTags: ["후속 과제 필요"],
    improvementNote: "다음에는 독해 연습 과제를 조금 더 받아보고 싶습니다.",
    followUpNeeded: false,
    comment: "지문을 보는 순서를 알려줘서 시험 전에 바로 적용할 수 있었습니다.",
    createdAt: "2026-08-10T18:00:00+09:00",
  },
  {
    id: "feedback-math-mentor",
    sessionId: "session-math-1",
    authorId: "user-minseo",
    targetUserId: "mentor-jiho",
    rating: 4,
    clarityRating: 4,
    punctualityRating: 5,
    goalProgressRating: 3,
    retryPreference: "maybe",
    improvementTags: ["문제 난이도 조정", "목표 재설정"],
    improvementNote: "처음 목표보다 문제가 어려워서 다음 세션은 기본 유형부터 다시 정리하면 좋겠습니다.",
    followUpNeeded: true,
    comment: "그래프를 먼저 그리는 방식은 이해하기 쉬웠습니다.",
    createdAt: "2026-08-24T16:00:00+09:00",
  },
];

export const demoNotifications: Notification[] = [
  {
    id: "noti-1",
    userId: "user-minseo",
    type: "application_received",
    title: "멘토링 신청이 도착했습니다",
    message: "박지호 멘토가 미적분 요청에 신청했습니다.",
    link: "/applications",
    isRead: false,
    createdAt: "2026-08-22T10:00:00+09:00",
  },
  {
    id: "noti-2",
    userId: "user-minseo",
    type: "session_created",
    title: "새 세션이 등록되었습니다",
    message: "파이썬 프로젝트 멘토링 일정이 등록되었습니다.",
    link: "/mentorships/mentorship-python",
    isRead: false,
    createdAt: "2026-08-22T10:30:00+09:00",
  },
  {
    id: "noti-3",
    userId: "user-minseo",
    type: "feedback_requested",
    title: "피드백을 작성해 주세요",
    message: "완료된 영어 독해 세션에 대한 피드백을 남길 수 있습니다.",
    link: "/mentorships/mentorship-english",
    isRead: true,
    createdAt: "2026-08-17T17:40:00+09:00",
  },
  {
    id: "noti-4",
    userId: "user-minseo",
    type: "admin_notice",
    title: "개인 연락처 작성 안내",
    message: "요청과 프로필에는 전화번호나 외부 메신저 계정을 적지 마세요.",
    link: "/requests/new",
    isRead: true,
    createdAt: "2026-08-15T09:00:00+09:00",
  },
];

export const demoReports: ContentReport[] = [
  {
    id: "report-1",
    reporterId: "user-minseo",
    targetType: "learning_request",
    targetId: "request-history-modern",
    reason: "개인 연락처 포함 의심",
    description: "요청 본문에 외부 연락처를 적으려는 표현이 있어 검토가 필요합니다.",
    status: "pending",
    createdAt: "2026-08-23T13:00:00+09:00",
  },
];

export function getSubjectById(id: string) {
  return demoSubjects.find((subject) => subject.id === id);
}

export function getProfileById(id: string) {
  return demoProfiles.find((profile) => profile.id === id);
}

export function getMentorById(id: string) {
  return demoMentors.find((mentor) => mentor.profile.id === id);
}

export function getRequestById(id: string) {
  return demoRequests.find((request) => request.id === id);
}

export function getMentorshipById(id: string) {
  return demoMentorships.find((mentorship) => mentorship.id === id);
}

export function getRecommendedMentorsForRequest(request: LearningRequest, limit = 4) {
  return rankRecommendedMentors(request, demoMentors).slice(0, limit);
}

export function getDashboardStats(userId: string): DashboardStats {
  const sentPendingApplications = demoApplications.filter(
    (application) => application.menteeId === userId && application.status === "pending",
  ).length;
  const receivedPendingApplications = demoApplications.filter(
    (application) => application.mentorId === userId && application.status === "pending",
  ).length;
  const activeMentorships = demoMentorships.filter(
    (mentorship) =>
      (mentorship.mentorId === userId || mentorship.menteeId === userId) &&
      ["planned", "active"].includes(mentorship.status),
  ).length;
  const upcomingSessions = demoSessions.filter((session) => session.status === "scheduled").length;
  const completedMentorships = demoMentorships.filter(
    (mentorship) =>
      (mentorship.mentorId === userId || mentorship.menteeId === userId) && mentorship.status === "completed",
  ).length;

  return {
    sentPendingApplications,
    receivedPendingApplications,
    activeMentorships,
    upcomingSessions,
    completedMentorships,
  };
}

export const recentActivity = [
  "미적분 요청에 새 멘토링 신청이 도착했습니다.",
  "파이썬 프로젝트 멘토링 세션이 등록되었습니다.",
  "영어 독해 멘토링이 완료되었습니다.",
  "관리자 안내: 요청에 개인 연락처를 작성하지 마세요.",
];
