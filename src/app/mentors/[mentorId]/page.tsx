import { notFound } from "next/navigation";
import { Star, Users } from "lucide-react";

import { ApplicationPanel } from "@/components/applications/ApplicationPanel";
import { LinkButton } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { SubjectBadge } from "@/components/common/SubjectBadge";
import { AppShell } from "@/components/layout/AppShell";
import { BASE_SUBJECTS, DAY_LABELS } from "@/lib/constants/options";
import { demoCurrentUser, demoFeedback, demoRequests, getMentorById } from "@/lib/demo/data";
import { hasCapacity } from "@/lib/matching/calculate-mentor-score";

type MentorDetailProps = {
  params: Promise<{ mentorId: string }>;
};

export async function generateMetadata({ params }: MentorDetailProps) {
  const { mentorId } = await params;
  const mentor = getMentorById(mentorId);

  return {
    title: mentor ? `${mentor.profile.displayName} 멘토` : "멘토 상세",
    description: mentor?.settings.introduction,
  };
}

export default async function MentorDetailPage({ params }: MentorDetailProps) {
  const { mentorId } = await params;
  const mentor = getMentorById(mentorId);

  if (!mentor) {
    notFound();
  }

  const matchingRequest =
    demoRequests.find(
      (request) =>
        request.menteeId === demoCurrentUser.id &&
        request.status === "open" &&
        mentor.subjects.some((subject) => subject.subjectId === request.subjectId),
    ) ?? demoRequests.find((request) => request.menteeId === demoCurrentUser.id && request.status === "open");
  const remainingCapacity = mentor.settings.maxActiveMentees - mentor.activeMentees;

  return (
    <AppShell>
      <PageHeader
        actions={<LinkButton href="/mentors" variant="secondary">목록으로</LinkButton>}
        description={mentor.settings.introduction}
        title={`${mentor.profile.displayName} 멘토`}
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">기본 프로필</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-zinc-500">학년</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{mentor.profile.grade}학년</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">평균 평점</dt>
                <dd className="mt-1 flex items-center gap-1 font-semibold text-zinc-950">
                  <Star aria-hidden="true" className="h-4 w-4 fill-amber-400 text-amber-500" />
                  {mentor.averageRating?.toFixed(1) ?? "평가 없음"}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">완료한 멘토링</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{mentor.completedMentorships}회</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">진행 가능 여유</dt>
                <dd className="mt-1 flex items-center gap-1 font-semibold text-zinc-950">
                  <Users aria-hidden="true" className="h-4 w-4 text-emerald-700" />
                  {hasCapacity(mentor) ? `${remainingCapacity}명` : "정원 마감"}
                </dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">가능 과목과 세부 단원</h2>
            <div className="mt-4 space-y-4">
              {mentor.subjects.map((subject) => {
                const subjectName = BASE_SUBJECTS.find((item) => item.id === subject.subjectId)?.name ?? "과목";

                return (
                  <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4" key={subject.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <SubjectBadge>{subjectName}</SubjectBadge>
                      <span className="text-sm font-semibold text-zinc-700">숙련도 {subject.proficiencyLevel}/5</span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-zinc-700">{subject.topics.join(", ")}</p>
                    <p className="mt-2 text-xs text-zinc-500">
                      선호 학년: {subject.preferredGrades.length > 0 ? subject.preferredGrades.map((grade) => `${grade}학년`).join(", ") : "전체"}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">가능한 요일과 시간</h2>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {mentor.availability.map((slot) => (
                <li className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 text-sm font-medium text-zinc-800" key={slot.id}>
                  {DAY_LABELS[slot.dayOfWeek]} {slot.startTime.slice(0, 5)} - {slot.endTime.slice(0, 5)}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">최근 후기</h2>
            {demoFeedback.length > 0 ? (
              <div className="mt-4 space-y-3">
                {demoFeedback.slice(0, 2).map((feedback) => (
                  <article className="rounded-lg bg-zinc-50 p-4" key={feedback.id}>
                    <p className="text-sm font-semibold text-zinc-950">평점 {feedback.rating}/5</p>
                    <p className="mt-2 text-sm leading-6 text-zinc-700">{feedback.comment}</p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-sm text-zinc-600">아직 후기가 없습니다.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          {matchingRequest ? (
            <ApplicationPanel currentUserId={demoCurrentUser.id} learningRequestId={matchingRequest.id} mentor={mentor} />
          ) : (
            <div className="rounded-lg border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-700">
              신청하려면 먼저 학습 도움 요청을 작성해 주세요.
              <div className="mt-4">
                <LinkButton href="/requests/new">도움 요청 작성</LinkButton>
              </div>
            </div>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
