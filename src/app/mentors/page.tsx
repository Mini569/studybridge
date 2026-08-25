import { Search } from "lucide-react";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { inputStyles } from "@/components/forms/FormField";
import { AppShell } from "@/components/layout/AppShell";
import { MentorCard } from "@/components/mentors/MentorCard";
import { BASE_SUBJECTS, DAY_OPTIONS, GRADE_OPTIONS } from "@/lib/constants/options";
import { demoMentors } from "@/lib/demo/data";
import { filterMentors } from "@/lib/mentors/filter-mentors";

export const metadata = {
  title: "멘토 찾기",
};

type MentorSearchParams = {
  subject?: string;
  q?: string;
  grade?: string;
  day?: string;
  available?: string;
  sort?: string;
};

export default async function MentorsPage({ searchParams }: { searchParams: Promise<MentorSearchParams> }) {
  const params = await searchParams;
  const selectedDay = params.day ? Number(params.day) : undefined;
  const selectedGrade = params.grade ? Number(params.grade) : undefined;
  const onlyAvailable = params.available === "true";
  const filteredMentors = filterMentors(demoMentors, {
    subject: params.subject,
    keyword: params.q,
    grade: selectedGrade,
    day: selectedDay,
    availableOnly: onlyAvailable,
    sort: params.sort,
  });

  return (
    <AppShell>
      <PageHeader description="과목, 세부 단원, 가능한 시간과 현재 신청 가능 여부로 교내 멘토를 찾습니다." title="멘토 찾기" />

      <form className="mt-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm md:grid-cols-3 xl:grid-cols-6">
        <label className="text-sm font-semibold text-zinc-900">
          과목
          <select className={`${inputStyles} mt-2`} defaultValue={params.subject ?? ""} name="subject">
            <option value="">전체</option>
            {BASE_SUBJECTS.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-zinc-900">
          키워드
          <input className={`${inputStyles} mt-2`} defaultValue={params.q ?? ""} name="q" placeholder="단원 또는 이름" />
        </label>
        <label className="text-sm font-semibold text-zinc-900">
          학년
          <select className={`${inputStyles} mt-2`} defaultValue={params.grade ?? ""} name="grade">
            <option value="">전체</option>
            {GRADE_OPTIONS.map((grade) => (
              <option key={grade.value} value={grade.value}>
                {grade.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-zinc-900">
          요일
          <select className={`${inputStyles} mt-2`} defaultValue={params.day ?? ""} name="day">
            <option value="">전체</option>
            {DAY_OPTIONS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-zinc-900">
          정렬
          <select className={`${inputStyles} mt-2`} defaultValue={params.sort ?? "recommended"} name="sort">
            <option value="recommended">추천순</option>
            <option value="rating">평점순</option>
            <option value="recent">최근 활동순</option>
            <option value="capacity">여유 인원순</option>
          </select>
        </label>
        <div className="flex flex-col justify-end gap-2">
          <label className="flex min-h-11 items-center gap-2 rounded-lg border border-zinc-200 px-3 text-sm">
            <input className="h-4 w-4 accent-emerald-700" defaultChecked={onlyAvailable} name="available" type="checkbox" value="true" />
            신청 가능
          </label>
          <button className="min-h-11 rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800" type="submit">
            필터 적용
          </button>
        </div>
      </form>

      {filteredMentors.length > 0 ? (
        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredMentors.map((mentor) => (
            <MentorCard key={mentor.profile.id} mentor={mentor} />
          ))}
        </section>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="필터를 줄이거나 다른 과목과 요일을 선택해 보세요."
            icon={Search}
            title="조건에 맞는 멘토가 없습니다"
          />
        </div>
      )}
    </AppShell>
  );
}
