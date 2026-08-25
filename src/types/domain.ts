export type Grade = 1 | 2 | 3;
export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export type UserRole = "student" | "admin";
export type RequestStatus = "open" | "matched" | "closed" | "cancelled" | "hidden";
export type ApplicationStatus = "pending" | "accepted" | "rejected" | "cancelled";
export type MentorshipStatus = "planned" | "active" | "completed" | "cancelled";
export type SessionStatus = "scheduled" | "completed" | "cancelled";
export type ReportStatus = "pending" | "reviewing" | "resolved" | "dismissed";
export type HelpType =
  | "concept"
  | "problem_solving"
  | "study_method"
  | "exam"
  | "project"
  | "other";

export type NotificationType =
  | "application_received"
  | "application_accepted"
  | "application_rejected"
  | "application_cancelled"
  | "session_created"
  | "session_changed"
  | "mentorship_completed"
  | "feedback_requested"
  | "admin_notice";

export type LocationType = "classroom" | "library" | "self_study" | "online" | "campus";

export interface Subject {
  id: string;
  name: string;
  category: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
}

export interface Profile {
  id: string;
  displayName: string;
  grade: Grade;
  bio?: string;
  avatarUrl?: string;
  role: UserRole;
  onboardingCompleted: boolean;
  mentorEnabled: boolean;
  interests: string[];
  needs: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MentorSettings {
  mentorId: string;
  introduction: string;
  maxActiveMentees: number;
  isAccepting: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MentorSubject {
  id: string;
  mentorId: string;
  subjectId: string;
  proficiencyLevel: 1 | 2 | 3 | 4 | 5;
  topics: string[];
  preferredGrades: Grade[];
  isActive: boolean;
  createdAt: string;
}

export interface AvailabilitySlot {
  id: string;
  userId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface MentorProfile {
  profile: Profile;
  settings: MentorSettings;
  subjects: MentorSubject[];
  availability: AvailabilitySlot[];
  averageRating: number | null;
  completedMentorships: number;
  activeMentees: number;
  lastActiveAt: string;
}

export interface LearningRequest {
  id: string;
  menteeId: string;
  subjectId: string;
  title: string;
  topics: string[];
  description: string;
  helpType: HelpType;
  desiredLevel: 1 | 2 | 3 | 4 | 5;
  preferredDays: DayOfWeek[];
  preferredStartTime?: string;
  preferredEndTime?: string;
  expectedSessions: number;
  visibility: "school" | "mentor_only";
  status: RequestStatus;
  createdAt: string;
  updatedAt: string;
  requester?: Profile;
}

export interface MentoringApplication {
  id: string;
  learningRequestId: string;
  mentorId: string;
  menteeId: string;
  message: string;
  status: ApplicationStatus;
  createdAt: string;
  respondedAt?: string;
}

export interface Mentorship {
  id: string;
  learningRequestId: string;
  mentorId: string;
  menteeId: string;
  subjectId: string;
  goal: string;
  status: MentorshipStatus;
  startedAt: string;
  completedAt?: string;
  cancelledAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MentoringSession {
  id: string;
  mentorshipId: string;
  scheduledAt: string;
  durationMinutes: number;
  topic: string;
  locationType: LocationType;
  status: SessionStatus;
  mentorNote?: string;
  menteeNote?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SessionFeedback {
  id: string;
  sessionId: string;
  authorId: string;
  targetUserId: string;
  rating: 1 | 2 | 3 | 4 | 5;
  clarityRating: 1 | 2 | 3 | 4 | 5;
  punctualityRating: 1 | 2 | 3 | 4 | 5;
  goalProgressRating: 1 | 2 | 3 | 4 | 5;
  retryPreference: "yes" | "maybe" | "no";
  improvementTags: string[];
  improvementNote?: string;
  followUpNeeded: boolean;
  comment?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface ContentReport {
  id: string;
  reporterId: string;
  targetType: "profile" | "learning_request" | "session";
  targetId: string;
  reason: string;
  description?: string;
  status: ReportStatus;
  resolvedBy?: string;
  resolvedAt?: string;
  createdAt: string;
}

export interface DashboardStats {
  sentPendingApplications: number;
  receivedPendingApplications: number;
  activeMentorships: number;
  upcomingSessions: number;
  completedMentorships: number;
}

export interface MentorScoreInput {
  request: LearningRequest & { requester?: Profile };
  mentor: MentorProfile;
  subjectId: string;
}

export interface MentorScoreResult {
  mentorId: string;
  score: number;
  reasons: string[];
}
