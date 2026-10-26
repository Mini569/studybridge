import { ArrowRight, BookOpen, CalendarCheck } from "lucide-react";

import { LinkButton } from "@/components/common/Button";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatDateTime } from "@/lib/utils";
import type { MentoringSession, Mentorship } from "@/types/domain";

interface MentorshipCardProps {
  mentorship: Mentorship;
  mentorName: string;
  menteeName: string;
  subjectName: string;
  sessions: MentoringSession[];
}

export function MentorshipCard({ mentorship, mentorName, menteeName, subjectName, sessions }: MentorshipCardProps) {
  const nextSession = sessions.find((session) => session.status === "scheduled");
  const completedCount = sessions.filter((session) => session.status === "completed").length;

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 text-sm font-semibold text-emerald-800">
            <BookOpen aria-hidden="true" className="h-4 w-4" />
            {subjectName}
          </p>
          <h2 className="mt-2 text-lg font-bold text-zinc-950">{mentorship.goal}</h2>
        </div>
        <StatusBadge status={mentorship.status} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-zinc-500">멘토</dt>
          <dd className="mt-1 font-medium text-zinc-900">{mentorName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">멘티</dt>
          <dd className="mt-1 font-medium text-zinc-900">{menteeName}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">완료 세션</dt>
          <dd className="mt-1 font-medium text-zinc-900">{completedCount}회</dd>
        </div>
        <div>
          <dt className="text-zinc-500">다음 일정</dt>
          <dd className="mt-1 flex items-center gap-1 font-medium text-zinc-900">
            <CalendarCheck aria-hidden="true" className="h-4 w-4 text-emerald-700" />
            {nextSession ? formatDateTime(nextSession.scheduledAt) : "예정 없음"}
          </dd>
        </div>
      </dl>

      <LinkButton className="mt-5 w-full" href={`/mentorships/${mentorship.id}`} variant="secondary">
        상세 보기
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </LinkButton>
    </article>
  );
}
