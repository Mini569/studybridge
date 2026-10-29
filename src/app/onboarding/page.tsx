import { OnboardingForm } from "@/components/forms/OnboardingForm";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { isDemoMode } from "@/lib/env";
import { loadCurrentProfile, loadSubjects } from "@/lib/data/studybridge";

export const metadata = {
  title: "온보딩",
};

export default async function OnboardingPage() {
  const [profile, subjects] = await Promise.all([loadCurrentProfile(), loadSubjects()]);
  return (
    <main className="min-h-screen bg-zinc-50">
      {isDemoMode ? <DemoBanner /> : null}
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-bold text-emerald-800">첫 설정</p>
          <h1 className="mt-2 text-2xl font-bold text-zinc-950">학습 프로필을 완성하세요</h1>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            관심 과목과 도움받고 싶은 과목을 등록하면 멘토 추천과 대시보드가 더 정확해집니다.
          </p>
          <div className="mt-6">
            <OnboardingForm initialDisplayName={profile.displayName} initialGrade={profile.grade} subjects={subjects} />
          </div>
        </section>
      </div>
    </main>
  );
}
