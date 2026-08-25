import { ArrowRight, CalendarDays } from "lucide-react";

import { LinkButton } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SubjectBadge } from "@/components/common/SubjectBadge";
import { HELP_TYPE_LABELS } from "@/lib/constants/options";
import { getSubjectById } from "@/lib/demo/data";
import { formatDayList, formatRelativeDate, formatTimeRange } from "@/lib/utils";
import type { LearningRequest } from "@/types/domain";

interface RequestCardProps {
  request: LearningRequest;
}

export function RequestCard({ request }: RequestCardProps) {
  const subject = getSubjectById(request.subjectId);

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SubjectBadge>{subject?.name ?? "과목"}</SubjectBadge>
        <StatusBadge status={request.status} />
      </div>
      <h2 className="mt-4 text-lg font-bold text-zinc-950">{request.title}</h2>
      <p className="mt-2 line-clamp-2 text-sm leading-6 text-zinc-600">{request.description}</p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">세부 단원</dt>
          <dd className="mt-1 font-medium text-zinc-900">{request.topics.join(", ")}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">도움 방식</dt>
          <dd className="mt-1 font-medium text-zinc-900">{HELP_TYPE_LABELS[request.helpType]}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">희망 일정</dt>
          <dd className="mt-1 flex items-center gap-1 font-medium text-zinc-900">
            <CalendarDays aria-hidden="true" className="h-4 w-4 text-emerald-700" />
            {formatDayList(request.preferredDays)} {formatTimeRange(request.preferredStartTime, request.preferredEndTime)}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">작성자</dt>
          <dd className="mt-1 font-medium text-zinc-900">
            {request.requester?.grade ?? "-"}학년 · {formatRelativeDate(request.createdAt)}
          </dd>
        </div>
      </dl>
      <LinkButton className="mt-5 w-full" href={`/requests/${request.id}`} variant="secondary">
        요청 상세 보기
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </LinkButton>
    </article>
  );
}
