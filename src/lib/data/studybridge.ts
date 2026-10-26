import { redirect } from "next/navigation";

import {
  demoApplications,
  demoCurrentUser,
  demoFeedback,
  demoMentors,
  demoMentorships,
  demoNotifications,
  demoProfiles,
  demoReports,
  demoRequests,
  demoSessions,
  demoSubjects,
  getDashboardStats,
  recentActivity,
} from "@/lib/demo/data";
import { isDemoMode } from "@/lib/env";
import { rankRecommendedMentors } from "@/lib/matching/calculate-mentor-score";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type {
  AvailabilitySlot,
  ContentReport,
  DashboardStats,
  DayOfWeek,
  Grade,
  HelpType,
  LearningRequest,
  LocationType,
  MentoringApplication,
  MentoringSession,
  Mentorship,
  MentorProfile,
  MentorSettings,
  MentorSubject,
  Notification,
  NotificationType,
  Profile,
  SessionFeedback,
  Subject,
} from "@/types/domain";

type Row = Record<string, unknown>;

export interface ApplicationListItem {
  application: MentoringApplication;
  requestTitle: string;
  mentorName: string;
  menteeName: string;
}

export interface MentorshipListItem {
  mentorship: Mentorship;
  mentorName: string;
  menteeName: string;
  subjectName: string;
  sessions: MentoringSession[];
}

export interface MentorshipDetailData extends MentorshipListItem {
  feedback: SessionFeedback[];
}

export interface ProfilePageData {
  profile: Profile;
  mentor?: MentorProfile;
  completedMentorships: number;
  mentorCount: number;
  menteeCount: number;
  averageRating: number | null;
}

export interface AdminPageData {
  profiles: Profile[];
  mentors: MentorProfile[];
  requests: LearningRequest[];
  mentorships: Mentorship[];
  feedback: SessionFeedback[];
  reports: ContentReport[];
}

function text(row: Row, key: string, fallback = "") {
  return typeof row[key] === "string" ? row[key] : fallback;
}

function optionalText(row: Row, key: string) {
  return typeof row[key] === "string" && row[key] ? row[key] as string : undefined;
}

function numberValue(row: Row, key: string, fallback = 0) {
  return typeof row[key] === "number" ? row[key] : fallback;
}

function booleanValue(row: Row, key: string, fallback = false) {
  return typeof row[key] === "boolean" ? row[key] : fallback;
}

function stringArray(row: Row, key: string) {
  return Array.isArray(row[key]) ? (row[key] as unknown[]).filter((value): value is string => typeof value === "string") : [];
}

function numberArray(row: Row, key: string) {
  return Array.isArray(row[key]) ? (row[key] as unknown[]).filter((value): value is number => typeof value === "number") : [];
}

function toRows(value: unknown): Row[] {
  return Array.isArray(value) ? value.filter((item): item is Row => Boolean(item) && typeof item === "object") : [];
}

function toRow(value: unknown): Row | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Row : null;
}

export function mapSubject(row: Row): Subject {
  return {
    id: text(row, "id"),
    name: text(row, "name"),
    category: text(row, "category"),
    description: optionalText(row, "description"),
    isActive: booleanValue(row, "is_active", true),
    createdAt: text(row, "created_at"),
  };
}

