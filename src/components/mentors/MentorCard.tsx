import { ArrowRight, Star, Users } from "lucide-react";

import { LinkButton } from "@/components/common/Button";
import { SubjectBadge } from "@/components/common/SubjectBadge";
import { BASE_SUBJECTS } from "@/lib/constants/options";
import { summarizeAvailability } from "@/lib/matching/calculate-mentor-score";
import { cn } from "@/lib/utils";
import type { MentorProfile, MentorScoreResult } from "@/types/domain";

interface MentorCardProps {
  mentor: MentorProfile;
  score?: MentorScoreResult;
}

export function MentorCard({ mentor, score }: MentorCardProps) {
  const subjects = mentor.subjects
    .map((item) => BASE_SUBJECTS.find((subject) => subject.id === item.subjectId)?.name)
    .filter((name): name is string => Boolean(name));
  const remainingCapacity = mentor.settings.maxActiveMentees - mentor.activeMentees;

  return (
    <article className="rounded-lg border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-zinc-950">{mentor.profile.displayName}</h2>
          <p className="mt-1 text-sm text-zinc-600">{mentor.profile.grade}학년 멘토</p>
        </div>
        {score ? (
          <span className="rounded-full bg-emerald-700 px-3 py-1 text-xs font-bold text-white">{score.score}점</span>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {subjects.slice(0, 3).map((subject) => (
          <SubjectBadge key={subject}>{subject}</SubjectBadge>
        ))}
      </div>

      <p className="mt-4 line-clamp-2 text-sm leading-6 text-zinc-600">{mentor.settings.introduction}</p>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-zinc-500">가능 시간</dt>
          <dd className="mt-1 font-medium text-zinc-900">{summarizeAvailability(mentor.availability)}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">여유 인원</dt>
          <dd className={cn("mt-1 flex items-center gap-1 font-medium", remainingCapacity > 0 ? "text-emerald-800" : "text-red-700")}>
            <Users aria-hidden="true" className="h-4 w-4" />
            {Math.max(remainingCapacity, 0)}명
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">평균 평점</dt>
          <dd className="mt-1 flex items-center gap-1 font-medium text-zinc-900">
            <Star aria-hidden="true" className="h-4 w-4 fill-amber-400 text-amber-500" />
            {mentor.averageRating ? mentor.averageRating.toFixed(1) : "평가 없음"}
          </dd>
        </div>
        <div>
          <dt className="text-zinc-500">완료</dt>
          <dd className="mt-1 font-medium text-zinc-900">{mentor.completedMentorships}회</dd>
        </div>
      </dl>

      {score ? (
        <div className="mt-4 rounded-lg bg-zinc-50 p-3">
          <h3 className="text-xs font-bold text-zinc-700">추천 이유</h3>
          <ul className="mt-2 space-y-1 text-xs leading-5 text-zinc-600">
            {score.reasons.slice(0, 3).map((reason) => (
              <li key={reason}>- {reason}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <LinkButton className="mt-5 w-full" href={`/mentors/${mentor.profile.id}`} variant="secondary">
        프로필 보기
        <ArrowRight aria-hidden="true" className="h-4 w-4" />
      </LinkButton>
    </article>
  );
}
