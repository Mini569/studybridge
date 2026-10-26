import { notFound } from "next/navigation";

import { ApplicationPanel } from "@/components/applications/ApplicationPanel";
import { LinkButton } from "@/components/common/Button";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SubjectBadge } from "@/components/common/SubjectBadge";
import { AppShell } from "@/components/layout/AppShell";
import { CancelRequestButton } from "@/components/requests/CancelRequestButton";
import { HELP_TYPE_LABELS } from "@/lib/constants/options";
import { loadCurrentProfile, loadMentors, loadRequestById, loadSubjects } from "@/lib/data/studybridge";
import { rankRecommendedMentors } from "@/lib/matching/calculate-mentor-score";
import { formatDayList, formatTimeRange } from "@/lib/utils";

type RequestDetailProps = {
  params: Promise<{ requestId: string }>;
};

export async function generateMetadata({ params }: RequestDetailProps) {
  const { requestId } = await params;
  const request = await loadRequestById(requestId);

  return {
    title: request?.title ?? "도움 요청 상세",
    description: request?.description,
  };
}

export default async function RequestDetailPage({ params }: RequestDetailProps) {
  const { requestId } = await params;
  const [request, subjects, mentors, currentUser] = await Promise.all([
    loadRequestById(requestId), loadSubjects(), loadMentors(), loadCurrentProfile(),
  ]);

  if (!request) {
    notFound();
  }

  const subject = subjects.find((item) => item.id === request.subjectId);
  const recommendations = rankRecommendedMentors(request, mentors).slice(0, 4);
  const isOwner = request.menteeId === currentUser.id;

  return (
    <AppShell>
      <PageHeader
        actions={<LinkButton href="/requests" variant="secondary">목록으로</LinkButton>}
        description="요청 내용, 가능한 시간, 추천 멘토와 신청 상태를 확인합니다."
        title={request.title}
      />

      <div className="mt-6 grid gap-6 2xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-center gap-2">
              <SubjectBadge>{subject?.name ?? "과목"}</SubjectBadge>
              <StatusBadge status={request.status} />
            </div>
            <dl className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-zinc-500">요청자 학년</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{request.requester?.grade ?? "-"}학년</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">도움 방식</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{HELP_TYPE_LABELS[request.helpType]}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">세부 단원</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{request.topics.join(", ")}</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">희망 일정</dt>
                <dd className="mt-1 font-semibold text-zinc-950">
                  {formatDayList(request.preferredDays)} {formatTimeRange(request.preferredStartTime, request.preferredEndTime)}
                </dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">예상 횟수</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{request.expectedSessions}회</dd>
              </div>
              <div>
                <dt className="text-sm text-zinc-500">원하는 도움 수준</dt>
                <dd className="mt-1 font-semibold text-zinc-950">{request.desiredLevel}/5</dd>
              </div>
            </dl>
            <div className="mt-6 rounded-lg bg-zinc-50 p-4">
              <h2 className="font-bold text-zinc-950">어려운 점</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-700">{request.description}</p>
            </div>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">추천 멘토</h2>
            {recommendations.length > 0 ? (
              <div className="mt-4 grid gap-4">
                {recommendations.map(({ mentor, result }) => (
                  <article className="min-w-0 rounded-lg border border-zinc-200 bg-zinc-50 p-4" key={mentor.profile.id}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-emerald-800">멘토 닉네임</p>
                        <h3 className="mt-1 break-words font-semibold text-zinc-950">{mentor.profile.displayName}</h3>
                        <p className="mt-1 text-sm text-zinc-600">{mentor.profile.grade}학년 · 평점 {mentor.averageRating?.toFixed(1) ?? "평가 없음"}</p>
                      </div>
                      <span className="shrink-0 rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white">{result.score}점</span>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm leading-6 text-zinc-700">
                      {result.reasons.slice(0, 4).map((reason) => (
                        <li key={reason}>- {reason}</li>
                      ))}
                    </ul>
                    <div className="mt-4">
                      <LinkButton className="w-full sm:w-auto" href={`/mentors/${mentor.profile.id}`} variant="secondary">프로필 보기</LinkButton>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-zinc-600">현재 추천 가능한 멘토가 없습니다.</p>
            )}
          </section>
        </div>

        <aside className="space-y-4">
          {isOwner && request.status === "open" ? (
            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-950">작성자 관리</h2>
              <p className="mt-2 text-sm leading-6 text-zinc-600">매칭 전에는 요청을 취소할 수 있습니다.</p>
              <div className="mt-4">
                <CancelRequestButton requestId={request.id} />
              </div>
            </section>
          ) : null}

          {isOwner && recommendations[0] ? (
            <ApplicationPanel currentUserId={currentUser.id} learningRequestId={request.id} mentor={recommendations[0].mentor} />
          ) : !isOwner ? (
            <section className="rounded-lg border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-700">
              다른 학생의 요청입니다. 본인의 도움 요청에서 추천된 멘토에게 신청할 수 있습니다.
            </section>
          ) : (
            <section className="rounded-lg border border-zinc-200 bg-white p-5 text-sm leading-6 text-zinc-700">
              이 요청과 정확히 맞는 멘토가 아직 없습니다.
            </section>
          )}
        </aside>
      </div>
    </AppShell>
  );
}