export function mapProfile(row: Row): Profile {
  return {
    id: text(row, "id"),
    displayName: text(row, "display_name", "학생"),
    grade: numberValue(row, "grade", 1) as Grade,
    bio: optionalText(row, "bio"),
    avatarUrl: optionalText(row, "avatar_url"),
    role: text(row, "role", "student") as Profile["role"],
    onboardingCompleted: booleanValue(row, "onboarding_completed"),
    mentorEnabled: booleanValue(row, "mentor_enabled"),
    interests: stringArray(row, "interests"),
    needs: stringArray(row, "needs"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  };
}

function mapMentorSettings(row: Row): MentorSettings {
  return {
    mentorId: text(row, "mentor_id"),
    introduction: text(row, "introduction"),
    maxActiveMentees: numberValue(row, "max_active_mentees", 3),
    isAccepting: booleanValue(row, "is_accepting", true),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  };
}

function mapMentorSubject(row: Row): MentorSubject {
  return {
    id: text(row, "id"),
    mentorId: text(row, "mentor_id"),
    subjectId: text(row, "subject_id"),
    proficiencyLevel: numberValue(row, "proficiency_level", 3) as MentorSubject["proficiencyLevel"],
    topics: stringArray(row, "topics"),
    preferredGrades: numberArray(row, "preferred_grades") as Grade[],
    isActive: booleanValue(row, "is_active", true),
    createdAt: text(row, "created_at"),
  };
}

function mapAvailability(row: Row): AvailabilitySlot {
  return {
    id: text(row, "id"),
    userId: text(row, "user_id"),
    dayOfWeek: numberValue(row, "day_of_week") as DayOfWeek,
    startTime: text(row, "start_time"),
    endTime: text(row, "end_time"),
    createdAt: text(row, "created_at"),
  };
}

export function mapLearningRequest(row: Row, requester?: Profile): LearningRequest {
  return {
    id: text(row, "id"),
    menteeId: text(row, "mentee_id"),
    subjectId: text(row, "subject_id"),
    title: text(row, "title"),
    topics: stringArray(row, "topics"),
    description: text(row, "description"),
    helpType: text(row, "help_type", "other") as HelpType,
    desiredLevel: numberValue(row, "desired_level", 3) as LearningRequest["desiredLevel"],
    preferredDays: numberArray(row, "preferred_days") as DayOfWeek[],
    preferredStartTime: optionalText(row, "preferred_start_time"),
    preferredEndTime: optionalText(row, "preferred_end_time"),
    expectedSessions: numberValue(row, "expected_sessions", 1),
    visibility: text(row, "visibility", "school") as LearningRequest["visibility"],
    status: text(row, "status", "open") as LearningRequest["status"],
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
    requester,
  };
}

function mapApplication(row: Row): MentoringApplication {
  return {
    id: text(row, "id"),
    learningRequestId: text(row, "learning_request_id"),
    mentorId: text(row, "mentor_id"),
    menteeId: text(row, "mentee_id"),
    message: text(row, "message"),
    status: text(row, "status", "pending") as MentoringApplication["status"],
    createdAt: text(row, "created_at"),
    respondedAt: optionalText(row, "responded_at"),
  };
}

function mapMentorship(row: Row): Mentorship {
  return {
    id: text(row, "id"),
    learningRequestId: text(row, "learning_request_id"),
    mentorId: text(row, "mentor_id"),
    menteeId: text(row, "mentee_id"),
    subjectId: text(row, "subject_id"),
    goal: text(row, "goal"),
    status: text(row, "status", "active") as Mentorship["status"],
    startedAt: text(row, "started_at"),
    completedAt: optionalText(row, "completed_at"),
    cancelledAt: optionalText(row, "cancelled_at"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  };
}

function mapSession(row: Row): MentoringSession {
  return {
    id: text(row, "id"),
    mentorshipId: text(row, "mentorship_id"),
    scheduledAt: text(row, "scheduled_at"),
    durationMinutes: numberValue(row, "duration_minutes"),
    topic: text(row, "topic"),
    locationType: text(row, "location_type", "campus") as LocationType,
    status: text(row, "status", "scheduled") as MentoringSession["status"],
    mentorNote: optionalText(row, "mentor_note"),
    menteeNote: optionalText(row, "mentee_note"),
    completedAt: optionalText(row, "completed_at"),
    createdAt: text(row, "created_at"),
    updatedAt: text(row, "updated_at"),
  };
}

function mapFeedback(row: Row): SessionFeedback {
  return {
    id: text(row, "id"),
    sessionId: text(row, "session_id"),
    authorId: text(row, "author_id"),
    targetUserId: text(row, "target_user_id"),
    rating: numberValue(row, "rating", 3) as SessionFeedback["rating"],
    clarityRating: numberValue(row, "clarity_rating", 3) as SessionFeedback["clarityRating"],
    punctualityRating: numberValue(row, "punctuality_rating", 3) as SessionFeedback["punctualityRating"],
    goalProgressRating: numberValue(row, "goal_progress_rating", 3) as SessionFeedback["goalProgressRating"],
    retryPreference: text(row, "retry_preference", "maybe") as SessionFeedback["retryPreference"],
    improvementTags: stringArray(row, "improvement_tags"),
    improvementNote: optionalText(row, "improvement_note"),
    followUpNeeded: booleanValue(row, "follow_up_needed"),
    comment: optionalText(row, "comment"),
    createdAt: text(row, "created_at"),
  };
}

function mapNotification(row: Row): Notification {
  return {
    id: text(row, "id"),
    userId: text(row, "user_id"),
    type: text(row, "type", "admin_notice") as NotificationType,
    title: text(row, "title"),
    message: text(row, "message"),
    link: optionalText(row, "link"),
    isRead: booleanValue(row, "is_read"),
    createdAt: text(row, "created_at"),
  };
}

function mapReport(row: Row): ContentReport {
  return {
    id: text(row, "id"),
    reporterId: text(row, "reporter_id"),
    targetType: text(row, "target_type", "profile") as ContentReport["targetType"],
    targetId: text(row, "target_id"),
    reason: text(row, "reason"),
    description: optionalText(row, "description"),
    status: text(row, "status", "pending") as ContentReport["status"],
    resolvedBy: optionalText(row, "resolved_by"),
    resolvedAt: optionalText(row, "resolved_at"),
    createdAt: text(row, "created_at"),
  };
}

async function requireRealUser() {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return { supabase, user };
}

async function loadProfilesByIds(supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>, ids: string[]) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  if (uniqueIds.length === 0) return new Map<string, Profile>();
  const { data } = await supabase.from("profiles").select("*").in("id", uniqueIds);
  return new Map(toRows(data).map((row) => {
    const profile = mapProfile(row);
    return [profile.id, profile] as const;
  }));
}

export async function loadSubjects(): Promise<Subject[]> {
  if (isDemoMode) return demoSubjects;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("subjects").select("*").eq("is_active", true).order("name");
  return toRows(data).map(mapSubject);
}

export async function loadCurrentProfile(): Promise<Profile> {
  if (isDemoMode) return demoCurrentUser;
  const { supabase, user } = await requireRealUser();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
  const row = toRow(data);
  if (!row) redirect("/onboarding");
  return mapProfile(row);
}

export async function loadShellData() {
  if (isDemoMode) {
    return { profile: demoCurrentUser, unreadCount: demoNotifications.filter((item) => !item.isRead).length };
  }
  const { supabase, user } = await requireRealUser();
  const [{ data: profileData }, { count }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("is_read", false),
  ]);
  const row = toRow(profileData);
  if (!row) redirect("/onboarding");
  return { profile: mapProfile(row), unreadCount: count ?? 0 };
}

