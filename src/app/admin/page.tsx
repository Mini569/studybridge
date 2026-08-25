import { AlertTriangle, ClipboardList, ShieldCheck, UsersRound } from "lucide-react";

import { AdminActionButton } from "@/components/admin/AdminActionButton";
import { PageHeader } from "@/components/common/PageHeader";
import { StatusBadge } from "@/components/common/StatusBadge";
import { AppShell } from "@/components/layout/AppShell";
import { demoFeedback, demoMentors, demoMentorships, demoProfiles, demoReports, demoRequests } from "@/lib/demo/data";
import { buildFeedbackInsights } from "@/lib/feedback/insights";

export const metadata = {
  title: "관리자",
};

export default function AdminPage() {
  const activeMentors = demoMentors.filter((mentor) => mentor.profile.mentorEnabled).length;
  const activeMentorships = demoMentorships.filter((mentorship) => mentorship.status === "active").length;
  const completedMentorships = demoMentorships.filter((mentorship) => mentorship.status === "completed").length;
  const reportedCount = demoReports.filter((report) => report.status === "pending").length;
  const feedbackInsights = buildFeedbackInsights(demoFeedback);
  const stats = [
    { label: "전체 사용자", value: demoProfiles.length, icon: UsersRound },
    { label: "활성 멘토", value: activeMentors, icon: ShieldCheck },
    { label: "등록 요청", value: demoRequests.length, icon: ClipboardList },
    { label: "진행 중 멘토링", value: activeMentorships, icon: UsersRound },
    { label: "완료 멘토링", value: completedMentorships, icon: ShieldCheck },
    { label: "신고 콘텐츠", value: reportedCount, icon: AlertTriangle },
  ];

  return (
    <AppShell>
      <PageHeader
        description="관리자 기능은 서버 액션과 RLS 정책에서 모두 관리자 권한을 확인합니다."
        title="관리자"
      />

      <section className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
        데모 모드에서는 관리자 화면을 미리 볼 수 있습니다. 실제 모드에서는 profiles.role 값이 admin인 사용자만 관리자 작업을 수행할 수 있습니다.
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" key={item.label}>
              <Icon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
              <p className="mt-4 text-3xl font-bold text-zinc-950">{item.value}</p>
              <h2 className="mt-1 text-sm font-medium text-zinc-600">{item.label}</h2>
            </article>
          );
        })}
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-zinc-950">피드백 개선 인사이트</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            별점만 보지 않고 설명 명확성, 시간 준수, 목표 달성도, 다시 신청 의향과 개선 태그를 함께 봅니다.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { label: "전체 만족도", value: `${feedbackInsights.averageRating}/5` },
              { label: "설명 명확성", value: `${feedbackInsights.averageClarity}/5` },
              { label: "시간 준수", value: `${feedbackInsights.averagePunctuality}/5` },
              { label: "목표 달성도", value: `${feedbackInsights.averageGoalProgress}/5` },
              { label: "다시 신청 의향", value: `${feedbackInsights.retryIntentRate}%` },
            ].map((item) => (
              <article className="rounded-lg bg-zinc-50 p-4" key={item.label}>
                <p className="text-xs font-medium text-zinc-500">{item.label}</p>
                <p className="mt-2 text-2xl font-bold text-zinc-950">{item.value}</p>
              </article>
            ))}
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
              <h3 className="font-semibold text-zinc-950">반복 개선 태그</h3>
              {feedbackInsights.topImprovementTags.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                  {feedbackInsights.topImprovementTags.map((item) => (
                    <li className="flex items-center justify-between gap-3" key={item.tag}>
                      <span>{item.tag}</span>
                      <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-zinc-800">{item.count}회</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-zinc-600">아직 선택된 개선 태그가 없습니다.</p>
              )}
            </div>
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <h3 className="font-semibold text-emerald-950">우선 개선 액션</h3>
              {feedbackInsights.priorityActions.length > 0 ? (
                <ul className="mt-3 space-y-2 text-sm leading-6 text-emerald-950">
                  {feedbackInsights.priorityActions.map((action) => (
                    <li key={action}>- {action}</li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-sm text-emerald-950">현재 우선 조치가 필요한 항목은 없습니다.</p>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">사용자 목록</h2>
          <div className="mt-4 space-y-3">
            {demoProfiles.slice(0, 6).map((profile) => (
              <article className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-zinc-50 p-4 sm:flex-row sm:items-center sm:justify-between" key={profile.id}>
                <div>
                  <h3 className="font-semibold text-zinc-950">{profile.displayName}</h3>
                  <p className="mt-1 text-sm text-zinc-600">
                    {profile.grade}학년 · {profile.role === "admin" ? "관리자" : "학생"} · 멘토 {profile.mentorEnabled ? "활성" : "비활성"}
                  </p>
                </div>
                {profile.mentorEnabled ? <AdminActionButton action="suspendMentor" danger label="멘토 중지" targetId={profile.id} /> : null}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-zinc-950">도움 요청 관리</h2>
          <div className="mt-4 space-y-3">
            {demoRequests.slice(0, 4).map((request) => (
              <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4" key={request.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-zinc-950">{request.title}</h3>
                  <StatusBadge status={request.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{request.description}</p>
                {request.status !== "hidden" ? (
                  <div className="mt-3">
                    <AdminActionButton action="hideRequest" danger label="요청 숨김" targetId={request.id} />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm xl:col-span-2">
          <h2 className="text-lg font-bold text-zinc-950">신고 처리</h2>
          <div className="mt-4 space-y-3">
            {demoReports.map((report) => (
              <article className="rounded-lg border border-zinc-200 bg-zinc-50 p-4" key={report.id}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-zinc-950">{report.reason}</h3>
                  <span className="rounded-full bg-amber-100 px-2.5 py-1 text-xs font-semibold text-amber-900">{report.status}</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-600">{report.description}</p>
                <div className="mt-3">
                  <AdminActionButton action="resolveReport" label="해결 처리" targetId={report.id} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </AppShell>
  );
}
