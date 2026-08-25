import { Bell, BookOpenCheck, CalendarDays, ClipboardPlus, GraduationCap, Inbox, Search, UsersRound } from "lucide-react";

import { LinkButton } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { AppShell } from "@/components/layout/AppShell";
import { MentorCard } from "@/components/mentors/MentorCard";
import { demoCurrentUser, demoMentors, getDashboardStats, recentActivity } from "@/lib/demo/data";

export const metadata = {
  title: "대시보드",
};

const statIcons = [Inbox, Bell, UsersRound, CalendarDays, BookOpenCheck];

export default function DashboardPage() {
  const stats = getDashboardStats(demoCurrentUser.id);
  const statItems = [
    { label: "보낸 대기 신청", value: stats.sentPendingApplications },
    { label: "받은 대기 신청", value: stats.receivedPendingApplications },
    { label: "진행 중 멘토링", value: stats.activeMentorships },
    { label: "예정된 세션", value: stats.upcomingSessions },
    { label: "완료한 멘토링", value: stats.completedMentorships },
  ];
  const recommendedMentors = demoMentors.slice(0, 3);

  return (
    <AppShell>
      <PageHeader
        actions={
          <>
            <LinkButton href="/mentors" variant="secondary">
              <Search aria-hidden="true" className="h-4 w-4" />
              멘토 찾기
            </LinkButton>
            <LinkButton href="/requests/new">
              <ClipboardPlus aria-hidden="true" className="h-4 w-4" />
              도움 요청 작성
            </LinkButton>
          </>
        }
        description="내 신청, 진행 중인 멘토링, 예정 세션과 추천 멘토를 한곳에서 확인합니다."
        title="대시보드"
      />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statItems.map((item, index) => {
          const Icon = statIcons[index];

          return (
            <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm" key={item.label}>
              <Icon aria-hidden="true" className="h-5 w-5 text-emerald-700" />
              <p className="mt-4 text-3xl font-bold text-zinc-950">{item.value}</p>
              <h2 className="mt-1 text-sm font-medium text-zinc-600">{item.label}</h2>
            </article>
          );
        })}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <h2 className="text-xl font-bold text-zinc-950">추천 멘토</h2>
          {recommendedMentors.length > 0 ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recommendedMentors.map((mentor) => (
                <MentorCard key={mentor.profile.id} mentor={mentor} />
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState
                action={<LinkButton href="/profile">관심 과목 등록</LinkButton>}
                description="관심 과목과 도움받고 싶은 과목을 등록하면 추천 멘토가 표시됩니다."
                icon={GraduationCap}
                title="아직 추천 멘토가 없습니다"
              />
            </div>
          )}
        </div>

        <aside className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">최근 활동</h2>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-zinc-700">
              {recentActivity.map((activity) => (
                <li className="border-b border-zinc-100 pb-3 last:border-b-0 last:pb-0" key={activity}>
                  {activity}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">빠른 실행</h2>
            <div className="mt-4 grid gap-2">
              <LinkButton href="/mentors" variant="secondary">멘토 찾기</LinkButton>
              <LinkButton href="/requests/new" variant="secondary">도움 요청 작성</LinkButton>
              <LinkButton href="/profile" variant="secondary">멘토로 등록하기</LinkButton>
              <LinkButton href="/mentorships" variant="secondary">내 멘토링 확인</LinkButton>
            </div>
          </section>
        </aside>
      </section>
    </AppShell>
  );
}