export async function loadMentors(): Promise<MentorProfile[]> {
  if (isDemoMode) return demoMentors;
  const { supabase } = await requireRealUser();
  const [profilesResult, settingsResult, subjectsResult, availabilityResult, statsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("mentor_enabled", true),
    supabase.from("mentor_settings").select("*"),
    supabase.from("mentor_subjects").select("*").eq("is_active", true),
    supabase.from("availability_slots").select("*"),
    supabase.rpc("get_mentor_stats"),
  ]);
  const settings = toRows(settingsResult.data).map(mapMentorSettings);
  const mentorSubjects = toRows(subjectsResult.data).map(mapMentorSubject);
  const availability = toRows(availabilityResult.data).map(mapAvailability);
  const stats = new Map(toRows(statsResult.data).map((row) => [text(row, "mentor_id"), row]));

  return toRows(profilesResult.data).map(mapProfile).map((profile) => {
    const setting = settings.find((item) => item.mentorId === profile.id) ?? {
      mentorId: profile.id,
      introduction: profile.bio ?? "",
      maxActiveMentees: 3,
      isAccepting: true,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    };
    const stat = stats.get(profile.id);
    return {
      profile,
      settings: setting,
      subjects: mentorSubjects.filter((item) => item.mentorId === profile.id),
      availability: availability.filter((item) => item.userId === profile.id),
      averageRating: stat && typeof stat.average_rating === "number" ? stat.average_rating : null,
      completedMentorships: stat ? numberValue(stat, "completed_mentorships") : 0,
      activeMentees: stat ? numberValue(stat, "active_mentees") : 0,
      lastActiveAt: stat ? text(stat, "last_active_at", profile.updatedAt) : profile.updatedAt,
    };
  });
}

export async function loadRequests(): Promise<LearningRequest[]> {
  if (isDemoMode) return demoRequests;
  const { supabase } = await requireRealUser();
  const { data } = await supabase.from("learning_requests").select("*").order("created_at", { ascending: false });
  const rows = toRows(data);
  const profiles = await loadProfilesByIds(supabase, rows.map((row) => text(row, "mentee_id")));
  return rows.map((row) => mapLearningRequest(row, profiles.get(text(row, "mentee_id"))));
}

export async function loadRequestById(id: string): Promise<LearningRequest | null> {
  if (isDemoMode) return demoRequests.find((item) => item.id === id) ?? null;
  const { supabase } = await requireRealUser();
  const { data } = await supabase.from("learning_requests").select("*").eq("id", id).maybeSingle();
  const row = toRow(data);
  if (!row) return null;
  const profiles = await loadProfilesByIds(supabase, [text(row, "mentee_id")]);
  return mapLearningRequest(row, profiles.get(text(row, "mentee_id")));
}

