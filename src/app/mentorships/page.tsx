import { GraduationCap } from "lucide-react";
import Link from "next/link";

import { EmptyState } from "@/components/common/EmptyState";
import { PageHeader } from "@/components/common/PageHeader";
import { AppShell } from "@/components/layout/AppShell";
import { MentorshipCard } from "@/components/mentorships/MentorshipCard";
import { MENTORSHIP_STATUS_LABELS } from "@/lib/constants/options";
import { loadMentorships } from "@/lib/data/studybridge";
import { cn } from "@/lib/utils";
import type { MentorshipStatus } from "@/types/domain";

export const metadata = {
  title: "내 멘토링",
};

type MentorshipSearchParams = {
  status?: MentorshipStatus | "all";
};

export default async function MentorshipsPage({ searchParams }: { searchParams: Promise<MentorshipSearchParams> }) {
  const params = await searchParams;
  const allMentorships = await loadMentorships();
  const status = params.status ?? "all";
  const mentorships = allMentorships.filter(({ mentorship }) => status === "all" || mentorship.status === status);

  return (
    <AppShell>
      <PageHeader description="진행 예정, 진행 중, 완료, 취소된 멘토링과 세션 기록을 확인합니다." title="내 멘토링" />

      <div className="mt-6 flex flex-wrap gap-2">
        <Link className={cn("rounded-lg px-4 py-2 text-sm font-semibold", status === "all" ? "bg-emerald-700 text-white" : "bg-white text-zinc-700")} href="/mentorships">
          전체
        </Link>
        {Object.entries(MENTORSHIP_STATUS_LABELS).map(([value, label]) => (
          <Link
            className={cn("rounded-lg px-4 py-2 text-sm font-semibold", status === value ? "bg-emerald-700 text-white" : "bg-white text-zinc-700")}
            href={`/mentorships?status=${value}`}
            key={value}
          >
            {label}
          </Link>
        ))}
      </div>

      {mentorships.length > 0 ? (
        <section className="mt-6 grid gap-4 lg:grid-cols-2">
          {mentorships.map((item) => (
            <MentorshipCard {...item} key={item.mentorship.id} />
          ))}
        </section>
      ) : (
        <div className="mt-6">
          <EmptyState
            description="승인된 멘토링이 생기면 일정과 활동 기록이 이곳에 표시됩니다."
            icon={GraduationCap}
            title="표시할 멘토링이 없습니다"
          />
        </div>
      )}
    </AppShell>
  );
}
