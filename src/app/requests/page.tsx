import { ClipboardList } from "lucide-react";

import { LinkButton } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { inputStyles } from "@/components/forms/FormField";
import { AppShell } from "@/components/layout/AppShell";
import { RequestCard } from "@/components/requests/RequestCard";
import { DAY_OPTIONS, GRADE_OPTIONS, REQUEST_STATUS_LABELS } from "@/lib/constants/options";
import { loadRequests, loadSubjects } from "@/lib/data/studybridge";
import type { RequestStatus } from "@/types/domain";

export const metadata = {
  title: "도움 요청",
};

type RequestSearchParams = {
  subject?: string;
  grade?: string;
  status?: RequestStatus;
  day?: string;
};

export default async function RequestsPage({ searchParams }: { searchParams: Promise<RequestSearchParams> }) {
  const params = await searchParams;
  const [requests, subjects] = await Promise.all([loadRequests(), loadSubjects()]);
  const selectedGrade = params.grade ? Number(params.grade) : undefined;
  const selectedDay = params.day ? Number(params.day) : undefined;

  const filteredRequests = requests.filter((request) => {
    const matchesSubject = params.subject ? request.subjectId === params.subject : true;
    const matchesGrade = selectedGrade ? request.requester?.grade === selectedGrade : true;
    const matchesStatus = params.status ? request.status === params.status : true;
    const matchesDay = selectedDay !== undefined ? request.preferredDays.includes(selectedDay as 0 | 1 | 2 | 3 | 4 | 5 | 6) : true;

    return matchesSubject && matchesGrade && matchesStatus && matchesDay;
  });

  return (
    <AppShell>
      <PageHeader
        actions={<LinkButton href="/requests/new">도움 요청 작성</LinkButton>}
        description="학습 도움이 필요한 학생의 공개 요청을 확인합니다. 멘토로 등록한 사용자만 지원할 수 있습니다."
        title="학습 도움 요청"
      />

      <form className="mt-6 grid gap-3 rounded-lg border border-zinc-200 bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-5">
        <label className="text-sm font-semibold text-zinc-900">
          과목
          <select className={`${inputStyles} mt-2`} defaultValue={params.subject ?? ""} name="subject">
            <option value="">전체</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
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
          상태
          <select className={`${inputStyles} mt-2`} defaultValue={params.status ?? ""} name="status">
            <option value="">전체</option>
            {Object.entries(REQUEST_STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold text-zinc-900">
          희망 요일
          <select className={`${inputStyles} mt-2`} defaultValue={params.day ?? ""} name="day">
            <option value="">전체</option>
            {DAY_OPTIONS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <button className="min-h-11 w-full rounded-lg bg-emerald-700 px-4 text-sm font-bold text-white hover:bg-emerald-800" type="submit">
            필터 적용
          </button>
        </div>
      </form>

      {filteredRequests.length > 0 ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredRequests.map((request) => (
            <RequestCard key={request.id} request={request} subjects={subjects} />
          ))}
        </section>
      ) : (
        <div className="mt-6">
          <EmptyState
            action={<LinkButton href="/requests/new">도움 요청 작성</LinkButton>}
            description="아직 조건에 맞는 요청이 없습니다. 필요한 학습 내용을 직접 작성해 보세요."
            icon={ClipboardList}
            title="표시할 요청이 없습니다"
          />
        </div>
      )}
    </AppShell>
  );
}