export async function loadApplications(): Promise<ApplicationListItem[]> {
  if (isDemoMode) {
    return demoApplications.map((application) => ({
      application,
      requestTitle: demoRequests.find((item) => item.id === application.learningRequestId)?.title ?? "학습 요청",
      mentorName: demoProfiles.find((item) => item.id === application.mentorId)?.displayName ?? "멘토",
      menteeName: demoProfiles.find((item) => item.id === application.menteeId)?.displayName ?? "멘티",
    }));
  }
  const { supabase } = await requireRealUser();
  const { data } = await supabase.from("mentoring_applications").select("*").order("created_at", { ascending: false });
  const applications = toRows(data).map(mapApplication);
  const requestIds = [...new Set(applications.map((item) => item.learningRequestId))];
  const [{ data: requestData }, profiles] = await Promise.all([
    requestIds.length ? supabase.from("learning_requests").select("id,title").in("id", requestIds) : Promise.resolve({ data: [] }),
    loadProfilesByIds(supabase, applications.flatMap((item) => [item.mentorId, item.menteeId])),
  ]);
  const titles = new Map(toRows(requestData).map((row) => [text(row, "id"), text(row, "title", "학습 요청")]));
  return applications.map((application) => ({
    application,
    requestTitle: titles.get(application.learningRequestId) ?? "학습 요청",
    mentorName: profiles.get(application.mentorId)?.displayName ?? "멘토",
    menteeName: profiles.get(application.menteeId)?.displayName ?? "멘티",
  }));
}

export async function loadMentorships(): Promise<MentorshipListItem[]> {
  if (isDemoMode) {
    return demoMentorships.map((mentorship) => ({
      mentorship,
      mentorName: demoProfiles.find((item) => item.id === mentorship.mentorId)?.displayName ?? "멘토",
      menteeName: demoProfiles.find((item) => item.id === mentorship.menteeId)?.displayName ?? "멘티",
      subjectName: demoSubjects.find((item) => item.id === mentorship.subjectId)?.name ?? "과목",
      sessions: demoSessions.filter((item) => item.mentorshipId === mentorship.id),
    }));
  }
  const { supabase } = await requireRealUser();
  const { data } = await supabase.from("mentorships").select("*").order("created_at", { ascending: false });
  const mentorships = toRows(data).map(mapMentorship);
  const [profiles, subjects, sessionsResult] = await Promise.all([
    loadProfilesByIds(supabase, mentorships.flatMap((item) => [item.mentorId, item.menteeId])),
    loadSubjects(),
    supabase.from("mentoring_sessions").select("*").order("scheduled_at"),
  ]);
  const subjectNames = new Map(subjects.map((item) => [item.id, item.name]));
  const sessions = toRows(sessionsResult.data).map(mapSession);
  return mentorships.map((mentorship) => ({
    mentorship,
    mentorName: profiles.get(mentorship.mentorId)?.displayName ?? "멘토",
    menteeName: profiles.get(mentorship.menteeId)?.displayName ?? "멘티",
    subjectName: subjectNames.get(mentorship.subjectId) ?? "과목",
    sessions: sessions.filter((item) => item.mentorshipId === mentorship.id),
  }));
}

export async function loadMentorshipById(id: string): Promise<MentorshipDetailData | null> {
  const item = (await loadMentorships()).find((entry) => entry.mentorship.id === id);
  if (!item) return null;
  if (isDemoMode) {
    const ids = new Set(item.sessions.map((session) => session.id));
    return { ...item, feedback: demoFeedback.filter((entry) => ids.has(entry.sessionId)) };
  }
  const { supabase } = await requireRealUser();
  const ids = item.sessions.map((session) => session.id);
  if (ids.length === 0) return { ...item, feedback: [] };
  const { data } = await supabase.from("session_feedback").select("*").in("session_id", ids).order("created_at");
  return { ...item, feedback: toRows(data).map(mapFeedback) };
}

export async function loadNotifications(): Promise<Notification[]> {
  if (isDemoMode) return demoNotifications.filter((item) => item.userId === demoCurrentUser.id);
  const { supabase, user } = await requireRealUser();
  const { data } = await supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
  return toRows(data).map(mapNotification);
}

export async function loadVisibleFeedback(targetUserId?: string): Promise<SessionFeedback[]> {
  if (isDemoMode) return targetUserId ? demoFeedback.filter((item) => item.targetUserId === targetUserId) : demoFeedback;
  const { supabase } = await requireRealUser();
  let query = supabase.from("session_feedback").select("*").order("created_at", { ascending: false });
  if (targetUserId) query = query.eq("target_user_id", targetUserId);
  const { data } = await query;
  return toRows(data).map(mapFeedback);
}

