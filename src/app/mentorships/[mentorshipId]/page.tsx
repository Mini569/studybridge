import { notFound } from "next/navigation";

import { LinkButton } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { FeedbackForm } from "@/components/forms/FeedbackForm";
import { SessionForm } from "@/components/forms/SessionForm";
import { AppShell } from "@/components/layout/AppShell";
import { CompleteMentorshipButton } from "@/components/mentorships/CompleteMentorshipButton";
import { BASE_SUBJECTS, LOCATION_LABELS } from "@/lib/constants/options";
import { demoCurrentUser, demoFeedback, demoSessions, getMentorshipById, getProfileById } from "@/lib/demo/data";
import { buildFeedbackInsights } from "@/lib/feedback/insights";
import { formatDateTime } from "@/lib/utils";

type MentorshipDetailProps = {
  params: Promise<{ mentorshipId: string }>;
};

export async function generateMetadata({ params }: MentorshipDetailProps) {
  const { mentorshipId } = await params;
  const mentorship = getMentorshipById(mentorshipId);

  return {
    title: mentorship ? "멘토링 상세" : "멘토링",
    description: mentorship?.goal,
  };
}

export default async function MentorshipDetailPage({ params }: MentorshipDetailProps) {
  const { mentorshipId } = await params;
  const mentorship = getMentorshipById(mentorshipId);

  if (!mentorship) {
    notFound();
  }

  const mentor = getProfileById(mentorship.mentorId);
  const mentee = getProfileById(mentorship.menteeId);
  const subject = BASE_SUBJECTS.find((item) => item.id === mentorship.subjectId);
  const sessions = demoSessions.filter((session) => session.mentorshipId === mentorship.id);
  const completedSession = sessions.find((session) => session.status === "completed");
  const sessionIds = new Set(sessions.map((session) => session.id));
  const feedback = demoFeedback.filter((item) => sessionIds.has(item.sessionId));
  const feedbackInsights = buildFeedbackInsights(feedback);
  const targetUserId = demoCurrentUser.id === mentorship.mentorId ? mentorship.menteeId : mentorship.mentorId;

  return (
    <AppShell>
      <PageHeader
        actions={<LinkButton href="/mentorships" variant="secondary">목록으로</LinkButton>}
        description="멘토와 멘티만 접근 가능한 멘토링 활동 기록입니다."
        title="멘토링 상세"
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-emerald-800">{subject?.name ?? "과목"}</p>
                <h2 className="mt-2 text-xl font-bold text-zinc-950">{mentorship.goal}</h2>
              </div>
              <StatusBadge status={mentorship.status} />
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-zinc-500">멘토</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{mentor?.displayName ?? "멘토"}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">멘티</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{mentee?.displayName ?? "멘티"}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">시작일</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{formatDateTime(mentorship.startedAt)}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">세션 수</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{sessions.length}회</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">세션 목록</h2>
            {sessions.length > 0 ? (
              <div className="mt-4 space-y-3">
                {sessions.map((session) => (
                  <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4" key={session.id}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-zinc-950">{session.topic}</h3>
                        <p className="mt-1 text-sm text-zinc-600">
                          {formatDateTime(session.scheduledAt)} · {session.durationMinutes}분 · {LOCATION_LABELS[session.locationType]}
                        </p>
                      </div>
                      <StatusBadge status={session.status} />
                    </div>
                    {session.mentorNote || session.menteeNote ? (
                      <div className="mt-3 grid gap-2 text-sm leading-6 text-zinc-700">
                        {session.mentorNote ? <p>멘토 기록: {session.mentorNote}</p> : null}
                        {session.menteeNote ? <p>멘티 기록: {session.menteeNote}</p> : null}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-600">등록된 세션이 없습니다.</p>
            )}
          </section>

          {feedback.length > 0 ? (
            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-950">피드백 요약</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-4">
                {[
                  { label: "전체", value: feedbackInsights.averageRating },
                  { label: "설명", value: feedbackInsights.averageClarity },
                  { label: "시간", value: feedbackInsights.averagePunctuality },
                  { label: "목표", value: feedbackInsights.averageGoalProgress },
                ].map((item) => (
                  <article className="rounded-lg bg-zinc-50 p-3" key={item.label}>
                    <p className="text-xs text-zinc-500">{item.label}</p>
                    <p className="mt-1 text-xl font-bold text-zinc-950">{item.value}/5</p>
                  </article>
                ))}
              </div>
              {feedbackInsights.priorityActions.length > 0 ? (
                <div className="mt-4 rounded-lg bg-emerald-50 p-4">
                  <h3 className="text-sm font-bold text-emerald-950">다음 세션 개선 포인트</h3>
                  <ul className="mt-2 space-y-1 text-sm leading-6 text-emerald-950">
                    {feedbackInsights.priorityActions.map((action) => (
                      <li key={action}>- {action}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {mentorship.status === "active" || mentorship.status === "planned" ? <SessionForm mentorshipId={mentorship.id} /> : null}
          {completedSession ? <FeedbackForm sessionId={completedSession.id} targetUserId={targetUserId} /> : null}
        </div>

        <aside className="space-y-4">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">활동 원칙</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-zinc-700">
              <li>- 개인 전화번호와 외부 메신저 계정은 공유하지 않습니다.</li>
              <li>- 장소는 교실, 도서관, 자율학습실, 온라인, 기타 교내 공간만 사용합니다.</li>
              <li>- 세션 후 활동 기록과 피드백을 남깁니다.</li>
            </ul>
          </section>

          {mentorship.status === "active" || mentorship.status === "planned" ? (
            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-950">멘토링 완료</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">MVP에서는 멘토 또는 멘티 한쪽이 완료 처리하면 멘토링이 완료됩니다.</p>
              <div className="mt-4">
                <CompleteMentorshipButton mentorshipId={mentorship.id} />
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}
