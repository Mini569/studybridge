import { Star, UsersRound } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { SubjectBadge } from "@/components/common/SubjectBadge";
import { ProfileForm } from "@/components/forms/ProfileForm";
import { AppShell } from "@/components/layout/AppShell";
import { BASE_SUBJECTS } from "@/lib/constants/options";
import { demoCurrentUser, demoMentors, demoMentorships } from "@/lib/demo/data";

export const metadata = {
  title: "프로필",
};

export default function ProfilePage() {
  const mentor = demoMentors.find((item) => item.profile.id === demoCurrentUser.id);
  const completedMentorships = demoMentorships.filter(
    (mentorship) =>
      mentorship.status === "completed" &&
      (mentorship.mentorId === demoCurrentUser.id || mentorship.menteeId === demoCurrentUser.id),
  ).length;
  const mentorCount = demoMentorships.filter((mentorship) => mentorship.mentorId === demoCurrentUser.id).length;
  const menteeCount = demoMentorships.filter((mentorship) => mentorship.menteeId === demoCurrentUser.id).length;

  return (
    <AppShell>
      <PageHeader description="표시 이름, 학년, 자기소개와 멘토 활동 정보를 관리합니다." title="프로필" />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <ProfileForm mentor={mentor} profile={demoCurrentUser} />

        <aside className="space-y-6">
          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-bold text-zinc-950">활동 통계</h2>
            <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-lg bg-zinc-50 p-3">
                <dt className="text-zinc-500">완료</dt>
                <dd className="mt-1 text-2xl font-bold text-zinc-950">{completedMentorships}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <dt className="text-zinc-500">멘토 활동</dt>
                <dd className="mt-1 text-2xl font-bold text-zinc-950">{mentorCount}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <dt className="text-zinc-500">멘티 활동</dt>
                <dd className="mt-1 text-2xl font-bold text-zinc-950">{menteeCount}</dd>
              </div>
              <div className="rounded-lg bg-zinc-50 p-3">
                <dt className="flex items-center gap-1 text-zinc-500">
                  <Star aria-hidden="true" className="h-4 w-4" />
                  평균 점수
                </dt>
                <dd className="mt-1 text-2xl font-bold text-zinc-950">4.8</dd>
              </div>
            </dl>
          </section>

          <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
            <h2 className="flex items-center gap-2 text-lg font-bold text-zinc-950">
              <UsersRound aria-hidden="true" className="h-5 w-5 text-emerald-700" />
              관심 과목
            </h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {demoCurrentUser.interests.map((subject) => (
                <SubjectBadge key={subject}>{subject}</SubjectBadge>
              ))}
            </div>
            <h3 className="mt-5 text-sm font-bold text-zinc-950">도움받고 싶은 과목</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {demoCurrentUser.needs.map((subject) => (
                <SubjectBadge key={subject}>{subject}</SubjectBadge>
              ))}
            </div>
          </section>

          {mentor ? (
            <section className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
              <h2 className="text-lg font-bold text-zinc-950">멘토 가능 과목</h2>
              <div className="mt-4 space-y-3">
                {mentor.subjects.map((subject) => (
                  <div className="rounded-lg bg-zinc-50 p-3" key={subject.id}>
                    <p className="font-semibold text-zinc-950">{BASE_SUBJECTS.find((item) => item.id === subject.subjectId)?.name}</p>
                    <p className="mt-1 text-sm text-zinc-600">{subject.topics.join(", ")}</p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </AppShell>
  );
}