export async function loadProfilePageData(): Promise<ProfilePageData> {
  if (isDemoMode) {
    const mentor = demoMentors.find((item) => item.profile.id === demoCurrentUser.id);
    const related = demoMentorships.filter((item) => item.mentorId === demoCurrentUser.id || item.menteeId === demoCurrentUser.id);
    const ratings = demoFeedback.filter((item) => item.targetUserId === demoCurrentUser.id).map((item) => item.rating);
    return {
      profile: demoCurrentUser,
      mentor,
      completedMentorships: related.filter((item) => item.status === "completed").length,
      mentorCount: related.filter((item) => item.mentorId === demoCurrentUser.id).length,
      menteeCount: related.filter((item) => item.menteeId === demoCurrentUser.id).length,
      averageRating: ratings.length ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length : null,
    };
  }
  const profile = await loadCurrentProfile();
  const [mentors, mentorshipItems] = await Promise.all([loadMentors(), loadMentorships()]);
  const related = mentorshipItems.map((item) => item.mentorship);
  const mentor = mentors.find((item) => item.profile.id === profile.id);
  return {
    profile,
    mentor,
    completedMentorships: related.filter((item) => item.status === "completed").length,
    mentorCount: related.filter((item) => item.mentorId === profile.id).length,
    menteeCount: related.filter((item) => item.menteeId === profile.id).length,
    averageRating: mentor?.averageRating ?? null,
  };
}

export async function loadDashboardData(): Promise<{
  profile: Profile;
  stats: DashboardStats;
  recommendedMentors: ReturnType<typeof rankRecommendedMentors>;
  activity: string[];
}> {
  if (isDemoMode) {
    const request = demoRequests.find((item) => item.menteeId === demoCurrentUser.id && item.status === "open");
    return {
      profile: demoCurrentUser,
      stats: getDashboardStats(demoCurrentUser.id),
      recommendedMentors: request ? rankRecommendedMentors(request, demoMentors).slice(0, 3) : [],
      activity: recentActivity,
    };
  }
  const profile = await loadCurrentProfile();
  const [applications, mentorshipItems, requests, mentors, notifications] = await Promise.all([
    loadApplications(), loadMentorships(), loadRequests(), loadMentors(), loadNotifications(),
  ]);
  const mentorships = mentorshipItems.map((item) => item.mentorship);
  const sessions = mentorshipItems.flatMap((item) => item.sessions);
  const request = requests.find((item) => item.menteeId === profile.id && item.status === "open");
  const stats: DashboardStats = {
    sentPendingApplications: applications.filter((item) => item.application.menteeId === profile.id && item.application.status === "pending").length,
    receivedPendingApplications: applications.filter((item) => item.application.mentorId === profile.id && item.application.status === "pending").length,
    activeMentorships: mentorships.filter((item) => item.status === "active").length,
    upcomingSessions: sessions.filter((item) => item.status === "scheduled" && new Date(item.scheduledAt).getTime() > Date.now()).length,
    completedMentorships: mentorships.filter((item) => item.status === "completed").length,
  };
  return {
    profile,
    stats,
    recommendedMentors: request ? rankRecommendedMentors(request, mentors).slice(0, 3) : [],
    activity: notifications.slice(0, 5).map((item) => `${item.title}: ${item.message}`),
  };
}

export async function loadAdminPageData(): Promise<AdminPageData> {
  if (isDemoMode) {
    return { profiles: demoProfiles, mentors: demoMentors, requests: demoRequests, mentorships: demoMentorships, feedback: demoFeedback, reports: demoReports };
  }
  const profile = await loadCurrentProfile();
  if (profile.role !== "admin") redirect("/dashboard");
  const supabase = await createSupabaseServerClient();
  const [profiles, mentors, requests, mentorships, feedbackResult, reportsResult] = await Promise.all([
    supabase.from("profiles").select("*").order("created_at", { ascending: false }),
    loadMentors(), loadRequests(), loadMentorships(),
    supabase.from("session_feedback").select("*").order("created_at", { ascending: false }),
    supabase.from("content_reports").select("*").order("created_at", { ascending: false }),
  ]);
  return {
    profiles: toRows(profiles.data).map(mapProfile),
    mentors,
    requests,
    mentorships: mentorships.map((item) => item.mentorship),
    feedback: toRows(feedbackResult.data).map(mapFeedback),
    reports: toRows(reportsResult.data).map(mapReport),
  };
}
